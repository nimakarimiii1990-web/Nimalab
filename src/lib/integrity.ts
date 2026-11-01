// ================= Nima Result Integrity engine =================
// Cross-test consistency rules: for every sample where a relation between
// analytes is expected, verify it and warn the user when the pattern is
// physiologically implausible (probable analytical / pre-analytical error).
// All messages are in English (UI language); news/articles keep Persian text.

export type IntegrityStatus = "ok" | "warning" | "error" | "info";

export interface ChartBand {
  value: number;
  lo?: number;
  hi?: number;
  axisMax: number;
  unit?: string;
  zoneLabel?: string;
}

export interface ChartBalance {
  parts: { name: string; value: number; color: string }[];
  total: number;
  totalLabel: string;
  unit: string;
  residualPct?: number;
}

export interface IntegrityChart {
  kind: "donut" | "band" | "balance";
  pct?: number; // donut fraction %
  expectedLabel?: string; // e.g. "expected < 6%" or "normal 10–25%"
  band?: ChartBand;
  balance?: ChartBalance;
}

export interface IntegrityResult {
  ruleId: string;
  panel: string;
  title: string;
  status: IntegrityStatus;
  message: string;
  chart?: IntegrityChart;
}

export interface IntegrityRule {
  id: string;
  panel: string;
  title: string;
  relation: string; // catalog line
  keys: string[]; // required canonical keys
  optionalKeys?: string[];
  evaluate: (v: Record<string, number>) => Omit<IntegrityResult, "ruleId" | "panel" | "title"> | null;
}

