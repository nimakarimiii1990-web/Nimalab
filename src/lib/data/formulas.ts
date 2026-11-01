import type { Formula } from "../nima-types";

const r2 = (x: number) => Math.round(x * 100) / 100;
const r1 = (x: number) => Math.round(x * 10) / 10;

export const FORMULAS: Formula[] = [
  // ================= LDL / Lipids =================
  {
    id: "ldl-friedewald",
    fa: "LDL فریدوالد",
    en: "Friedewald LDL-C",
    expr: "LDL = TC − HDL − (TG ÷ 5)  <small>(mg/dL)</small>",
    inputs: [
      { key: "tc", fa: "کلسترول توتال (TC)", unit: "mg/dL" },
      { key: "hdl", fa: "کلسترول HDL", unit: "mg/dL" },
      { key: "tg", fa: "تری‌گلیسرید (TG)", unit: "mg/dL" },
    ],
    out: { fa: "LDL کلسترول محاسباتی", unit: "mg/dL" },
    compute: (v) =>
      v.tc > 0 && v.hdl >= 0 && v.tg > 0 ? r2(v.tc - v.hdl - v.tg / 5) : null,
    interp: (r, v) => {
      if (v.tg >= 400)
        return "TG ≥ 400 → فرمول فری‌دوالد معتبر نیست؛ از Sampson یا LDL مستقیم استفاده کنید.";
      if (r < 70) return "بهینه برای ریسک بسیار بالا (<70)";
      if (r < 100) return "بهینه/مطلوب (<100)";
      if (r < 130) return "نزدیک به مطلوب (100–129)";
      if (r < 160) return "مرزی بالا (130–159)";
      if (r < 190) return "بالا (160–189)";
      return "بسیار بالا (≥190)";
    },
    refs: ["Friedewald WT, et al. Clin Chem. 1972;18(6):499-502"],
    cats: ["biochem"],
  },
  {
    id: "ldl-sampson",
    fa: "LDL سامسون–نیه (NIH Equation 2)",
    en: "Sampson-NIH Equation 2",
    expr:
      "LDL = TC/0.948 − HDL/0.971 − (TG/8.56 + [TG×nonHDL]/2140 − TG²/16100) − 9.44  <small>(mg/dL)</small>",
    inputs: [
      { key: "tc", fa: "کلسترول توتال (TC)", unit: "mg/dL" },
      { key: "hdl", fa: "کلسترول HDL", unit: "mg/dL" },
      { key: "tg", fa: "تری‌گلیسرید (TG)", unit: "mg/dL" },
    ],
    out: { fa: "LDL کلسترول محاسباتی", unit: "mg/dL" },
    compute: (v) => {
      if (v.tc <= 0 || v.hdl < 0 || v.tg <= 0) return null;
      const nonHdl = v.tc - v.hdl;
      const part =
        v.tg / 8.56 + (v.tg * nonHdl) / 2140 - (v.tg * v.tg) / 16100;
      return r2(v.tc / 0.948 - v.hdl / 0.971 - part - 9.44);
    },
    interp: (r, v) => {
      if (v.tg > 800)
        return "خارج از محدوده اعتبارسنجی فرمول (TG تا 800)؛ LDL مستقیم توصیه می‌شود.";
      if (v.tg > 400)
        return "برخلاف فری‌دوالد، در TG بالا (400–800) طراحی شده و دقت بهتری دارد.";
      return r < 70 ? "بهینه برای ریسک بسیار بالا (<70)" : r < 100 ? "مطلوب (<100)" : "بالای 100 — مطابق اهداف راهنما ارزیابی شود";
    },
    refs: [
      "Sampson M, et al. JAMA Cardiol. 2020;5(1):40-48",
      "Sampson M, et al. J Lipid Res. 2021;62:100108 (Eq.2)",
    ],
    cats: ["biochem"],
  },
  {
    id: "ldl-martin",
    fa: "LDL مارتین–هاپکینز",
    en: "Martin-Hopkins LDL-C",
    expr: "LDL = TC − HDL − (TG ÷ F)  <small>؛ F = فاکتور شخصی‌سازی‌شده (جدول رسمی 180 سلولی، معمولاً 5/2 تا 6/0)</small>",
    inputs: [
      { key: "tc", fa: "کلسترول توتال (TC)", unit: "mg/dL" },
      { key: "hdl", fa: "کلسترول HDL", unit: "mg/dL" },
      { key: "tg", fa: "تری‌گلیسرید (TG)", unit: "mg/dL" },
      { key: "f", fa: "فاکتور جدول مارتین–هاپکینز (F)", unit: "—" },
    ],
    out: { fa: "LDL کلسترول محاسباتی", unit: "mg/dL" },
    compute: (v) =>
      v.tc > 0 && v.hdl >= 0 && v.tg > 0 && v.f > 0
        ? r2(v.tc - v.hdl - v.tg / v.f)
        : null,
    interp: (r, v) => {
      if (v.tg >= 400) return "خارج از محدوده؛ نسخه extended تا TG=800 طراحی شده است.";
      return "دقت در LDL پایین (<70) و TG متوسط بهتر از فری‌دوالد است. F را از جدول رسمی 180 سلولی بر اساس TG و non-HDL بردارید.";
    },
    refs: ["Martin SS, et al. Clin Chem. 2013;59(9):1207-1217"],
    cats: ["biochem"],
  },
  {
    id: "non-hdl",
    fa: "کلسترول غیر HDL",
    en: "non-HDL Cholesterol",
    expr: "non-HDL = TC − HDL  <small>(mg/dL)</small>",
    inputs: [
      { key: "tc", fa: "کلسترول توتال", unit: "mg/dL" },
      { key: "hdl", fa: "HDL", unit: "mg/dL" },
    ],
    out: { fa: "non-HDL", unit: "mg/dL" },
    compute: (v) => (v.tc > 0 && v.hdl >= 0 ? r2(v.tc - v.hdl) : null),
    interp: (r) =>
      r < 130 ? "هدف معمول (<130)" : r < 160 ? "مرزی" : "بالا — هدف درمانی معمولاً 30 واحد بیشتر از هدف LDL است",
    refs: ["ACC/AHA 2018 Cholesterol Guideline", "Endotext (NCBI Bookshelf)"],
    cats: ["biochem"],
  },
  {
    id: "tc-hdl-ratio",
    fa: "نسبت TC/HDL",
    en: "TC/HDL Ratio",
    expr: "Ratio = TC ÷ HDL",
    inputs: [
      { key: "tc", fa: "کلسترول توتال", unit: "mg/dL" },
      { key: "hdl", fa: "HDL", unit: "mg/dL" },
    ],
    out: { fa: "نسبت", unit: "—" },
    compute: (v) => (v.hdl > 0 ? r2(v.tc / v.hdl) : null),
    interp: (r) =>
      r < 3.5 ? "کم‌خطر" : r < 5 ? "متوسط" : "نسبت بالا — ریسک قلبی-عروقی بیشتر",
    refs: ["Endotext (NCBI Bookshelf), Dyslipidemia chapter"],
    cats: ["biochem"],
  },
  // ================= Diabetes =================
  {
    id: "eag",
    fa: "قند متوسط تخمینی (eAG)",
    en: "estimated Average Glucose",
    expr: "eAG = 28.7 × A1c − 46.7  <small>(A1c % → mg/dL)</small>",
    inputs: [{ key: "a1c", fa: "هموگلوبین A1c", unit: "%" }],
    out: { fa: "میانگین قند تخمینی", unit: "mg/dL" },
    compute: (v) => (v.a1c > 0 ? r2(28.7 * v.a1c - 46.7) : null),
    interp: (r) =>
      `eAG معادل ${r2(r)} mg/dL و تقریباً ${r2(r / 18)} mmol/L است؛ برای قیاس با FBS/self-monitoring استفاده کنید.`,
    refs: ["Nathan DM, et al. Diabetes Care. 2008;31(8):1473-8 (ADAG Study)"],
    cats: ["biochem"],
  },
  {
    id: "a1c-from-eag",
    fa: "A1c از قند متوسط",
    en: "A1c from average glucose",
    expr: "A1c = (eAG + 46.7) ÷ 28.7  <small>(mg/dL → %)</small>",
    inputs: [{ key: "eag", fa: "میانگین قند (eAG)", unit: "mg/dL" }],
    out: { fa: "A1c تخمینی", unit: "%" },
    compute: (v) => (v.eag > 0 ? r2((v.eag + 46.7) / 28.7) : null),
    interp: (r) => `A1c تخمینی ≈ ${r2(r)}% (محدوده مرجع آزمایشگاه شما را لحاظ کنید)`,
    refs: ["Nathan DM, et al. Diabetes Care. 2008;31(8):1473-8"],
    cats: ["biochem"],
  },
  {
    id: "homa-ir",
    fa: "HOMA-IR (مقاومت به انسولین)",
    en: "HOMA-IR",
    expr: "HOMA-IR = (FPI × FPG) ÷ 405  <small>(FPI µIU/mL, FPG mg/dL)</small>",
    inputs: [
      { key: "fpi", fa: "انسولین ناشتا (FPI)", unit: "µIU/mL" },
      { key: "fpg", fa: "قند ناشتا (FPG)", unit: "mg/dL" },
    ],
    out: { fa: "شاخص HOMA-IR", unit: "—" },
    compute: (v) =>
      v.fpi > 0 && v.fpg > 0 ? r2((v.fpi * v.fpg) / 405) : null,
    interp: (r) =>
      r < 2.5
        ? "حساسیت انسولین حفظ شده (کات‌آف رایج 2/5؛ مرجع جمعیت خود را لحاظ کنید)"
        : r < 3
        ? "مرزی"
        : "مقاومت به انسولین احتمالی",
    refs: ["Matthews DR, et al. Diabetologia. 1985;28(7):412-9", "Endotext (NCBI Bookshelf)"],
    cats: ["biochem", "hormone"],
  },
  {
    id: "quicki",
    fa: "شاخص QUICKI",
    en: "QUICKI Index",
    expr: "QUICKI = 1 ÷ (log FPI + log FPG)",
    inputs: [
      { key: "fpi", fa: "انسولین ناشتا", unit: "µIU/mL" },
      { key: "fpg", fa: "قند ناشتا", unit: "mg/dL" },
    ],
    out: { fa: "QUICKI", unit: "—" },
    compute: (v) =>
      v.fpi > 0 && v.fpg > 0
        ? r2(1 / (Math.log10(v.fpi) + Math.log10(v.fpg)))
        : null,
    interp: (r) => (r > 0.38 ? "حساسیت مناسب" : r > 0.339 ? "مرزی" : "مقاومت به انسولین محتمل"),
    refs: ["Katz A, et al. J Clin Endocrinol Metab. 2000;85(7):2402-10"],
    cats: ["biochem", "hormone"],
  },
  {
    id: "tyg",
    fa: "شاخص TyG",
    en: "TyG Index",
    expr: "TyG = Ln [ TG(mg/dL) × FPG(mg/dL) ÷ 2 ]",
    inputs: [
      { key: "tg", fa: "تری‌گلیسرید", unit: "mg/dL" },
      { key: "fpg", fa: "قند ناشتا", unit: "mg/dL" },
    ],
    out: { fa: "شاخص TyG", unit: "—" },
    compute: (v) =>
      v.tg > 0 && v.fpg > 0 ? r2(Math.log((v.tg * v.fpg) / 2)) : null,
    interp: (r) =>
      r < 8.5 ? "پایین" : r < 9 ? "مرزی" : "بالا — مقاومت به انسولین/استئاتوز کبدی محتمل (کات‌آف جمعیت‌محور)",
    refs: ["Simental-Mendía LE, et al. Lipids Health Dis. 2008;7:35"],
    cats: ["biochem"],
  },
  {
    id: "tyg-bmi",
    fa: "TyG-BMI",
    en: "TyG-BMI Index",
    expr: "TyG-BMI = TyG + Ln(BMI)",
    inputs: [
      { key: "tyg", fa: "شاخص TyG (از فرمول TyG)", unit: "—" },
      { key: "bmi", fa: "BMI", unit: "kg/m²" },
    ],
    out: { fa: "TyG-BMI", unit: "—" },
    compute: (v) => (v.tyg > 0 && v.bmi > 0 ? r2(v.tyg + Math.log(v.bmi)) : null),
    interp: () => "بالاتر = خطر NAFLD/سندرم متابولیک بیشتر؛ کات‌آف مطالعه‌محور است.",
    refs: ["Zhang S, et al. Cardiovasc Diabetol. 2022;21:143"],
    cats: ["biochem"],
  },
  // ================= Kidney =================
  {
    id: "ckd-epi-2021-crea",
    fa: "eGFR — CKD-EPI 2021 (کراتینین)",
    en: "CKD-EPI 2021 creatinine",
    expr:
      "eGFR = 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1.200 × 0.9938^age × (1.012 اگر زن)  <small>؛ κ: زن 0/7 مرد 0/9 — α: زن −0/241 مرد −0/302</small>",
    inputs: [
      { key: "scr", fa: "کراتینین سرم (Scr)", unit: "mg/dL" },
      { key: "age", fa: "سن", unit: "سال" },
      { key: "sex", fa: "جنسیت (1=زن، 0=مرد)", unit: "—" },
    ],
    out: { fa: "eGFR", unit: "mL/min/1.73m²" },
    compute: (v) => {
      const female = v.sex >= 0.5;
      const k = female ? 0.7 : 0.9;
      const a = female ? -0.241 : -0.302;
      const min = Math.min(v.scr / k, 1);
      const max = Math.max(v.scr / k, 1);
      return Math.round(
        142 *
          Math.pow(min, a) *
          Math.pow(max, -1.2) *
          Math.pow(0.9938, v.age) *
          (female ? 1.012 : 1)
      );
    },
    interp: (r) =>
      r >= 90
        ? "G1 — طبیعی (با نشانه کلیوی → بدون CKD)"
        : r >= 60
        ? "G2 — کاهش خفیف"
        : r >= 45
        ? "G3a — کاهش خفیف تا متوسط"
        : r >= 30
        ? "G3b — کاهش متوسط تا شدید"
        : r >= 15
        ? "G4 — کاهش شدید"
        : "G5 — نارسایی کلیه",
    refs: ["Inker LA, et al. N Engl J Med. 2021;385(19):1737-1749", "KDIGO 2024 CKD Guideline"],
    cats: ["biochem", "urine"],
  },
  {
    id: "ckd-epi-2021-cys",
    fa: "eGFR — CKD-EPI 2021 (سیستاتین C)",
    en: "CKD-EPI 2021 cystatin C",
    expr:
      "eGFR = 142 × min(CysC/0.8,1)^−0.478 × max(CysC/0.8,1)^−1.132 × 0.9938^age × (0.7952 اگر زن)",
    inputs: [
      { key: "cys", fa: "سیستاتین C", unit: "mg/L" },
      { key: "age", fa: "سن", unit: "سال" },
      { key: "sex", fa: "جنسیت (1=زن، 0=مرد)", unit: "—" },
    ],
    out: { fa: "eGFR", unit: "mL/min/1.73m²" },
    compute: (v) => {
      const female = v.sex >= 0.5;
      const min = Math.min(v.cys / 0.8, 1);
      const max = Math.max(v.cys / 0.8, 1);
      return Math.round(
        142 *
          Math.pow(min, -0.478) *
          Math.pow(max, -1.132) *
          Math.pow(0.9938, v.age) *
          (female ? 0.7952 : 1)
      );
    },
    interp: (r) =>
      "KDIGO 2024: اگر سیستاتین C در دسترس است، رده GFR باید با ترکیب کراتینین و سیستاتین C (eGFRcr-cys) تعیین شود.",
    refs: ["Inker LA, et al. N Engl J Med. 2021;385:1737-1749", "KDIGO 2024"],
    cats: ["biochem"],
  },
  {
    id: "cockcroft-gault",
    fa: "کلیرنس کراتینین — کوککرافت-گالت",
    en: "Cockcroft-Gault",
    expr:
      "CrCl = (140 − age) × weight ÷ (72 × Scr) × (0.85 اگر زن)  <small>(mL/min)</small>",
    inputs: [
      { key: "age", fa: "سن", unit: "سال" },
      { key: "wt", fa: "وزن", unit: "kg" },
      { key: "scr", fa: "کراتینین", unit: "mg/dL" },
      { key: "sex", fa: "جنسیت (1=زن، 0=مرد)", unit: "—" },
    ],
    out: { fa: "کلیرنس کراتینین", unit: "mL/min" },
    compute: (v) =>
      v.scr > 0 && v.wt > 0
        ? Math.round(
            ((140 - v.age) * v.wt * (v.sex >= 0.5 ? 0.85 : 1)) / (72 * v.scr)
          )
        : null,
    interp: (r) =>
      r >= 90 ? "طبیعی" : r >= 60 ? "کاهش خفیف" : r >= 30 ? "متوسط" : "شدید — تنظیم دوز دارویی لازم",
    refs: ["Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41"],
    cats: ["biochem", "tox"],
  },
  {
    id: "bun-cr",
    fa: "نسبت BUN/کراتینین",
    en: "BUN/Creatinine Ratio",
    expr: "Ratio = BUN ÷ Creatinine",
    inputs: [
      { key: "bun", fa: "BUN", unit: "mg/dL" },
      { key: "cr", fa: "کراتینین", unit: "mg/dL" },
    ],
    out: { fa: "نسبت", unit: "—" },
    compute: (v) => (v.cr > 0 ? r1(v.bun / v.cr) : null),
    interp: (r) =>
      r > 20
        ? "بالا — پیش‌کلیوی (دهیدراتاسیون، خونریزی GI، کاتابولیسم) محتمل"
        : r < 10
        ? "پایین — آسیب ذاتی کلیه/داری کم‌پروتئین محتمل"
        : "نسبت معمول (10–20)",
    refs: ["Endotext (NCBI Bookshelf), CKD chapter"],
    cats: ["biochem", "urine"],
  },
  {
    id: "fena",
    fa: "کسر دفع سدیم (FENa)",
    en: "Fractional Excretion of Sodium",
    expr: "FENa% = (UNa × PCr) ÷ (PNa × UCr) × 100",
    inputs: [
      { key: "una", fa: "سدیم ادرار", unit: "mEq/L" },
      { key: "pna", fa: "سدیم پلاسما", unit: "mEq/L" },
      { key: "pcr", fa: "کراتینین پلاسما", unit: "mg/dL" },
      { key: "ucr", fa: "کراتینین ادرار", unit: "mg/dL" },
    ],
    out: { fa: "FENa", unit: "%" },
    compute: (v) =>
      v.pna > 0 && v.ucr > 0 ? r2(((v.una * v.pcr) / (v.pna * v.ucr)) * 100) : null,
    interp: (r) =>
      r < 1
        ? "<1% — الگوی پیش‌کلیوی (ATN دیورتیک‌دار ممکن است گمراه‌کننده باشد؛ در دیورتیک از FEUrea استفاده کنید)"
        : r > 2
        ? ">2% — الگوی آسیب ذاتی (ATN)"
        : "مرزی (1–2%)",
    refs: ["Endotext (NCBI Bookshelf)", "Steiner RW. Am J Kidney Dis. 2007 (letter)"],
    cats: ["biochem", "urine"],
  },
  {
    id: "feurea",
    fa: "کسر دفع اوره (FEUrea)",
    en: "Fractional Excretion of Urea",
    expr: "FEUrea% = (Uurea × PCr) ÷ (Purea × UCr) × 100",
    inputs: [
      { key: "uurea", fa: "اوره ادرار (BUN ادرار)", unit: "mg/dL" },
      { key: "purea", fa: "اوره پلاسما", unit: "mg/dL" },
      { key: "pcr", fa: "کراتینین پلاسما", unit: "mg/dL" },
      { key: "ucr", fa: "کراتینین ادرار", unit: "mg/dL" },
    ],
    out: { fa: "FEUrea", unit: "%" },
    compute: (v) =>
      v.purea > 0 && v.ucr > 0
        ? r2(((v.uurea * v.pcr) / (v.purea * v.ucr)) * 100)
        : null,
    interp: (r) =>
      r < 35 ? "<35% — الگوی پیش‌کلیوی (حتی بیمار دیورتیک‌دار)" : "≥35% — آسیب ذاتی محتمل",
    refs: ["Carvounis CP, et al. Kidney Int. 2002;62(6):2223-9"],
    cats: ["biochem", "urine"],
  },
  {
    id: "crcl-24h",
    fa: "کلیرنس کراتینین ادرار ۲۴ ساعته",
    en: "24h Creatinine Clearance",
    expr: "CrCl = (Ucr × V) ÷ (Pcr × 1440)  <small>؛ V = حجم ادرار 24h (mL)</small>",
    inputs: [
      { key: "ucr", fa: "کراتینین ادرار", unit: "mg/dL" },
      { key: "vol", fa: "حجم ادرار ۲۴ ساعته", unit: "mL" },
      { key: "pcr", fa: "کراتینین سرم", unit: "mg/dL" },
    ],
    out: { fa: "CrCl", unit: "mL/min" },
    compute: (v) =>
      v.pcr > 0 ? Math.round((v.ucr * v.vol) / (v.pcr * 1440)) : null,
    interp: (r) =>
      "با eGFR مقایسه کنید؛ نمونه ۲۴ ساعته ناقص (کراتینین ادراری <15–20 mg/kg/day) جواب نامعتبر می‌دهد.",
    refs: ["Endotext (NCBI Bookshelf)"],
    cats: ["urine", "biochem"],
  },
  // ================= Electrolytes / Acid-Base =================
  {
    id: "anion-gap",
    fa: "شکاف آنیونی",
    en: "Anion Gap",
    expr: "AG = Na − (Cl + HCO₃)  <small>(بدون K؛ نوع با K: +K)</small>",
    inputs: [
      { key: "na", fa: "سدیم", unit: "mEq/L" },
      { key: "cl", fa: "کلر", unit: "mEq/L" },
      { key: "hco3", fa: "بیکربنات (CO2 total)", unit: "mEq/L" },
    ],
    out: { fa: "شکاف آنیونی", unit: "mEq/L" },
    compute: (v) => r1(v.na - (v.cl + v.hco3)),
    interp: (r) =>
      r > 12
        ? "بالا — اسیدوز متابولیک هایپرکلرمیک/انباشت اسید (کتوز، لاکتات، سموم، اورمی)"
        : r < 8
        ? "پایین — هایپرآلبومینمی، آنیون‌های غیراندازه‌گیری‌شده مثبت (پاراپروتئین، لیتیم، برم)"
        : "معمول (8–12)",
    refs: ["Emmett M, Narins RG. Arch Intern Med. 1977;137:771-5", "Endotext"],
    cats: ["biochem"],
  },
  {
    id: "corrected-na",
    fa: "سدیم اصلاح‌شده (هایپرگلیسمی)",
    en: "Corrected Sodium (hyperglycemia)",
    expr: "Na corr = Na + 2.4 × (Glu − 100) ÷ 100  <small>(Hillier)</small>",
    inputs: [
      { key: "na", fa: "سدیم اندازه‌گیری‌شده", unit: "mEq/L" },
      { key: "glu", fa: "قند خون", unit: "mg/dL" },
    ],
    out: { fa: "سدیم اصلاح‌شده", unit: "mEq/L" },
    compute: (v) => r1(v.na + 2.4 * ((v.glu - 100) / 100)),
    interp: () =>
      "در هایپرگلیسمی، سدیم رقیق‌شده «سدیم واقعی» نیست؛ برای تصمیم درمانی از مقدار اصلاح‌شده استفاده کنید (بخش تبادل‌پذیر عمدتاً 2/4).",
    refs: ["Hillier TA, et al. Am J Med. 1999;106(4):399-403"],
    cats: ["biochem"],
  },
  {
    id: "corrected-ca",
    fa: "کلسیم اصلاح‌شده",
    en: "Corrected Calcium",
    expr: "Ca corr = Ca + 0.8 × (4.0 − Albumin)  <small>(mg/dL)</small>",
    inputs: [
      { key: "ca", fa: "کلسیم توتال", unit: "mg/dL" },
      { key: "alb", fa: "آلبومین", unit: "g/dL" },
    ],
    out: { fa: "کلسیم اصلاح‌شده", unit: "mg/dL" },
    compute: (v) => r2(v.ca + 0.8 * (4 - v.alb)),
    interp: (r) =>
      r < 8.5 ? "هیپوکلسمی اصلاح‌شده" : r > 10.5 ? "هایپرکلسمی اصلاح‌شده" : "در محدوده (8/5–10/5)",
    refs: ["Payne RB, et al. BMJ. 1973;4(5893):643-6"],
    cats: ["biochem"],
  },
  {
    id: "osmolality",
    fa: "اسمولالیته محاسباتی سرم",
    en: "Calculated Serum Osmolality",
    expr: "Osm = 2×Na + Glu/18 + BUN/2.8  <small>(mg/dL)</small>",
    inputs: [
      { key: "na", fa: "سدیم", unit: "mEq/L" },
      { key: "glu", fa: "قند", unit: "mg/dL" },
      { key: "bun", fa: "BUN", unit: "mg/dL" },
      { key: "etoh", fa: "اتانول (اختیاری، 0 بگذارید)", unit: "mg/dL" },
    ],
    out: { fa: "اسمولالیته", unit: "mOsm/kg" },
    compute: (v) => r2(2 * v.na + v.glu / 18 + v.bun / 2.8 + v.etoh / 4.6),
    interp: (r) => (r < 275 ? "هیپواسمولار" : r > 295 ? "هایپراسمولار" : "ایزواسمولار (275–295)"),
    refs: ["Dorwart WV, Chalmers L. Am J Med. 1975;255:274-9 (formula family)"],
    cats: ["biochem"],
  },
  {
    id: "osm-gap",
    fa: "شکاف اسمولار",
    en: "Osmolar Gap",
    expr: "Gap = Osm(measured) − Osm(calculated)",
    inputs: [
      { key: "meas", fa: "اسمولالیته اندازه‌گیری‌شده", unit: "mOsm/kg" },
      { key: "calc", fa: "اسمولالیته محاسباتی (از فرمول)", unit: "mOsm/kg" },
    ],
    out: { fa: "شکاف اسمولار", unit: "mOsm/kg" },
    compute: (v) => r1(v.meas - v.calc),
    interp: (r) =>
      r > 10
        ? ">10 — شکاف بالا: الکل‌های سمی (متانول/اتیلن گلایکول)، آسیتون، مانیتول؛ بررسی مسمومیت"
        : "معمول (−2 تا +10 تقریباً)",
    refs: ["Endotext (NCBI Bookshelf), Acid-Base chapter"],
    cats: ["biochem", "tox"],
  },
  {
    id: "a-a-gradient",
    fa: "گرادیان آلوئولی-شریانی",
    en: "A–a Gradient",
    expr: "A–a = PAO₂ − PaO₂ ؛ PAO₂ = 150 − (PaCO₂ ÷ 0.8)",
    inputs: [
      { key: "paco2", fa: "PaCO₂", unit: "mmHg" },
      { key: "pao2", fa: "PaO₂", unit: "mmHg" },
      { key: "age", fa: "سن", unit: "سال" },
    ],
    out: { fa: "A–a gradient", unit: "mmHg" },
    compute: (v) => {
      const aa = 150 - v.paco2 / 0.8 - v.pao2;
      return Math.round(aa);
    },
    interp: (r, v) => {
      const expected = v.age / 4 + 4;
      return `انتظار سن‌محور ≈ ${Math.round(expected)} mmHg؛ ${
        r > expected ? "بالاتر از انتظار → مشکل تبادل گازی (شنت/عدم تطابق V-Q)" : "در محدوده انتظار"
      }`;
    },
    refs: ["Endotext (NCBI Bookshelf)"],
    cats: ["biochem"],
  },
  {
    id: "winter",
    fa: "فرمول وینتر (بازرسی اسیدوز)",
    en: "Winter's Formula",
    expr: "Expected PaCO₂ = 1.5 × HCO₃ + 8 (± 2)",
    inputs: [{ key: "hco3", fa: "HCO₃ سرم", unit: "mEq/L" }],
    out: { fa: "PaCO₂ مورد انتظار", unit: "mmHg" },
    compute: (v) => (v.hco3 > 0 ? r1(1.5 * v.hco3 + 8) : null),
    interp: (r, v) =>
      `PaCO₂ اندازه‌گیری‌شده در بازه ${r1(r - 2)} تا ${r1(r + 2)} باشد؛ اگر بالاتر است → آسیدوز تنفسی هم‌زمان، اگر پایین‌تر → آلکالوز تنفسی هم‌زمان (HCO₃=${v.hco3})`,
    refs: ["Albert MS, et al. Ann Intern Med. 1967;67:222-9 (basis)"],
    cats: ["biochem"],
  },
  // ================= Liver / Pancreas / Cardiac =================
  {
    id: "de-ritis",
    fa: "نسبت De Ritis (AST/ALT)",
    en: "De Ritis Ratio",
    expr: "Ratio = AST ÷ ALT",
    inputs: [
      { key: "ast", fa: "AST", unit: "U/L" },
      { key: "alt", fa: "ALT", unit: "U/L" },
    ],
    out: { fa: "نسبت", unit: "—" },
    compute: (v) => (v.alt > 0 ? r2(v.ast / v.alt) : null),
    interp: (r) =>
      r >= 2
        ? "≥2 — آسیب الکلی کبد محتمل (با GGT بالا تقویت می‌شود)"
        : r > 1
        ? "1–2 — می‌تواند در سیروز/NAFLD پیشرفته دیده شود"
        : "<1 — الگوی هپاتیت ویروسی/ناکلیوتیک رایج",
    refs: ["De Ritis F, et al. 1957 (original); Nyblom H, et al. Alcohol Alcohol. 2004"],
    cats: ["enzyme", "biochem"],
  },
  {
    id: "ckmb-index",
    fa: "شاخص نسبی CK-MB",
    en: "CK-MB Relative Index",
    expr: "Index% = (CK-MB ÷ CK) × 100",
    inputs: [
      { key: "ckmb", fa: "CK-MB (توده/فعالیت)", unit: "ng/mL یا U/L" },
      { key: "ck", fa: "CK توتال", unit: "U/L" },
    ],
    out: { fa: "شاخص نسبی", unit: "%" },
    compute: (v) => (v.ck > 0 ? r2((v.ckmb / v.ck) * 100) : null),
    interp: (r) =>
      r > 2.5
        ? ">2.5% — منشا قلبی محتمل (با ورژن ماس); در رهاشدگی پایدار (همولیز نمی‌رود) به اتصال غیرطبیعی CK-MB/گلوبولین (macro-CK) فکر کنید"
        : "≤2.5% — اگر CK بالا باشد منشا اسکلتی-عضلانی محتمل",
    refs: ["Mair J. Clin Chem Lab Med. 1999 (review)", "Endotext"],
    cats: ["cardiac", "enzyme"],
  },
  {
    id: "hcg-doubling",
    fa: "زمان دوبرابر شدن hCG",
    en: "hCG Doubling Time",
    expr: "Dt = Δt × Ln2 ÷ Ln(hCG₂/hCG₁)",
    inputs: [
      { key: "h1", fa: "hCG اول", unit: "mIU/mL" },
      { key: "h2", fa: "hCG دوم", unit: "mIU/mL" },
      { key: "dt", fa: "فاصله دو نمونه", unit: "ساعت" },
    ],
    out: { fa: "زمان دوبرابر شدن", unit: "ساعت" },
    compute: (v) =>
      v.h1 > 0 && v.h2 > v.h1 && v.dt > 0
        ? r1((v.dt * Math.LN2) / Math.log(v.h2 / v.h1))
        : null,
    interp: (r, v) =>
      v.h1 >= 1500 && v.h1 < 3500
        ? `در سنین بارداری زودهنگام، دوبرابر شدن ${r1(r)} ساعته ${
            r <= 72 ? "مطابق بارداری داخل‌رحمی زنده است" : "کندتر از انتظار — حاملگی خارج‌رحمی/سقط تهدیدکننده را بررسی کنید"
          }`
        : "تفسیر به سطح پایه وابسته است؛ در hCG بالا (>3500) سرعت به کندی می‌رسد.",
    refs: ["Barnhart KT, et al. Obstet Gynecol. 2004 (models)", "Practice Bulletin ACOG #193"],
    cats: ["hormone"],
  },
  {
    id: "saag",
    fa: "گرادیان آلبومین آسیت-سرم (SAAG)",
    en: "Serum-Ascites Albumin Gradient",
    expr: "SAAG = Albumin(serum) − Albumin(ascites)  <small>(g/dL)</small>",
    inputs: [
      { key: "sa", fa: "آلبومین سرم", unit: "g/dL" },
      { key: "aa", fa: "آلبومین آسیت", unit: "g/dL" },
    ],
    out: { fa: "SAAG", unit: "g/dL" },
    compute: (v) => r1(v.sa - v.aa),
    interp: (r) =>
      r >= 1.1 ? "≥1/1 — فشار پورت بالا (سیروز، CHF)" : "<1/1 — غیر پورت‌هایپرتانسیون (پریتونیت، سرطان، پانکراتیت)",
    refs: ["Runyon BA. Am J Med. 1996 (AASLD guidance basis)"],
    cats: ["biochem"],
  },
  // ================= Iron =================
  {
    id: "tsat",
    fa: "درجه اشباع ترانسفرین (TSAT)",
    en: "Transferrin Saturation",
    expr: "TSAT% = (Fe ÷ TIBC) × 100",
    inputs: [
      { key: "fe", fa: "آهن سرم", unit: "µg/dL" },
      { key: "tibc", fa: "TIBC", unit: "µg/dL" },
    ],
    out: { fa: "TSAT", unit: "%" },
    compute: (v) => (v.tibc > 0 ? r1((v.fe / v.tibc) * 100) : null),
    interp: (r) =>
      r < 20 ? "پایین — کمبود آهن (با فریتین تفسیر شود)" : r > 50 ? "بالا — اضافه‌بار آهن/هموکروماتوز" : "معمول (20–50)",
    refs: ["Endotext (NCBI Bookshelf), Iron deficiency chapter"],
    cats: ["biochem", "hematology"],
  },
  {
    id: "tibc-tf",
    fa: "TIBC از ترانسفرین",
    en: "TIBC from Transferrin",
    expr: "TIBC = Transferrin × 1.40  <small>(mg/dL ترانسفرین → µg/dL TIBC)</small>",
    inputs: [{ key: "tf", fa: "ترانسفرین", unit: "mg/dL" }],
    out: { fa: "TIBC تخمینی", unit: "µg/dL" },
    compute: (v) => (v.tf > 0 ? Math.round(v.tf * 1.4) : null),
    interp: () =>
      "معادل ازمایشگاه‌محور: ضریب بسته به روش بین 1/4 تا 1/7 متغیر است؛ با روش آزمایشگاه خودتان کالیبره کنید. UIBC = TIBC − Fe.",
    refs: ["Endotext (NCBI Bookshelf)"],
    cats: ["biochem"],
  },
  {
    id: "uibc",
    fa: "ظرفیت اتصال اشباع‌نشده (UIBC)",
    en: "UIBC",
    expr: "UIBC = TIBC − Fe",
    inputs: [
      { key: "tibc", fa: "TIBC", unit: "µg/dL" },
      { key: "fe", fa: "آهن سرم", unit: "µg/dL" },
    ],
    out: { fa: "UIBC", unit: "µg/dL" },
    compute: (v) => (v.tibc >= v.fe ? Math.round(v.tibc - v.fe) : null),
    interp: (r) => (r > 330 ? "بالا — کمبود آهن محتمل" : r < 150 ? "پایین — اضافه‌بار آهن/التهاب" : "معمول (150–330)"),
    refs: ["Endotext (NCBI Bookshelf)"],
    cats: ["biochem"],
  },
  // ================= Hematology / Coag =================
  {
    id: "inr",
    fa: "INR",
    en: "International Normalized Ratio",
    expr: "INR = (PT patient ÷ PT normal)^ISI",
    inputs: [
      { key: "pt", fa: "PT بیمار", unit: "ثانیه" },
      { key: "np", fa: "PT پلاسمای طبیعی (MNPT)", unit: "ثانیه" },
      { key: "isi", fa: "ISI معرف", unit: "—" },
    ],
    out: { fa: "INR", unit: "—" },
    compute: (v) => (v.np > 0 ? r2(Math.pow(v.pt / v.np, v.isi)) : null),
    interp: (r) =>
      r <= 1.1 ? "طبیعی" : r <= 2 ? "پایش وارفارین (هدف 2–3 در اکثر موارد)" : r <= 3.5 ? "در بازه درمانی/بالاتر" : "خطر خونریزی — بررسی",
    refs: ["WHO Expert Committee, Biological Standardization (ISI)"],
    cats: ["coag"],
  },
  {
    id: "retic-idx",
    fa: "شاخص رتیکولوسیت",
    en: "Reticulocyte Index",
    expr: "RI = Retic% × (Hct ÷ 45)",
    inputs: [
      { key: "ret", fa: "رتیکولوسیت", unit: "%" },
      { key: "hct", fa: "هماتوکریت", unit: "%" },
    ],
    out: { fa: "شاخص رتیکولوسیت", unit: "—" },
    compute: (v) => (v.hct > 0 ? r2((v.ret * v.hct) / 45) : null),
    interp: (r) =>
      r > 2 ? "پاسخ مغز استخوان مناسب (کم‌خونی محیطی/همولیتیک)" : r < 2 ? "پاسخ ناکافی — کم‌خونی هیپوپرولیفراتیو محتمل" : "مرزی",
    refs: ["Endotext (NCBI Bookshelf), Anemia chapter"],
    cats: ["hematology"],
  },
  {
    id: "wbc-nrbc",
    fa: "WBC اصلاح‌شده برای NRBC",
    en: "Corrected WBC (nucleated RBC)",
    expr: "WBC corr = WBC × 100 ÷ (100 + NRBC)",
    inputs: [
      { key: "wbc", fa: "WBC گزارش‌شده", unit: "×10³/µL" },
      { key: "nrbc", fa: "NRBC در هر 100 لوکوسیت", unit: "—" },
    ],
    out: { fa: "WBC اصلاح‌شده", unit: "×10³/µL" },
    compute: (v) => r2((v.wbc * 100) / (100 + v.nrbc)),
    interp: () =>
      "NRBC تعداد واقعی لوکوسیت را جعل (بالا) نشان می‌دهد؛ در نوزادان/هیپوکسی/میلوپرولیفراتیو دیده می‌شود.",
    refs: ["Endotext (NCBI Bookshelf)"],
    cats: ["hematology"],
  },
  {
    id: "anc",
    fa: "شمارش مطلق نوتروفیل (ANC)",
    en: "Absolute Neutrophil Count",
    expr: "ANC = WBC × Neut% ÷ 100",
    inputs: [
      { key: "wbc", fa: "WBC", unit: "×10³/µL" },
      { key: "npct", fa: "درصد نوتروفیل", unit: "%" },
    ],
    out: { fa: "ANC", unit: "cells/µL" },
    compute: (v) => Math.round(v.wbc * v.npct * 10),
    interp: (r) =>
      r < 500 ? "نوتروپنی شدید (<500) — ریسک عفونت فرصت‌طلب" : r < 1500 ? "نوتروپنی (<1500)" : "معمول (≥1500)",
    refs: ["Endotext (NCBI Bookshelf)"],
    cats: ["hematology"],
  },
  {
    id: "fsh-lh",
    fa: "نسبت FSH/LH",
    en: "FSH/LH Ratio",
    expr: "Ratio = FSH ÷ LH",
    inputs: [
      { key: "fsh", fa: "FSH", unit: "mIU/mL" },
      { key: "lh", fa: "LH", unit: "mIU/mL" },
    ],
    out: { fa: "نسبت", unit: "—" },
    compute: (v) => (v.lh > 0 ? r2(v.fsh / v.lh) : null),
    interp: (r) =>
      r > 2 ? "نسبت >2 — الگوی گاهی دیده‌شده در PCOS (تشخیص آنه‌ای، مستقل نیست)" : "نسبت معمول/پایین",
    refs: ["Endotext (NCBI Bookshelf), PCOS chapter"],
    cats: ["hormone"],
  },
  {
    id: "corrected-pht",
    fa: "فنی‌توئین اصلاح‌شده (آلبومین پایین)",
    en: "Corrected Phenytoin",
    expr: "PHT corr = PHT ÷ (0.9 × Albumin + 0.1)  <small>(Alb g/dL)</small>",
    inputs: [
      { key: "pht", fa: "فنی‌توئین اندازه‌گیری‌شده", unit: "µg/mL" },
      { key: "alb", fa: "آلبومین", unit: "g/dL" },
    ],
    out: { fa: "فنی‌توئین اصلاح‌شده", unit: "µg/mL" },
    compute: (v) => (v.pht > 0 && v.alb > 0 ? r2(v.pht / (0.9 * v.alb + 0.1)) : null),
    interp: (r) =>
      r < 10 ? "زیر بازه درمانی (10–20)" : r > 20 ? "بالا — ریسک نیتاگموس/آتاکسی" : "در بازه درمانی",
    refs: ["Winter ME, et al. (correction family); Bertilsson L. Ther Drug Monit. 1978"],
    cats: ["tox"],
  },
  {
    id: "crcl-urine",
    fa: "پروتئین/کراتینین ادرار تصادفی (PCR)",
    en: "Urine Protein-Creatinine Ratio",
    expr: "PCR (mg/g) = Protein(mg/dL) ÷ Creatinine(g/dL) × 100",
    inputs: [
      { key: "prot", fa: "پروتئین ادرار", unit: "mg/dL" },
      { key: "cr", fa: "کراتینین ادرار", unit: "g/dL" },
    ],
    out: { fa: "PCR", unit: "mg/g" },
    compute: (v) => (v.cr > 0 ? Math.round((v.prot / v.cr) * 100) : null),
    interp: (r) =>
      r < 150 ? "معمول" : r < 500 ? "پروتئینوری خفیف" : r < 3500 ? "پروتئینوری متوسط — بررسی" : "پروتئینوری در حد نفروتیک (≥3500)",
    refs: ["KDIGO 2024 CKD Guideline"],
    cats: ["urine"],
  },
  {
    id: "acr",
    fa: "نسبت آلبومین/کراتینین ادرار (ACR)",
    en: "Albumin-Creatinine Ratio",
    expr: "ACR (mg/g) = Albumin(mg/dL) ÷ Creatinine(g/dL) × 100",
    inputs: [
      { key: "alb", fa: "آلبومین ادرار", unit: "mg/dL" },
      { key: "cr", fa: "کراتینین ادرار", unit: "g/dL" },
    ],
    out: { fa: "ACR", unit: "mg/g" },
    compute: (v) => (v.cr > 0 ? Math.round((v.alb / v.cr) * 100) : null),
    interp: (r) =>
      r < 30 ? "A1 — طبیعی تا خفیف" : r <= 300 ? "A2 — آلبومینوری متوسط (ریسک CKD)" : "A3 — آلبومینوری شدید",
    refs: ["KDIGO 2024 CKD Guideline"],
    cats: ["urine", "biochem"],
  },
];

export const FORMULA_MAP: Record<string, Formula> = Object.fromEntries(
  FORMULAS.map((f) => [f.id, f])
);
