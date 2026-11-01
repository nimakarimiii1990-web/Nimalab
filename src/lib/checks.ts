import type { AnalyzerParam, CheckReportItem, PatientResultRow, QcEntry, QcSeries } from "./nima-types";

export const uid = () => Math.random().toString(36).slice(2, 10);

// ================= Westgard rules =================
export interface WestgardResult {
  idx: number;
  violations: string[]; // e.g. ["1-3s", "2-2s"]
  reject: boolean;
}

export function evaluateWestgard(series: QcSeries): WestgardResult[] {
  const { mean, sd, entries } = series;
  const out: WestgardResult[] = [];
  if (!sd || entries.length === 0) return entries.map((_, i) => ({ idx: i, violations: [], reject: false }));

  const z = (v: number) => (v - mean) / sd;

  entries.forEach((e: QcEntry, i) => {
    const zc = z(e.value);
    const violations: string[] = [];
    // 1-2s warning
    if (Math.abs(zc) >= 2) violations.push("1-2s ⚠ warning");
    // 1-3s rejection
    if (Math.abs(zc) >= 3) violations.push("1-3s ❌ reject");
    // 2-2s: two consecutive same-side beyond ±2s
    if (i >= 1) {
      const zp = z(entries[i - 1].value);
      if (Math.abs(zc) >= 2 && Math.abs(zp) >= 2 && Math.sign(zc) === Math.sign(zp))
        violations.push("2-2s ❌ reject");
    }
    // R-4s: two consecutive points on opposite sides, both beyond ±2s (range ≥4s)
    if (i >= 1) {
      const zp = z(entries[i - 1].value);
      if (Math.abs(zc) >= 2 && Math.abs(zp) >= 2 && Math.sign(zc) !== Math.sign(zp))
        violations.push("R-4s ❌ reject");
    }
    // 3-1s: three consecutive beyond same side ±1s
    if (i >= 2) {
      const arr = [z(entries[i - 2].value), z(entries[i - 1].value), zc];
      if (arr.every((v) => v >= 1) || arr.every((v) => v <= -1)) violations.push("3-1s ❌ reject");
    }
    // 4-1s: four consecutive same side ±1s
    if (i >= 3) {
      const arr = [z(entries[i - 3].value), z(entries[i - 2].value), z(entries[i - 1].value), zc];
      if (arr.every((v) => v >= 1) || arr.every((v) => v <= -1)) violations.push("4-1s ❌ reject");
    }
    // 10x: ten consecutive same side of mean
    if (i >= 9) {
      const arr = entries.slice(i - 9, i + 1).map((x) => z(x.value));
      if (arr.every((v) => v > 0) || arr.every((v) => v < 0)) violations.push("10x ❌ reject");
    }
    out.push({ idx: i, violations, reject: violations.some((v) => v.includes("❌")) });
  });
  return out;
}

export function sigmaMetric(tea?: number, bias?: number, cv?: number): number | null {
  if (!tea || !cv || cv <= 0) return null;
  return Math.max(0, Math.round(((tea - (bias || 0)) / cv) * 10) / 10);
}

export function sigmaInterp(sigma: number | null): string {
  if (sigma === null) return "Enter TEa and CV.";
  if (sigma >= 6) return "≥6 — excellent; 1-3s alone is enough.";
  if (sigma >= 5) return "5–6 — very good; 1-2s/1-3s with a few rules.";
  if (sigma >= 4) return "4–5 — good; use multi-rule 2-2s + R-4s + 4-1s.";
  if (sigma >= 3) return "3–4 — marginal; heavy QC and method review advised.";
  return "<3 — poor; improve the method before relying on QC.";
}

// ================= Result check engine =================
export function checkRow(
  row: PatientResultRow,
  param: AnalyzerParam | undefined
): CheckReportItem {
  const item: CheckReportItem = {
    nameFa: row.nameFa || row.nameEn,
    nameEn: row.nameEn,
    value: row.value,
    unit: row.unit,
    status: "ok",
    messages: [],
  };

  if (!param) {
    item.status = "error";
    item.messages.push("This parameter is not in the parameter table — define it first (admin: Analyzer page).");
    return item;
  }

  // Critical / reference flags
  if (param.critLow !== undefined && row.value <= param.critLow) {
    item.status = "critical";
    item.messages.push(`Critical low value (≤ ${param.critLow}) — confirm with physician / verify sample before releasing the report.`);
  } else if (param.critHigh !== undefined && row.value >= param.critHigh) {
    item.status = "critical";
    item.messages.push(`Critical high value (≥ ${param.critHigh}) — follow the urgent-report protocol.`);
  } else if (param.refLow !== undefined && row.value < param.refLow) {
    item.status = "low";
    item.messages.push(`Below reference range (${param.refLow})`);
  } else if (param.refHigh !== undefined && row.value > param.refHigh) {
    item.status = "high";
    item.messages.push(`Above reference range (${param.refHigh})`);
  }

  // Delta check (patient-based QC)
  if (row.prev !== undefined && row.prev > 0) {
    const delta = ((row.value - row.prev) / row.prev) * 100;
    if (Math.abs(delta) >= 50) {
      item.messages.push(
        `Delta check: ${delta > 0 ? "+" : ""}${Math.round(delta)}% change vs previous result (${row.prev}) — possible sample/label error; request a new sample.`
      );
      if (item.status === "ok") item.status = "error";
    } else if (Math.abs(delta) >= 25) {
      item.messages.push(`Delta check: ${Math.round(delta)}% change — review for sensitive analytes.`);
    }
  }

  // Sanity (order of magnitude) — likely unit mix-up
  if (param.refLow !== undefined && param.refHigh !== undefined && param.refLow > 0) {
    const mid = (param.refLow + param.refHigh) / 2;
    const ratio = row.value / mid;
    if (ratio >= 100 || ratio <= 0.01) {
      item.messages.push(
        "Grossly out of proportion to the reference range — likely unit mix-up (SI / mg-dL) or typo; check the unit."
      );
      if (item.status === "ok") item.status = "error";
    }
  }

  return item;
}
