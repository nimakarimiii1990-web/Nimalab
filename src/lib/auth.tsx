"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loadKey, saveKey } from "./store";

/** sha256("admin") — default admin password documented in Help. */
export const DEFAULT_ADMIN_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";

const SESSION_KEY = "nima:adminSession";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface AuthCtx {
  isAdmin: boolean;
  ready: boolean;
  login: (pw: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (current: string, next: string) => Promise<"ok" | "wrong" | "weak">;
}

const Ctx = createContext<AuthCtx>({
  isAdmin: false,
  ready: false,
  login: async () => false,
  logout: () => {},
  changePassword: async () => "wrong",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sessionStorage.getItem(SESSION_KEY) === "1") setIsAdmin(true);
    } catch {
      // private mode — treat as not admin
    }
    setReady(true);
  }, []);

  const login = useCallback(async (pw: string) => {
    const stored = loadKey<string>("adminPassHash", DEFAULT_ADMIN_HASH);
    const h = await sha256(pw);
    if (h === stored) {
      setIsAdmin(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    const stored = loadKey<string>("adminPassHash", DEFAULT_ADMIN_HASH);
    const ch = await sha256(current);
    if (ch !== stored) return "wrong";
    if (next.length < 4) return "weak";
    saveKey("adminPassHash", await sha256(next));
    return "ok";
  }, []);

  return (
    <Ctx.Provider value={{ isAdmin, ready, login, logout, changePassword }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}

/** Small banner shown where a write-action is blocked for normal users. */
export function ReadOnlyNotice({ what }: { what: string }) {
  return (
    <div className="rounded-lg bg-sky-50 border border-sky-200 px-3 py-2 text-xs text-sky-800 flex items-center gap-2">
      <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
        R
      </span>
      Read-only — only the admin can {what}. Log in with the <b>Admin</b> button (top bar).
    </div>
  );
}
