"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineChatBubbleLeftRight, HiOutlineXMark } from "react-icons/hi2";
import ChatThread, { type ChatThreadProps } from "./ChatThread";
import Gallery from "./Gallery";

/* ---------------------------------------------------------------------
 * Shared panel-switch state -- "chat" is always the default and the
 * fallback. activeFolderId is only meaningful while view === "gallery".
 * ------------------------------------------------------------------- */

type PanelView = "chat" | "gallery";

function usePanelState() {
  const [view, setView] = useState<PanelView>("chat");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeFolderName, setActiveFolderName] = useState<string | null>(null);

  const openGallery = (folderId: string | null, folderName: string | null = null) => {
    setActiveFolderId(folderId);
    setActiveFolderName(folderName);
    setView("gallery");
  };

  const backToChat = () => setView("chat");

  const resetToChat = () => {
    setView("chat");
    setActiveFolderId(null);
    setActiveFolderName(null);
  };

  return { view, activeFolderId, activeFolderName, openGallery, backToChat, resetToChat };
}

/* ---------------------------------------------------------------------
 * Floating bottom-right widget -- collapsible bubble, ~380px when open.
 *
 * NOTE: Gallery is keyed by the business's public `slug` (e.g. "kiteum"),
 * not a tenant UUID -- matches GET /gallery/{slug}/browse server-side.
 * ChatThreadProps is assumed to expose `slug` (the same value ChatThread
 * already uses to POST /chat/${slug}/message, since that call works).
 * If ChatThreadProps instead calls this field `tenantId` while actually
 * holding a slug string, rename that field to `slug` in ChatThread.tsx
 * and its prop type too, so the name matches what it actually contains.
 * ------------------------------------------------------------------- */

export function ChatWidget(props: ChatThreadProps) {
  const [open, setOpen] = useState(false);
  const accentColor = props.accentColor ?? "#2B4EFF";
  const panel = usePanelState();

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Re-opening always resumes on the chat thread, not wherever the
    // gallery was left -- the conversation is the primary surface.
    if (next === false) panel.resetToChat();
    window.parent.postMessage(
      { source: "my-chat-widget", type: next ? "open" : "close" },
      "*"
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-[70vh] max-h-[560px] w-[92vw] max-w-[380px] overflow-hidden rounded-3xl border border-black/[0.06] shadow-2xl ring-1 ring-black/5"
          >
            {panel.view === "chat" ? (
              <ChatThread
                {...props}
                className="h-full"
                onOpenGallery={(folderId) => panel.openGallery(folderId)}
              />
            ) : (
              <Gallery
                slug={props.slug}
                accentColor={accentColor}
                startFolderId={panel.activeFolderId}
                startFolderTitle={panel.activeFolderName}
                onBack={panel.backToChat}
                className="h-full"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggle}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl"
        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)` }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: accentColor }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            {open ? <HiOutlineXMark size={24} /> : <HiOutlineChatBubbleLeftRight size={24} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

/* ---------------------------------------------------------------------
 * Full-page view -- standalone route shell, same panel-switch behavior
 * inside the same fixed container.
 * ------------------------------------------------------------------- */

export function FullPageChat(props: ChatThreadProps) {
  const accentColor = props.accentColor ?? "#2B4EFF";
  const panel = usePanelState();

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-[#FAFAF9] p-0 sm:p-6"
      style={{
        backgroundImage: `radial-gradient(120% 100% at 50% -10%, ${accentColor}12 0%, transparent 55%)`,
      }}
    >
      <div className="flex h-screen w-full max-w-2xl flex-col overflow-hidden bg-white shadow-sm sm:h-[85vh] sm:rounded-3xl sm:border sm:border-black/[0.06] sm:shadow-xl">
        {panel.view === "chat" ? (
          <ChatThread {...props} className="h-full" onOpenGallery={(folderId) => panel.openGallery(folderId)} />
        ) : (
          <Gallery
            slug={props.slug}
            accentColor={accentColor}
            startFolderId={panel.activeFolderId}
            startFolderTitle={panel.activeFolderName}
            onBack={panel.backToChat}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
}