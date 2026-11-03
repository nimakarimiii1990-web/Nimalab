// ---------- Nima core types ----------

export type CatId =
  | "biochem"
  | "enzyme"
  | "cardiac"
  | "hormone"
  | "hematology"
  | "coag"
  | "immuno"
  | "viral"
  | "micro"
  | "molecular"
  | "tumor"
  | "urine"
  | "tox"
  | "bank";

export interface Category {
  id: CatId;
  fa: string;
  en: string;
  icon: string;
  desc: string;
}

export interface LabTest {
  id: string;
  fa: string;
  en: string;
  syn?: string;
  cat: CatId;
  sp: string;
  unit: string;
  ref: string;
  sig: string;
  f?: string;
  intr?: string;
  hot?: string;
}

export interface FormulaInput {
  key: string;
  fa: string;
  unit?: string;
}

export interface Formula {
  id: string;
  fa: string;
  en: string;
  expr: string;
  inputs: FormulaInput[];
  out: { fa: string; unit: string };
  compute: (v: Record<string, number>) => number | null;
  interp: (r: number, v: Record<string, number>) => string;
  refs: string[];
  cats?: CatId[];
}

export interface Article {
  id: string;
  title: string;
  titleFa?: string;
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  url: string;
  summaryFa: string;
  tags: string[];
  source: "seed" | "sync";
  addedAt: string;
}

export interface NewsItem {
  id: string;
  titleFa: string;
  summaryFa: string;
  sourceName: string;
  url: string;
  date: string;
  source: "seed" | "sync";
}

export interface LabEvent {
  id: string;
  titleFa: string;
  en?: string;
  city: string;
  country: string;
  dateStart: string;
  dateEnd: string;
  site: string;
  descFa: string;
  verified: boolean;
  source: "seed" | "user";
}

// ---------- QC ----------
export interface QcSeries {
  id: string;
  analyte: string;
  level: string;
  unit: string;
  mean: number;
  sd: number;
  lot?: string;
  tea?: number;
  bias?: number;
  entries: QcEntry[];
  createdAt: string;
}
export interface QcEntry {
  id: string;
  date: string;
  value: number;
  note?: string;
}

// ---------- Accuracy ----------
export interface AccuracyStudy {
  id: string;
  analyte: string;
  unit: string;
  tea: number;
  points: AccuracyPoint[];
  createdAt: string;
}
export interface AccuracyPoint {
  id: string;
  sample: string;
  target: number;
  measured: number;
}

// ---------- Analyzer ----------
export interface AnalyzerParam {
  id: string;
  fa: string;
  en: string;
  unit: string;
  refLow?: number;
  refHigh?: number;
  critLow?: number;
  critHigh?: number;
  decimals?: number;
  formula?: string;
  source: "seed" | "user";
}
export interface PatientResultRow {
  id: string;
  paramId: string;
  nameEn: string;
  nameFa: string;
  unit: string;
  value: number;
  prev?: number;
  flag?: string;
}

export interface CheckReportItem {
  nameFa: string;
  nameEn: string;
  value: number;
  unit: string;
  status: "ok" | "low" | "high" | "critical" | "error";
  messages: string[];
}

// ---------- Pubmed ----------
export interface PubmedArticle {
  pmid: string;
  title: string;
  journal: string;
  year: number;
  date: string;
  doi?: string;
  url: string;
}

// ---------- Kit validation (CLSI EP15 / production verification) ----------
export interface KitValReplicate {
  id: string;
  runId: string;
  date: string;
  level: string;
  value: number;
}

export interface KitValAccuracyPoint {
  id: string;
  date: string;
  sample: string;
  target: number;
  measured: number;
}

export interface KitValLinearityPoint {
  id: string;
  date: string;
  expected: number;
  measured: number;
}

export interface KitValidationStudy {
  id: string;
  kitName: string;
  analyte: string;
  unit: string;
  lot: string;
  manufacturer: string;
  tea: number;
  claimCV: number;
  claimBias: number;
  startDate: string;
  endDate: string;
  analyst: string;
  notes: string;
  replicates: KitValReplicate[];
  accuracyPoints: KitValAccuracyPoint[];
  linearityPoints: KitValLinearityPoint[];
  createdAt: string;
}