"use client";

/**
 * Kit Validation — CLSI-aligned
 * EP15/EP05 precision (Sr, Sb, Swl + ANOVA table)
 * Trueness, Bland–Altman, OLS / Deming / Passing–Bablok
 * Linearity, LoB/LoD/LoQ (EP17-style)
 * Excel CSV export — Admin edit only
 */

import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend, ScatterChart, Scatter, Line, ComposedChart, Cell,
} from "recharts";
import { FlaskConical, Plus, Trash2, Download, Lock, Info } from "lucide-react";
import { useKitValidations } from "@/lib/store";
import { uid } from "@/lib/checks";
import { useAuth, ReadOnlyNotice } from "@/lib/auth";
import type {
  KitValidationStudy, KitValReplicate, KitValAccuracyPoint, KitValLinearityPoint,
} from "@/lib/nima-types";
import { toast } from "@/hooks/use-toast";

/* ========================= Math helpers ========================= */

function mean(xs: number[]) {
  if (!xs.length) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function sampleSd(xs: number[]) {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}
function cvPct(sdV: number, m: number) {
  if (!m || isNaN(sdV)) return NaN;
  return (sdV / Math.abs(m)) * 100;
}
function median(xs: number[]) {
  if (!xs.length) return NaN;
  const a = [...xs].sort((p, q) => p - q);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}
function fmt(x: number, d = 4) {
  if (x == null || isNaN(x)) return "—";
  return Number(x).toFixed(d);
}
function fmt2(x: number) {
  return fmt(x, 2);
}

/** EP15/EP05 nested precision components for one level */
function precisionAnova(reps: KitValReplicate[]) {
  const values = reps.map((r) => r.value);
  const N = values.length;
  const grand = mean(values);
  const byRun: Record<string, number[]> = {};
  reps.forEach((r) => {
    (byRun[r.runId] ||= []).push(r.value);
  });
  const runIds = Object.keys(byRun);
  const rCount = runIds.length;

  let ssWithin = 0;
  let dfWithin = 0;
  const runMeans: { runId: string; n: number; mean: number; sd: number; cv: number }[] = [];
  runIds.forEach((id) => {
    const vs = byRun[id];
    const mi = mean(vs);
    const sdi = sampleSd(vs);
    runMeans.push({ runId: id, n: vs.length, mean: mi, sd: sdi, cv: cvPct(sdi, mi) });
    if (vs.length >= 2) {
      vs.forEach((x) => {
        ssWithin += (x - mi) ** 2;
      });
      dfWithin += vs.length - 1;
    }
  });

  const Sr2 = dfWithin > 0 ? ssWithin / dfWithin : NaN;
  const Sr = Math.sqrt(Sr2);

  let ssBetween = 0;
  runIds.forEach((id) => {
    const vs = byRun[id];
    ssBetween += vs.length * (mean(vs) - grand) ** 2;
  });
  const dfBetween = rCount > 1 ? rCount - 1 : 0;
  const MSb = dfBetween > 0 ? ssBetween / dfBetween : NaN;
  const MSw = Sr2;
  const n0 = rCount > 0 ? N / rCount : NaN;
  let Sb2 = NaN;
  if (!isNaN(MSb) && !isNaN(Sr2) && n0 > 0) Sb2 = Math.max(0, (MSb - Sr2) / n0);
  const Sb = Math.sqrt(Sb2);
  const Swl2 = (!isNaN(Sr2) ? Sr2 : 0) + (!isNaN(Sb2) ? Sb2 : 0);
  const Swl = Math.sqrt(Swl2);
  const ssTotal = values.reduce((s, x) => s + (x - grand) ** 2, 0);
  const dfTotal = N > 1 ? N - 1 : 0;

  return {
    N, runs: rCount, grandMean: grand,
    Sr, Sb, Swl, Sr2, Sb2, Swl2,
    CVr: cvPct(Sr, grand), CVb: cvPct(Sb, grand), CVwl: cvPct(Swl, grand),
    dfWithin, dfBetween, dfTotal,
    ssWithin, ssBetween, ssTotal, MSb, MSw, n0,
    runMeans, values,
  };
}

/** Ordinary least squares */
function ols(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 2) return { slope: NaN, intercept: NaN, r: NaN, r2: NaN, syx: NaN };
  const mx = mean(xs), my = mean(ys);
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxx += dx * dx; sxy += dx * dy; syy += dy * dy;
  }
  const slope = sxx === 0 ? NaN : sxy / sxx;
  const intercept = my - slope * mx;
  const r = sxx === 0 || syy === 0 ? NaN : sxy / Math.sqrt(sxx * syy);
  let ssRes = 0;
  for (let i = 0; i < n; i++) ssRes += (ys[i] - (slope * xs[i] + intercept)) ** 2;
  const syx = n > 2 ? Math.sqrt(ssRes / (n - 2)) : NaN;
  return { slope, intercept, r, r2: r * r, syx };
}

