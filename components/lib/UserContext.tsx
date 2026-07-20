"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchCurrentUser, refreshAccessToken, type UserOut } from "./authServices";
import { authStore } from "./authStore";

type Status = "checking" | "ready" | "unauthenticated";

interface UserContextValue {
  user: UserOut | null;
  status: Status;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

const PUBLIC_ROUTES = ["/login"];
const UNLOCKED_DASHBOARD_PATH = "/dashboard/train-ai";

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserOut | null>(null);
  const [status, setStatus] = useState<Status>("checking");

  const load = useCallback(async () => {
    try {
      const current = authStore.getToken()
        ? await fetchCurrentUser()
        : await refreshAccessToken();
      setUser(current);
      setStatus("ready");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.replace("/login");
      }
    }
  }, [pathname, router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (
      status === "ready" &&
      user &&
      !user.is_configured &&
      pathname.startsWith("/dashboard") &&
      pathname !== UNLOCKED_DASHBOARD_PATH
    ) {
      router.replace(UNLOCKED_DASHBOARD_PATH);
    }
  }, [status, user, pathname, router]);

  return (
    <UserContext.Provider value={{ user, status, refresh: load }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser() must be called inside <UserProvider>");
  }
  return ctx;
}