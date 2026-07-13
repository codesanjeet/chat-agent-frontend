"use client";

/**
 * Gallery.tsx
 *
 * Standalone folder/image browser for the public chat widget. Fetches one
 * tree level at a time, same "folders before images" ordering as the
 * dashboard's own GalleryTrainer.tsx, but read-only and unauthenticated --
 * this is what a customer sees, not the owner.
 *
 * `title` is optional (mirrors GalleryItemOut -- images may have none,
 * folders are expected to but the type stays nullable to match the wire
 * shape exactly). `description` is kept in the type because the backend
 * still returns it, but is never rendered anywhere in this file -- it's
 * internal grounding text written for the AI, not a user-facing caption.
 *
 * Self-contained: the fetch call and its types live in this file rather
 * than a separate lib module, so there's nothing else to wire up.
 *
 * Tenant is identified by `slug` now, not the tenant's UUID -- matches
 * GET /gallery/{slug}/browse?parent_id=... in app/routers/gallery.py,
 * which resolves the slug to a tenant_id server-side (same pattern as the
 * chat route). Mirrors gallery_crud.list_gallery's response shape exactly.
 *
 * Works two ways:
 *   - Embedded in ChatWidget.tsx, opened at a specific folder id, with an
 *     onBack handed in to return to the chat thread.
 *   - Standalone, e.g. mounted at a "/gallery" page with no folder id
 *     (defaults to root) and no onBack (back button just hidden).
 */

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineChevronRight,
  HiOutlineFolder,
  HiOutlineHome,
  HiOutlinePhoto,
  HiOutlineXMark,
} from "react-icons/hi2";
import { FiArrowUpRight, FiLoader } from "react-icons/fi";

/* -------------------------------------------------------------------------
 * Types + fetch -- mirror app/schemas/gallery.py's GalleryItemOut field-for-
 * field. Inlined here rather than a shared lib file.
 * ---------------------------------------------------------------------- */

interface GalleryItemPublic {
  id: string;
  parent_id: string | null;
  item_type: "folder" | "image";
  title: string | null; // optional -- images may have none
  description: string; // AI-only grounding text -- never displayed here
  image_url: string | null; // only set for images
  external_url: string | null;
  created_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function fetchGalleryLevel(slug: string, parentId: string | null): Promise<GalleryItemPublic[]> {
  const query = parentId ? `?parent_id=${parentId}` : "";
  const res = await fetch(`${API_BASE_URL}/gallery/${slug}/browse${query}`);

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.detail ?? message;
    } catch {
      // non-JSON error body -- keep the generic message
    }
    throw new Error(message);
  }

  return res.json();
}

/* -------------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------------- */

export interface GalleryProps {
  /** Business's public slug, e.g. "joes-pizza" -- used to build the
   *  /gallery/{slug}/browse URL. Not the tenant's UUID. */
  slug: string;
  accentColor?: string;
  /** Folder to open into initially. Omit/null = gallery root. */
  startFolderId?: string | null;
  /** Optional display title for the starting folder, used as the first
   *  breadcrumb if provided (avoids a flash of "Gallery" before the first
   *  fetch resolves the real title). */
  startFolderTitle?: string | null;
  /** Present only when embedded from chat -- shown as a "back to chat"
   *  affordance distinct from the in-gallery breadcrumb/back navigation. */
  onBack?: () => void;
  className?: string;
}

interface Breadcrumb {
  id: string | null; // null = root
  title: string;
}

export default function Gallery({
  slug,
  accentColor = "#2B4EFF",
  startFolderId = null,
  startFolderTitle = null,
  onBack,
  className = "",
}: GalleryProps) {
  const [crumbs, setCrumbs] = useState<Breadcrumb[]>(() =>
    startFolderId
      ? [{ id: null, title: "Gallery" }, { id: startFolderId, title: startFolderTitle ?? "…" }]
      : [{ id: null, title: "Gallery" }]
  );
  const currentFolderId = crumbs[crumbs.length - 1].id;

  const [items, setItems] = useState<GalleryItemPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<GalleryItemPublic | null>(null);

  const load = useCallback(
    async (folderId: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGalleryLevel(slug, folderId);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't load the gallery.");
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    load(currentFolderId);
  }, [currentFolderId, load]);

  const openFolder = (item: GalleryItemPublic) => {
    setCrumbs((prev) => [...prev, { id: item.id, title: item.title ?? "Untitled folder" }]);
  };

  const goToCrumb = (index: number) => {
    setCrumbs((prev) => prev.slice(0, index + 1));
  };

  const folders = items.filter((i) => i.item_type === "folder");
  const images = items.filter((i) => i.item_type === "image");

  return (
    <div className={`relative flex flex-col overflow-hidden bg-[#FAFAF9] ${className}`}>
      {/* Header -- back-to-chat (if embedded) + breadcrumbs */}
      <div className="relative z-10 flex items-center gap-2 border-b border-black/[0.06] bg-white/80 px-4 py-3.5 backdrop-blur-xl">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6B6F76] hover:bg-black/[0.04] hover:text-[#0B0F19]"
            aria-label="Back to chat"
          >
            <HiOutlineArrowLeft size={17} />
          </button>
        )}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-sm">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.id ?? "root"}-${index}`} className="flex items-center gap-1">
              {index > 0 && <HiOutlineChevronRight size={12} className="shrink-0 text-[#6B6F76]" />}
              <button
                type="button"
                onClick={() => goToCrumb(index)}
                className={`flex items-center gap-1 truncate rounded-lg px-1.5 py-1 font-medium ${
                  index === crumbs.length - 1 ? "text-[#0B0F19]" : "text-[#6B6F76] hover:text-[#0B0F19]"
                }`}
              >
                {index === 0 && <HiOutlineHome size={13} />}
                {crumb.title}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
        {error && (
          <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#6B6F76]">
            <FiLoader className="animate-spin" size={15} />
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-black/[0.08] py-12 text-center text-sm text-[#6B6F76]">
            <HiOutlinePhoto size={22} />
            <span>Nothing here yet.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {folders.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => openFolder(folder)}
                    className="flex flex-col items-start gap-2 rounded-xl border border-black/[0.06] bg-white p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform hover:scale-[1.02]"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                    >
                      <HiOutlineFolder size={18} />
                    </span>
                    <span className="truncate text-sm font-medium text-[#0B0F19]">
                      {folder.title ?? "Untitled folder"}
                    </span>
                    {folder.external_url && (
                      <span
                        className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold"
                        style={{ color: accentColor }}
                      >
                        View full listing <FiArrowUpRight size={12} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setLightboxItem(image)}
                    className="group relative overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.image_url ?? ""}
                      alt={image.title ?? ""}
                      className="h-28 w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    {image.title && (
                      <p className="line-clamp-1 px-2 py-1.5 text-left text-xs text-[#0B0F19]">
                        {image.title}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col bg-black/85"
            onClick={() => setLightboxItem(null)}
          >
            <div className="flex items-center justify-end p-3">
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Close"
              >
                <HiOutlineXMark size={18} />
              </button>
            </div>
            <div
              className="flex flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-4 pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxItem.image_url ?? ""}
                alt={lightboxItem.title ?? ""}
                className="max-h-[65%] max-w-full rounded-xl object-contain"
              />
              {lightboxItem.title && (
                <p className="max-w-md text-center text-sm text-white/90">{lightboxItem.title}</p>
              )}
              {lightboxItem.external_url && (
                <a
                  href={lightboxItem.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)` }}
                >
                  View full listing <FiArrowUpRight size={14} />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}