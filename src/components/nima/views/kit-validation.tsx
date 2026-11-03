"use client";

import { useMemo, useState } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Line, ComposedChart, Legend, BarChart, Bar, Cell,
} from "recharts";
import { FlaskConical, Plus, Trash2, Download, Lock } from "lucide-react";
import { useKitValidations } from "@/lib/store";
import { uid } from "@/lib/checks";
import { useAuth, ReadOnlyNotice } from "@/lib/auth";
import type { KitValidationStudy, KitValReplicate, KitValAccuracyPoint, KitValLinearityPoint } from "@/lib/nima-types";
import { toast } from "@/hooks/use-toast";

/* ---------- stats helpers (CLSI-style) ---------- */
function mean(xs: number[]) {
  if (!xs.length) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function sd(xs: number[]) {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}
function cv(xs: number[]) {
  const m = mean(xs);
  const s = sd(xs);
  if (!m || isNaN(s)) return NaN;
  return (s / Math.abs(m)) * 100;
}
function linearRegression(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 2) return { slope: NaN, intercept: NaN, r2: NaN };
  const mx = mean(xs), my = mean(ys);
  let num = 0, den = 0, ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? NaN : num / den;
  const intercept = my - slope * mx;
  for (let i = 0; i < n; i++) {
    const pred = slope * xs[i] + intercept;
    ssRes += (ys[i] - pred) ** 2;
    ssTot += (ys[i] - my) ** 2;
  }
  const r2 = ssTot === 0 ? NaN : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}
const fmt = (x: number, d = 2) => (x == null || isNaN(x) ? "—" : Number(x).toFixed(d));

