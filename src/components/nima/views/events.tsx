"use client";

import { useState } from "react";
import { CalendarDays, Plus, Trash2, ExternalLink, MapPin, BadgeCheck, Clock, Lock, RefreshCw } from "lucide-react";
import { useEvents } from "@/lib/store";
import { uid } from "@/lib/checks";
import { useAuth, ReadOnlyNotice } from "@/lib/auth";
import type { LabEvent } from "@/lib/nima-types";
import { toast } from "@/hooks/use-toast";

function enDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export function EventsView({ go }: { go: (r: string, p?: string) => void }) {
  const [events, setEvents] = useEvents();
  const [form, setForm] = useState({ titleFa: "", city: "", country: "", dateStart: "", dateEnd: "", site: "", descFa: "" });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { isAdmin } = useAuth();

  const sorted = [...events].sort((a, b) => +new Date(a.dateStart) - +new Date(b.dateStart));

  // تابع رفرش برای همه کاربرها
  const refreshList = () => {
    setLoading(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setLoading(false);
      toast({ title: "Event list refreshed ✓" });
    }, 500);
  };

  const add = () => {
    if (!form.titleFa || !form.dateStart) {
      toast({ title: "Error", description: "Event name and start date are required." });
      return;
    }
    const e: LabEvent = {
      id: uid(),
      titleFa: form.titleFa,
      city: form.city,
      country: form.country,
      dateStart: form.dateStart,
      dateEnd: form.dateEnd || form.dateStart,
      site: form.site,
      descFa: form.descFa,
      verified: false,
      source: "user",
    };
    setEvents((prev) => [...prev, e]);
    setForm({ titleFa: "", city: "", country: "", dateStart: "", dateEnd: "", site: "", descFa: "" });
    toast({ title: "Event added ✓" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Laboratory Events & Exhibitions
          </h1>
          <p className="text-muted-foreground text-sm">
            Calendar of world and Iran IVD exhibitions — official events have verified dates. Only the admin can add events.
          </p>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-1">
              آخرین به‌روزرسانی: {lastUpdate.toLocaleTimeString("fa-IR")}
            </p>
          )}
        </div>

        {/* دکمه رفرش برای همه کاربرها */}
        <button
          onClick={refreshList}
          disabled={loading}
          className="bg-secondary text-foreground rounded-xl px-4 py-3 text-sm font-bold hover:bg-secondary/80 disabled:opacity-60 flex items-center gap-2 border"
          title="به‌روزرسانی لیست رویدادها"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr,360px] gap-6 items-start">
        <div className="space-y-3">
          {sorted.map((e) => {
            const past = new Date(e.dateEnd).getTime() < Date.now();
            return (
              <article
                key={e.id}
                className={`bg-white rounded-2xl border p-5 flex flex-wrap sm:flex-nowrap items-start gap-4 ${past ? "opacity-70" : ""}`}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0b5cad] to-[#00a5b5] text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] opacity-90">days</span>
                  <span className="text-sm font-extrabold ltr-inline">
                    {Math.max(0, Math.ceil((+new Date(e.dateStart) - Date.now()) / 86400000))}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold" dir="rtl">
                      {e.titleFa}
                    </h3>
                    {e.verified ? (
                      <span className="text-[11px] bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> verified dates
                      </span>
                    ) : (
                      <span className="text-[11px] bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> approximate dates
                      </span>
                    )}
                    {past && <span className="text-[11px] bg-secondary rounded-full px-2 py-0.5">passed</span>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {e.city}
                      {e.country && `, ${e.country}`}
                    </span>
                    <span className="ltr-inline">
                      {enDate(e.dateStart)}
                      {e.dateEnd !== e.dateStart ? ` → ${enDate(e.dateEnd)}` : ""}
                    </span>
                  </div>
                  {e.descFa && (
                    <p className="text-sm text-foreground/75 leading-6 mt-2" dir="rtl">
                      {e.descFa}
                    </p>
                  )}
                  {e.site && (
                    <a
                      href={e.site}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Official website
                    </a>
                  )}
                </div>
                {e.source === "user" && isAdmin && (
                  <button
                    onClick={() => setEvents((prev) => prev.filter((x) => x.id !== e.id))}
                    className="p-1.5 rounded hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </article>
            );
          })}
        </div>

        {/* Add form — admin only */}
        <div className="bg-white rounded-2xl border p-4 lg:sticky lg:top-20">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Add event
            {!isAdmin && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
          </h2>
          {isAdmin ? (
            <div className="space-y-2.5">
              <input
                value={form.titleFa}
                onChange={(ev) => setForm((f) => ({ ...f, titleFa: ev.target.value }))}
                placeholder="Event name (Persian)"
                dir="rtl"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={form.city}
                  onChange={(ev) => setForm((f) => ({ ...f, city: ev.target.value }))}
                  placeholder="City"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  value={form.country}
                  onChange={(ev) => setForm((f) => ({ ...f, country: ev.target.value }))}
                  placeholder="Country"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-muted-foreground">
                  Start
                  <input
                    type="date"
                    value={form.dateStart}
                    onChange={(ev) => setForm((f) => ({ ...f, dateStart: ev.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  End
                  <input
                    type="date"
                    value={form.dateEnd}
                    onChange={(ev) => setForm((f) => ({ ...f, dateEnd: ev.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
              </div>
              <input
                value={form.site}
                onChange={(ev) => setForm((f) => ({ ...f, site: ev.target.value }))}
                placeholder="Website URL (optional)"
                dir="ltr"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30 ltr-inline"
              />
              <textarea
                value={form.descFa}
                onChange={(ev) => setForm((f) => ({ ...f, descFa: ev.target.value }))}
                placeholder="Short description (Persian)"
                dir="rtl"
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={add} className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-bold hover:bg-primary/90">
                Save event
              </button>
            </div>
          ) : (
            <ReadOnlyNotice what="add or remove events" />
          )}
        </div>
      </div>
    </div>
  );
}