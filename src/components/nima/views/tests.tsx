"use client";

import { useMemo, useState } from "react";
import { Search, ArrowRight, FlaskConical, BookOpen, AlertTriangle } from "lucide-react";
import { CAT_MAP, CATEGORIES } from "@/lib/data/categories";
import { ALL_TESTS, searchTests } from "@/lib/data/tests";
import { TEST_MAP } from "@/lib/data/tests";
import type { CatId, LabTest } from "@/lib/nima-types";

export function TestsView({ param, go }: { param: string; go: (r: string, p?: string) => void }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CatId | "">("");

  const selected = param ? TEST_MAP[param] : undefined;

  const results = useMemo(() => searchTests(query, cat || undefined), [query, cat]);
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    ALL_TESTS.forEach((t) => (m[t.cat] = (m[t.cat] || 0) + 1));
    return m;
  }, []);

  if (selected) {
    return <TestDetail t={selected} go={go} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-1">Laboratory Tests Reference</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {ALL_TESTS.length.toLocaleString("en-US")} tests across 14 disciplines — biochemistry, hormones, hematology,
        coagulation, immunology, virology, microbiology, molecular, tumor markers, urine, toxicology and blood banking.
        (Descriptions are shown in Persian.)
      </p>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search: Latin or Persian name, abbreviation… e.g. LDL or thyroid"
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border bg-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
          aria-label="Search tests"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCat("")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            cat === "" ? "bg-primary text-white border-primary" : "bg-white hover:bg-secondary"
          }`}
        >
          All ({ALL_TESTS.length.toLocaleString("en-US")})
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(cat === c.id ? "" : c.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              cat === c.id ? "bg-primary text-white border-primary" : "bg-white hover:bg-secondary"
            }`}
          >
            {c.en} ({(counts[c.id] || 0).toLocaleString("en-US")})
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((t) => (
          <TestCard key={t.id} t={t} go={go} />
        ))}
        {results.length === 0 && (
          <div className="col-span-full text-center py-14 text-muted-foreground">
            Nothing found — try another Latin or Persian name.
          </div>
        )}
      </div>
    </div>
  );
}

function TestCard({ t, go }: { t: LabTest; go: (r: string, p?: string) => void }) {
  const c = CAT_MAP[t.cat];
  return (
    <button
      onClick={() => go("tests", t.id)}
      className="text-left bg-white rounded-xl border p-4 hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-xs font-medium bg-secondary text-secondary-foreground rounded-full px-2.5 py-1">
          {c?.en}
        </span>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
      <div className="font-bold ltr-inline">{t.en}</div>
      <div className="text-xs text-muted-foreground" dir="rtl">
        {t.fa}
      </div>
      <div className="text-xs mt-2 text-foreground/70 line-clamp-2" dir="rtl">
        {t.sig}
      </div>
    </button>
  );
}

export function TestDetail({ t, go }: { t: LabTest; go: (r: string, p?: string) => void }) {
  const c = CAT_MAP[t.cat];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button onClick={() => go("tests")} className="text-sm text-primary hover:underline mb-4 inline-flex items-center gap-1">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Back to list
      </button>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="bg-gradient-to-r from-[#0b5cad] to-[#00a5b5] text-white p-6">
          <span className="text-xs bg-white/20 rounded-full px-3 py-1">{c?.en}</span>
          <h1 className="text-2xl font-extrabold mt-3 ltr-inline">{t.en}</h1>
          <div className="text-white/85 mt-1" dir="rtl">
            {t.fa}
          </div>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
          <InfoRow label="Specimen" value={t.sp} />
          <InfoRow label="Unit" value={t.unit} />
          <InfoRow label="Reference range" value={t.ref} highlight />
          {t.f && (
            <InfoRow
              label="Related formula"
              value={
                <button onClick={() => go("formulas", t.f)} className="text-primary hover:underline inline-flex items-center gap-1">
                  <FlaskConical className="w-4 h-4" /> Open formula & calculator
                </button>
              }
            />
          )}
          <div className="sm:col-span-2">
            <div className="font-bold mb-1">Clinical significance</div>
            <p className="text-foreground/80 leading-7" dir="rtl">
              {t.sig}
            </p>
          </div>
          {t.intr && (
            <div className="sm:col-span-2 rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-700 text-sm">Interferences & pre-analytical notes</div>
                <p className="text-sm text-amber-800/90 mt-1 leading-6" dir="rtl">
                  {t.intr}
                </p>
              </div>
            </div>
          )}
          {t.hot && (
            <div className="sm:col-span-2 rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="font-bold text-red-700 text-sm">Critical values</div>
              <p className="text-sm text-red-800/90 mt-1" dir="rtl">
                {t.hot}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => go("articles")}
          className="inline-flex items-center gap-2 text-sm bg-white border rounded-xl px-4 py-2.5 hover:bg-secondary"
        >
          <BookOpen className="w-4 h-4 text-primary" />
          Related articles 2024+
        </button>
        <button
          onClick={() => go("analyzer")}
          className="inline-flex items-center gap-2 text-sm bg-white border rounded-xl px-4 py-2.5 hover:bg-secondary"
        >
          <FlaskConical className="w-4 h-4 text-primary" />
          Enter this test result in troubleshooting
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3.5 ${highlight ? "bg-secondary/60 border-primary/20" : ""}`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="font-medium leading-6">{value}</div>
    </div>
  );
}