// ---------- analyte name resolution ----------
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[%.\-_=()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Many synonyms → canonical key. Includes test ids from the Nima database. */
export const ALIASES: Record<string, string> = {
  // cardiac
  ck: "ck", cpk: "ck", "total ck": "ck", "creatinine kinase": "ck", "creatine kinase": "ck", "creatine phosphokinase": "ck",
  ckmb: "ckmb", "ck mb": "ckmb", "ckmb activity": "ckmb", "ck mb activity": "ckmb", "ckmb mass": "ckmb",
  troponin: "trop", "trop i": "trop", "trop i hs": "trop", tni: "trop", tnt: "trop",
  // bilirubin / liver
  "total bilirubin": "tbili", "bilirubin total": "tbili", tbili: "tbili", "t bili": "tbili", bilirubin: "tbili", "bili total": "tbili",
  "direct bilirubin": "dbili", "bilirubin direct": "dbili", dbili: "dbili", "d bili": "dbili", "conjugated bilirubin": "dbili",
  "indirect bilirubin": "ibili",
  ast: "ast", sgot: "ast", alt: "alt", sgpt: "alt", ldh: "ldh", alp: "alp", ggt: "ggt",
  // lipids
  tc: "tc", "total cholesterol": "tc", cholesterol: "tc", "cholesterol total": "tc", "chol": "tc",
  tg: "tg", triglycerides: "tg", triglyceride: "tg", trigs: "tg",
  hdl: "hdl", "hdl cholesterol": "hdl", "hdl c": "hdl", "hdl cholest": "hdl",
  ldl: "ldl", "ldl cholesterol": "ldl", "ldl c": "ldl", "ldl direct": "ldl", "direct ldl": "ldl", "ldl calculated": "ldl",
  vldl: "vldl", "vldl cholesterol": "vldl", "vldl c": "vldl",
  // electrolytes / minerals / proteins
  na: "na", sodium: "na", k: "k", potassium: "k", cl: "cl", chloride: "cl",
  hco3: "hco3", co2: "hco3", bicarbonate: "hco3", "total co2": "hco3",
  ca: "ca", calcium: "ca", "total calcium": "ca", phos: "phos", phosphorus: "phos", phosphate: "phos",
  alb: "alb", albumin: "alb", tp: "tp", "total protein": "tp", protein: "tp",
  // renal / glucose
  bun: "bun", urea: "bun", "blood urea": "bun", crea: "crea", creatinine: "crea", cr: "crea",
  glu: "glu", glucose: "glu", fbs: "glu", "fasting glucose": "glu", "glucose fasting": "glu", "plasma glucose": "glu", sugar: "glu",
  a1c: "a1c", hba1c: "a1c", "hb a1c": "a1c", "hemoglobin a1c": "a1c", "glycated hemoglobin": "a1c", "glycohemoglobin": "a1c",
  osm: "osm", osmolality: "osm", "serum osmolality": "osm", "measured osmolality": "osm",
  // iron
  fe: "fe", iron: "fe", "serum iron": "fe", tibc: "tibc", "total iron binding capacity": "tibc",
  ferritin: "ferritin", transferrin: "transferrin", tsat: "tsat",
  // hormones
  tsh: "tsh", ft4: "ft4", "free t4": "ft4", "free thyroxine": "ft4", "thyroxine free": "ft4", "free t 4": "ft4",
  // cbc
  wbc: "wbc", "white blood cells": "wbc", "wbc count": "wbc", "leukocytes": "wbc",
  rbc: "rbc", "red blood cells": "rbc", "rbc count": "rbc",
  hgb: "hgb", hemoglobin: "hgb", haemoglobin: "hgb", hb: "hgb",
  hct: "hct", hematocrit: "hct", haematocrit: "hct", pcv: "hct",
  mcv: "mcv", mch: "mch", mchc: "mchc",
  neut: "neut", neutrophils: "neut", "neutrophil": "neut", "polys": "neut",
  lymph: "lymph", lymphocytes: "lymph", "lymphocyte": "lymph",
  mono: "mono", monocytes: "mono", eos: "eos", eosinophils: "eos", baso: "baso", basophils: "baso",
  plt: "plt", "platelet count": "plt", platelets: "plt", "plt count": "plt",
  // coag / csf
  pt: "pt", "prothrombin time": "pt", inr: "inr", "i n r": "inr",
  "csf glucose": "csfglu", "csf sugar": "csfglu",
};

// Persian aliases for the most common analytes (bulk input accepts them too)
const FA_ALIASES: Record<string, string> = {
  "سدیم": "na", "پتاسیم": "k", "کلر": "cl", "قند": "glu", "قند خون": "glu", "قند ناشتا": "glu",
  "کراتینین": "crea", "اوره": "bun", "اسید اوریک": "ua", "کلسیم": "ca", "آلبومین": "alb",
  "پروتئین تام": "tp", "بیلی روبین توتال": "tbili", "بیلی روبین توتل": "tbili", "بیلی روبین کل": "tbili",
  "بیلی روبین دایرکت": "dbili", "بیلی روبین مستقیم": "dbili", "بیلی روبین غیر مستقیم": "ibili",
  "چربی خون": "tg", "تری گلیسیرید": "tg", "کلسترول تام": "tc", "کلسترول": "tc",
  "هموگلوبین": "hgb", "هماتوکریت": "hct", "گلبول سفید": "wbc", "گلبول قرمز": "rbc",
  "پلاکت": "plt", "ترومبوسیت": "plt", "نوتروفیل": "neut", "لنفوسیت": "lymph",
  "تستوسترون": "testost", "تیروئید": "tsh", "فریتین": "ferritin", "آهن": "fe",
  "hba1c": "a1c", "هموگلوبین a1c": "a1c", "ast": "ast", "alt": "alt", "قند csf": "csfglu",
};

export function resolveKey(rawName: string): string | null {
  const n = norm(rawName);
  if (!n) return null;
  if (ALIASES[n]) return ALIASES[n];
  if (FA_ALIASES[rawName.trim()]) return FA_ALIASES[rawName.trim()];
  // token-level retry: "sodium (na)" → "sodium na" → try full, then strip parens content
  const stripped = n.replace(/\b(na|k|cl)\b$/, "").trim();
  if (stripped && ALIASES[stripped]) return ALIASES[stripped];
  // startsWith fallback for long forms like "bilirubin direct fractional"
  const hit = Object.keys(ALIASES).find((k) => k.length >= 4 && n.startsWith(k));
  return hit ? ALIASES[hit] : null;
}

export const C_AL = "#0b5cad"; // LDL / primary blue
export const C_TEAL = "#00a5b5"; // HDL / teal
export const C_AMBER = "#f59e0b";
export const C_RED = "#ef4444";
export const C_GREEN = "#10b981";
export const C_GRAY = "#cbd5e1";

const f1 = (x: number) => (Math.round(x * 10) / 10).toString();
const f0 = (x: number) => Math.round(x).toString();

const donut = (pct: number, expectedLabel: string): IntegrityChart => ({
  kind: "donut",
  pct: Math.max(0, Math.min(100, pct)),
  expectedLabel,
});

// ---------- rules ----------
export const INTEGRITY_RULES: IntegrityRule[] = [
  // ===== Cardiac =====
  {
    id: "ck-ckmb-fraction",
    panel: "Cardiac",
    title: "CK-MB / Total CK fraction",
    relation: "CK-MB is normally < 6% of total CK (CPK). A much higher fraction is physiologically implausible.",
    keys: ["ck", "ckmb"],
    evaluate: (v) => {
      if (v.ck <= 0) return null;
      const pct = (v.ckmb / v.ck) * 100;
      const chart = donut(pct, "expected < 6% of total CK");
      if (pct > 25) {
        return {
          status: "error",
          message: `CK-MB = ${f0(pct)}% of total CK — physiologically implausible. Suspect macro-CK, CK-BB release, assay interference or sample mix-up. Repeat the sample and confirm with troponin.`,
          chart,
        };
      }
      if (pct > 6) {
        return {
          status: "warning",
          message: `CK-MB = ${f1(pct)}% of total CK (usual < 6%). This suggests a cardiac source of CK — verify with troponin and ECG; if the patient has no cardiac signs, suspect interference.`,
          chart,
        };
      }
      return { status: "ok", message: `CK-MB = ${f1(pct)}% of total CK — within the expected fraction (< 6%).`, chart };
    },
  },
  {
    id: "troponin-ckmb-concordance",
    panel: "Cardiac",
    title: "Troponin vs CK-MB concordance",
    relation: "In acute myocardial injury, troponin (more sensitive) should not be normal while CK-MB is markedly raised.",
    keys: ["trop", "ckmb"],
    evaluate: (v) => {
      if (v.ckmb >= 25 && v.trop < 0.04) {
        return {
          status: "warning",
          message: `CK-MB ${v.ckmb} is high but troponin ${v.trop} is normal — atypical pattern. Suspect skeletal-muscle source, macro-CK interference or timing mismatch; repeat troponin in 3–6 h.`,
        };
      }
      return { status: "ok", message: "Troponin and CK-MB pattern are concordant." };
    },
  },

  // ===== Bilirubin =====
  {
    id: "bilirubin-fraction",
    panel: "Liver",
    title: "Direct / Total bilirubin fraction",
    relation: "Direct (conjugated) bilirubin is normally ≈ 20% (10–25%) of total bilirubin.",
    keys: ["tbili", "dbili"],
    evaluate: (v) => {
      if (v.tbili <= 0) return null;
      const pct = (v.dbili / v.tbili) * 100;
      const chart = donut(pct, "normal ≈ 20% (10–25%)");
      if (v.dbili > v.tbili) {
        return {
          status: "error",
          message: `Direct bilirubin (${v.dbili}) exceeds total (${v.tbili}) — impossible result. Check sample identity, reagent blank or instrument; also verify units.`,
          chart,
        };
      }
      if (pct > 50) {
        return {
          status: "error",
          message: `Direct bilirubin = ${f0(pct)}% of total (normal ≈ 20%). In a sample with no specific problem this is implausible — suspect hemolysis/lipemia interference or an assay error; repeat and check ALP/GGT.`,
          chart,
        };
      }
      if (pct > 25) {
        return {
          status: "warning",
          message: `Direct bilirubin = ${f1(pct)}% of total (expected ≈ 20%). A cholestatic pattern is possible — check ALP/GGT; if liver enzymes are normal, suspect interference and repeat.`,
          chart,
        };
      }
      const ind = v.tbili - v.dbili;
      return {
        status: "ok",
        message: `Direct = ${f1(pct)}% of total — within the expected ≈ 20% band. Indirect = ${f1(ind)}.`,
        chart,
      };
    },
  },

  // ===== Lipids =====
  {
    id: "lipid-balance",
    panel: "Lipids",
    title: "Lipid panel mass balance",
    relation: "Total cholesterol ≈ LDL + HDL + VLDL (TG/5) + IDL/Lp(a) residual. The residual is normally small (< ~8–10% of TC).",
    keys: ["tc", "hdl", "tg"],
    optionalKeys: ["ldl", "vldl"],
    evaluate: (v) => {
      const vldlCalc = v.tg / 5;
      const vldl = v.vldl ?? vldlCalc;
      if (v.ldl !== undefined) {
        const sum = v.hdl + v.ldl + vldl;
        const residual = v.tc - sum;
        const pct = (residual / v.tc) * 100;
        const chart: IntegrityChart = {
          kind: "balance",
          balance: {
            parts: [
              { name: "LDL", value: v.ldl, color: C_AL },
              { name: "HDL", value: v.hdl, color: C_TEAL },
              { name: "VLDL (TG/5)", value: vldl, color: C_AMBER },
              { name: "Residual (IDL + Lp(a))", value: Math.max(0, residual), color: pct < 0 ? C_RED : C_GRAY },
            ],
            total: v.tc,
            totalLabel: "Measured total cholesterol",
            unit: "mg/dL",
            residualPct: pct,
          },
        };
        if (v.tc < v.hdl + v.ldl) {
          return {
            status: "error",
            message: `HDL + LDL (${f0(v.hdl + v.ldl)}) alone exceeds total cholesterol (${f0(v.tc)}) — the lipid panel is internally inconsistent. Check sample mix-up or instrument error.`,
            chart,
          };
        }
        if (pct > 20) {
          return {
            status: "error",
            message: `Residual cholesterol (TC − LDL − HDL − TG/5) = ${f0(residual)} mg/dL = ${f0(pct)}% of total — too large. The panel is probably erroneous (mismatched results or method error); repeat the lipid panel.`,
            chart,
          };
        }
        if (pct > 8) {
          return {
            status: "warning",
            message: `Residual cholesterol = ${f0(residual)} mg/dL (${f1(pct)}% of TC) — mildly raised. This can be IDL, Lp(a) or beta-VLDL, but also an LDL/VLDL method mismatch; consider direct LDL or Sampson equation.`,
            chart,
          };
        }
        return {
          status: "ok",
          message: `Lipid fractions add up to total cholesterol within tolerance (residual ${f0(residual)} mg/dL = ${f1(pct)}%).`,
          chart,
        };
      }
      // LDL not measured → informational Friedewald estimate
      if (v.tg >= 400) {
        return {
          status: "warning",
          message: `TG = ${f0(v.tg)} mg/dL (≥ 400) — Friedewald LDL is invalid. Use direct LDL or the Sampson-NIH equation.`,
        };
      }
      const ldlF = v.tc - v.hdl - v.tg / 5;
      const chart: IntegrityChart = {
        kind: "balance",
        balance: {
          parts: [
            { name: "LDL (Friedewald)", value: Math.max(0, ldlF), color: C_AL },
            { name: "HDL", value: v.hdl, color: C_TEAL },
            { name: "VLDL (TG/5)", value: vldlCalc, color: C_AMBER },
          ],
          total: v.tc,
          totalLabel: "Measured total cholesterol",
          unit: "mg/dL",
        },
      };
      if (ldlF < 0) {
        return {
          status: "error",
          message: `Friedewald LDL = ${f0(ldlF)} mg/dL — negative result is impossible. The lipid panel is inconsistent (check sample mix-up, lipemia or unit error).`,
          chart,
        };
      }
      return {
        status: "info",
        message: `LDL (Friedewald) = ${f0(ldlF)} mg/dL. Expected residual for IDL/Lp(a) is small; enter measured LDL to run the full mass-balance check.`,
        chart,
      };
    },
  },
  {
    id: "vldl-vs-tg",
    panel: "Lipids",
    title: "VLDL vs TG/5",
    relation: "VLDL cholesterol ≈ TG ÷ 5 (mg/dL). A large gap means inconsistent lipid results.",
    keys: ["vldl", "tg"],
    evaluate: (v) => {
      const calc = v.tg / 5;
      if (calc <= 0) return null;
      const dev = ((v.vldl - calc) / calc) * 100;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: v.vldl, lo: calc * 0.7, hi: calc * 1.3, axisMax: Math.max(v.vldl, calc * 2), unit: "mg/dL", zoneLabel: "TG/5 ± 30%" },
      };
      if (Math.abs(dev) > 30) {
        return {
          status: "warning",
          message: `Reported VLDL ${f0(v.vldl)} vs expected TG/5 = ${f0(calc)} mg/dL (${dev > 0 ? "+" : ""}${f0(dev)}%) — inconsistent; check TG or VLDL result/method.`,
          chart,
        };
      }
      return { status: "ok", message: `VLDL ${f0(v.vldl)} matches TG/5 = ${f0(calc)} mg/dL.`, chart };
    },
  },

  // ===== Electrolytes =====
  {
    id: "anion-gap",
    panel: "Electrolytes & Acid-Base",
    title: "Anion gap",
    relation: "Anion gap = Na − (Cl + HCO₃), normal 8–16 mEq/L.",
    keys: ["na", "cl", "hco3"],
    evaluate: (v) => {
      const ag = v.na - (v.cl + v.hco3);
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: ag, lo: 8, hi: 16, axisMax: 36, unit: "mEq/L", zoneLabel: "normal 8–16" },
      };
      if (ag < 0) {
        return {
          status: "error",
          message: `Anion gap = ${f1(ag)} mEq/L — negative gap is a red flag for an electrolyte error (often misplaced chloride/decimal) or bromide/iodide interference. Repeat the electrolytes.`,
          chart,
        };
      }
      if (ag > 20) {
        return {
          status: "warning",
          message: `Anion gap = ${f0(ag)} mEq/L — high. Metabolic acidosis (ketoacidosis, lactic acidosis, renal failure) or a lab error is possible; confirm with blood gas.`,
          chart,
        };
      }
      if (ag < 5) {
        return {
          status: "warning",
          message: `Anion gap = ${f1(ag)} mEq/L — low. Check albumin, bromide/iodide interference, myeloma paraprotein, or an electrolyte error.`,
          chart,
        };
      }
      return { status: "ok", message: `Anion gap = ${f0(ag)} mEq/L — within the normal 8–16 range.`, chart };
    },
  },
  {
    id: "electroneutrality",
    panel: "Electrolytes & Acid-Base",
    title: "Electroneutrality (Na+K vs Cl+HCO₃)",
    relation: "(Na + K) − (Cl + HCO₃) should be ≈ 8–17 mEq/L (unmeasured ions). A wild deviation means mutually inconsistent electrolytes.",
    keys: ["na", "k", "cl", "hco3"],
    evaluate: (v) => {
      const gap = v.na + v.k - (v.cl + v.hco3);
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: gap, lo: 8, hi: 17, axisMax: 40, unit: "mEq/L", zoneLabel: "normal 8–17" },
      };
      if (gap < 0 || gap > 25) {
        return {
          status: "warning",
          message: `Charge gap = ${f1(gap)} mEq/L — Na/K vs Cl/HCO₃ are mutually inconsistent (${v.na}+${v.k} vs ${v.cl}+${v.hco3}). Check for sample mix-up, wrong tube or instrument error.`,
          chart,
        };
      }
      return { status: "ok", message: `Charge gap = ${f0(gap)} mEq/L — electrolytes are mutually consistent.`, chart };
    },
  },
  {
    id: "sodium-glucose",
    panel: "Electrolytes & Acid-Base",
    title: "Sodium correction for hyperglycemia",
    relation: "With glucose > 100 mg/dL, measured Na falls ≈ 1.6 mEq/L per 100 mg/dL glucose — corrected Na should be checked.",
    keys: ["na", "glu"],
    evaluate: (v) => {
      if (v.glu <= 100) return null;
      const corr = v.na + 1.6 * ((v.glu - 100) / 100);
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: v.na, lo: 135, hi: 145, axisMax: 165, unit: "mEq/L", zoneLabel: "Na 135–145" },
      };
      if (v.na < 135 && corr >= 135) {
        return {
          status: "warning",
          message: `Pseudohyponatremia: measured Na ${f1(v.na)} with glucose ${f0(v.glu)} → corrected Na ≈ ${f1(corr)} mEq/L (normal). The hyponatremia is dilutional from hyperglycemia — report corrected value.`,
          chart,
        };
      }
      return {
        status: "info",
        message: `Corrected Na for hyperglycemia ≈ ${f1(corr)} mEq/L (measured ${f1(v.na)}, glucose ${f0(v.glu)}).`,
        chart,
      };
    },
  },
  {
    id: "osmolal-gap",
    panel: "Electrolytes & Acid-Base",
    title: "Osmolal gap",
    relation: "Calculated osmolality = 2×Na + Glu/18 + BUN/2.8. Measured − calculated should be within −10…+10 mOsm/kg.",
    keys: ["osm", "na", "glu", "bun"],
    evaluate: (v) => {
      const calc = 2 * v.na + v.glu / 18 + v.bun / 2.8;
      const gap = v.osm - calc;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: gap, lo: -10, hi: 10, axisMax: 40, unit: "mOsm/kg", zoneLabel: "normal −10…+10" },
      };
      if (gap > 10) {
        return {
          status: "error",
          message: `Osmolal gap = ${f0(gap)} mOsm/kg — unmeasured osmoles (toxic alcohols, mannitol, ketones) or an error between the chemistry panel and osmometry. Correlate clinically; repeat both.`,
          chart,
        };
      }
      if (gap < -10) {
        return {
          status: "error",
          message: `Osmolal gap = ${f0(gap)} mOsm/kg — negative gap suggests a unit/identity mismatch between the two measurements (e.g. different samples). Verify sample identity.`,
          chart,
        };
      }
      return {
        status: "ok",
        message: `Osmolal gap = ${f0(gap)} mOsm/kg (calculated ${f0(calc)}) — consistent.`,
        chart,
      };
    },
  },

  // ===== Calcium & bone =====
  {
    id: "calcium-albumin",
    panel: "Calcium & Bone",
    title: "Calcium correction for albumin",
    relation: "Corrected Ca = Ca + 0.8 × (4 − albumin). With hypoalbuminemia the measured Ca under-estimates true calcium.",
    keys: ["ca", "alb"],
    evaluate: (v) => {
      const corr = v.ca + 0.8 * (4 - v.alb);
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: corr, lo: 8.5, hi: 10.5, axisMax: 14, unit: "mg/dL", zoneLabel: "corrected Ca 8.5–10.5" },
      };
      if (corr > 10.5) {
        return {
          status: "warning",
          message: `Corrected calcium ≈ ${f1(corr)} mg/dL is HIGH (measured ${f1(v.ca)} with albumin ${f1(v.alb)}). True hypercalcemia may be masked by low albumin — check PTH.`,
          chart,
        };
      }
      if (corr < 8.5) {
        return {
          status: "warning",
          message: `Corrected calcium ≈ ${f1(corr)} mg/dL is LOW (measured ${f1(v.ca)}, albumin ${f1(v.alb)}) — true hypocalcemia; check PTH, vitamin D, magnesium.`,
          chart,
        };
      }
      return {
        status: "info",
        message: `Corrected calcium ≈ ${f1(corr)} mg/dL (measured ${f1(v.ca)}, albumin ${f1(v.alb)}) — within normal.`,
        chart,
      };
    },
  },
  {
    id: "ca-phos-product",
    panel: "Calcium & Bone",
    title: "Ca × P product",
    relation: "Calcium × phosphorus product is normally 30–70 (mg/dL)². Very high values risk metastatic calcification (CKD).",
    keys: ["ca", "phos"],
    evaluate: (v) => {
      const prod = v.ca * v.phos;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: prod, lo: 30, hi: 70, axisMax: 130, zoneLabel: "normal 30–70" },
      };
      if (prod > 70) {
        return {
          status: "warning",
          message: `Ca × P = ${f0(prod)} — above 70. In CKD this drives vascular calcification; in a routine sample also verify the phosphorus result.`,
          chart,
        };
      }
      if (prod < 30) {
        return {
          status: "warning",
          message: `Ca × P = ${f0(prod)} — below 30. Check for hypophosphatemia or calcium error.`,
          chart,
        };
      }
      return { status: "ok", message: `Ca × P = ${f0(prod)} — within the normal 30–70 band.`, chart };
    },
  },

  // ===== Renal =====
  {
    id: "bun-creatinine",
    panel: "Kidney",
    title: "BUN / Creatinine ratio",
    relation: "BUN/Cr is normally 10–20 : 1. > 20 suggests a pre-renal cause; < 10 an intrinsic or low-protein pattern.",
    keys: ["bun", "crea"],
    evaluate: (v) => {
      if (v.crea <= 0) return null;
      const r = v.bun / v.crea;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: r, lo: 10, hi: 20, axisMax: 45, zoneLabel: "normal 10–20" },
      };
      if (r > 20) {
        return {
          status: "info",
          message: `BUN/Cr = ${f0(r)} : 1 — pre-renal pattern (dehydration, GI bleeding, catabolism, steroids) or high protein intake.`,
          chart,
        };
      }
      if (r < 10) {
        return {
          status: "info",
          message: `BUN/Cr = ${f1(r)} : 1 — intrinsic renal injury, low protein intake, liver disease, or (rarely) a BUN error.`,
          chart,
        };
      }
      return { status: "ok", message: `BUN/Cr = ${f0(r)} : 1 — normal ratio.`, chart };
    },
  },

  // ===== Proteins =====
  {
    id: "protein-albumin",
    panel: "Proteins",
    title: "Albumin fraction of total protein",
    relation: "Albumin is normally 50–65% of total protein (A/G 1.1–2.2). Albumin > total protein is impossible.",
    keys: ["tp", "alb"],
    evaluate: (v) => {
      const pct = (v.alb / v.tp) * 100;
      const agRatio = v.tp - v.alb > 0 ? v.alb / (v.tp - v.alb) : Infinity;
      const chart = donut(pct, "albumin 50–65% of total protein");
      if (v.alb > v.tp) {
        return {
          status: "error",
          message: `Albumin (${f1(v.alb)}) exceeds total protein (${f1(v.tp)}) — impossible. Check sample identity, dilution or instrument error.`,
          chart,
        };
      }
      if (pct > 75) {
        return {
          status: "error",
          message: `Albumin = ${f0(pct)}% of total protein — implausibly high (A/G ${agRatio === Infinity ? "∞" : f1(agRatio)}). Suspect a globulin/total-protein error; repeat and consider SPEP.`,
          chart,
        };
      }
      if (pct < 40) {
        return {
          status: "warning",
          message: `Albumin = ${f0(pct)}% of total protein (A/G ${f1(agRatio)}) — low fraction. Myeloma/paraprotein, chronic inflammation or liver disease pattern; consider SPEP.`,
          chart,
        };
      }
      return {
        status: "ok",
        message: `Albumin = ${f0(pct)}% of total protein, A/G = ${f1(agRatio)} — normal composition.`,
        chart,
      };
    },
  },

  // ===== Iron =====
  {
    id: "tsat",
    panel: "Iron",
    title: "Transferrin saturation (TSAT)",
    relation: "TSAT = Iron / TIBC × 100, normally 20–50%. > 80% is physiologically implausible.",
    keys: ["fe", "tibc"],
    optionalKeys: ["ferritin"],
    evaluate: (v) => {
      if (v.tibc <= 0) return null;
      const tsat = (v.fe / v.tibc) * 100;
      const chart = donut(tsat, "normal 20–50%");
      if (tsat > 80) {
        return {
          status: "error",
          message: `TSAT = ${f0(tsat)}% — physiologically implausible. Iron or TIBC result is probably erroneous (or transfusion/IV iron confusion); repeat the iron panel.`,
          chart,
        };
      }
      if (tsat > 50) {
        return {
          status: "warning",
          message: `TSAT = ${f0(tsat)}% — high. Iron overload, hemolysis in tube, or a result error; check ferritin.${v.ferritin !== undefined ? ` Ferritin here is ${f0(v.ferritin)}.` : ""}`,
          chart,
        };
      }
      if (tsat < 16) {
        if (v.ferritin !== undefined && v.ferritin > 100) {
          return {
            status: "warning",
            message: `TSAT = ${f0(tsat)}% low but ferritin = ${f0(v.ferritin)} normal/high — chronic disease / inflammation pattern. Check CRP; true iron deficiency is less likely.`,
            chart,
          };
        }
        return {
          status: "warning",
          message: `TSAT = ${f0(tsat)}% — low, iron-deficiency pattern.${v.ferritin !== undefined ? ` Ferritin ${f0(v.ferritin)}.` : " Add ferritin for confirmation."}`,
          chart,
        };
      }
      return { status: "ok", message: `TSAT = ${f0(tsat)}% — within the normal 20–50% band.`, chart };
    },
  },

  // ===== Thyroid =====
  {
    id: "tsh-ft4",
    panel: "Hormones",
    title: "TSH ↔ Free T4 pattern",
    relation: "TSH and FT4 normally move in opposite directions. Both high or both low suggests assay interference (biotin, heterophile antibodies) or central disease.",
    keys: ["tsh", "ft4"],
    evaluate: (v) => {
      const bothHigh = v.tsh > 4.5 && v.ft4 > 1.8;
      const bothLow = v.tsh < 0.35 && v.ft4 < 0.8;
      if (bothHigh) {
        return {
          status: "warning",
          message: `TSH ${v.tsh} AND FT4 ${v.ft4} both HIGH — discordant with normal physiology. Suspect TSH-oma or assay interference (biotin, heterophile antibodies, macro-TSH); confirm with another platform after withholding biotin.`,
        };
      }
      if (bothLow) {
        return {
          status: "warning",
          message: `TSH ${v.tsh} AND FT4 ${v.ft4} both LOW — central (pituitary/hypothalamic) hypothyroidism or drug effect (steroids, dopamine). Check the other pituitary axes; do not start levothyroxine blindly.`,
        };
      }
      return { status: "ok", message: "TSH and FT4 pattern is physiologically consistent." };
    },
  },

  // ===== Diabetes =====
  {
    id: "a1c-eag",
    panel: "Diabetes",
    title: "HbA1c vs fasting glucose (eAG)",
    relation: "eAG = 28.7 × A1c − 46.7. If measured fasting glucose differs from eAG by > ~50 mg/dL, suspect discordance.",
    keys: ["a1c"],
    optionalKeys: ["glu"],
    evaluate: (v) => {
      const eag = 28.7 * v.a1c - 46.7;
      if (v.glu === undefined) {
        return { status: "info", message: `eAG from A1c ${v.a1c}% ≈ ${f0(eag)} mg/dL — add fasting glucose to cross-check.` };
      }
      const diff = v.glu - eag;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: v.glu, lo: eag - 50, hi: eag + 50, axisMax: Math.max(400, v.glu + 60), unit: "mg/dL", zoneLabel: "eAG ± 50" },
      };
      if (Math.abs(diff) > 50) {
        return {
          status: "warning",
          message: `FBS ${f0(v.glu)} vs eAG ${f0(eag)} mg/dL (from A1c ${v.a1c}%) — discordant by ${Math.abs(Math.round(diff))} mg/dL. Consider hemoglobinopathy, hemolysis/recent transfusion (A1c unreliable), pre-analytical timing, or sample mix-up.`,
          chart,
        };
      }
      return { status: "ok", message: `FBS ${f0(v.glu)} agrees with eAG ${f0(eag)} mg/dL (A1c ${v.a1c}%).`, chart };
    },
  },

  // ===== Liver enzymes =====
  {
    id: "ast-alt-ratio",
    panel: "Liver",
    title: "De Ritis ratio (AST/ALT)",
    relation: "AST/ALT < 1.5 typical of viral hepatitis; > 2 suggests alcoholic/toxic or chronic fatty-liver pattern.",
    keys: ["ast", "alt"],
    evaluate: (v) => {
      if (v.alt <= 0) return null;
      const r = v.ast / v.alt;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: r, lo: 0.8, hi: 2, axisMax: 5, zoneLabel: "0.8–2" },
      };
      if (r > 2) {
        return {
          status: "info",
          message: `De Ritis ratio = ${f1(r)} — AST dominant. Alcoholic/toxic injury or chronic liver disease pattern; also consider extra-hepatic AST sources (muscle, hemolysis).`,
          chart,
        };
      }
      return { status: "ok", message: `AST/ALT = ${f1(r)} — typical ratio.`, chart };
    },
  },

  // ===== CBC =====
  {
    id: "hgb-hct-rule-of-three",
    panel: "CBC",
    title: "Hemoglobin ↔ Hematocrit (rule of three)",
    relation: "Hct ≈ Hb × 3 (± 3%). A large deviation means the CBC is internally inconsistent.",
    keys: ["hgb", "hct"],
    evaluate: (v) => {
      const pred = v.hgb * 3;
      const diff = v.hct - pred;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: v.hct, lo: pred - 3, hi: pred + 3, axisMax: Math.max(pred + 12, v.hct + 12), unit: "%", zoneLabel: `predicted ${f0(pred)} ± 3` },
      };
      if (pred <= 0) return null;
      if (Math.abs(diff) > 4) {
        return {
          status: "error",
          message: `Rule of three violated: Hb ${f1(v.hgb)} → expected Hct ≈ ${f0(pred)}%, measured ${f1(v.hct)}. Clots, lipemia, cold agglutinins, old/under-filled sample or RBC/HCT channel error — repeat the CBC.`,
          chart,
        };
      }
      return {
        status: "ok",
        message: `Hct ${f1(v.hct)} ≈ 3 × Hb ${f1(v.hgb)} — internally consistent.`,
        chart,
      };
    },
  },
  {
    id: "mcv-consistency",
    panel: "CBC",
    title: "MCV = (Hct × 10) / RBC",
    relation: "Reported MCV must equal Hct×10 ÷ RBC within ± 3 fL.",
    keys: ["hct", "rbc"],
    optionalKeys: ["mcv"],
    evaluate: (v) => {
      if (v.rbc <= 0) return null;
      const calc = (v.hct * 10) / v.rbc;
      const reported = v.mcv ?? calc;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: reported, lo: calc - 3, hi: calc + 3, axisMax: 130, unit: "fL", zoneLabel: `calculated ${f1(calc)} ± 3` },
      };
      if (v.mcv !== undefined && Math.abs(v.mcv - calc) > 3) {
        return {
          status: "error",
          message: `Reported MCV ${f1(v.mcv)} fL vs calculated ${f1(calc)} fL — CBC indices are inconsistent (RBC/Hct channel error, fragments or double counting). Check the histogram and repeat.`,
          chart,
        };
      }
      return { status: "ok", message: `MCV consistent with Hct/RBC (calculated ${f1(calc)} fL).`, chart };
    },
  },
  {
    id: "mchc-consistency",
    panel: "CBC",
    title: "MCHC = (Hb × 100) / Hct",
    relation: "Reported MCHC must equal Hb/Hct × 100 within ± 2 g/dL. MCHC > 37 almost always means an error (lipemia, cold agglutinin, clots).",
    keys: ["hgb", "hct"],
    optionalKeys: ["mchc"],
    evaluate: (v) => {
      if (v.hct <= 0) return null;
      const calc = (v.hgb * 100) / v.hct;
      const reported = v.mchc ?? calc;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: reported, lo: calc - 2, hi: calc + 2, axisMax: 44, unit: "g/dL", zoneLabel: `calculated ${f1(calc)} ± 2` },
      };
      if (v.mchc !== undefined && Math.abs(v.mchc - calc) > 2) {
        return {
          status: "error",
          message: `Reported MCHC ${f1(v.mchc)} vs calculated ${f1(calc)} g/dL — inconsistent. Lipemia, cold agglutinins or clots are classic causes; warm the sample and repeat.`,
          chart,
        };
      }
      return { status: "ok", message: `MCHC consistent with Hb/Hct (calculated ${f1(calc)} g/dL).`, chart };
    },
  },
  {
    id: "wbc-differential-sum",
    panel: "CBC",
    title: "WBC differential sums to 100%",
    relation: "Neutrophils + lymphocytes + monocytes + eosinophils + basophils (%) must sum to ≈ 100 (95–105).",
    keys: ["neut", "lymph"],
    optionalKeys: ["mono", "eos", "baso"],
    evaluate: (v) => {
      const parts: [string, number | null][] = [
        ["Neut", v.neut ?? null],
        ["Lymph", v.lymph ?? null],
        ["Mono", v.mono ?? null],
        ["Eos", v.eos ?? null],
        ["Baso", v.baso ?? null],
      ];
      const known = parts.filter((p): p is [string, number] => p[1] !== null);
      const sum = known.reduce((a, p) => a + p[1], 0);
      const allFive = known.length === 5;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: sum, lo: 95, hi: 105, axisMax: 130, unit: "%", zoneLabel: "sum ≈ 100%" },
      };
      if (sum > 105) {
        return {
          status: "error",
          message: `Differential sums to ${f0(sum)}% — impossible. Check for a decimal error or mis-entered percentage.`,
          chart,
        };
      }
      if (allFive && sum < 95) {
        return {
          status: "error",
          message: `Differential sums to only ${f0(sum)}% — a fraction is missing or wrong. Re-check the five-part differential.`,
          chart,
        };
      }
      if (!allFive && sum > 100) {
        return {
          status: "warning",
          message: `Partial differential already sums to ${f0(sum)}% — the remaining cells would push it over 100%. Verify the values.`,
          chart,
        };
      }
      return { status: "ok", message: `Differential sums to ${f0(sum)}% — consistent.${allFive ? "" : " (some cell classes not provided)"}`, chart };
    },
  },

  // ===== Pre-analytics / hemolysis =====
  {
    id: "hemolysis-pattern",
    panel: "Pre-analytics",
    title: "Hemolysis pattern (K ↑, LDH ↑, AST ↑)",
    relation: "In-vitro hemolysis lifts potassium, LDH and AST together. When all three are high, suspect the sample before the patient.",
    keys: ["k", "ldh"],
    optionalKeys: ["ast"],
    evaluate: (v) => {
      const kHigh = v.k >= 5.8;
      const ldhHigh = v.ldh > 450;
      const astHigh = v.ast !== undefined && v.ast > 80;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: v.k, lo: 3.5, hi: 5.1, axisMax: 8, unit: "mEq/L", zoneLabel: "K 3.5–5.1" },
      };
      if (kHigh && ldhHigh) {
        return {
          status: "warning",
          message: `K ${v.k} + LDH ${f0(v.ldh)}${astHigh ? ` + AST ${f0(v.ast)}` : ""} all elevated — classic in-vitro hemolysis pattern. Inspect the serum, repeat on a fresh sample before reporting hyperkalemia.`,
          chart,
        };
      }
      if (kHigh) {
        return {
          status: "warning",
          message: `K = ${v.k} mEq/L is high — rule out hemolysis, EDTA contamination or prolonged tourniquet/fist clenching before reporting.`,
          chart,
        };
      }
      return { status: "ok", message: "No combined hemolysis pattern (K, LDH) detected.", chart };
    },
  },
  {
    id: "wbc-leukostasis-glucose",
    panel: "Pre-analytics",
    title: "Pseudohypoglycemia in leukocytosis",
    relation: "With WBC > 100 ×10³/µL, glucose is consumed in the tube after draw — measured glucose falsely low.",
    keys: ["wbc", "glu"],
    evaluate: (v) => {
      if (v.wbc < 100 || v.glu >= 70) return null;
      return {
        status: "warning",
        message: `WBC ${f0(v.wbc)} ×10³/µL with glucose ${f0(v.glu)} mg/dL — pseudohypoglycemia is likely (glycolysis in the tube). Send a fresh sample in a fluoride/oxalate tube and analyze promptly.`,
      };
    },
  },

  // ===== Coagulation =====
  {
    id: "inr-pt",
    panel: "Coagulation",
    title: "INR ↔ PT consistency",
    relation: "INR = (PT/MNPT)^ISI. With a typical MNPT ≈ 12 s, INR should roughly track PT/12 — a wild mismatch means one of the two is wrong.",
    keys: ["pt", "inr"],
    evaluate: (v) => {
      const expect = v.pt / 12;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: v.inr, lo: expect * 0.75, hi: expect * 1.3, axisMax: Math.max(6, v.inr + 1.5), zoneLabel: `≈ PT/12 = ${f1(expect)} ± 30%` },
      };
      if (expect > 0 && (v.inr > expect * 1.3 || v.inr < expect * 0.75)) {
        return {
          status: "warning",
          message: `INR ${v.inr} does not match PT ${f1(v.pt)} s (expected ≈ ${f1(expect)}). Verify the ISI/MNPT of your system or a transcription error before reporting.`,
          chart,
        };
      }
      return { status: "ok", message: `INR ${v.inr} is consistent with PT ${f1(v.pt)} s.`, chart };
    },
  },

  // ===== CSF =====
  {
    id: "csf-glucose-ratio",
    panel: "CSF",
    title: "CSF / plasma glucose ratio",
    relation: "CSF glucose is normally ≈ 60–70% of simultaneous plasma glucose. < 40% suggests bacterial/TB meningitis.",
    keys: ["csfglu", "glu"],
    evaluate: (v) => {
      if (v.glu <= 0) return null;
      const r = v.csfglu / v.glu;
      const chart: IntegrityChart = {
        kind: "band",
        band: { value: r, lo: 0.6, hi: 0.7, axisMax: 1.1, zoneLabel: "normal 0.6–0.7" },
      };
      if (r > 1.1) {
        return {
          status: "warning",
          message: `CSF glucose (${v.csfglu}) exceeds plasma glucose (${v.glu}) — physiologically unlikely (or samples drawn far apart / mixed up). Verify sample identity.`,
          chart,
        };
      }
      if (r < 0.4) {
        return {
          status: "warning",
          message: `CSF/plasma glucose ratio = ${f1(r)} — bacterial or tuberculous meningitis pattern (CSF < 40% of plasma). Correlate with cell count and Gram stain.`,
          chart,
        };
      }
      return { status: "ok", message: `CSF/plasma glucose ratio = ${f1(r)} — normal.`, chart };
    },
  },
];

