"use client";

import {
  CalendarDays,
  ArrowRight,
  BookOpenCheck,
  Droplets,
  Sigma,
  LineChart as LineChartIcon,
  Newspaper,
  GaugeCircle,
  Activity,
  Target,
} from "lucide-react";
import { NAV_ITEMS } from "@/components/nima/shell";
import { useEvents, useNews } from "@/lib/store";
import { ALL_TESTS } from "@/lib/data/tests";
import { FORMULAS } from "@/lib/data/formulas";

function enDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

const QUICK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tests: Droplets,
  formulas: Sigma,
  qc: LineChartIcon,
  integrity: GaugeCircle,
  accuracy: Target,
  analyzer: Activity,
  articles: BookOpenCheck,
  news: Newspaper,
  events: CalendarDays,
};

const QUICK_LABELS: Record<string, string> = {
  tests: "Lab Tests",
  formulas: "Formulas & Calculators",
  qc: "Quality Control",
  integrity: "Result Integrity",
  accuracy: "Bias & Accuracy",
  analyzer: "Analyzer & Results",
  articles: "Articles 2024+",
  news: "Lab News",
  events: "Events & Exhibitions",
};

export function HomeView({ go }: { go: (r: string, p?: string) => void }) {
  const [events] = useEvents();
  const [news] = useNews();
  const upcoming = events
    .filter((e) => new Date(e.dateEnd).getTime() >= Date.now())
    .sort((a, b) => +new Date(a.dateStart) - +new Date(b.dateStart))
    .slice(0, 3);

  return (
    <div>
      {/* Hero — Agappe-style full-width image */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-lab.jpg')" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#083a6b]/95 via-[#0b5cad]/85 to-[#0b5cad]/35"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32">
          <h1
            className="text-6xl sm:text-8xl font-extrabold text-white tracking-wide mb-3"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Nima
          </h1>
          <div className="w-24 h-1 rounded bg-cyan-300 mb-4" aria-hidden="true" />
          <p className="text-cyan-100 text-lg sm:text-xl font-medium tracking-wide mb-8">
            Your Complete Laboratory Companion
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => go("tests")}
              className="inline-flex items-center gap-2 bg-white text-[#0b5cad] font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              Explore Tests
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => go("integrity")}
              className="inline-flex items-center gap-2 bg-white/15 border border-white/40 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/25 transition-colors backdrop-blur"
            >
              <GaugeCircle className="w-5 h-5" />
              Result Integrity
            </button>
          </div>
        </div>
      </section>

      {/* Quick links — icon + name only (Agappe-style product grid) */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {NAV_ITEMS.filter((n) => n.id !== "home" && n.id !== "help").map((item) => {
            const Icon = QUICK_ICONS[item.id] || item.icon;
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                title={item.desc}
                className="group bg-white rounded-2xl border border-border p-6 flex items-center gap-4 hover:border-primary/60 hover:shadow-lg transition-all text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="font-bold text-[#0b5cad] leading-tight">{QUICK_LABELS[item.id] || item.label}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Stats band with image */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/tubes-lab.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#083a6b]/85" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
          {[
            { n: ALL_TESTS.length.toLocaleString("en-US") + "+", l: "Lab Tests" },
            { n: FORMULAS.length.toLocaleString("en-US"), l: "Formulas" },
            { n: "2024+", l: "Articles" },
            { n: "Offline", l: "Ready" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-3xl sm:text-4xl font-extrabold">{s.n}</div>
              <div className="text-xs sm:text-sm text-cyan-100 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* News + Events preview */}
      <section className="mx-auto max-w-7xl px-4 py-14 grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" />
              Latest News
            </h3>
            <button onClick={() => go("news")} className="text-sm text-primary hover:underline font-medium">
              All news →
            </button>
          </div>
          <div className="space-y-3">
            {news.slice(0, 3).map((n) => (
              <button
                key={n.id}
                onClick={() => go("news")}
                className="w-full text-left rounded-xl border bg-white p-4 flex items-start gap-3 hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary shrink-0">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm leading-6" dir="rtl">
                    {n.titleFa}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {n.sourceName} — {enDate(n.date)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Upcoming Events
            </h3>
            <button onClick={() => go("events")} className="text-sm text-primary hover:underline font-medium">
              All events →
            </button>
          </div>
          <div className="space-y-3">
            {upcoming.map((e) => (
              <button
                key={e.id}
                onClick={() => go("events")}
                className="w-full text-left rounded-xl border bg-white p-4 flex items-start gap-3 hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm" dir="rtl">
                    {e.titleFa}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {e.city} — {enDate(e.dateStart)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
