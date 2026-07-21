/**
 * chat.ts
 * Wire types (mirrors app/schemas/chat.py, app/schemas/lead.py, and
 * app/schemas/settings.py::PublicBusinessOut), session/history persistence,
 * and the public API calls the chat widget makes.
 *
 * NOTE: tenant is identified by `slug`, not UUID -- routes are
 * /chat/{slug}/message, /leads/{slug}/submit, /settings/public/{slug}.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParentFolderRef {
  id: string;
  title: string;
  external_url: string | null;
}

export interface GalleryItemRef {
  item_id: string;
  item_type: "folder" | "image";
  title: string | null;
  image_url: string | null;
  external_url: string | null;
  parent_folder: ParentFolderRef | null;
}

export interface LinkRef {
  platform: string;
  url: string;
  label: string | null;
}

export interface LeadFormField {
  key: string;
  label: string;
  type: string;
  prompt: string;
  required: boolean;
}

export interface LeadFormRef {
  id: string;
  name: string;
  requires_payment: boolean;
  form_schema: { fields: LeadFormField[] };
}

export interface ChatMessageOut {
  reply: string;
  gallery_items: GalleryItemRef[];
  links: LinkRef[];
  lead_form: LeadFormRef | null;
  escalated: boolean;
}

export interface LeadOut {
  id: string;
  session_id: string;
  lead_form_id: string | null;
  data: Record<string, unknown>;
  status: string;
  payment_status: string | null;
  payment_qr_image: string | null;
  created_at: string;
}

export interface PublicBusinessOut {
  business_name: string | null;
  logo: string | null;
  payment_qr_image: string | null;
}

export type ThreadMessage =
  | { id: string; role: "user"; text: string; createdAt: string; failed?: boolean }
  | {
      id: string;
      role: "assistant";
      text: string;
      galleryItems: GalleryItemRef[];
      links: LinkRef[];
      leadForm: LeadFormRef | null;
      leadFormState: "pending" | "submitted" | null;
      leadSubmission: { leadId: string; paymentQrImage: string | null } | null;
      escalated: boolean;
      createdAt: string;
    }
  | { id: string; role: "error"; text: string; createdAt: string };

// ---------------------------------------------------------------------------
// Session + history persistence
// ---------------------------------------------------------------------------

const SESSION_KEY_PREFIX = "kiteum_chat_session";
const HISTORY_KEY_PREFIX = "kiteum_chat_history";

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getOrCreateSessionId(slug: string): string {
  const storage = safeLocalStorage();
  const key = `${SESSION_KEY_PREFIX}:${slug}`;
  if (!storage) return crypto.randomUUID();

  const existing = storage.getItem(key);
  if (existing) return existing;

  const created = crypto.randomUUID();
  storage.setItem(key, created);
  return created;
}

export function loadHistory(slug: string, sessionId: string): ThreadMessage[] {
  const storage = safeLocalStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(`${HISTORY_KEY_PREFIX}:${slug}:${sessionId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ThreadMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(slug: string, sessionId: string, messages: ThreadMessage[]): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(`${HISTORY_KEY_PREFIX}:${slug}:${sessionId}`, JSON.stringify(messages));
  } catch {
    // storage full/unavailable -- thread still works for this page life
  }
}

// ---------------------------------------------------------------------------
// API calls -- public, unauthenticated.
// ---------------------------------------------------------------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function unwrap<T>(res: Response): Promise<T> {
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

export async function sendChatMessage(slug: string, sessionId: string, message: string): Promise<ChatMessageOut> {
  const res = await fetch(`${API_BASE_URL}/chat/${slug}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  return unwrap<ChatMessageOut>(res);
}

// TODO: confirm whether /leads/{...}/submit expects the tenant's slug or
// its UUID -- the leads router hasn't been reviewed yet. Left as `slug`
// here (matching the single identifier the widget has available) but this
// may need to go back to the tenant's actual id depending on how that
// route is written. Don't ship this without checking.
export async function submitLead(
  slug: string,
  sessionId: string,
  leadFormId: string | null,
  data: Record<string, unknown>
): Promise<LeadOut> {
  const res = await fetch(`${API_BASE_URL}/leads/${slug}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, lead_form_id: leadFormId, data }),
  });
  return unwrap<LeadOut>(res);
}

export async function getPublicBusiness(slug: string): Promise<PublicBusinessOut> {
  const res = await fetch(`${API_BASE_URL}/settings/public/${slug}`);
  return unwrap<PublicBusinessOut>(res);
}