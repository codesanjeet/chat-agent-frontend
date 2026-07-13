import apiRequest from './apiReq';
import { authStore } from './authStore';
import type { UserOut } from './authServices';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Mirrors app/schemas/user.py::CompleteProfileRequest on the backend.
export type CompleteProfilePayload = {
  business_name: string;
  business_category: string;
  slug?: string | null;
};

export async function completeProfile(
  payload: CompleteProfilePayload
): Promise<UserOut> {
  return apiRequest('/user/profile/complete', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// Inlined raw fetch -- deliberately NOT using apiRequest() here, same as
// Settings.tsx's local uploadFile() helper. apiRequest forces
// Content-Type: application/json, which breaks multipart/form-data (the
// browser needs to set its own boundary), so this file handles the auth
// header and fetch itself instead of importing that shared helper.
// Backend (app/routers/settings.py::upload_logo) returns a full SettingsOut
// object -- the logo URL is on `.logo`, there is no `.url` field.
export async function uploadLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const token = authStore.getToken();
  const res = await fetch(`${API_BASE_URL}/settings/logo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || 'Logo upload failed');
  }

  const data = await res.json();
  return data.logo;
}