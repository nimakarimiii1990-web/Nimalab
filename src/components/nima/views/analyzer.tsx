"use client";

import { useMemo, useRef, useState } from "react";
import { Activity, Upload, Plus, Trash2, FileDown, ClipboardList, AlertTriangle, GaugeCircle, Lock } from "lucide-react";
import { useParams } from "@/lib/store";
import { checkRow, uid } from "@/lib/checks";
import { useAuth, ReadOnlyNotice } from "@/lib/auth";
import { ALL_TESTS, TEST_MAP } from "@/lib/data/tests";
import { NUM_LIMITS } from "@/lib/data/param-limits";
import type { AnalyzerParam, PatientResultRow } from "@/lib/nima-types";
import { toast } from "@/hooks/use-toast";

const STATUS_STYLE: Record<string, string> = {
  ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
  low: "bg-sky-50 text-sky-700 border-sky-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  error: "bg-red-50 text-red-700 border-red-200",
};
const STATUS_EN: Record<string, string> = {
  ok: "Acceptable",
  low: "Low",
  high: "High",
  critical: "Critical",
  error: "Must be reviewed",
};

export function AnalyzerView({ go }: { go: (r: string, p?: string) => void }) {
  const [params, setParams] = useParams();
  const [rows, setRows] = useState<PatientResultRow[]>([]);
  const [addForm, setAddForm] = useState({ testId: "", value: "", prev: "" });
  const [bulk, setBulk] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAuth();

  // Seed defaults from database (admin only)
  const seedDefaults = () => {
    const seeds: AnalyzerParam[] = ALL_TESTS.filter((t) =>
      ["biochem", "enzyme", "cardiac", "hormone", "hematology", "coag", "tox"].includes(t.cat)
    ).map((t) => ({
      id: t.id,
      fa: t.fa,
      en: t.en,
      unit: t.unit,
      ...(NUM_LIMITS[t.id] || {}),
      source: "seed" as const,
      formula: t.f,
    }));
    setParams(seeds);
    toast({
      title: `${seeds.length} base parameters loaded ✓`,
      description: "Default standard reference ranges inserted; refine them with your own analyzer brochure.",
    });
  };

  const importFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        let imported: AnalyzerParam[] = [];
        if (file.name.endsWith(".json")) {
          const j = JSON.parse(text);
          imported = (Array.isArray(j) ? j : j.params).map((p: Record<string, unknown>) => ({
            id: String(p.id || p.en || p.name || uid()),
            fa: String(p.fa || p.nameFa || p.name || ""),
            en: String(p.en || p.nameEn || p.name || ""),
            unit: String(p.unit || ""),
            refLow: num(p.refLow),
            refHigh: num(p.refHigh),
            critLow: num(p.critLow),
            critHigh: num(p.critHigh),
            decimals: num(p.decimals),
            formula: p.formula ? String(p.formula) : undefined,
            source: "user" as const,
          }));
        } else {
          // CSV: id,fa,en,unit,refLow,refHigh,critLow,critHigh
          const lines = text.split(/\r?\n/).filter((l) => l.trim());
          const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
          imported = lines.slice(1).map((line) => {
            const cells = line.split(",").map((c) => c.trim());
            const get = (k: string) => cells[header.indexOf(k)];
            return {
              id: get("id") || get("en") || uid(),
              fa: get("fa") || get("name") || "",
              en: get("en") || "",
              unit: get("unit") || "",
              refLow: num(get("reflow")),
              refHigh: num(get("refhigh")),
              critLow: num(get("critlow")),
              critHigh: num(get("crithigh")),
              source: "user" as const,
            };
          });
        }
        setParams((prev) => [...prev.filter((p) => !imported.some((i) => i.id === p.id)), ...imported]);
        toast({ title: `${imported.length} parameters imported ✓` });
      } catch {
        toast({ title: "Error reading file", description: "Use a valid JSON or CSV format." });
      }
    };
    reader.readAsText(file);
  };

  const exportTemplate = () => {
    const tpl = "id,fa,en,unit,refLow,refHigh,critLow,critHigh\nna,سدیم,Sodium,mEq/L,135,145,120,160\nk,پتاسیم,Potassium,mEq/L,3.5,5.1,2.5,6.5\nglu-fbs,قند ناشتا,Fasting Glucose,mg/dL,70,100,50,400\n";
    const blob = new Blob([tpl], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nima-params-template.csv";
    a.click();
  };

  const addRow = () => {
    const t = TEST_MAP[addForm.testId];
    const p = params.find((x) => x.id === addForm.testId);
    const v = parseFloat(addForm.value);
    if ((!t && !p) || isNaN(v)) {
      toast({ title: "Error", description: "Select a test and enter a value." });
      return;
    }
    const prev = addForm.prev ? parseFloat(addForm.prev) : undefined;
    setRows((r) => [
      ...r,
      {
        id: uid(),
        paramId: addForm.testId,
        nameEn: p?.en || t?.en || addForm.testId,
        nameFa: p?.fa || t?.fa || addForm.testId,
        unit: p?.unit || t?.unit || "",
        value: v,
        prev: prev !== undefined && !isNaN(prev) ? prev : undefined,
      },
    ]);
    setAddForm({ testId: "", value: "", prev: "" });
  };

  // Free-text bulk input: "Name = value" per line (accepts latin or persian names)
  const addBulk = () => {
    let added = 0;
    const lines = bulk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const newRows: PatientResultRow[] = [];
    const stripParen = (s: string) => s.replace(/\s*[(（].*?[)）]\s*/g, "").trim();
    for (const line of lines) {
      const m = line.match(/^(.+?)\s*[=،:]\s*([\d.]+)\s*(.*)$/);
      if (!m) continue;
      const name = m[1].trim();
      const value = parseFloat(m[2]);
      if (isNaN(value)) continue;
      const nl = name.toLowerCase();
      const p =
        params.find((x) => stripParen(x.en).toLowerCase() === nl) ||
        params.find((x) => x.fa === name) ||
        ALL_TESTS.find((t) => stripParen(t.en).toLowerCase() === nl) ||
        ALL_TESTS.find((t) => t.fa === name) ||
        ALL_TESTS.find((t) => t.id === nl) ||
        ALL_TESTS.find((t) => stripParen(t.en).toLowerCase().startsWith(nl) && nl.length >= 3) ||
        ALL_TESTS.find((t) => t.syn?.toLowerCase().includes(nl) && nl.length >= 3);
      if (!p) continue;
      newRows.push({
        id: uid(),
        paramId: p.id,
        nameEn: p.en,
        nameFa: p.fa,
        unit: p.unit,
        value,
      });
      added++;
    }
    if (added === 0) {
      toast({ title: "Nothing recognised", description: "Format per line: Sodium = 132 (Latin or Persian name)" });
      return;
    }
    setRows((r) => [...r, ...newRows]);
    setBulk("");
    toast({ title: `${added} results added ✓` });
  };

  const report = useMemo(() => rows.map((r) => checkRow(r, params.find((p) => p.id === r.paramId))), [rows, params]);
  const hasIssues = report.some((r) => r.status !== "ok");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <Activity className="w-6 h-6 text-primary" />
        Analyzer Parameters & Result Troubleshooting
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Load your analyzer's parameters (admin), enter patient results, and see what to check: reference range,
        critical values, delta check, unit sanity — plus cross-test consistency in the{" "}
        <button onClick={() => go("integrity")} className="text-primary font-bold hover:underline">
          Result Integrity
        </button>{" "}
        page.
      </p>

      <div className="grid lg:grid-cols-2 gap-6 items-start mb-8">
        {/* Params manager */}
        <div className="bg-white rounded-2xl border">
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold text-sm flex items-center gap-2">
              Analyzer parameters ({params.length.toLocaleString("en-US")})
              {!isAdmin && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            </h2>
            {isAdmin ? (
              <div className="flex gap-2">
                <button onClick={seedDefaults} className="text-xs bg-secondary hover:bg-secondary/70 rounded-lg px-3 py-2">
                  Load base parameters
                </button>
                <button onClick={() => fileRef.current?.click()} className="text-xs bg-primary text-white rounded-lg px-3 py-2 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Import file
                </button>
                <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
                <button onClick={exportTemplate} className="text-xs bg-white border rounded-lg px-3 py-2 flex items-center gap-1.5" title="CSV template">
                  <FileDown className="w-3.5 h-3.5" /> Template
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground">admin only</span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto nice-scroll">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Test</th>
                  <th className="px-3 py-2 text-left">Unit</th>
                  <th className="px-3 py-2 text-left">Reference</th>
                  <th className="px-3 py-2 text-left">Critical</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {params.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">
                      <div className="ltr-inline">{p.en}</div>
                      <div className="text-[11px] text-muted-foreground" dir="rtl">{p.fa}</div>
                    </td>
                    <td className="px-3 py-2 text-xs ltr-inline">{p.unit}</td>
                    <td className="px-3 py-2 text-xs ltr-inline">
                      {p.refLow !== undefined && p.refHigh !== undefined ? `${p.refLow} – ${p.refHigh}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs ltr-inline">
                      {p.critLow !== undefined || p.critHigh !== undefined
                        ? `${p.critLow ?? "-"} / ${p.critHigh ?? "+"}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {isAdmin && (
                        <button
                          onClick={() => setParams((prev) => prev.filter((x) => x.id !== p.id))}
                          className="p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {params.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No parameters yet — the admin can load base parameters or import a CSV/JSON from your analyzer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t bg-secondary/30 text-xs text-muted-foreground leading-5">
            CSV format: <span className="ltr-inline">id,fa,en,unit,refLow,refHigh,critLow,critHigh</span> — refine
            reference and critical values from your own analyzer brochure.
          </div>
        </div>

        {/* Result entry — available to every user (checking, not editing content) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-bold text-sm mb-3">Add a result</h2>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,100px,100px,auto] gap-2">
              <select
                value={addForm.testId}
                onChange={(e) => setAddForm((f) => ({ ...f, testId: e.target.value }))}
                className="px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select a test…</option>
                {ALL_TESTS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.en} ({t.fa})
                  </option>
                ))}
              </select>
              <input
                value={addForm.value}
                onChange={(e) => setAddForm((f) => ({ ...f, value: e.target.value }))}
                type="number"
                step="any"
                placeholder="Result"
                className="px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                value={addForm.prev}
                onChange={(e) => setAddForm((f) => ({ ...f, prev: e.target.value }))}
                type="number"
                step="any"
                placeholder="Previous"
                className="px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={addRow} className="bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-primary/90 flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-bold text-sm mb-2">Quick entry (one per line: Name = value)</h2>
            <textarea
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              rows={4}
              dir="ltr"
              placeholder={"Sodium = 132\nPotassium = 5.9\nHbA1c = 8.2"}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30 font-mono"
            />
            <button onClick={addBulk} className="mt-2 bg-secondary hover:bg-secondary/70 rounded-lg px-4 py-2 text-sm font-bold">
              Detect & add
            </button>
          </div>
        </div>
      </div>

      {/* Report */}
      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                Troubleshooting report ({rows.length.toLocaleString("en-US")} results)
              </h2>
              <button onClick={() => setRows([])} className="text-xs text-red-500 hover:underline">
                Clear all
              </button>
            </div>
            <div className="divide-y">
              {report.map((r, i) => (
                <div key={i} className="p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-xs font-bold rounded-full px-3 py-1 border ${STATUS_STYLE[r.status]}`}>
                      {STATUS_EN[r.status]}
                    </span>
                    <b className="ltr-inline">{r.nameEn}</b>
                    <span className="text-muted-foreground ltr-inline text-sm">
                      {r.value} {r.unit}
                    </span>
                    <button
                      onClick={() => setRows((prev) => prev.filter((x) => x.id !== rows[i].id))}
                      className="p-1 rounded hover:bg-red-50 ml-auto"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                  {r.messages.length > 0 ? (
                    <ul className="text-sm space-y-1 pl-1">
                      {r.messages.map((m, j) => (
                        <li key={j} className="flex gap-2 leading-6">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-emerald-600">Everything is consistent ✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA — cross-test checks */}
          <div className="bg-gradient-to-r from-[#0b5cad] to-[#00a5b5] rounded-2xl text-white p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <GaugeCircle className="w-6 h-6" />
              </div>
              <div className="text-sm leading-6">
                <b className="block">Cross-test consistency (CK-MB/CPK, bilirubin fractions, lipid balance…)</b>
                Enter all results of this sample in Result Integrity to see relationship warnings with charts.
              </div>
            </div>
            <button
              onClick={() => go("integrity")}
              className="sm:ml-auto bg-white text-[#0b5cad] font-bold rounded-xl px-5 py-3 text-sm hover:shadow-lg transition-shadow shrink-0"
            >
              Open Result Integrity
            </button>
          </div>

          {hasIssues && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 leading-6">
              <b>Suggested next step:</b> for flagged analytes, review the QC series in{" "}
              <button onClick={() => go("qc")} className="text-primary font-bold hover:underline">Quality Control</button>{" "}
              (Westgard rules), and check pre-analytical interferences (hemolysis, biotin, lipemia) in the test details.
            </div>
          )}
          {!isAdmin && <ReadOnlyNotice what="edit analyzer parameters (upload, load defaults, delete)" />}
        </div>
      )}
    </div>
  );
}

function num(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}