export function KitValidationView() {
  const [studies, setStudies] = useKitValidations();
  const { isAdmin } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"precision" | "accuracy" | "linearity" | "summary">("summary");

  const [meta, setMeta] = useState({
    kitName: "", analyte: "", unit: "mg/dL", lot: "", manufacturer: "",
    tea: "10", claimCV: "", claimBias: "", startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10), analyst: "", notes: "",
  });

  const [repForm, setRepForm] = useState({ runId: "Run1", date: new Date().toISOString().slice(0, 10), level: "L1", value: "" });
  const [accForm, setAccForm] = useState({ date: new Date().toISOString().slice(0, 10), sample: "", target: "", measured: "" });
  const [linForm, setLinForm] = useState({ date: new Date().toISOString().slice(0, 10), expected: "", measured: "" });

  const selected = studies.find((s) => s.id === selectedId) || studies[0] || null;

  const createStudy = () => {
    if (!isAdmin) return;
    if (!meta.kitName || !meta.analyte) {
      toast({ title: "Error", description: "Kit name and analyte are required." });
      return;
    }
    const s: KitValidationStudy = {
      id: uid(),
      kitName: meta.kitName,
      analyte: meta.analyte,
      unit: meta.unit || "—",
      lot: meta.lot,
      manufacturer: meta.manufacturer,
      tea: parseFloat(meta.tea) || 10,
      claimCV: parseFloat(meta.claimCV) || 0,
      claimBias: parseFloat(meta.claimBias) || 0,
      startDate: meta.startDate,
      endDate: meta.endDate,
      analyst: meta.analyst,
      notes: meta.notes,
      replicates: [],
      accuracyPoints: [],
      linearityPoints: [],
      createdAt: new Date().toISOString(),
    };
    setStudies((prev) => [...prev, s]);
    setSelectedId(s.id);
    toast({ title: "Study created ✓" });
  };

  const removeStudy = (id: string) => {
    if (!isAdmin) return;
    setStudies((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const addReplicate = () => {
    if (!isAdmin || !selected) return;
    const v = parseFloat(repForm.value);
    if (isNaN(v)) return toast({ title: "Enter a valid value" });
    const r: KitValReplicate = {
      id: uid(), runId: repForm.runId || "Run1", date: repForm.date,
      level: repForm.level || "L1", value: v,
    };
    setStudies((prev) =>
      prev.map((s) => (s.id === selected.id ? { ...s, replicates: [...s.replicates, r] } : s))
    );
    setRepForm((f) => ({ ...f, value: "" }));
  };

  const addAccuracy = () => {
    if (!isAdmin || !selected) return;
    const target = parseFloat(accForm.target);
    const measured = parseFloat(accForm.measured);
    if (isNaN(target) || isNaN(measured) || target === 0) return toast({ title: "Enter valid target & measured" });
    const p: KitValAccuracyPoint = {
      id: uid(), date: accForm.date, sample: accForm.sample || `S${selected.accuracyPoints.length + 1}`,
      target, measured,
    };
    setStudies((prev) =>
      prev.map((s) => (s.id === selected.id ? { ...s, accuracyPoints: [...s.accuracyPoints, p] } : s))
    );
    setAccForm((f) => ({ ...f, sample: "", target: "", measured: "" }));
  };

  const addLinearity = () => {
    if (!isAdmin || !selected) return;
    const expected = parseFloat(linForm.expected);
    const measured = parseFloat(linForm.measured);
    if (isNaN(expected) || isNaN(measured)) return toast({ title: "Enter valid expected & measured" });
    const p: KitValLinearityPoint = { id: uid(), date: linForm.date, expected, measured };
    setStudies((prev) =>
      prev.map((s) => (s.id === selected.id ? { ...s, linearityPoints: [...s.linearityPoints, p] } : s))
    );
    setLinForm((f) => ({ ...f, expected: "", measured: "" }));
  };

  /* ---- precision calculations ---- */
  const precision = useMemo(() => {
    if (!selected) return null;
    const byLevel: Record<string, KitValReplicate[]> = {};
    selected.replicates.forEach((r) => {
      (byLevel[r.level] ||= []).push(r);
    });
    return Object.entries(byLevel).map(([level, reps]) => {
      const values = reps.map((r) => r.value);
      // Within-run: group by runId, mean of within-run SDs conceptually → use all same-run groups
      const byRun: Record<string, number[]> = {};
      reps.forEach((r) => { (byRun[r.runId] ||= []).push(r.value); });
      const withinCVs: number[] = [];
      const withinSDs: number[] = [];
      Object.values(byRun).forEach((vs) => {
        if (vs.length >= 2) {
          withinSDs.push(sd(vs));
          withinCVs.push(cv(vs));
        }
      });
      const withinRunSD = withinSDs.length ? mean(withinSDs) : sd(values);
      const withinRunCV = withinCVs.length ? mean(withinCVs) : cv(values);
      // Between-run = overall (within-lab) precision on all points
      const betweenRunSD = sd(values);
      const betweenRunCV = cv(values);
      return {
        level,
        n: values.length,
        runs: Object.keys(byRun).length,
        mean: mean(values),
        withinRunSD,
        withinRunCV,
        betweenRunSD,
        betweenRunCV,
        values,
      };
    });
  }, [selected]);

  const accuracyStats = useMemo(() => {
    if (!selected?.accuracyPoints.length) return null;
    const biases = selected.accuracyPoints.map((p) => ((p.measured - p.target) / p.target) * 100);
    const recoveries = selected.accuracyPoints.map((p) => (p.measured / p.target) * 100);
    return {
      n: biases.length,
      meanBias: mean(biases),
      meanRecovery: mean(recoveries),
      points: selected.accuracyPoints.map((p) => ({
        ...p,
        bias: ((p.measured - p.target) / p.target) * 100,
        recovery: (p.measured / p.target) * 100,
      })),
    };
  }, [selected]);

  const linearityStats = useMemo(() => {
    if (!selected || selected.linearityPoints.length < 2) return null;
    const xs = selected.linearityPoints.map((p) => p.expected);
    const ys = selected.linearityPoints.map((p) => p.measured);
    const reg = linearRegression(xs, ys);
    return {
      ...reg,
      points: selected.linearityPoints.map((p) => ({
        ...p,
        predicted: reg.slope * p.expected + reg.intercept,
      })),
    };
  }, [selected]);

  const exportExcel = () => {
    if (!selected) return;
    const lines: string[] = [];
    const q = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    lines.push("KIT VALIDATION REPORT (CLSI-aligned)");
    lines.push(`Kit,${q(selected.kitName)}`);
    lines.push(`Analyte,${q(selected.analyte)}`);
    lines.push(`Unit,${q(selected.unit)}`);
    lines.push(`Lot,${q(selected.lot)}`);
    lines.push(`Manufacturer,${q(selected.manufacturer)}`);
    lines.push(`TEa %,${selected.tea}`);
    lines.push(`Claim CV %,${selected.claimCV}`);
    lines.push(`Claim Bias %,${selected.claimBias}`);
    lines.push(`Start date,${selected.startDate}`);
    lines.push(`End date,${selected.endDate}`);
    lines.push(`Analyst,${q(selected.analyst)}`);
    lines.push(`Notes,${q(selected.notes)}`);
    lines.push("");
    lines.push("PRECISION (Within-run & Between-run)");
    lines.push("Level,n,Runs,Mean,Within-run SD,Within-run CV%,Between-run SD,Between-run CV%,Claim CV%,Pass Within,Pass Between");
    (precision || []).forEach((p) => {
      const passW = selected.claimCV ? p.withinRunCV <= selected.claimCV * 1.5 : "";
      const passB = selected.claimCV ? p.betweenRunCV <= selected.claimCV * 1.5 : "";
      lines.push([p.level, p.n, p.runs, fmt(p.mean), fmt(p.withinRunSD), fmt(p.withinRunCV), fmt(p.betweenRunSD), fmt(p.betweenRunCV), selected.claimCV, passW, passB].join(","));
    });
    lines.push("");
    lines.push("REPLICATES RAW");
    lines.push("Date,Run,Level,Value");
    selected.replicates.forEach((r) => lines.push([r.date, r.runId, r.level, r.value].join(",")));
    lines.push("");
    lines.push("ACCURACY / TRUENESS");
    lines.push("Date,Sample,Target,Measured,Bias %,Recovery %");
    (accuracyStats?.points || []).forEach((p) =>
      lines.push([p.date, q(p.sample), p.target, p.measured, fmt(p.bias), fmt(p.recovery)].join(","))
    );
    if (accuracyStats) {
      lines.push(`Mean bias %,${fmt(accuracyStats.meanBias)}`);
      lines.push(`Mean recovery %,${fmt(accuracyStats.meanRecovery)}`);
      lines.push(`TEa %,${selected.tea}`);
      lines.push(`Bias within TEa,${Math.abs(accuracyStats.meanBias) <= selected.tea ? "PASS" : "FAIL"}`);
    }
    lines.push("");
    lines.push("LINEARITY / REGRESSION");
    lines.push("Date,Expected,Measured,Predicted");
    (linearityStats?.points || []).forEach((p) =>
      lines.push([p.date, p.expected, p.measured, fmt(p.predicted)].join(","))
    );
    if (linearityStats) {
      lines.push(`Slope,${fmt(linearityStats.slope, 4)}`);
      lines.push(`Intercept,${fmt(linearityStats.intercept, 4)}`);
      lines.push(`R-squared,${fmt(linearityStats.r2, 4)}`);
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `KitValidation_${selected.kitName.replace(/\W+/g, "_")}_${selected.lot || "lot"}.csv`;
    a.click();
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30";
  const labelCls = "block text-xs text-muted-foreground mb-1";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <FlaskConical className="w-6 h-6 text-primary" />
        Kit Validation (CLSI)
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Biochemistry kit production verification — within-run &amp; between-run precision, trueness/bias, linearity regression,
        dates and Excel export. Aligned with CLSI EP15 concepts. <b>Admin only.</b>
      </p>

      <div className="grid lg:grid-cols-[300px,1fr] gap-6 items-start">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
              New study {!isAdmin && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            </h2>
            {isAdmin ? (
              <div className="space-y-2">
                <input className={inputCls} placeholder="Kit name *" value={meta.kitName} onChange={(e) => setMeta({ ...meta, kitName: e.target.value })} />
                <input className={inputCls} placeholder="Analyte *" value={meta.analyte} onChange={(e) => setMeta({ ...meta, analyte: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputCls} placeholder="Unit" value={meta.unit} onChange={(e) => setMeta({ ...meta, unit: e.target.value })} />
                  <input className={inputCls} placeholder="Lot" value={meta.lot} onChange={(e) => setMeta({ ...meta, lot: e.target.value })} />
                </div>
                <input className={inputCls} placeholder="Manufacturer" value={meta.manufacturer} onChange={(e) => setMeta({ ...meta, manufacturer: e.target.value })} />
                <div className="grid grid-cols-3 gap-2">
                  <input className={inputCls} type="number" placeholder="TEa %" value={meta.tea} onChange={(e) => setMeta({ ...meta, tea: e.target.value })} />
                  <input className={inputCls} type="number" placeholder="Claim CV%" value={meta.claimCV} onChange={(e) => setMeta({ ...meta, claimCV: e.target.value })} />
                  <input className={inputCls} type="number" placeholder="Claim Bias%" value={meta.claimBias} onChange={(e) => setMeta({ ...meta, claimBias: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Start</label>
                    <input className={inputCls} type="date" value={meta.startDate} onChange={(e) => setMeta({ ...meta, startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>End</label>
                    <input className={inputCls} type="date" value={meta.endDate} onChange={(e) => setMeta({ ...meta, endDate: e.target.value })} />
                  </div>
                </div>
                <input className={inputCls} placeholder="Analyst" value={meta.analyst} onChange={(e) => setMeta({ ...meta, analyst: e.target.value })} />
                <textarea className={inputCls} rows={2} placeholder="Notes" value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} />
                <button onClick={createStudy} className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-bold hover:bg-primary/90 flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> Create study
                </button>
              </div>
            ) : (
              <ReadOnlyNotice what="create kit validation studies" />
            )}
          </div>

          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-bold text-sm mb-2">Studies ({studies.length})</h2>
            {studies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No studies yet.</p>
            ) : (
              <ul className="space-y-1">
                {studies.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm flex justify-between gap-2 ${
                        selected?.id === s.id ? "bg-primary text-white" : "hover:bg-secondary"
                      }`}
                    >
                      <span>
                        <span className="font-medium block">{s.kitName}</span>
                        <span className={`text-[11px] ${selected?.id === s.id ? "text-white/80" : "text-muted-foreground"}`}>
                          {s.analyte} · Lot {s.lot || "—"}
                        </span>
                      </span>
                      {isAdmin && (
                        <span
                          onClick={(e) => { e.stopPropagation(); removeStudy(s.id); }}
                          className="p-1"
                        >
                          <Trash2 className={`w-3.5 h-3.5 ${selected?.id === s.id ? "text-white/80" : "text-red-400"}`} />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Main */}
        {!selected ? (
          <div className="bg-white rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            Create a kit validation study (admin) to enter within-run / between-run data, accuracy and linearity.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold">{selected.kitName} — {selected.analyte}</div>
                <div className="text-xs text-muted-foreground">
                  Lot {selected.lot || "—"} · {selected.startDate} → {selected.endDate} · TEa ±{selected.tea}%
                  {selected.analyst ? ` · ${selected.analyst}` : ""}
                </div>
              </div>
              <button onClick={exportExcel} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-bold rounded-lg px-4 py-2 hover:bg-emerald-700">
                <Download className="w-4 h-4" /> Export Excel (CSV)
              </button>
            </div>

            <div className="flex flex-wrap gap-1 border-b pb-2">
              {(["summary", "precision", "accuracy", "linearity"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${
                    tab === t ? "bg-primary text-white" : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {t === "precision" ? "Within / Between-run" : t}
                </button>
              ))}
            </div>

            {tab === "summary" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(precision || []).map((p) => (
                  <div key={p.level} className="bg-white rounded-2xl border p-4">
                    <div className="text-xs text-muted-foreground">Level {p.level}</div>
                    <div className="font-bold text-lg ltr-inline">Mean {fmt(p.mean)}</div>
                    <div className="text-sm mt-2 space-y-1">
                      <div>Within-run CV: <b className="ltr-inline">{fmt(p.withinRunCV)}%</b></div>
                      <div>Between-run CV: <b className="ltr-inline">{fmt(p.betweenRunCV)}%</b></div>
                      <div className="text-xs text-muted-foreground">n={p.n} · runs={p.runs}</div>
                    </div>
                  </div>
                ))}
                {accuracyStats && (
                  <div className="bg-white rounded-2xl border p-4">
                    <div className="text-xs text-muted-foreground">Trueness</div>
                    <div className="font-bold text-lg ltr-inline">Bias {fmt(accuracyStats.meanBias)}%</div>
                    <div className="text-sm">Recovery <b className="ltr-inline">{fmt(accuracyStats.meanRecovery)}%</b></div>
                    <div className={`text-xs mt-1 font-bold ${Math.abs(accuracyStats.meanBias) <= selected.tea ? "text-emerald-600" : "text-red-600"}`}>
                      {Math.abs(accuracyStats.meanBias) <= selected.tea ? "✓ within TEa" : "✗ outside TEa"}
                    </div>
                  </div>
                )}
                {linearityStats && (
                  <div className="bg-white rounded-2xl border p-4">
                    <div className="text-xs text-muted-foreground">Linearity regression</div>
                    <div className="text-sm mt-1 space-y-1">
                      <div>Slope <b className="ltr-inline">{fmt(linearityStats.slope, 4)}</b></div>
                      <div>Intercept <b className="ltr-inline">{fmt(linearityStats.intercept, 4)}</b></div>
                      <div>R² <b className="ltr-inline">{fmt(linearityStats.r2, 4)}</b></div>
                    </div>
                  </div>
                )}
                {!precision?.length && !accuracyStats && !linearityStats && (
                  <div className="col-span-full text-sm text-muted-foreground border border-dashed rounded-xl p-8 text-center">
                    Enter precision, accuracy or linearity data in the other tabs.
                  </div>
                )}
              </div>
            )}

            {tab === "precision" && (
              <div className="space-y-4">
                {isAdmin && (
                  <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-2 items-end">
                    <div>
                      <label className={labelCls}>Date</label>
                      <input type="date" className={inputCls + " w-36"} value={repForm.date} onChange={(e) => setRepForm({ ...repForm, date: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Run ID</label>
                      <input className={inputCls + " w-24"} value={repForm.runId} onChange={(e) => setRepForm({ ...repForm, runId: e.target.value })} placeholder="Run1" />
                    </div>
                    <div>
                      <label className={labelCls}>Level</label>
                      <input className={inputCls + " w-20"} value={repForm.level} onChange={(e) => setRepForm({ ...repForm, level: e.target.value })} placeholder="L1" />
                    </div>
                    <div>
                      <label className={labelCls}>Value ({selected.unit})</label>
                      <input type="number" step="any" className={inputCls + " w-28"} value={repForm.value} onChange={(e) => setRepForm({ ...repForm, value: e.target.value })} />
                    </div>
                    <button onClick={addReplicate} className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-bold">Add</button>
                  </div>
                )}
                {(precision || []).length > 0 && (
                  <div className="bg-white rounded-2xl border p-4 h-72" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={precision}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="level" />
                        <YAxis unit="%" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="withinRunCV" name="Within-run CV%" fill="#0d6fb8" />
                        <Bar dataKey="betweenRunCV" name="Between-run CV%" fill="#f59e0b" />
                        {selected.claimCV > 0 && <ReferenceLine y={selected.claimCV} stroke="#16a34a" label="Claim CV" />}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="bg-white rounded-2xl border overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Level</th>
                        <th className="px-3 py-2 text-left">n</th>
                        <th className="px-3 py-2 text-left">Mean</th>
                        <th className="px-3 py-2 text-left">Within-run SD</th>
                        <th className="px-3 py-2 text-left">Within-run CV%</th>
                        <th className="px-3 py-2 text-left">Between-run SD</th>
                        <th className="px-3 py-2 text-left">Between-run CV%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(precision || []).map((p) => (
                        <tr key={p.level} className="border-t">
                          <td className="px-3 py-2 font-medium">{p.level}</td>
                          <td className="px-3 py-2 ltr-inline">{p.n}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.mean)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.withinRunSD)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.withinRunCV)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.betweenRunSD)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.betweenRunCV)}</td>
                        </tr>
                      ))}
                      {!precision?.length && (
                        <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">No replicate data yet. Same Run ID = within-run; different Run IDs = between-run.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "accuracy" && (
              <div className="space-y-4">
                {isAdmin && (
                  <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-2 items-end">
                    <div>
                      <label className={labelCls}>Date</label>
                      <input type="date" className={inputCls + " w-36"} value={accForm.date} onChange={(e) => setAccForm({ ...accForm, date: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Sample</label>
                      <input className={inputCls + " w-28"} value={accForm.sample} onChange={(e) => setAccForm({ ...accForm, sample: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Target</label>
                      <input type="number" step="any" className={inputCls + " w-28"} value={accForm.target} onChange={(e) => setAccForm({ ...accForm, target: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Measured</label>
                      <input type="number" step="any" className={inputCls + " w-28"} value={accForm.measured} onChange={(e) => setAccForm({ ...accForm, measured: e.target.value })} />
                    </div>
                    <button onClick={addAccuracy} className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-bold">Add</button>
                  </div>
                )}
                {accuracyStats && (
                  <div className="bg-white rounded-2xl border p-4 h-72" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accuracyStats.points}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sample" />
                        <YAxis unit="%" />
                        <Tooltip />
                        <ReferenceLine y={0} stroke="#64748b" />
                        <ReferenceLine y={selected.tea} stroke="#dc2626" strokeDasharray="4 4" />
                        <ReferenceLine y={-selected.tea} stroke="#dc2626" strokeDasharray="4 4" />
                        <Bar dataKey="bias" name="Bias %">
                          {accuracyStats.points.map((p, i) => (
                            <Cell key={i} fill={Math.abs(p.bias) > selected.tea ? "#dc2626" : "#16a34a"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="bg-white rounded-2xl border overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Sample</th>
                        <th className="px-3 py-2 text-left">Target</th>
                        <th className="px-3 py-2 text-left">Measured</th>
                        <th className="px-3 py-2 text-left">Bias %</th>
                        <th className="px-3 py-2 text-left">Recovery %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(accuracyStats?.points || []).map((p) => (
                        <tr key={p.id} className="border-t">
                          <td className="px-3 py-2 ltr-inline">{p.date}</td>
                          <td className="px-3 py-2">{p.sample}</td>
                          <td className="px-3 py-2 ltr-inline">{p.target}</td>
                          <td className="px-3 py-2 ltr-inline">{p.measured}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.bias)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.recovery)}</td>
                        </tr>
                      ))}
                      {!accuracyStats && (
                        <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No accuracy points yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "linearity" && (
              <div className="space-y-4">
                {isAdmin && (
                  <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-2 items-end">
                    <div>
                      <label className={labelCls}>Date</label>
                      <input type="date" className={inputCls + " w-36"} value={linForm.date} onChange={(e) => setLinForm({ ...linForm, date: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Expected</label>
                      <input type="number" step="any" className={inputCls + " w-28"} value={linForm.expected} onChange={(e) => setLinForm({ ...linForm, expected: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Measured</label>
                      <input type="number" step="any" className={inputCls + " w-28"} value={linForm.measured} onChange={(e) => setLinForm({ ...linForm, measured: e.target.value })} />
                    </div>
                    <button onClick={addLinearity} className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-bold">Add</button>
                  </div>
                )}
                {linearityStats && (
                  <div className="bg-white rounded-2xl border p-4 h-80" dir="ltr">
                    <div className="text-xs text-muted-foreground mb-2">
                      y = {fmt(linearityStats.slope, 4)}·x + {fmt(linearityStats.intercept, 4)} · R² = {fmt(linearityStats.r2, 4)}
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                      <ComposedChart data={linearityStats.points}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="expected" name="Expected" />
                        <YAxis name="Measured" />
                        <Tooltip />
                        <Legend />
                        <Scatter dataKey="measured" name="Measured" fill="#0d6fb8" />
                        <Line type="linear" dataKey="predicted" name="Regression" stroke="#dc2626" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="bg-white rounded-2xl border overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Expected</th>
                        <th className="px-3 py-2 text-left">Measured</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.linearityPoints.map((p) => (
                        <tr key={p.id} className="border-t">
                          <td className="px-3 py-2 ltr-inline">{p.date}</td>
                          <td className="px-3 py-2 ltr-inline">{p.expected}</td>
                          <td className="px-3 py-2 ltr-inline">{p.measured}</td>
                        </tr>
                      ))}
                      {!selected.linearityPoints.length && (
                        <tr><td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">No linearity points yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}