"use client";

/**
 * Kit Validation — CLSI-aligned calculations
 * Precision: EP15 / EP05-style nested components (within-run / between-run / within-lab)
 * Trueness: bias %, recovery %, vs TEa
 * Linearity: OLS regression + residual / max deviation
 * Agreement: Bland–Altman (measured vs target)
 * Export: Excel-compatible CSV with all raw + summary tables
 * Access: Admin only for editing
 */

import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend, ScatterChart, Scatter, ZAxis, Line, ComposedChart, Cell,
} from "recharts";
import { FlaskConical, Plus, Trash2, Download, Lock, Info } from "lucide-react";
import { useKitValidations } from "@/lib/store";
import { uid } from "@/lib/checks";
import { useAuth, ReadOnlyNotice } from "@/lib/auth";
import type {
  KitValidationStudy, KitValReplicate, KitValAccuracyPoint, KitValLinearityPoint,
} from "@/lib/nima-types";
import { toast } from "@/hooks/use-toast";

/* ========================= Math (CLSI-style) ========================= */

function mean(xs: number[]): number {
  if (!xs.length) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function sum(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0);
}
/** Sample SD (n-1) */
function sampleSd(xs: number[]): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}
function cvPct(sdVal: number, meanVal: number): number {
  if (!meanVal || isNaN(sdVal)) return NaN;
  return (sdVal / Math.abs(meanVal)) * 100;
}
function fmt(x: number, d = 4): string {
  if (x == null || isNaN(x)) return "—";
  return Number(x).toFixed(d);
}
function fmt2(x: number) {
  return fmt(x, 2);
}

/**
 * EP15 / EP05-style precision components for one concentration level.
 * Data model: multiple runs (runId), each with ≥1 replicates.
 *
 * Within-run variance (repeatability):
 *   S_r² = Σ_i Σ_j (x_ij - x̄_i)² / (N - r)
 * Between-run variance:
 *   S_b² = max(0, (Σ_i n_i (x̄_i - x̄)² / (r - 1) - S_r²) / n0)
 *   where n0 ≈ average replicates per run
 * Within-laboratory (total):
 *   S_wl² = S_r² + S_b²
 */
function precisionAnova(reps: KitValReplicate[]) {
  const values = reps.map((r) => r.value);
  const N = values.length;
  const grand = mean(values);

  const byRun: Record<string, number[]> = {};
  reps.forEach((r) => {
    (byRun[r.runId] ||= []).push(r.value);
  });
  const runIds = Object.keys(byRun);
  const r = runIds.length;

  // Within-run SS and df
  let ssWithin = 0;
  let dfWithin = 0;
  const runMeans: { runId: string; n: number; mean: number; sd: number; cv: number }[] = [];
  runIds.forEach((id) => {
    const vs = byRun[id];
    const mi = mean(vs);
    runMeans.push({ runId: id, n: vs.length, mean: mi, sd: sampleSd(vs), cv: cvPct(sampleSd(vs), mi) });
    if (vs.length >= 2) {
      vs.forEach((x) => {
        ssWithin += (x - mi) ** 2;
      });
      dfWithin += vs.length - 1;
    }
  });

  const Sr2 = dfWithin > 0 ? ssWithin / dfWithin : NaN;
  const Sr = Math.sqrt(Sr2);

  // Between-run
  let ssBetween = 0;
  runIds.forEach((id) => {
    const vs = byRun[id];
    ssBetween += vs.length * (mean(vs) - grand) ** 2;
  });
  const dfBetween = r > 1 ? r - 1 : 0;
  const MSb = dfBetween > 0 ? ssBetween / dfBetween : NaN;

  // Effective n0 (average n per run, balanced approximation)
  const n0 = N / r;
  let Sb2 = NaN;
  if (!isNaN(MSb) && !isNaN(Sr2) && n0 > 0) {
    Sb2 = Math.max(0, (MSb - Sr2) / n0);
  }
  const Sb = Math.sqrt(Sb2);
  const Swl2 = (!isNaN(Sr2) ? Sr2 : 0) + (!isNaN(Sb2) ? Sb2 : 0);
  const Swl = Math.sqrt(Swl2);

  return {
    N,
    runs: r,
    grandMean: grand,
    /** Repeatability SD (within-run) */
    Sr,
    /** Between-run SD component */
    Sb,
    /** Within-laboratory SD (total) */
    Swl,
    CVr: cvPct(Sr, grand),
    CVb: cvPct(Sb, grand),
    CVwl: cvPct(Swl, grand),
    dfWithin,
    dfBetween,
    runMeans,
    values,
  };
}

