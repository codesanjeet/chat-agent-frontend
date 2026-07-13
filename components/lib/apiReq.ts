import { authStore } from "./authStore";
import { refreshAccessToken } from "./authServices";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let refreshPromise: ReturnType<typeof refreshAccessToken> | null = null;

const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const makeRequest = async (token?: string) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

  let response = await makeRequest(authStore.getToken() ?? undefined);

  if (response.status === 401) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;

      response = await makeRequest(authStore.getToken() ?? undefined);
    } catch {
      authStore.clear();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      throw new Error("Session expired. Please login again.");
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail || "API request failed");
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export default apiRequest;