// ---------- runner ----------
export interface ParsedInput {
  key: string;
  name: string;
  value: number;
}

export function runIntegrity(inputs: ParsedInput[]): { results: IntegrityResult[]; unused: string[] } {
  const v: Record<string, number> = {};
  const unused: string[] = [];
  for (const inp of inputs) v[inp.key] = inp.value;
  const results: IntegrityResult[] = [];
  for (const rule of INTEGRITY_RULES) {
    if (!rule.keys.every((k) => v[k] !== undefined && !isNaN(v[k]))) continue;
    const r = rule.evaluate(v);
    if (r) results.push({ ruleId: rule.id, panel: rule.panel, title: rule.title, ...r });
  }
  const used = new Set<string>();
  for (const rule of INTEGRITY_RULES) {
    const all = [...rule.keys, ...(rule.optionalKeys || [])];
    if (rule.keys.every((k) => v[k] !== undefined)) all.forEach((k) => v[k] !== undefined && used.add(k));
  }
  for (const inp of inputs) if (!used.has(inp.key)) unused.push(inp.name);
  return { results, unused };
}

/** Example panels for quick demos / training. */
export const EXAMPLES: { label: string; lines: string[] }[] = [
  {
    label: "Cardiac (CK/CK-MB error example)",
    lines: ["CPK = 150", "CK-MB = 60", "Troponin I = 0.02"],
  },
  {
    label: "Bilirubin (direct fraction error)",
    lines: ["Total Bilirubin = 1.2", "Direct Bilirubin = 0.9", "ALT = 35", "AST = 28", "ALP = 95"],
  },
  {
    label: "Lipid panel (mass balance)",
    lines: ["Cholesterol Total = 200", "Triglycerides = 150", "HDL = 45", "LDL = 130"],
  },
  {
    label: "Lipids (inconsistent panel)",
    lines: ["Cholesterol Total = 180", "Triglycerides = 130", "HDL = 42", "LDL = 150"],
  },
  {
    label: "Electrolytes + glucose + osmolality",
    lines: ["Sodium = 136", "Potassium = 4.2", "Chloride = 88", "CO2 = 24", "Glucose = 350", "BUN = 18", "Osmolality = 310"],
  },
  {
    label: "CBC (rule of three)",
    lines: ["WBC = 7.2", "RBC = 4.8", "Hemoglobin = 13.5", "Hematocrit = 33", "MCV = 82", "MCHC = 34", "Neutrophils = 60", "Lymphocytes = 30", "Monocytes = 6", "Eosinophils = 3", "Basophils = 1"],
  },
  {
    label: "Iron panel",
    lines: ["Iron = 120", "TIBC = 300", "Ferritin = 250"],
  },
  {
    label: "Thyroid (interference pattern)",
    lines: ["TSH = 12", "Free T4 = 2.6"],
  },
];