/** Ordinary least squares */
function ols(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 2) return { slope: NaN, intercept: NaN, r: NaN, r2: NaN, syx: NaN };
  const mx = mean(xs);
  const my = mean(ys);
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  const slope = sxx === 0 ? NaN : sxy / sxx;
  const intercept = my - slope * mx;
  const r = sxx === 0 || syy === 0 ? NaN : sxy / Math.sqrt(sxx * syy);
  const r2 = r * r;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const pred = slope * xs[i] + intercept;
    ssRes += (ys[i] - pred) ** 2;
  }
  const syx = n > 2 ? Math.sqrt(ssRes / (n - 2)) : NaN;
  return { slope, intercept, r, r2, syx };
}

/* ========================= Component ========================= */

export function KitValidationView() {
  const [studies, setStudies] = useKitValidations();
  const { isAdmin } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"summary" | "precision" | "accuracy" | "linearity">("summary");

  const [meta, setMeta] = useState({
    kitName: "",
    analyte: "",
    unit: "mg/dL",
    lot: "",
    manufacturer: "",
    tea: "10",
    claimCV: "",
    claimBias: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    analyst: "",
    notes: "",
  });

  const [repForm, setRepForm] = useState({
    runId: "Day1",
    date: new Date().toISOString().slice(0, 10),
    level: "L1",
    value: "",
  });
  const [accForm, setAccForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    sample: "",
    target: "",
    measured: "",
  });
  const [linForm, setLinForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    expected: "",
    measured: "",
  });

  const selected = studies.find((s) => s.id === selectedId) || studies[0] || null;

  const createStudy = () => {
    if (!isAdmin) return;
    if (!meta.kitName.trim() || !meta.analyte.trim()) {
      toast({ title: "Error", description: "Kit name and analyte are required." });
      return;
    }
    const s: KitValidationStudy = {
      id: uid(),
      kitName: meta.kitName.trim(),
      analyte: meta.analyte.trim(),
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
    setTab("precision");
    toast({ title: "Study created ✓", description: "Enter precision replicates (recommend ≥5 days × 3 reps per level)." });
  };

  const removeStudy = (id: string) => {
    if (!isAdmin) return;
    setStudies((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const addReplicate = () => {
    if (!isAdmin || !selected) return;
    const v = parseFloat(repForm.value);
    if (isNaN(v)) return toast({ title: "Enter a valid measured value" });
    const r: KitValReplicate = {
      id: uid(),
      runId: repForm.runId.trim() || "Day1",
      date: repForm.date,
      level: repForm.level.trim() || "L1",
      value: v,
    };
    setStudies((prev) =>
      prev.map((s) => (s.id === selected.id ? { ...s, replicates: [...s.replicates, r] } : s))
    );
    setRepForm((f) => ({ ...f, value: "" }));
  };

  const deleteReplicate = (rid: string) => {
    if (!isAdmin || !selected) return;
    setStudies((prev) =>
      prev.map((s) =>
        s.id === selected.id ? { ...s, replicates: s.replicates.filter((x) => x.id !== rid) } : s
      )
    );
  };

  const addAccuracy = () => {
    if (!isAdmin || !selected) return;
    const target = parseFloat(accForm.target);
    const measured = parseFloat(accForm.measured);
    if (isNaN(target) || isNaN(measured) || target === 0) {
      return toast({ title: "Enter valid target and measured (target ≠ 0)" });
    }
    const p: KitValAccuracyPoint = {
      id: uid(),
      date: accForm.date,
      sample: accForm.sample || `S${selected.accuracyPoints.length + 1}`,
      target,
      measured,
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

  /* ---- derived stats ---- */
  const precisionByLevel = useMemo(() => {
    if (!selected) return [];
    const levels = Array.from(new Set(selected.replicates.map((r) => r.level)));
    return levels.map((level) => {
      const reps = selected.replicates.filter((r) => r.level === level);
      const an = precisionAnova(reps);
      // EP15 verification limit often ~1.5 × manufacturer claim CV (simplified)
      const limitCV = selected.claimCV > 0 ? selected.claimCV * 1.5 : NaN;
      const passRepeat = !isNaN(limitCV) && !isNaN(an.CVr) ? an.CVr <= limitCV : null;
      const passWl = !isNaN(limitCV) && !isNaN(an.CVwl) ? an.CVwl <= limitCV : null;
      return { level, ...an, limitCV, passRepeat, passWl };
    });
  }, [selected]);

  const accuracyStats = useMemo(() => {
    if (!selected?.accuracyPoints.length) return null;
    const rows = selected.accuracyPoints.map((p) => {
      const bias = ((p.measured - p.target) / p.target) * 100;
      const recovery = (p.measured / p.target) * 100;
      const diff = p.measured - p.target;
      const avg = (p.measured + p.target) / 2;
      return { ...p, bias, recovery, diff, avg };
    });
    const biases = rows.map((r) => r.bias);
    const diffs = rows.map((r) => r.diff);
    const meanBias = mean(biases);
    const meanDiff = mean(diffs);
    const sdDiff = sampleSd(diffs);
    // Bland–Altman 95% limits of agreement
    const loaLow = meanDiff - 1.96 * sdDiff;
    const loaHigh = meanDiff + 1.96 * sdDiff;
    return {
      n: rows.length,
      meanBias,
      sdBias: sampleSd(biases),
      meanRecovery: mean(rows.map((r) => r.recovery)),
      meanDiff,
      sdDiff,
      loaLow,
      loaHigh,
      passTea: Math.abs(meanBias) <= selected.tea,
      rows,
    };
  }, [selected]);

  const linearityStats = useMemo(() => {
    if (!selected || selected.linearityPoints.length < 2) return null;
    const xs = selected.linearityPoints.map((p) => p.expected);
    const ys = selected.linearityPoints.map((p) => p.measured);
    const reg = ols(xs, ys);
    const points = selected.linearityPoints.map((p) => {
      const predicted = reg.slope * p.expected + reg.intercept;
      const residual = p.measured - predicted;
      const devPct = p.expected !== 0 ? (residual / p.expected) * 100 : NaN;
      return { ...p, predicted, residual, devPct };
    });
    const maxAbsDevPct = Math.max(...points.map((p) => Math.abs(p.devPct || 0)));
    return { ...reg, points, maxAbsDevPct };
  }, [selected]);

  /* ---- Excel export ---- */
  const exportExcel = () => {
    if (!selected) return;
    const q = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    const L: string[] = [];
    L.push("CLSI-ALIGNED KIT VALIDATION REPORT");
    L.push(`Generated,${new Date().toISOString()}`);
    L.push("");
    L.push("STUDY METADATA");
    L.push(`Kit,${q(selected.kitName)}`);
    L.push(`Analyte,${q(selected.analyte)}`);
    L.push(`Unit,${q(selected.unit)}`);
    L.push(`Lot,${q(selected.lot)}`);
    L.push(`Manufacturer,${q(selected.manufacturer)}`);
    L.push(`TEa %,${selected.tea}`);
    L.push(`Manufacturer claim CV %,${selected.claimCV}`);
    L.push(`Manufacturer claim Bias %,${selected.claimBias}`);
    L.push(`Verification CV limit (1.5x claim) %,${selected.claimCV ? selected.claimCV * 1.5 : ""}`);
    L.push(`Start date,${selected.startDate}`);
    L.push(`End date,${selected.endDate}`);
    L.push(`Analyst,${q(selected.analyst)}`);
    L.push(`Notes,${q(selected.notes)}`);
    L.push("");
    L.push("PRECISION SUMMARY (EP15/EP05-style nested components)");
    L.push("Level,N,Runs,Grand mean,Sr (repeatability SD),CVr %,Sb (between-run SD),CVb %,Swl (within-lab SD),CVwl %,Claim CV %,Limit 1.5x %,Pass CVr,Pass CVwl");
    precisionByLevel.forEach((p) => {
      L.push(
        [
          p.level, p.N, p.runs, fmt2(p.grandMean), fmt(p.Sr), fmt2(p.CVr), fmt(p.Sb), fmt2(p.CVb),
          fmt(p.Swl), fmt2(p.CVwl), selected.claimCV, fmt2(p.limitCV),
          p.passRepeat == null ? "" : p.passRepeat ? "PASS" : "FAIL",
          p.passWl == null ? "" : p.passWl ? "PASS" : "FAIL",
        ].join(",")
      );
    });
    L.push("");
    L.push("PRECISION RAW REPLICATES");
    L.push("Date,Run/Day,Level,Value");
    selected.replicates.forEach((r) => L.push([r.date, r.runId, r.level, r.value].join(",")));
    L.push("");
    L.push("ACCURACY / TRUENESS");
    L.push("Date,Sample,Target,Measured,Bias %,Recovery %,Diff (Meas-Target),Average");
    (accuracyStats?.rows || []).forEach((p) =>
      L.push([p.date, q(p.sample), p.target, p.measured, fmt2(p.bias), fmt2(p.recovery), fmt(p.diff), fmt(p.avg)].join(","))
    );
    if (accuracyStats) {
      L.push(`Mean bias %,${fmt2(accuracyStats.meanBias)}`);
      L.push(`SD of bias %,${fmt2(accuracyStats.sdBias)}`);
      L.push(`Mean recovery %,${fmt2(accuracyStats.meanRecovery)}`);
      L.push(`Bland-Altman mean diff,${fmt(accuracyStats.meanDiff)}`);
      L.push(`Bland-Altman SD diff,${fmt(accuracyStats.sdDiff)}`);
      L.push(`LoA low (mean-1.96SD),${fmt(accuracyStats.loaLow)}`);
      L.push(`LoA high (mean+1.96SD),${fmt(accuracyStats.loaHigh)}`);
      L.push(`TEa %,${selected.tea}`);
      L.push(`Mean |bias| <= TEa,${accuracyStats.passTea ? "PASS" : "FAIL"}`);
    }
    L.push("");
    L.push("LINEARITY / REGRESSION (OLS)");
    L.push("Date,Expected,Measured,Predicted,Residual,Deviation %");
    (linearityStats?.points || []).forEach((p) =>
      L.push([p.date, p.expected, p.measured, fmt(p.predicted), fmt(p.residual), fmt2(p.devPct)].join(","))
    );
    if (linearityStats) {
      L.push(`Slope,${fmt(linearityStats.slope, 6)}`);
      L.push(`Intercept,${fmt(linearityStats.intercept, 6)}`);
      L.push(`r,${fmt(linearityStats.r, 6)}`);
      L.push(`R-squared,${fmt(linearityStats.r2, 6)}`);
      L.push(`Syx (residual SD),${fmt(linearityStats.syx)}`);
      L.push(`Max |deviation| %,${fmt2(linearityStats.maxAbsDevPct)}`);
    }
    L.push("");
    L.push("FORMULAS USED");
    L.push("Sr^2,Sum of within-run squared deviations / (N - number of runs)");
    L.push("Sb^2,max(0, (MSb - Sr^2) / n0) where MSb is between-run mean square");
    L.push("Swl^2,Sr^2 + Sb^2");
    L.push("CV%,(SD/|Mean|)*100");
    L.push("Bias%,((Measured-Target)/Target)*100");
    L.push("Recovery%,(Measured/Target)*100");
    L.push("Bland-Altman,diff=Measured-Target; LoA = mean(diff) ± 1.96*SD(diff)");
    L.push("OLS,slope = Sxy/Sxx; intercept = mean(y)-slope*mean(x); R^2 = r^2");

    const blob = new Blob(["\uFEFF" + L.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `CLSI_KitValidation_${selected.kitName.replace(/\W+/g, "_")}_${selected.lot || "lot"}.csv`;
    a.click();
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30";
  const labelCls = "block text-xs text-muted-foreground mb-1";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <FlaskConical className="w-6 h-6 text-primary" />
        Kit Validation (CLSI EP15 / EP05-style)
      </h1>
      <p className="text-muted-foreground text-sm mb-4">
        Production verification for biochemistry kits: nested precision (Sr, Sb, Swl), trueness (bias/recovery),
        Bland–Altman, linearity regression, dates and Excel export. <b>Admin only</b> to edit.
      </p>

      <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[12.5px] text-sky-900 flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <b>Recommended protocol (EP15-style):</b> for each level (L1/L2/L3), run <b>≥ 5 days</b> × <b>3 replicates</b> per day.
          Use the same <b>Run/Day ID</b> for replicates of one day (Within-run). Change Run/Day ID across days (Between-run).
          Verification limit for CV is set to <b>1.5 × manufacturer claim CV</b> when claim is entered.
        </div>
      </div>

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
                  <input className={inputCls} type="number" step="any" placeholder="TEa %" value={meta.tea} onChange={(e) => setMeta({ ...meta, tea: e.target.value })} />
                  <input className={inputCls} type="number" step="any" placeholder="Claim CV%" value={meta.claimCV} onChange={(e) => setMeta({ ...meta, claimCV: e.target.value })} />
                  <input className={inputCls} type="number" step="any" placeholder="Claim Bias%" value={meta.claimBias} onChange={(e) => setMeta({ ...meta, claimBias: e.target.value })} />
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
                        <span onClick={(e) => { e.stopPropagation(); removeStudy(s.id); }} className="p-1">
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
            Create a study (admin), then enter precision replicates, accuracy and linearity points. Charts and PASS/FAIL appear automatically.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold">{selected.kitName} — {selected.analyte}</div>
                <div className="text-xs text-muted-foreground">
                  Lot {selected.lot || "—"} · {selected.startDate} → {selected.endDate} · TEa ±{selected.tea}%
                  {selected.claimCV ? ` · Claim CV ${selected.claimCV}%` : ""}
                  {selected.analyst ? ` · ${selected.analyst}` : ""}
                </div>
              </div>
              <button onClick={exportExcel} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-bold rounded-lg px-4 py-2 hover:bg-emerald-700">
                <Download className="w-4 h-4" /> Export Excel (CSV)
              </button>
            </div>

            <div className="flex flex-wrap gap-1 border-b pb-2">
              {([
                ["summary", "Summary"],
                ["precision", "Precision (Sr / Swl)"],
                ["accuracy", "Accuracy + Bland–Altman"],
                ["linearity", "Linearity + Regression"],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    tab === id ? "bg-primary text-white" : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* SUMMARY */}
            {tab === "summary" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {precisionByLevel.map((p) => (
                  <div key={p.level} className="bg-white rounded-2xl border p-4">
                    <div className="text-xs text-muted-foreground">Level {p.level}</div>
                    <div className="font-bold text-lg ltr-inline">Mean {fmt2(p.grandMean)}</div>
                    <div className="text-sm mt-2 space-y-1">
                      <div>Sr (repeatability): <b className="ltr-inline">{fmt(p.Sr)}</b> · CV <b className="ltr-inline">{fmt2(p.CVr)}%</b></div>
                      <div>Swl (within-lab): <b className="ltr-inline">{fmt(p.Swl)}</b> · CV <b className="ltr-inline">{fmt2(p.CVwl)}%</b></div>
                      <div className="text-xs text-muted-foreground">N={p.N} · runs={p.runs}</div>
                      {p.passRepeat != null && (
                        <div className={`text-xs font-bold ${p.passRepeat && p.passWl ? "text-emerald-600" : "text-red-600"}`}>
                          {p.passRepeat && p.passWl ? "✓ CV within 1.5× claim" : "✗ CV exceeds 1.5× claim"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {accuracyStats && (
                  <div className="bg-white rounded-2xl border p-4">
                    <div className="text-xs text-muted-foreground">Trueness</div>
                    <div className="font-bold text-lg ltr-inline">Bias {fmt2(accuracyStats.meanBias)}%</div>
                    <div className="text-sm">Recovery <b className="ltr-inline">{fmt2(accuracyStats.meanRecovery)}%</b></div>
                    <div className={`text-xs mt-1 font-bold ${accuracyStats.passTea ? "text-emerald-600" : "text-red-600"}`}>
                      {accuracyStats.passTea ? "✓ |bias| ≤ TEa" : "✗ |bias| > TEa"}
                    </div>
                  </div>
                )}
                {linearityStats && (
                  <div className="bg-white rounded-2xl border p-4">
                    <div className="text-xs text-muted-foreground">Linearity (OLS)</div>
                    <div className="text-sm mt-1 space-y-1">
                      <div>Slope <b className="ltr-inline">{fmt(linearityStats.slope, 4)}</b></div>
                      <div>Intercept <b className="ltr-inline">{fmt(linearityStats.intercept, 4)}</b></div>
                      <div>R² <b className="ltr-inline">{fmt(linearityStats.r2, 4)}</b></div>
                      <div>Max |dev| <b className="ltr-inline">{fmt2(linearityStats.maxAbsDevPct)}%</b></div>
                    </div>
                  </div>
                )}
                {!precisionByLevel.length && !accuracyStats && !linearityStats && (
                  <div className="col-span-full text-sm text-muted-foreground border border-dashed rounded-xl p-8 text-center">
                    Enter data in Precision / Accuracy / Linearity tabs.
                  </div>
                )}
              </div>
            )}

            {/* PRECISION */}
            {tab === "precision" && (
              <div className="space-y-4">
                {isAdmin && (
                  <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-2 items-end">
                    <div>
                      <label className={labelCls}>Date</label>
                      <input type="date" className={inputCls + " w-36"} value={repForm.date} onChange={(e) => setRepForm({ ...repForm, date: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Run / Day ID</label>
                      <input className={inputCls + " w-24"} value={repForm.runId} onChange={(e) => setRepForm({ ...repForm, runId: e.target.value })} placeholder="Day1" />
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

                {precisionByLevel.length > 0 && (
                  <div className="bg-white rounded-2xl border p-4 h-72" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={precisionByLevel}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="level" />
                        <YAxis unit="%" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="CVr" name="CVr % (repeatability)" fill="#0d6fb8" />
                        <Bar dataKey="CVwl" name="CVwl % (within-lab)" fill="#f59e0b" />
                        {selected.claimCV > 0 && <ReferenceLine y={selected.claimCV} stroke="#16a34a" label="Claim CV" />}
                        {selected.claimCV > 0 && <ReferenceLine y={selected.claimCV * 1.5} stroke="#dc2626" strokeDasharray="4 4" label="1.5× claim" />}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-white rounded-2xl border overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Level</th>
                        <th className="px-3 py-2 text-left">N</th>
                        <th className="px-3 py-2 text-left">Runs</th>
                        <th className="px-3 py-2 text-left">Mean</th>
                        <th className="px-3 py-2 text-left">Sr</th>
                        <th className="px-3 py-2 text-left">CVr %</th>
                        <th className="px-3 py-2 text-left">Sb</th>
                        <th className="px-3 py-2 text-left">Swl</th>
                        <th className="px-3 py-2 text-left">CVwl %</th>
                        <th className="px-3 py-2 text-left">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {precisionByLevel.map((p) => (
                        <tr key={p.level} className="border-t">
                          <td className="px-3 py-2 font-medium">{p.level}</td>
                          <td className="px-3 py-2 ltr-inline">{p.N}</td>
                          <td className="px-3 py-2 ltr-inline">{p.runs}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt2(p.grandMean)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.Sr)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt2(p.CVr)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.Sb)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.Swl)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt2(p.CVwl)}</td>
                          <td className="px-3 py-2 text-xs font-bold">
                            {p.passRepeat == null ? "—" : p.passRepeat && p.passWl ? (
                              <span className="text-emerald-600">PASS</span>
                            ) : (
                              <span className="text-red-600">FAIL</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {!precisionByLevel.length && (
                        <tr>
                          <td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">
                            No replicates yet. Same Run/Day ID = within-run; different IDs = between-run.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {selected.replicates.length > 0 && (
                  <div className="bg-white rounded-2xl border overflow-auto max-h-56">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Run/Day</th>
                          <th className="px-3 py-2 text-left">Level</th>
                          <th className="px-3 py-2 text-left">Value</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.replicates.map((r) => (
                          <tr key={r.id} className="border-t">
                            <td className="px-3 py-2 ltr-inline">{r.date}</td>
                            <td className="px-3 py-2">{r.runId}</td>
                            <td className="px-3 py-2">{r.level}</td>
                            <td className="px-3 py-2 ltr-inline">{r.value}</td>
                            <td className="px-3 py-2">
                              {isAdmin && (
                                <button onClick={() => deleteReplicate(r.id)} className="p-1 hover:bg-red-50 rounded">
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ACCURACY */}
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
                  <>
                    <div className="bg-white rounded-2xl border p-4 h-72" dir="ltr">
                      <div className="text-xs text-muted-foreground mb-1">Bias % vs TEa (±{selected.tea}%)</div>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={accuracyStats.rows}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="sample" />
                          <YAxis unit="%" />
                          <Tooltip />
                          <ReferenceLine y={0} stroke="#64748b" />
                          <ReferenceLine y={selected.tea} stroke="#dc2626" strokeDasharray="4 4" />
                          <ReferenceLine y={-selected.tea} stroke="#dc2626" strokeDasharray="4 4" />
                          <Bar dataKey="bias" name="Bias %">
                            {accuracyStats.rows.map((p, i) => (
                              <Cell key={i} fill={Math.abs(p.bias) > selected.tea ? "#dc2626" : "#16a34a"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-white rounded-2xl border p-4 h-72" dir="ltr">
                      <div className="text-xs text-muted-foreground mb-1">
                        Bland–Altman: mean diff={fmt(accuracyStats.meanDiff)}, LoA [{fmt(accuracyStats.loaLow)}, {fmt(accuracyStats.loaHigh)}]
                      </div>
                      <ResponsiveContainer width="100%" height="90%">
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" dataKey="avg" name="Average" />
                          <YAxis type="number" dataKey="diff" name="Diff" />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                          <ReferenceLine y={accuracyStats.meanDiff} stroke="#0d6fb8" />
                          <ReferenceLine y={accuracyStats.loaLow} stroke="#dc2626" strokeDasharray="4 4" />
                          <ReferenceLine y={accuracyStats.loaHigh} stroke="#dc2626" strokeDasharray="4 4" />
                          <Scatter data={accuracyStats.rows} fill="#0d6fb8" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </>
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
                      {(accuracyStats?.rows || []).map((p) => (
                        <tr key={p.id} className="border-t">
                          <td className="px-3 py-2 ltr-inline">{p.date}</td>
                          <td className="px-3 py-2">{p.sample}</td>
                          <td className="px-3 py-2 ltr-inline">{p.target}</td>
                          <td className="px-3 py-2 ltr-inline">{p.measured}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt2(p.bias)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt2(p.recovery)}</td>
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

            {/* LINEARITY */}
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
                      y = {fmt(linearityStats.slope, 4)}·x + {fmt(linearityStats.intercept, 4)} · R² = {fmt(linearityStats.r2, 4)} · Syx = {fmt(linearityStats.syx)}
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                      <ComposedChart data={linearityStats.points}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="expected" name="Expected" />
                        <YAxis name="Measured" />
                        <Tooltip />
                        <Legend />
                        <Scatter dataKey="measured" name="Measured" fill="#0d6fb8" />
                        <Line type="linear" dataKey="predicted" name="OLS fit" stroke="#dc2626" dot={false} />
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
                        <th className="px-3 py-2 text-left">Predicted</th>
                        <th className="px-3 py-2 text-left">Residual</th>
                        <th className="px-3 py-2 text-left">Dev %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(linearityStats?.points || selected.linearityPoints).map((p: { id: string; date: string; expected: number; measured: number; predicted?: number; residual?: number; devPct?: number }) => (
                        <tr key={p.id} className="border-t">
                          <td className="px-3 py-2 ltr-inline">{p.date}</td>
                          <td className="px-3 py-2 ltr-inline">{p.expected}</td>
                          <td className="px-3 py-2 ltr-inline">{p.measured}</td>
                          <td className="px-3 py-2 ltr-inline">{p.predicted != null ? fmt(p.predicted) : "—"}</td>
                          <td className="px-3 py-2 ltr-inline">{p.residual != null ? fmt(p.residual) : "—"}</td>
                          <td className="px-3 py-2 ltr-inline">{p.devPct != null ? fmt2(p.devPct) : "—"}</td>
                        </tr>
                      ))}
                      {!selected.linearityPoints.length && (
                        <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No linearity points yet.</td></tr>
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