/** Deming regression (lambda = σ²εx / σ²εy). Default lambda = 1 (equal error). */
function deming(xs: number[], ys: number[], lambda = 1) {
  const n = xs.length;
  if (n < 2) return { slope: NaN, intercept: NaN };
  const mx = mean(xs), my = mean(ys);
  let sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
  }
  sxx /= n - 1; syy /= n - 1; sxy /= n - 1;
  if (sxy === 0) return { slope: NaN, intercept: NaN };
  const U = syy - lambda * sxx;
  const slope = (U + Math.sqrt(U * U + 4 * lambda * sxy * sxy)) / (2 * sxy);
  const intercept = my - slope * mx;
  return { slope, intercept };
}

/**
 * Passing–Bablok regression (non-parametric).
 * Slope = median of pairwise slopes (xi≠xj), excluding infinite/undefined.
 * Intercept = median(yi − slope·xi)
 */
function passingBablok(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 3) return { slope: NaN, intercept: NaN };
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = xs[j] - xs[i];
      const dy = ys[j] - ys[i];
      if (dx === 0) continue; // vertical — skip for slope median (simplified)
      slopes.push(dy / dx);
    }
  }
  if (!slopes.length) return { slope: NaN, intercept: NaN };
  const slope = median(slopes);
  const intercepts = xs.map((x, i) => ys[i] - slope * x);
  const intercept = median(intercepts);
  return { slope, intercept };
}

/** EP17-style LoB / LoD (parametric) */
function ep17LobLod(blankValues: number[], lowValues: number[]) {
  const meanBlank = mean(blankValues);
  const sdBlank = sampleSd(blankValues);
  const sdLow = sampleSd(lowValues);
  // LoB ≈ mean_blank + 1.645·SDblank  (one-sided 95%)
  const LoB = meanBlank + 1.645 * (sdBlank || 0);
  // LoD ≈ LoB + 1.645·SDlow
  const LoD = LoB + 1.645 * (sdLow || 0);
  return { meanBlank, sdBlank, sdLow, LoB, LoD, nBlank: blankValues.length, nLow: lowValues.length };
}

/* ========================= Component ========================= */

