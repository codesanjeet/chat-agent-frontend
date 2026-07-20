import { authStore } from './authStore';
import apiRequest from './apiReq';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export type UserOut = {
  id: string;
  email: string;
  business_name: string | null;
  business_category: string | null;
  logo: string | null;
  slug: string | null;
  profile_completed: boolean;
  is_configured: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: UserOut;
};

export async function fetchCurrentUser(): Promise<UserOut> {
  return apiRequest('/auth/me');
}

export async function requestOtp(email: string): Promise<void> {
  // 204 No Content on success -- apiRequest already returns null for that.
  await apiRequest('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, code: string): Promise<UserOut> {
  const data: TokenResponse = await apiRequest('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
  authStore.setToken(data.access_token);
  return data.user;
}

export async function googleLogin(idToken: string): Promise<UserOut> {
  const data: TokenResponse = await apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });
  authStore.setToken(data.access_token);
  return data.user;
}

export async function refreshAccessToken(): Promise<UserOut> {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    authStore.clear();
    throw new Error('Session expired');
  }

  // The backend's /auth/refresh already returns the full user alongside the
  // new access token (see _issue_tokens in user_router.py) -- so unlike the
  // old version, there's no need for a second round-trip to /auth/me here.
  const data: TokenResponse = await res.json();
  authStore.setToken(data.access_token);
  return data.user;
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (res.ok) {
    authStore.clear();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } else {
    throw new Error('Unable to logout.');
  }
}