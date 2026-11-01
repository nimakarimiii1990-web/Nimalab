"use client";

import { useState } from "react";
import { HelpCircle, Download, Upload, Smartphone, MonitorSmartphone, WifiOff, HardDriveDownload, ShieldCheck } from "lucide-react";
import { exportAllData, importAllData } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export function HelpView() {
  const [imported, setImported] = useState("");
  const { isAdmin } = useAuth();

  const doExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nima-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast({ title: "Backup created ✓" });
  };

  const doImport = () => {
    if (importAllData(imported)) {
      toast({ title: "Restore succeeded ✓ — refresh the page." });
    } else {
      toast({ title: "Invalid backup file" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <HelpCircle className="w-6 h-6 text-primary" />
        Nima Help
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Everything about running Nima on web, desktop and Android, offline use, admin permissions and data backup.
      </p>

      <div className="space-y-4">
        <Section icon={<WifiOff className="w-5 h-5" />} title="Works without a server (offline)">
          <p>
            Nima is a PWA: after the first visit, the entire application (tests, formulas, charts and your data) is
            stored on the device. If your server is off, the app still runs from cache and your QC data, parameters and
            results stay in place. The sync buttons (articles/news) only refresh when internet is available; otherwise
            the stored content is shown.
          </p>
        </Section>

        <Section icon={<ShieldCheck className="w-5 h-5" />} title="Admin & users — who can edit">
          <ul className="list-disc pl-6 space-y-2 leading-7">
            <li>
              <b>Normal users browse read-only.</b> Editing content — analyzer parameters, QC series, accuracy studies,
              articles, news and events — is reserved for the administrator.
            </li>
            <li>
              Click the <b>Admin</b> button in the top bar and enter the password.
              <b> Default password: <span className="ltr-inline">admin</span></b> — change it right after the first
              login (Admin → Change admin password).
            </li>
            <li>
              The admin session lasts until you close the browser tab, or until you press <b>Log out</b>. Result entry
              (Result Integrity / Analyzer checking) stays available to everyone because it does not change stored
              content.
            </li>
          </ul>
        </Section>

        <Section icon={<HardDriveDownload className="w-5 h-5" />} title="Install on any device">
          <ul className="list-disc pl-6 space-y-2 leading-7">
            <li>
              <b>Web:</b> in Chrome/Edge click “Install app” (the + icon in the address bar).
            </li>
            <li>
              <b>Android:</b> open the server address in Chrome → menu → “Add to Home screen”. The app then runs
              full-screen like a native app. (To build a real APK: Capacitor — commands are in the project README.)
            </li>
            <li>
              <b>Desktop (Windows/macOS/Linux):</b> install from Chrome/Edge (App mode), or package with
              <span className="ltr-inline"> Electron/Tauri </span> as a desktop app — ready commands are in the README.
            </li>
          </ul>
        </Section>

        <Section icon={<MonitorSmartphone className="w-5 h-5" />} title="Your server, your data">
          <p>
            Nima runs on your own server (the laboratory computer); nothing leaves your network. User data is kept in
            the browser's <span className="ltr-inline">localStorage</span> on the same device. Use the backup below to
            move data to another device.
          </p>
        </Section>

        <Section icon={<Download className="w-5 h-5" />} title="Backup & restore">
          <div className="flex flex-wrap gap-3">
            <button onClick={doExport} className="bg-primary text-white rounded-xl px-5 py-3 text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export all data (JSON)
            </button>
          </div>
          <div className="mt-4">
            <label className="text-xs text-muted-foreground block mb-1.5">Restore: paste the backup file content here</label>
            <textarea
              value={imported}
              onChange={(e) => setImported(e.target.value)}
              rows={3}
              dir="ltr"
              className="w-full px-3 py-2.5 rounded-lg border text-xs outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              placeholder='{"app":"Nima", ...}'
            />
            <button
              onClick={doImport}
              disabled={!isAdmin}
              className="mt-2 bg-secondary hover:bg-secondary/70 rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50"
              title={isAdmin ? "" : "Admin only"}
            >
              Restore {isAdmin ? "" : "(admin)"}
            </button>
          </div>
        </Section>

        <Section icon={<Smartphone className="w-5 h-5" />} title="Purpose">
          <p>
            Nima was built for training and daily convenience of laboratory staff: 14 test disciplines, calculators for
            key formulas (Friedewald, Sampson-NIH, CKD-EPI 2021, HOMA-IR, …), quality control with Westgard rules,
            cross-test result integrity with charts (CK-MB/CPK, bilirubin fractions, lipid mass balance, anion gap,
            rule of three, …), 2024+ articles with Persian summaries and automatic sync, news and events. Numbers
            follow KDIGO/ADA/ACC-AHA guidelines and the original formula papers — always match borderline results with
            your laboratory's own protocol.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border p-5">
      <h2 className="font-bold flex items-center gap-2 mb-2 text-primary">
        <span className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">{icon}</span>
        {title}
      </h2>
      <div className="text-sm text-foreground/80 leading-7">{children}</div>
    </section>
  );
}