export function KitValidationView() {
  const [studies, setStudies] = useKitValidations();
  const { isAdmin } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"summary" | "precision" | "accuracy" | "linearity" | "detection">("summary");

  const [meta, setMeta] = useState({
    kitName: "", analyte: "", unit: "mg/dL", lot: "", manufacturer: "",
    tea: "10", claimCV: "", claimBias: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    analyst: "", notes: "",
  });

  const [repForm, setRepForm] = useState({
    runId: "Day1", date: new Date().toISOString().slice(0, 10), level: "L1", value: "",
  });
  const [accForm, setAccForm] = useState({
    date: new Date().toISOString().slice(0, 10), sample: "", target: "", measured: "",
  });
  const [linForm, setLinForm] = useState({
    date: new Date().toISOString().slice(0, 10), expected: "", measured: "",
  });
  // Detection capability: blank & low-level series (stored as replicates with level Blank / LoD)
  const [detForm, setDetForm] = useState({
    kind: "Blank" as "Blank" | "LoD",
    date: new Date().toISOString().slice(0, 10),
    value: "",
  });
  const [loqCvLimit, setLoqCvLimit] = useState("20");

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
    toast({ title: "Study created ✓" });
  };

  const removeStudy = (id: string) => {
    if (!isAdmin) return;
    setStudies((prev) => prev.filter((x) => x.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const patchSelected = (fn: (s: KitValidationStudy) => KitValidationStudy) => {
    if (!selected) return;
    setStudies((prev) => prev.map((s) => (s.id === selected.id ? fn(s) : s)));
  };

  const addReplicate = () => {
    if (!isAdmin || !selected) return;
    const v = parseFloat(repForm.value);
    if (isNaN(v)) return toast({ title: "Enter a valid value" });
    const r: KitValReplicate = {
      id: uid(), runId: repForm.runId.trim() || "Day1", date: repForm.date,
      level: repForm.level.trim() || "L1", value: v,
    };
    patchSelected((s) => ({ ...s, replicates: [...s.replicates, r] }));
    setRepForm((f) => ({ ...f, value: "" }));
  };

  const addDetection = () => {
    if (!isAdmin || !selected) return;
    const v = parseFloat(detForm.value);
    if (isNaN(v)) return toast({ title: "Enter a valid value" });
    const r: KitValReplicate = {
      id: uid(), runId: detForm.kind, date: detForm.date, level: detForm.kind, value: v,
    };
    patchSelected((s) => ({ ...s, replicates: [...s.replicates, r] }));
    setDetForm((f) => ({ ...f, value: "" }));
  };

  const deleteReplicate = (rid: string) => {
    if (!isAdmin || !selected) return;
    patchSelected((s) => ({ ...s, replicates: s.replicates.filter((x) => x.id !== rid) }));
  };

  const addAccuracy = () => {
    if (!isAdmin || !selected) return;
    const target = parseFloat(accForm.target);
    const measured = parseFloat(accForm.measured);
    if (isNaN(target) || isNaN(measured) || target === 0) {
      return toast({ title: "Enter valid target & measured (target ≠ 0)" });
    }
    const p: KitValAccuracyPoint = {
      id: uid(), date: accForm.date,
      sample: accForm.sample || `S${selected.accuracyPoints.length + 1}`,
      target, measured,
    };
    patchSelected((s) => ({ ...s, accuracyPoints: [...s.accuracyPoints, p] }));
    setAccForm((f) => ({ ...f, sample: "", target: "", measured: "" }));
  };

  const addLinearity = () => {
    if (!isAdmin || !selected) return;
    const expected = parseFloat(linForm.expected);
    const measured = parseFloat(linForm.measured);
    if (isNaN(expected) || isNaN(measured)) return toast({ title: "Enter valid expected & measured" });
    const p: KitValLinearityPoint = { id: uid(), date: linForm.date, expected, measured };
    patchSelected((s) => ({ ...s, linearityPoints: [...s.linearityPoints, p] }));
    setLinForm((f) => ({ ...f, expected: "", measured: "" }));
  };

  /* ---- derived ---- */
  const precisionByLevel = useMemo(() => {
    if (!selected) return [];
    const levels = Array.from(
      new Set(selected.replicates.map((r) => r.level).filter((l) => l !== "Blank" && l !== "LoD"))
    );
    return levels.map((level) => {
      const reps = selected.replicates.filter((r) => r.level === level);
      const an = precisionAnova(reps);
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
    const xs = rows.map((r) => r.target);
    const ys = rows.map((r) => r.measured);
    const olsFit = ols(xs, ys);
    const dem = deming(xs, ys, 1);
    const pb = passingBablok(xs, ys);
    return {
      n: rows.length,
      meanBias,
      sdBias: sampleSd(biases),
      meanRecovery: mean(rows.map((r) => r.recovery)),
      meanDiff,
      sdDiff,
      loaLow: meanDiff - 1.96 * sdDiff,
      loaHigh: meanDiff + 1.96 * sdDiff,
      passTea: Math.abs(meanBias) <= selected.tea,
      rows,
      olsFit,
      dem,
      pb,
    };
  }, [selected]);

  const linearityStats = useMemo(() => {
    if (!selected || selected.linearityPoints.length < 2) return null;
    const xs = selected.linearityPoints.map((p) => p.expected);
    const ys = selected.linearityPoints.map((p) => p.measured);
    const reg = ols(xs, ys);
    const dem = deming(xs, ys, 1);
    const pb = passingBablok(xs, ys);
    const points = selected.linearityPoints.map((p) => {
      const predicted = reg.slope * p.expected + reg.intercept;
      const residual = p.measured - predicted;
      const devPct = p.expected !== 0 ? (residual / p.expected) * 100 : NaN;
      return { ...p, predicted, residual, devPct };
    });
    const maxAbsDevPct = Math.max(...points.map((p) => Math.abs(p.devPct || 0)));
    return { ...reg, dem, pb, points, maxAbsDevPct };
  }, [selected]);

  const detectionStats = useMemo(() => {
    if (!selected) return null;
    const blanks = selected.replicates.filter((r) => r.level === "Blank").map((r) => r.value);
    const lows = selected.replicates.filter((r) => r.level === "LoD").map((r) => r.value);
    if (blanks.length < 2 && lows.length < 2) return null;
    const base = ep17LobLod(blanks.length ? blanks : [0], lows.length ? lows : blanks);
    // Simple LoQ estimate: lowest level in precision profile where CVwl <= loqCvLimit
    const limit = parseFloat(loqCvLimit) || 20;
    let LoQ: number | null = null;
    const sortedLevels = precisionByLevel
      .filter((p) => !isNaN(p.grandMean) && !isNaN(p.CVwl))
      .sort((a, b) => a.grandMean - b.grandMean);
    for (const p of sortedLevels) {
      if (p.CVwl <= limit) {
        LoQ = p.grandMean;
        break;
      }
    }
    return { ...base, LoQ, loqCvLimit: limit };
  }, [selected, precisionByLevel, loqCvLimit]);

  const exportExcel = () => {
    if (!selected) return;
    const q = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    const L: string[] = [];
    L.push("CLSI-ALIGNED KIT VALIDATION REPORT");
    L.push(`Generated,${new Date().toISOString()}`);
    L.push("");
    L.push("METADATA");
    [
      ["Kit", selected.kitName], ["Analyte", selected.analyte], ["Unit", selected.unit],
      ["Lot", selected.lot], ["Manufacturer", selected.manufacturer],
      ["TEa %", selected.tea], ["Claim CV %", selected.claimCV], ["Claim Bias %", selected.claimBias],
      ["Start", selected.startDate], ["End", selected.endDate], ["Analyst", selected.analyst],
      ["Notes", selected.notes],
    ].forEach(([k, v]) => L.push(`${k},${q(v)}`));
    L.push("");
    L.push("PRECISION ANOVA-STYLE (per level)");
    L.push("Level,N,Runs,Mean,df_within,SS_within,MS_within,df_between,SS_between,MS_between,Sr,CVr%,Sb,Swl,CVwl%,Pass");
    precisionByLevel.forEach((p) => {
      L.push([
        p.level, p.N, p.runs, fmt2(p.grandMean), p.dfWithin, fmt(p.ssWithin), fmt(p.MSw),
        p.dfBetween, fmt(p.ssBetween), fmt(p.MSb), fmt(p.Sr), fmt2(p.CVr), fmt(p.Sb),
        fmt(p.Swl), fmt2(p.CVwl),
        p.passRepeat && p.passWl ? "PASS" : p.passRepeat == null ? "" : "FAIL",
      ].join(","));
    });
    L.push("");
    L.push("RAW REPLICATES");
    L.push("Date,Run,Level,Value");
    selected.replicates.forEach((r) => L.push([r.date, r.runId, r.level, r.value].join(",")));
    L.push("");
    L.push("ACCURACY");
    L.push("Date,Sample,Target,Measured,Bias%,Recovery%");
    (accuracyStats?.rows || []).forEach((p) =>
      L.push([p.date, q(p.sample), p.target, p.measured, fmt2(p.bias), fmt2(p.recovery)].join(","))
    );
    if (accuracyStats) {
      L.push(`Mean bias %,${fmt2(accuracyStats.meanBias)}`);
      L.push(`Bland-Altman mean diff,${fmt(accuracyStats.meanDiff)}`);
      L.push(`LoA low,${fmt(accuracyStats.loaLow)}`);
      L.push(`LoA high,${fmt(accuracyStats.loaHigh)}`);
      L.push(`OLS slope,${fmt(accuracyStats.olsFit.slope, 6)}`);
      L.push(`OLS intercept,${fmt(accuracyStats.olsFit.intercept, 6)}`);
      L.push(`Deming slope,${fmt(accuracyStats.dem.slope, 6)}`);
      L.push(`Deming intercept,${fmt(accuracyStats.dem.intercept, 6)}`);
      L.push(`Passing-Bablok slope,${fmt(accuracyStats.pb.slope, 6)}`);
      L.push(`Passing-Bablok intercept,${fmt(accuracyStats.pb.intercept, 6)}`);
    }
    L.push("");
    L.push("LINEARITY");
    L.push("Date,Expected,Measured,Predicted,Residual,Dev%");
    (linearityStats?.points || []).forEach((p) =>
      L.push([p.date, p.expected, p.measured, fmt(p.predicted), fmt(p.residual), fmt2(p.devPct)].join(","))
    );
    if (linearityStats) {
      L.push(`OLS slope,${fmt(linearityStats.slope, 6)}`);
      L.push(`OLS R2,${fmt(linearityStats.r2, 6)}`);
      L.push(`Deming slope,${fmt(linearityStats.dem.slope, 6)}`);
      L.push(`Passing-Bablok slope,${fmt(linearityStats.pb.slope, 6)}`);
    }
    L.push("");
    L.push("DETECTION CAPABILITY (EP17-style)");
    if (detectionStats) {
      L.push(`LoB,${fmt(detectionStats.LoB)}`);
      L.push(`LoD,${fmt(detectionStats.LoD)}`);
      L.push(`LoQ (CV<=${detectionStats.loqCvLimit}%),${detectionStats.LoQ ?? ""}`);
      L.push(`n blank,${detectionStats.nBlank}`);
      L.push(`n low,${detectionStats.nLow}`);
    }
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
        Kit Validation (CLSI EP05 / EP15 / EP17)
      </h1>
      <p className="text-muted-foreground text-sm mb-4">
        Full production verification: nested precision ANOVA, trueness, Bland–Altman, OLS / Deming / Passing–Bablok,
        linearity, LoB/LoD/LoQ and Excel export. <b>Admin only</b> to edit.
      </p>

      <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[12.5px] text-sky-900 flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <b>Suggested protocol:</b> Precision — ≥5 days × 3 replicates per level (same Run/Day ID within a day).
          Accuracy — reference/target samples across the measuring range. Linearity — ≥5 concentrations.
          Detection — ≥20 blank + ≥20 low-level measurements when possible (EP17).
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
            Create a study (admin), then enter data in the tabs. All statistics are calculated automatically.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold">{selected.kitName} — {selected.analyte}</div>
                <div className="text-xs text-muted-foreground">
                  Lot {selected.lot || "—"} · {selected.startDate} → {selected.endDate} · TEa ±{selected.tea}%
                  {selected.claimCV ? ` · Claim CV ${selected.claimCV}%` : ""}
                </div>
              </div>
              <button onClick={exportExcel} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-bold rounded-lg px-4 py-2 hover:bg-emerald-700">
                <Download className="w-4 h-4" /> Export Excel (CSV)
              </button>
            </div>

            <div className="flex flex-wrap gap-1 border-b pb-2">
              {([
                ["summary", "Summary"],
                ["precision", "Precision ANOVA"],
                ["accuracy", "Accuracy / Regression"],
                ["linearity", "Linearity"],
                ["detection", "LoB / LoD / LoQ"],
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
                      <div>Sr <b className="ltr-inline">{fmt(p.Sr)}</b> · CVr <b className="ltr-inline">{fmt2(p.CVr)}%</b></div>
                      <div>Swl <b className="ltr-inline">{fmt(p.Swl)}</b> · CVwl <b className="ltr-inline">{fmt2(p.CVwl)}%</b></div>
                      <div className="text-xs text-muted-foreground">N={p.N} · runs={p.runs}</div>
                    </div>
                  </div>
                ))}
                {accuracyStats && (
                  <div className="bg-white rounded-2xl border p-4">
                    <div className="text-xs text-muted-foreground">Trueness</div>
                    <div className="font-bold text-lg ltr-inline">Bias {fmt2(accuracyStats.meanBias)}%</div>
                    <div className="text-sm">OLS slope <b className="ltr-inline">{fmt(accuracyStats.olsFit.slope, 4)}</b></div>
                    <div className="text-sm">Deming <b className="ltr-inline">{fmt(accuracyStats.dem.slope, 4)}</b></div>
                    <div className="text-sm">P–Bablok <b className="ltr-inline">{fmt(accuracyStats.pb.slope, 4)}</b></div>
                  </div>
                )}
                {detectionStats && (
                  <div className="bg-white rounded-2xl border p-4">
                    <div className="text-xs text-muted-foreground">Detection (EP17)</div>
                    <div className="text-sm mt-1 space-y-1">
                      <div>LoB <b className="ltr-inline">{fmt2(detectionStats.LoB)}</b></div>
                      <div>LoD <b className="ltr-inline">{fmt2(detectionStats.LoD)}</b></div>
                      <div>LoQ <b className="ltr-inline">{detectionStats.LoQ != null ? fmt2(detectionStats.LoQ) : "—"}</b></div>
                    </div>
                  </div>
                )}
                {!precisionByLevel.length && !accuracyStats && (
                  <div className="col-span-full text-sm text-muted-foreground border border-dashed rounded-xl p-8 text-center">
                    Enter data in the other tabs to populate the summary.
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
                      <input className={inputCls + " w-24"} value={repForm.runId} onChange={(e) => setRepForm({ ...repForm, runId: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Level</label>
                      <input className={inputCls + " w-20"} value={repForm.level} onChange={(e) => setRepForm({ ...repForm, level: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Value</label>
                      <input type="number" step="any" className={inputCls + " w-28"} value={repForm.value} onChange={(e) => setRepForm({ ...repForm, value: e.target.value })} />
                    </div>
                    <button onClick={addReplicate} className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-bold">Add</button>
                  </div>
                )}

                {precisionByLevel.length > 0 && (
                  <div className="bg-white rounded-2xl border p-4 h-64" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={precisionByLevel}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="level" />
                        <YAxis unit="%" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="CVr" name="CVr %" fill="#0d6fb8" />
                        <Bar dataKey="CVwl" name="CVwl %" fill="#f59e0b" />
                        {selected.claimCV > 0 && <ReferenceLine y={selected.claimCV} stroke="#16a34a" label="Claim" />}
                        {selected.claimCV > 0 && <ReferenceLine y={selected.claimCV * 1.5} stroke="#dc2626" strokeDasharray="4 4" label="1.5×" />}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-white rounded-2xl border overflow-auto">
                  <div className="px-4 pt-3 text-xs font-bold text-muted-foreground">ANOVA-style components (EP05 / EP15)</div>
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Level</th>
                        <th className="px-3 py-2 text-left">N</th>
                        <th className="px-3 py-2 text-left">Runs</th>
                        <th className="px-3 py-2 text-left">df_w</th>
                        <th className="px-3 py-2 text-left">MS_w</th>
                        <th className="px-3 py-2 text-left">df_b</th>
                        <th className="px-3 py-2 text-left">MS_b</th>
                        <th className="px-3 py-2 text-left">Sr</th>
                        <th className="px-3 py-2 text-left">Sb</th>
                        <th className="px-3 py-2 text-left">Swl</th>
                        <th className="px-3 py-2 text-left">CVr%</th>
                        <th className="px-3 py-2 text-left">CVwl%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {precisionByLevel.map((p) => (
                        <tr key={p.level} className="border-t">
                          <td className="px-3 py-2 font-medium">{p.level}</td>
                          <td className="px-3 py-2 ltr-inline">{p.N}</td>
                          <td className="px-3 py-2 ltr-inline">{p.runs}</td>
                          <td className="px-3 py-2 ltr-inline">{p.dfWithin}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.MSw)}</td>
                          <td className="px-3 py-2 ltr-inline">{p.dfBetween}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.MSb)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.Sr)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.Sb)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.Swl)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt2(p.CVr)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt2(p.CVwl)}</td>
                        </tr>
                      ))}
                      {!precisionByLevel.length && (
                        <tr><td colSpan={12} className="px-3 py-8 text-center text-muted-foreground">No precision data yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {selected.replicates.filter((r) => r.level !== "Blank" && r.level !== "LoD").length > 0 && (
                  <div className="bg-white rounded-2xl border overflow-auto max-h-48">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Run</th>
                          <th className="px-3 py-2 text-left">Level</th>
                          <th className="px-3 py-2 text-left">Value</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.replicates.filter((r) => r.level !== "Blank" && r.level !== "LoD").map((r) => (
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
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="bg-white rounded-2xl border p-3 text-sm">
                        <div className="text-xs text-muted-foreground">OLS</div>
                        <div>Slope <b className="ltr-inline">{fmt(accuracyStats.olsFit.slope, 4)}</b></div>
                        <div>Intercept <b className="ltr-inline">{fmt(accuracyStats.olsFit.intercept, 4)}</b></div>
                        <div>R² <b className="ltr-inline">{fmt(accuracyStats.olsFit.r2, 4)}</b></div>
                      </div>
                      <div className="bg-white rounded-2xl border p-3 text-sm">
                        <div className="text-xs text-muted-foreground">Deming (λ=1)</div>
                        <div>Slope <b className="ltr-inline">{fmt(accuracyStats.dem.slope, 4)}</b></div>
                        <div>Intercept <b className="ltr-inline">{fmt(accuracyStats.dem.intercept, 4)}</b></div>
                      </div>
                      <div className="bg-white rounded-2xl border p-3 text-sm">
                        <div className="text-xs text-muted-foreground">Passing–Bablok</div>
                        <div>Slope <b className="ltr-inline">{fmt(accuracyStats.pb.slope, 4)}</b></div>
                        <div>Intercept <b className="ltr-inline">{fmt(accuracyStats.pb.intercept, 4)}</b></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border p-4 h-64" dir="ltr">
                      <div className="text-xs text-muted-foreground mb-1">Bias % (TEa ±{selected.tea}%)</div>
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

                    <div className="bg-white rounded-2xl border p-4 h-64" dir="ltr">
                      <div className="text-xs text-muted-foreground mb-1">
                        Bland–Altman · mean={fmt(accuracyStats.meanDiff)} · LoA [{fmt(accuracyStats.loaLow)}, {fmt(accuracyStats.loaHigh)}]
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
                  <>
                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <div className="bg-white rounded-2xl border p-3">
                        <div className="text-xs text-muted-foreground">OLS</div>
                        <div>Slope <b className="ltr-inline">{fmt(linearityStats.slope, 4)}</b> · R² <b className="ltr-inline">{fmt(linearityStats.r2, 4)}</b></div>
                      </div>
                      <div className="bg-white rounded-2xl border p-3">
                        <div className="text-xs text-muted-foreground">Deming</div>
                        <div>Slope <b className="ltr-inline">{fmt(linearityStats.dem.slope, 4)}</b></div>
                      </div>
                      <div className="bg-white rounded-2xl border p-3">
                        <div className="text-xs text-muted-foreground">Passing–Bablok</div>
                        <div>Slope <b className="ltr-inline">{fmt(linearityStats.pb.slope, 4)}</b></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border p-4 h-72" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={linearityStats.points}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="expected" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Scatter dataKey="measured" name="Measured" fill="#0d6fb8" />
                          <Line type="linear" dataKey="predicted" name="OLS fit" stroke="#dc2626" dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </>
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
                      {(linearityStats?.points || []).map((p) => (
                        <tr key={p.id} className="border-t">
                          <td className="px-3 py-2 ltr-inline">{p.date}</td>
                          <td className="px-3 py-2 ltr-inline">{p.expected}</td>
                          <td className="px-3 py-2 ltr-inline">{p.measured}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.predicted)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt(p.residual)}</td>
                          <td className="px-3 py-2 ltr-inline">{fmt2(p.devPct)}</td>
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

            {/* DETECTION EP17 */}
            {tab === "detection" && (
              <div className="space-y-4">
                {isAdmin && (
                  <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-2 items-end">
                    <div>
                      <label className={labelCls}>Series</label>
                      <select className={inputCls + " w-28"} value={detForm.kind} onChange={(e) => setDetForm({ ...detForm, kind: e.target.value as "Blank" | "LoD" })}>
                        <option value="Blank">Blank</option>
                        <option value="LoD">Low (LoD)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Date</label>
                      <input type="date" className={inputCls + " w-36"} value={detForm.date} onChange={(e) => setDetForm({ ...detForm, date: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Value</label>
                      <input type="number" step="any" className={inputCls + " w-28"} value={detForm.value} onChange={(e) => setDetForm({ ...detForm, value: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>LoQ CV limit %</label>
                      <input type="number" step="any" className={inputCls + " w-24"} value={loqCvLimit} onChange={(e) => setLoqCvLimit(e.target.value)} />
                    </div>
                    <button onClick={addDetection} className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-bold">Add</button>
                  </div>
                )}

                {detectionStats ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white rounded-2xl border p-4">
                      <div className="text-xs text-muted-foreground">LoB</div>
                      <div className="text-xl font-bold ltr-inline">{fmt2(detectionStats.LoB)}</div>
                      <div className="text-xs text-muted-foreground">n blank = {detectionStats.nBlank}</div>
                    </div>
                    <div className="bg-white rounded-2xl border p-4">
                      <div className="text-xs text-muted-foreground">LoD</div>
                      <div className="text-xl font-bold ltr-inline">{fmt2(detectionStats.LoD)}</div>
                      <div className="text-xs text-muted-foreground">n low = {detectionStats.nLow}</div>
                    </div>
                    <div className="bg-white rounded-2xl border p-4">
                      <div className="text-xs text-muted-foreground">LoQ (CV ≤ {detectionStats.loqCvLimit}%)</div>
                      <div className="text-xl font-bold ltr-inline">{detectionStats.LoQ != null ? fmt2(detectionStats.LoQ) : "—"}</div>
                      <div className="text-xs text-muted-foreground">from precision profile</div>
                    </div>
                    <div className="bg-white rounded-2xl border p-4 text-sm">
                      <div>Mean blank <b className="ltr-inline">{fmt2(detectionStats.meanBlank)}</b></div>
                      <div>SD blank <b className="ltr-inline">{fmt(detectionStats.sdBlank)}</b></div>
                      <div>SD low <b className="ltr-inline">{fmt(detectionStats.sdLow)}</b></div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-xl p-8 text-center text-sm text-muted-foreground">
                    Add Blank replicates and Low-level (LoD) replicates. Optionally set precision levels to estimate LoQ.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================== English glossary ===================== */}
      <section className="mt-10 border-t pt-8">
        <h2 className="text-lg font-extrabold mb-3">What do these options mean? (English guide)</h2>
        <div className="grid md:grid-cols-2 gap-4 text-[13px] leading-relaxed text-muted-foreground">
          <div className="bg-white rounded-2xl border p-4 space-y-2">
            <p><b className="text-foreground">New study / metadata</b> — Identify the kit lot under test: kit name, analyte, unit, manufacturer claims (CV%, bias%), allowable total error (TEa%), study dates and analyst. These fields appear on the Excel report.</p>
            <p><b className="text-foreground">TEa %</b> — Total allowable error goal. Mean |bias| is compared against this limit for a simple PASS/FAIL on trueness.</p>
            <p><b className="text-foreground">Claim CV % / Claim Bias %</b> — Manufacturer specifications from the kit insert. Precision CVs are checked against a simplified verification limit of <b>1.5 × claim CV</b> (common EP15-style rule of thumb).</p>
          </div>
          <div className="bg-white rounded-2xl border p-4 space-y-2">
            <p><b className="text-foreground">Precision (Within-run / Between-run)</b> — Enter replicates with the same <b>Run/Day ID</b> for repeatability and different IDs for between-run variation. Recommended: ≥5 days × 3 replicates per level.</p>
            <p><b className="text-foreground">Sr (repeatability SD)</b> — Within-run standard deviation from nested ANOVA components (EP05/EP15 style).</p>
            <p><b className="text-foreground">Sb</b> — Between-run SD component. <b>Swl</b> — Within-laboratory SD = √(Sr² + Sb²). <b>CVr / CVwl</b> — those SDs as percent of the mean.</p>
            <p><b className="text-foreground">ANOVA table (df, MS)</b> — Degrees of freedom and mean squares used to derive Sr and Sb, similar in spirit to CLSI multi-day precision tables.</p>
          </div>
          <div className="bg-white rounded-2xl border p-4 space-y-2">
            <p><b className="text-foreground">Accuracy / Trueness</b> — Compare measured values to assigned/reference targets. Bias% = (Measured − Target) / Target × 100. Recovery% = Measured / Target × 100.</p>
            <p><b className="text-foreground">Bland–Altman</b> — Plots (Measured − Target) versus average of the two. Shows mean difference and 95% limits of agreement (mean ± 1.96 SD).</p>
            <p><b className="text-foreground">OLS regression</b> — Ordinary least squares fit of Measured vs Target/Expected (assumes error mainly in Y).</p>
            <p><b className="text-foreground">Deming regression</b> — Allows measurement error in both X and Y (default λ = 1, equal error variance). Preferred over OLS for method comparison.</p>
            <p><b className="text-foreground">Passing–Bablok</b> — Non-parametric regression robust to outliers; slope from the median of pairwise slopes. Widely used in clinical method comparison (CLSI EP09 context).</p>
          </div>
          <div className="bg-white rounded-2xl border p-4 space-y-2">
            <p><b className="text-foreground">Linearity</b> — Enter expected vs measured concentrations across the measuring range. OLS fit, residuals and % deviation are calculated; Deming and Passing–Bablok slopes are also reported.</p>
            <p><b className="text-foreground">LoB (Limit of Blank)</b> — Highest apparent analyte concentration expected in blank samples (EP17-style): mean_blank + 1.645 × SD_blank.</p>
            <p><b className="text-foreground">LoD (Limit of Detection)</b> — Lowest concentration likely to be distinguished from blank: LoB + 1.645 × SD_low.</p>
            <p><b className="text-foreground">LoQ (Limit of Quantitation)</b> — Estimated here as the lowest precision-profile mean where within-lab CV% is ≤ the chosen limit (default 20%).</p>
            <p><b className="text-foreground">Export Excel (CSV)</b> — Downloads a UTF-8 CSV (opens in Excel) with metadata, ANOVA precision, raw data, accuracy, regressions, linearity and detection limits.</p>
            <p><b className="text-foreground">Admin only</b> — Creating studies and entering/deleting points requires admin login; others can view exported concepts after data exist on the device.</p>
          </div>
        </div>
        <p className="mt-4 text-[12px] text-muted-foreground">
          Note: This tool implements widely used CLSI <i>concepts and formulas</i> (EP05/EP15 precision components, EP09-style regressions, EP17 detection limits)
          for kit production documentation. It is not a certified substitute for commercial biostatistics packages or the full official CLSI calculation workbooks;
          always cross-check critical regulatory submissions against the current CLSI documents and your QMS.
        </p>
      </section>
    </div>
  );
}