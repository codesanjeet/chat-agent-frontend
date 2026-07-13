"use client";

/**
 * GalleryTrainer.tsx
 *
 * The gallery tab inside Train AI. Unlike the old flat photo grid, the
 * backend now models this as a tree: folders group photos (one property /
 * one product / one event), folders can be described and searched just
 * like an image, and images live at any depth inside folders. This
 * component browses one level at a time (GET /gallery?parent_id=...),
 * with breadcrumbs for navigating back up.
 *
 * `name` is gone -- replaced by two distinct fields per the current
 * schema:
 *   - title: optional, short, user-facing label (shown in chat + the
 *     public gallery browser). Folders require it (GalleryFolderIn.title
 *     has no default); images don't (upload's title Form field defaults
 *     to None).
 *   - description: mandatory on both folders and images -- this is the
 *     AI's grounding text, never shown to the end customer, but the admin
 *     sees and edits it here since they're the one writing it.
 */

import { useCallback, useEffect, useState } from "react";
import {
  HiOutlineArrowUpTray,
  HiOutlineChevronRight,
  HiOutlineFolder,
  HiOutlineFolderPlus,
  HiOutlineHome,
  HiOutlinePencil,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import {
  SectionCard,
  PrimaryButton,
  GhostButton,
  TextField,
  ErrorBanner,
  EmptyState,
  apiJson,
  apiUpload,
  formatDate,
} from "./Trainer";

/* -------------------------------------------------------------------------
 * Types (mirror app/schemas/gallery.py field-for-field)
 * ---------------------------------------------------------------------- */

type GalleryItemType = "folder" | "image";

interface GalleryItem {
  id: string;
  parent_id: string | null;
  item_type: GalleryItemType;
  title: string | null; // optional -- images may have none
  description: string; // mandatory -- AI grounding text, always present
  image_url: string | null; // only set for images
  external_url: string | null;
  created_at: string;
}

interface Breadcrumb {
  id: string;
  title: string;
}

/* =========================================================================
 * Top-level view
 * ====================================================================== */

export default function GalleryTrainer() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // null = at gallery root. Non-empty crumbs = inside nested folders.
  const [crumbs, setCrumbs] = useState<Breadcrumb[]>([]);
  const currentFolderId = crumbs.length ? crumbs[crumbs.length - 1].id : null;

  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const load = useCallback(async (parentId: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const query = parentId ? `?parent_id=${parentId}` : "";
      const data = (await apiJson(`/gallery${query}`)) as GalleryItem[];
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the gallery.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(currentFolderId);
  }, [currentFolderId, load]);

  const openFolder = (item: GalleryItem) => {
    // Folders always have a title (GalleryFolderIn.title is required), so
    // this fallback is just defensive, not expected to trigger.
    setCrumbs((prev) => [...prev, { id: item.id, title: item.title ?? "Untitled folder" }]);
  };

  const goToCrumb = (index: number) => {
    // index -1 means "gallery root"
    setCrumbs((prev) => prev.slice(0, index + 1));
  };

  const handleDelete = async (item: GalleryItem) => {
    const label = item.title ?? (item.item_type === "folder" ? "this folder" : "this photo");
    const warning =
      item.item_type === "folder"
        ? `Delete "${label}"? This removes everything inside it too.`
        : `Delete "${label}"?`;
    if (!window.confirm(warning)) return;

    setError(null);
    try {
      await apiJson(`/gallery/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that item.");
    }
  };

  const handleUpdate = async (id: string, patch: { title?: string; description?: string; external_url?: string }) => {
    setError(null);
    try {
      const updated = (await apiJson(`/gallery/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      })) as GalleryItem;
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your changes.");
    }
  };

  const folders = items.filter((i) => i.item_type === "folder");
  const images = items.filter((i) => i.item_type === "image");

  return (
    <div className="flex flex-col gap-6">
      {error && <ErrorBanner message={error} />}

      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-1 text-sm">
        <button
          type="button"
          onClick={() => goToCrumb(-1)}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 font-medium ${
            crumbs.length === 0 ? "text-[#0B0F19]" : "text-[#6B6F76] hover:text-[#0B0F19]"
          }`}
        >
          <HiOutlineHome size={15} /> Gallery
        </button>
        {crumbs.map((crumb, index) => (
          <span key={crumb.id} className="flex items-center gap-1">
            <HiOutlineChevronRight size={13} className="text-[#6B6F76]" />
            <button
              type="button"
              onClick={() => goToCrumb(index)}
              className={`rounded-lg px-2 py-1 font-medium ${
                index === crumbs.length - 1 ? "text-[#0B0F19]" : "text-[#6B6F76] hover:text-[#0B0F19]"
              }`}
            >
              {crumb.title}
            </button>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <GhostButton onClick={() => setShowAddFolder((s) => !s)}>
          <HiOutlineFolderPlus size={15} /> New folder
        </GhostButton>
        <PrimaryButton onClick={() => setShowAddImage((s) => !s)}>
          <HiOutlinePlus size={15} /> Add photo
        </PrimaryButton>
      </div>

      {showAddFolder && (
        <AddFolderCard
          parentId={currentFolderId}
          onCreated={(folder) => {
            setItems((prev) => [folder, ...prev]);
            setShowAddFolder(false);
          }}
          onError={setError}
          onCancel={() => setShowAddFolder(false)}
        />
      )}

      {showAddImage && (
        <AddImageCard
          parentId={currentFolderId}
          onCreated={(image) => {
            setItems((prev) => [image, ...prev]);
            setShowAddImage(false);
          }}
          onError={setError}
          onCancel={() => setShowAddImage(false)}
        />
      )}

      <SectionCard>
        {loading ? (
          <p className="py-6 text-center text-sm text-[#6B6F76]">Loading…</p>
        ) : items.length === 0 ? (
          <EmptyState
            icon={HiOutlinePhoto}
            text={
              crumbs.length
                ? "This folder is empty. Add a photo or a sub-folder above."
                : "No photos yet. Add one above, or group photos into a folder first."
            }
          />
        ) : (
          <div className="flex flex-col gap-5">
            {folders.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onOpen={() => openFolder(folder)}
                    onEdit={() => setEditingItem(folder)}
                    onDelete={() => handleDelete(folder)}
                  />
                ))}
              </div>
            )}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((image) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    onEdit={() => setEditingItem(image)}
                    onDelete={() => handleDelete(image)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onCancel={() => setEditingItem(null)}
          onSave={(patch) => handleUpdate(editingItem.id, patch)}
        />
      )}
    </div>
  );
}

/* =========================================================================
 * Add folder / add image forms
 * ====================================================================== */

function AddFolderCard({
  parentId,
  onCreated,
  onError,
  onCancel,
}: {
  parentId: string | null;
  onCreated: (folder: GalleryItem) => void;
  onError: (msg: string) => void;
  onCancel: () => void;
}) {
  // Folders require both -- GalleryFolderIn.title and .description have
  // no defaults, so the backend will 422 without them.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim()) {
      onError("Give the folder a title first.");
      return;
    }
    if (!description.trim()) {
      onError("Add a description first -- this is what the agent reads to recommend it.");
      return;
    }
    setSubmitting(true);
    try {
      const folder = (await apiJson("/gallery/folders", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          parent_id: parentId,
          external_url: externalUrl || null,
        }),
      })) as GalleryItem;
      onCreated(folder);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't create that folder.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
          New folder
        </h2>
        <button type="button" onClick={onCancel} className="text-[#6B6F76] hover:text-[#0B0F19]" aria-label="Close">
          <HiOutlineXMark size={18} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Title" value={title} onChange={setTitle} placeholder="e.g. Green Valley Villa" />
        <TextField label="Link when tapped" value={externalUrl} onChange={setExternalUrl} placeholder="https://…" optional />
        <div className="sm:col-span-2">
          <TextField
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="What this folder covers, so the agent can recommend it as a whole"
          />
        </div>
      </div>
      <div className="mt-3">
        <PrimaryButton onClick={submit} disabled={submitting}>
          {submitting ? "Creating…" : "Create folder"}
        </PrimaryButton>
      </div>
    </SectionCard>
  );
}

function AddImageCard({
  parentId,
  onCreated,
  onError,
  onCancel,
}: {
  parentId: string | null;
  onCreated: (image: GalleryItem) => void;
  onError: (msg: string) => void;
  onCancel: () => void;
}) {
  // Images: title is optional (upload endpoint's title Form field defaults
  // to None), description is mandatory.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!file) {
      onError("Choose a photo first.");
      return;
    }
    if (!description.trim()) {
      onError("Add a description first -- this is what the agent reads to recommend it.");
      return;
    }
    setSubmitting(true);
    try {
      const extra: Record<string, string> = { description };
      if (title.trim()) extra.title = title;
      if (parentId) extra.parent_id = parentId;
      if (externalUrl) extra.external_url = externalUrl;

      const image = (await apiUpload("/gallery/images", file, extra)) as GalleryItem;
      onCreated(image);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't add that photo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
          Add a photo{parentId ? " to this folder" : ""}
        </h2>
        <button type="button" onClick={onCancel} className="text-[#6B6F76] hover:text-[#0B0F19]" aria-label="Close">
          <HiOutlineXMark size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[#0B0F19]">Photo file</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="rounded-xl border border-[#E5E5E0] bg-white px-3 py-2 text-sm text-[#0B0F19] outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#2B4EFF]/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#2B4EFF]"
          />
        </label>
        <TextField
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="What the customer sees under the photo"
          optional
        />
        <TextField
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="What's in the photo, and when the agent should use it"
        />
        <TextField label="Link when tapped" value={externalUrl} onChange={setExternalUrl} placeholder="https://…" optional />
        <div>
          <PrimaryButton onClick={submit} disabled={submitting}>
            <HiOutlineArrowUpTray size={15} />
            {submitting ? "Uploading…" : "Upload photo"}
          </PrimaryButton>
        </div>
      </div>
    </SectionCard>
  );
}

/* =========================================================================
 * Grid cards
 * ====================================================================== */

function FolderCard({
  folder,
  onOpen,
  onEdit,
  onDelete,
}: {
  folder: GalleryItem;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative flex flex-col items-start gap-2 rounded-xl border border-[#E5E5E0] p-3 text-left transition-colors hover:border-[#2B4EFF]/40">
      <button type="button" onClick={onOpen} className="flex w-full flex-col items-start gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2B4EFF]/10 text-[#2B4EFF]">
          <HiOutlineFolder size={18} />
        </span>
        <span className="truncate text-sm font-medium text-[#0B0F19]">
          {folder.title ?? "Untitled folder"}
        </span>
        <span className="line-clamp-2 text-xs text-[#6B6F76]">{folder.description}</span>
      </button>
      <div className="absolute right-1.5 top-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#6B6F76] shadow-sm hover:text-[#0B0F19]"
          aria-label="Edit folder"
        >
          <HiOutlinePencil size={13} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#6B6F76] shadow-sm hover:text-rose-600"
          aria-label="Delete folder"
        >
          <HiOutlineTrash size={13} />
        </button>
      </div>
    </div>
  );
}

function ImageCard({
  image,
  onEdit,
  onDelete,
}: {
  image: GalleryItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#E5E5E0]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.image_url ?? ""} alt={image.title ?? ""} className="h-32 w-full object-cover" />
      <div className="p-2">
        {image.title && <p className="truncate text-xs font-medium text-[#0B0F19]">{image.title}</p>}
        <p className="line-clamp-2 text-xs text-[#6B6F76]">{image.description}</p>
        <p className="mt-0.5 text-[10px] text-[#6B6F76]">{formatDate(image.created_at)}</p>
      </div>
      <div className="absolute right-1.5 top-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#6B6F76] shadow-sm hover:text-[#0B0F19]"
          aria-label="Edit photo"
        >
          <HiOutlinePencil size={13} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#6B6F76] shadow-sm hover:text-rose-600"
          aria-label="Delete photo"
        >
          <HiOutlineTrash size={13} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
 * Edit modal (shared by folders and images -- same PATCH endpoint)
 * ====================================================================== */

function EditItemModal({
  item,
  onCancel,
  onSave,
}: {
  item: GalleryItem;
  onCancel: () => void;
  onSave: (patch: { title?: string; description?: string; external_url?: string }) => void;
}) {
  const [title, setTitle] = useState(item.title ?? "");
  const [description, setDescription] = useState(item.description);
  const [externalUrl, setExternalUrl] = useState(item.external_url ?? "");
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!description.trim()) {
      setError("Description can't be empty.");
      return;
    }
    if (item.item_type === "folder" && !title.trim()) {
      setError("Folders need a title.");
      return;
    }
    setError(null);
    onSave({
      title: title !== (item.title ?? "") ? title : undefined,
      description: description !== item.description ? description : undefined,
      external_url: externalUrl !== (item.external_url ?? "") ? externalUrl : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E5E0] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-[#0B0F19]">
            Edit {item.item_type === "folder" ? "folder" : "photo"}
          </h3>
          <button type="button" onClick={onCancel} className="text-[#6B6F76] hover:text-[#0B0F19]" aria-label="Close">
            <HiOutlineXMark size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <TextField
            label="Title"
            value={title}
            onChange={setTitle}
            optional={item.item_type === "image"}
          />
          <TextField label="Description" value={description} onChange={setDescription} />
          <TextField label="Link when tapped" value={externalUrl} onChange={setExternalUrl} optional />
        </div>
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton onClick={save}>Save changes</PrimaryButton>
        </div>
      </div>
    </div>
  );
}