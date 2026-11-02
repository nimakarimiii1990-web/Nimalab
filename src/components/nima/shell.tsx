"use client";

import { useEffect, useState } from "react";
import {
  FlaskConical,
  Activity,
  HeartPulse,
  Dna,
  Droplets,
  Timer,
  ShieldPlus,
  Bug,
  Microscope,
  Atom,
  Target,
  FlaskRound,
  Pill,
  Building2,
  Home,
  BookOpenCheck,
  Sigma,
  LineChart as LineChartIcon,
  GaugeCircle,
  ShieldCheck,
  Newspaper,
  CalendarDays,
  FileText,
  HelpCircle,
  Menu,
  X,
  Lock,
  LogOut,
  Settings2,
  FileStack,
} from "lucide-react";
import type { CatId } from "@/lib/nima-types";
import { AuthProvider, useAuth } from "@/lib/auth";

export const CAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  biochem: FlaskConical,
  enzyme: Activity,
  cardiac: HeartPulse,
  hormone: Dna,
  hematology: Droplets,
  coag: Timer,
  immuno: ShieldPlus,
  viral: Bug,
  micro: Microscope,
  molecular: Atom,
  tumor: Target,
  urine: FlaskRound,
  tox: Pill,
  bank: Building2,
};

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home, desc: "Dashboard" },
  { id: "tests", label: "Lab Tests", icon: Droplets, desc: "Complete reference, all disciplines" },
  { id: "formulas", label: "Formulas", icon: Sigma, desc: "Clinical formulas with calculators" },
  { id: "qc", label: "Quality Control", icon: LineChartIcon, desc: "Levey-Jennings & Westgard" },
  { id: "integrity", label: "Result Integrity", icon: GaugeCircle, desc: "Cross-test consistency with charts" },
  { id: "accuracy", label: "Accuracy", icon: Target, desc: "Bias & accuracy vs target values" },
  { id: "analyzer", label: "Analyzer", icon: Activity, desc: "Parameters & result troubleshooting" },
  { id: "articles", label: "Articles 2024+", icon: BookOpenCheck, desc: "PubMed with Persian summaries" },
  { id: "news", label: "Lab News", icon: Newspaper, desc: "World laboratory news" },
  { id: "events", label: "Events", icon: CalendarDays, desc: "IVD events & exhibitions calendar" },
  { id: "params", label: "Parameters", icon: Settings2, desc: "Device parameters" },
  { id: "brochures", label: "Brochures", icon: FileStack, desc: "Kit & control brochures" },
  { id: "help", label: "Help", icon: HelpCircle, desc: "Install, offline, admin" },
];

export function useHashRoute(): { route: string; param: string; go: (r: string, p?: string) => void } {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const raw = hash.replace(/^#\/?/, "");
  const [route = "home", param = ""] = raw.split("/");
  const go = (r: string, p?: string) => {
    window.location.hash = `#/${r}${p ? "/" + p : ""}`;
    window.scrollTo({ top: 0 });
  };
  return { route: route || "home", param, go };
}

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div
        className="rounded-xl bg-gradient-to-br from-[#0b5cad] to-[#00a5b5] text-white flex items-center justify-center shadow-md"
        style={{ width: size, height: size }}
      >
        <Droplets className="w-1/2 h-1/2" />
      </div>
      <div className="leading-tight text-left">
        <div className="font-extrabold text-lg tracking-wide text-[#0b5cad]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Nima
        </div>
        <div className="text-[10px] text-muted-foreground font-medium tracking-wide">LAB COMPANION</div>
      </div>
    </div>
  );
}

function AdminDialog({ onClose }: { onClose: () => void }) {
  const { isAdmin, login, logout, changePassword } = useAuth();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"login" | "change">("login");
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [msg, setMsg] = useState("");

  const doLogin = async () => {
    const ok = await login(pw);
    if (ok) {
      onClose();
    } else {
      setErr("Wrong password. Default is admin (see Help).");
    }
  };

  const doChange = async () => {
    const r = await changePassword(cur, nw);
    if (r === "ok") {
      setMsg("Password changed ✓");
      setCur("");
      setNw("");
      setErr("");
    } else if (r === "wrong") {
      setErr("Current password is wrong.");
      setMsg("");
    } else {
      setErr("New password must be at least 4 characters.");
      setMsg("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded hover:bg-secondary" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold">Admin</div>
            <div className="text-xs text-muted-foreground">
              {isAdmin ? "You are logged in as administrator" : "Only the admin can edit content"}
            </div>
          </div>
        </div>

        {isAdmin ? (
          <div className="space-y-3">
            {tab === "change" ? (
              <>
                <input
                  type="password"
                  value={cur}
                  onChange={(e) => setCur(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="password"
                  value={nw}
                  onChange={(e) => setNw(e.target.value)}
                  placeholder="New password (min 4 chars)"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                {err && <div className="text-xs text-red-600">{err}</div>}
                {msg && <div className="text-xs text-emerald-600">{msg}</div>}
                <button onClick={doChange} className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-bold hover:bg-primary/90">
                  Save new password
                </button>
                <button onClick={() => setTab("login")} className="w-full text-xs text-muted-foreground hover:text-primary">
                  Back
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setTab("change")}
                  className="w-full bg-secondary hover:bg-secondary/70 rounded-lg py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Change admin password
                </button>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full bg-red-50 text-red-700 border border-red-200 rounded-lg py-2.5 text-sm font-bold hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
              placeholder="Admin password"
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            {err && <div className="text-xs text-red-600">{err}</div>}
            <button onClick={doLogin} className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-bold hover:bg-primary/90">
              Log in
            </button>
            <p className="text-[11px] text-muted-foreground leading-4">
              Default password: <b className="ltr-inline">admin</b> — change it after first login. Editing content
              (parameters, QC, articles, news, events) is reserved for the admin; everyone else browses read-only.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ShellInner({
  route,
  go,
  children,
}: {
  route: string;
  go: (r: string, p?: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { isAdmin, ready } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-3">
          <button onClick={() => go("home")} aria-label="Home" className="shrink-0">
            <Logo />
          </button>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                title={item.desc}
                className={`px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  route === item.id
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-foreground/80 hover:bg-secondary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {ready && (
              <button
                onClick={() => setAdminOpen(true)}
                className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-2 border transition-colors ${
                  isAdmin
                    ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                    : "bg-white text-foreground/80 border-border hover:bg-secondary"
                }`}
                title={isAdmin ? "Admin mode active" : "Log in as admin to edit"}
              >
                <ShieldCheck className="w-4 h-4" />
                {isAdmin ? "Admin" : "Admin"}
              </button>
            )}
            {/* Mobile hamburger */}
            <button
              className="xl:hidden p-2 rounded-lg hover:bg-secondary"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="xl:hidden border-t bg-white px-4 py-3 grid grid-cols-2 gap-2" aria-label="Mobile menu">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  go(item.id);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium ${
                  route === item.id ? "bg-primary text-white" : "bg-secondary text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-auto border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 pb-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" />
            <span>
              <b className="text-primary">Nima</b> — Laboratory Companion | v1.1
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => go("help")} className="hover:text-primary">
              Help & Offline
            </button>
            <button onClick={() => go("articles")} className="hover:text-primary">
              Articles
            </button>
            <span className="text-xs opacity-70">Data stays on your device</span>
          </div>
        </div>
      </footer>

      {adminOpen && <AdminDialog onClose={() => setAdminOpen(false)} />}
    </div>
  );
}

export function Shell(props: {
  route: string;
  go: (r: string, p?: string) => void;
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ShellInner {...props} />
    </AuthProvider>
  );
}