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
  icon: string; // lucide icon name (string key mapped in UI)
  desc: string; // Persian short description
}

export interface LabTest {
  id: string; // slug, latin
  fa: string; // Persian name
  en: string; // English / latin name
  syn?: string; // synonyms for search
  cat: CatId;
  sp: string; // specimen
  unit: string; // reference unit
  ref: string; // reference range (Persian text)
  sig: string; // clinical significance — one concise Persian sentence
  f?: string; // formula id (formulas registry)
  intr?: string; // important interferences / pre-analytical notes
  hot?: string; // critical (panic) values note
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
  expr: string; // display expression (HTML-safe, Persian/latin mixed)
  inputs: FormulaInput[];
  out: { fa: string; unit: string };
  compute: (v: Record<string, number>) => number | null;
  interp: (r: number, v: Record<string, number>) => string; // Persian interpretation
  refs: string[]; // references
  cats?: CatId[]; // related categories
}

export interface Article {
  id: string;
  title: string; // original title (EN)
  titleFa?: string;
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  url: string;
  summaryFa: string; // brief Persian description
  tags: string[]; // related test ids / keywords
  source: "seed" | "sync";
  addedAt: string; // ISO
}

export interface NewsItem {
  id: string;
  titleFa: string;
  summaryFa: string;
  sourceName: string;
  url: string;
  date: string; // ISO
  source: "seed" | "sync";
}

export interface LabEvent {
  id: string;
  titleFa: string;
  en?: string;
  city: string;
  country: string;
  dateStart: string; // ISO (approx ok)
  dateEnd: string;
  site: string;
  descFa: string;
  verified: boolean; // dates verified from official site?
  source: "seed" | "user";
}

// ---------- QC ----------
export interface QcSeries {
  id: string;
  analyte: string; // test name (free text, often en name)
  level: string; // Normal / High / Low
  unit: string;
  mean: number;
  sd: number;
  lot?: string;
  tea?: number; // allowable total error % (for sigma)
  bias?: number; // bias %
  entries: QcEntry[];
  createdAt: string;
}
export interface QcEntry {
  id: string;
  date: string; // ISO
  value: number;
  note?: string;
}

// ---------- Accuracy (result verification) ----------
export interface AccuracyStudy {
  id: string;
  analyte: string;
  unit: string;
  tea: number; // allowable total error %, e.g. CLIA goal
  points: AccuracyPoint[];
  createdAt: string;
}
export interface AccuracyPoint {
  id: string;
  sample: string; // sample label
  target: number; // reference/assigned value
  measured: number; // lab result
}

// ---------- Analyzer parameters & results ----------
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
  formula?: string; // formula id if applicable
  source: "seed" | "user";
}
export interface PatientResultRow {
  id: string;
  paramId: string; // matches AnalyzerParam.id or test id
  nameEn: string;
  nameFa: string;
  unit: string;
  value: number;
  prev?: number; // previous result for delta check
  flag?: string; // filled by checker
}

export interface CheckReportItem {
  nameFa: string;
  nameEn: string;
  value: number;
  unit: string;
  status: "ok" | "low" | "high" | "critical" | "error";
  messages: string[]; // Persian troubleshooting messages
}

// ---------- Pubmed sync ----------
export interface PubmedArticle {
  pmid: string;
  title: string;
  journal: string;
  year: number;
  date: string;
  doi?: string;
  url: string;
}
