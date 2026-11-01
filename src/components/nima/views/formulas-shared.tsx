"use client";

import { useMemo, useState } from "react";
import { Sigma, ArrowLeft, Info } from "lucide-react";
import { FORMULAS, FORMULA_MAP } from "@/lib/data/formulas";
import { CATEGORIES } from "@/lib/data/categories";

export function CALCULATOR({ param, go }: { param: string; go: (r: string, p?: string) => void }) {
  const [selectedId, setSelectedId] = useState<string>(param || "ldl-friedewald");
  const selected = FORMULA_MAP[selectedId] || FORMULAS[0];
  const [values, setValues] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      FORMULAS.filter(
        (f) => f.fa.includes(search) || f.en.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const result = useMemo(() => {
    const parsed: Record<string, number> = {};
    for (const input of selected.inputs) {
      const v = parseFloat(values[input.key] || "");
      parsed[input.key] = isNaN(v) ? NaN : v;
    }
    const ok = selected.inputs.every((i) => !isNaN(parsed[i.key]) && parsed[i.key] !== undefined);
    if (!ok) return null;
    return selected.compute(parsed);
  }, [values, selected]);

  const interp = useMemo(() => {
    if (result === null || result === undefined || isNaN(result)) return null;
    const parsed: Record<string, number> = {};
    for (const input of selected.inputs) parsed[input.key] = parseFloat(values[input.key] || "0") || 0;
    return selected.interp(result, parsed);
  }, [result, values, selected]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <button
        onClick={() => go("home")}
        className="text-sm text-muted-foreground hover:text-primary mb-3 inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Home
      </button>
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <Sigma className="w-6 h-6 text-primary" />
        Clinical Formulas with Calculators
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        {FORMULAS.length.toLocaleString("en-US")} clinical formulas with live calculators — from Friedewald and
        Sampson-NIH to CKD-EPI 2021 and HOMA-IR. (Names and interpretations are shown in Persian.)
      </p>

      <div className="grid lg:grid-cols-[320px,1fr] gap-6 items-start">
        {/* Formula list */}
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-3 border-b">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search formulas…"
              className="w-full px-3 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary/30 outline-none text-sm"
            />
          </div>
          <div className="max-h-[520px] overflow-y-auto nice-scroll">
            {filtered.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedId(f.id);
                  setValues({});
                  window.location.hash = `#/formulas/${f.id}`;
                }}
                className={`w-full text-left px-4 py-3 border-b last:border-0 text-sm hover:bg-secondary transition-colors ${
                  f.id === selectedId ? "bg-secondary font-bold" : ""
                }`}
              >
                <div className="ltr-inline">{f.en}</div>
                <div className="text-[11px] text-muted-foreground" dir="rtl">
                  {f.fa}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Calculator */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-extrabold text-primary ltr-inline">{selected.en}</h2>
          <div className="text-sm text-muted-foreground mb-4" dir="rtl">
            {selected.fa}
          </div>

          <div
            className="rounded-xl bg-secondary/70 border p-4 mb-6 text-center text-lg leading-8 ltr-inline"
            dangerouslySetInnerHTML={{ __html: selected.expr }}
          />

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {selected.inputs.map((inp) => (
              <div key={inp.key}>
                <label className="block text-sm font-medium mb-1.5">
                  {inp.fa}
                  {inp.unit && inp.unit !== "—" && (
                    <span className="text-muted-foreground text-xs ltr-inline"> ({inp.unit})</span>
                  )}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={values[inp.key] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [inp.key]: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3.5 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
            ))}
          </div>

          {result !== null && !isNaN(result) ? (
            <div className="rounded-2xl bg-gradient-to-r from-[#0b5cad] to-[#00a5b5] text-white p-5 mb-4">
              <div className="text-sm text-white/80 mb-1" dir="rtl">
                {selected.out.fa}
              </div>
              <div className="text-3xl font-extrabold ltr-inline">
                {result.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                <span className="text-base font-medium text-white/80 ltr-inline"> {selected.out.unit}</span>
              </div>
              {interp && (
                <div className="text-sm mt-3 bg-white/15 rounded-lg p-3 leading-6" dir="rtl">
                  {interp}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground mb-4">
              Enter all inputs to see the result and interpretation.
            </div>
          )}

          <div className="rounded-xl bg-cyan-50 border border-cyan-200 p-4 flex gap-3">
            <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div className="text-sm leading-6">
              <div className="font-bold text-cyan-800 mb-1">References</div>
              <ul className="list-disc pl-5 space-y-1 text-cyan-900/85">
                {selected.refs.map((r) => (
                  <li key={r} className="ltr-inline text-left w-full">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {selected.cats && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.cats.map((cid) => {
                const c = CATEGORIES.find((x) => x.id === cid);
                if (!c) return null;
                return (
                  <button
                    key={cid}
                    onClick={() => go("tests")}
                    className="text-xs bg-white border rounded-full px-3 py-1.5 hover:bg-secondary"
                  >
                    {c.en} tests
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
