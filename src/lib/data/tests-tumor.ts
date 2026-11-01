import type { LabTest } from "../nima-types";

export const TESTS_TUMOR: LabTest[] = [
  { id: "afp", fa: "AFP", en: "Alpha-Fetoprotein", cat: "tumor", sp: "سرم", unit: "ng/mL", ref: "<۱۰ (غیر باردار)", sig: "HCC و تومور زایده‌ای؛ در بارداری و سیروز بالا می‌رود." },
  { id: "cea", fa: "CEA", en: "Carcinoembryonic Antigen", cat: "tumor", sp: "سرم", unit: "ng/mL", ref: "غیر سیگاری <۳؛ سیگاری <۵", sig: "پایش کولورکتال پس از درمان؛ غربالگری اولیه نیست.", intr: "سیگار، التهاب روده و سیروز کاذب بالا می‌برند." },
  { id: "ca19-9", fa: "CA 19-9", en: "Carbohydrate Antigen 19-9", cat: "tumor", sp: "سرم", unit: "U/mL", ref: "<۳۷", sig: "پانکراس و راه صفراوی؛ در کولستانس کاذب بالا." },
  { id: "ca125", fa: "CA 125", en: "Cancer Antigen 125", cat: "tumor", sp: "سرم", unit: "U/mL", ref: "<۳۵", sig: "سرطان تخمدان و پایش؛ اندومتریوز/آسیت کاذب بالا." },
  { id: "ca15-3", fa: "CA 15-3", en: "Cancer Antigen 15-3", cat: "tumor", sp: "سرم", unit: "U/mL", ref: "<۳۱", sig: "پایش سرطان پستان؛ با HE4/CEA." },
  { id: "he4", fa: "HE4", en: "Human Epididymis Protein 4", cat: "tumor", sp: "سرم", unit: "pmol/L", ref: "<۱۴۰", sig: "با CA125 → شاخص ROMA افتراق خوش‌خیم/بدخیم توده آدنکسال." },
  { id: "psa", fa: "PSA توتال", en: "Prostate Specific Antigen", cat: "tumor", sp: "سرم", unit: "ng/mL", ref: "<۴", sig: "غربالگری پروستات؛ بالای 10 ریسک بدخیم بالاتر.", intr: "BIOPSY، ماساژ پروستات و دوچرخه‌سواری جواب را بالا می‌برند." },
  { id: "fpsa", fa: "PSA آزاد", en: "Free PSA", cat: "tumor", sp: "سرم", unit: "ng/mL", ref: "f/t >۲۵٪ خوش‌خیم‌تر", sig: "در PSA مرزی ۴–۱۰ افتراق BPH از سرطان." },
  { id: "scc", fa: "SCC", en: "Squamous Cell Carcinoma Antigen", cat: "tumor", sp: "سرم", unit: "ng/mL", ref: "<۱/۵", sig: "کارسینوم سلول سنگفرشی سرویکس/ریه/سر و گردن." },
  { id: "nse", fa: "NSE", en: "Neuron Specific Enolase", cat: "tumor", sp: "سرم", unit: "ng/mL", ref: "<۱۶/۳", sig: "کارسینوم سلول کوچک ریه و نوروبلاستوما." },
  { id: "cyfra", fa: "CYFRA 21-1", en: "Cytokeratin 19 Fragment", cat: "tumor", sp: "سرم", unit: "ng/mL", ref: "<۳/۳", sig: "مارکر کارسینوم ریه سلول غیرکوچک." },
  { id: "progrp", fa: "ProGRP", en: "Pro-gastrin Releasing Peptide", cat: "tumor", sp: "سرم", unit: "pg/mL", ref: "<۶۰", sig: "کارسینوم ریه سلول کوچک (اختصاصی‌تر از NSE)." },
  { id: "cga", fa: "کروموگرانین A", en: "Chromogranin A", cat: "tumor", sp: "سرم", unit: "ng/mL", ref: "<۱۰۰", sig: "تومورهای نوروآندوکرین؛ PPI جواب را جعل بالا می‌برد." },
  { id: "s100", fa: "S100", en: "S100 Protein", cat: "tumor", sp: "سرم", unit: "µg/L", ref: "<۰/۱۰۵", sig: "ملانوم بدخیم و پایش عود." },
  { id: "bhcg-tumor", fa: "β-hCG (تومور)", en: "Beta-hCG (tumor marker)", cat: "tumor", sp: "سرم", unit: "mIU/mL", ref: "<۵", sig: "تومورهای زایده‌ای (سمنوما/کوریوکارسینوما) و پایش." },
  { id: "calcitonin-tumor", fa: "کلسی‌تونین (مارکر MTC)", en: "Calcitonin (MTC marker)", cat: "tumor", sp: "سرم", unit: "pg/mL", ref: "مرد <۸/۴، زن <۵/۰", sig: "کارسینوم مدولار تیروئید و پایش پس از جراحی." },
  { id: "b2m-tumor", fa: "β۲-میکروگلوبولین (پیش‌آگهی)", en: "Beta-2 Microglobulin (prognosis)", cat: "tumor", sp: "سرم", unit: "mg/L", ref: "<۳", sig: "پیش‌آگهی میلوم/لنفوم (ISS staging)." },
];
