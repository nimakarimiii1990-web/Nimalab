import type { LabTest } from "../nima-types";

export const TESTS_MOLECULAR: LabTest[] = [
  // --- Infectious molecular ---
  { id: "tb-genexpert", fa: "GeneXpert MTB/RIF", en: "Xpert MTB/RIF", cat: "molecular", sp: "خلط", unit: "کیفی/مثبت + RIF", ref: "منفی", sig: "تشخیص سریع سل و مقاومت ریفامپین در ۲ ساعت (WHO)." },
  { id: "hbv-dna-q", fa: "HBV DNA کمی", en: "HBV DNA Quantitative", cat: "molecular", sp: "سرم/پلاسما", unit: "IU/mL", ref: "<۲۰", sig: "پایش درمان و تثبیت هپاتیت B." },
  { id: "hcv-rna-q", fa: "HCV RNA کمی", en: "HCV RNA Quantitative", cat: "molecular", sp: "پلاسما", unit: "IU/mL", ref: "منفی", sig: "پایش پاسخ DAA و SVR12." },
  { id: "hpv-dna", fa: "HPV DNA جنوتایپینگ", en: "HPV DNA Genotyping", cat: "molecular", sp: "سواپ سرویکس", unit: "جنوتایپ", ref: "منفی", sig: "غربالگری سرطان سرویکس؛ 16/18 پرخطرترین." },
  // --- Thrombophilia / Cardiogenetics ---
  { id: "fvl", fa: "فاکتور ۵ لیدن", en: "Factor V Leiden (G1691A)", cat: "molecular", sp: "خون کامل EDTA", unit: "ژنوتایپ", ref: "G/G نرمال", sig: "شایع‌ترین ترومبوفیلی ارثی؛ ترومبوز وریدی." },
  { id: "pt-g20210a", fa: "پروترومبین G20210A", en: "Prothrombin Mutation", cat: "molecular", sp: "خون کامل EDTA", unit: "ژنوتایپ", ref: "G/G", sig: "افزایش پروترومبین و ریسک ترومبوز." },
  { id: "mthfr", fa: "MTHFR C677T/A1298C", en: "MTHFR Polymorphism", cat: "molecular", sp: "خون کامل EDTA", unit: "ژنوتایپ", ref: "C/C", sig: "هایپرهوموسیستئینمی و ریسک عروقی/نورال‌تیوب." },
  // --- Hematology molecular ---
  { id: "jak2", fa: "JAK2 V617F", en: "JAK2 V617F", cat: "molecular", sp: "خون کامل EDTA", unit: "آلل%", ref: "منفی", sig: "پلی‌سیتمی ورا، essential ترومبوسیتوز و میلوفیبروز." },
  { id: "bcr-abl", fa: "BCR-ABL1 (p210)", en: "BCR-ABL1 Quantitative", cat: "molecular", sp: "خون/مغز استخوان", unit: "%IS", ref: "≤۰/۱% MMR", sig: "پایش CML و درمان تیروزین‌کیناز؛ MMR هدف درمانی." },
  { id: "pml-rara", fa: "PML-RARA", en: "PML-RARA Fusion", cat: "molecular", sp: "مغز استخوان", unit: "کیفی/مثبت", ref: "منفی", sig: "AML نوع M3 (پرومییلوسیتیک) — اورژانس درمانی." },
  { id: "flt3", fa: "FLT3-ITD/TKD", en: "FLT3 Mutation", cat: "molecular", sp: "مغز استخوان", unit: "VR", ref: "وایلد‌تایپ", sig: "پیش‌آگهی AML و انتخاب اینهیبیتر FLT3." },
  { id: "npm1", fa: "NPM1", en: "NPM1 Mutation", cat: "molecular", sp: "مغز استخوان", unit: "VR", ref: "وایلد‌تایپ", sig: "AML؛ همراه FLT3-ITD تعیین‌کننده ریسک." },
  { id: "calr", fa: "CALR", en: "Calreticulin Mutation", cat: "molecular", sp: "خون کامل EDTA", unit: "VR", ref: "وایلد‌تایپ", sig: "MPN در JAK2-منفی؛ پیش‌آگهی بهتر." },
  // --- Cancer solid ---
  { id: "brca12", fa: "BRCA1/2", en: "BRCA1/2 Sequencing", cat: "molecular", sp: "خون کامل EDTA", unit: "واریانت", ref: "منفی", sig: "ریسک پستان/تخمدان وراثتی؛ راهنمای PARP-اینهیبیتر." },
  { id: "kras", fa: "KRAS", en: "KRAS Mutation", cat: "molecular", sp: "بافت تومور/خون", unit: "VR", ref: "وایلد‌تایپ", sig: "پیش از درمان ضد EGFR در کولورکتال." },
  { id: "braf", fa: "BRAF V600E", en: "BRAF V600E", cat: "molecular", sp: "بافت تومور", unit: "VR", ref: "وایلد‌تایپ", sig: "ملانوم/کولورکتال/سرطان تیروئید؛ راهنمای BRAF-اینهیبیتر." },
  { id: "egfr-mutation", fa: "EGFR", en: "EGFR Mutation", cat: "molecular", sp: "بافت تومور/مایع آسپیرات", unit: "VR", ref: "وایلد‌تایپ", sig: "سرطان ریه غیرسلول کوچک؛ انتخاب TKI." },
  { id: "alk-fish", fa: "ALK (FISH)", en: "ALK Rearrangement FISH", cat: "molecular", sp: "بافت تومور", unit: "کیفی/مثبت", ref: "منفی", sig: "NSCLC؛ انتخاب ALK-اینهیبیتر." },
  { id: "her2-ish", fa: "HER2 (ISH/IHC)", en: "HER2 Amplification", cat: "molecular", sp: "بافت پستان", unit: "نمره", ref: "منفی", sig: "انتخاب تراستوزوماب در پستان/معده." },
  { id: "msi", fa: "MSI/MMR", en: "Microsatellite Instability", cat: "molecular", sp: "بافت تومور", unit: "MSI-H/MSS", ref: "MSS", sig: "راهنمای ایمیونوتراپی و لینچ سندرم." },
  // --- Pharmacogenomics ---
  { id: "cyp2c9-vkor", fa: "CYP2C9/VKORC1", en: "CYP2C9 & VKORC1", cat: "molecular", sp: "خون کامل EDTA", unit: "ژنوتایپ", ref: "*1/*1", sig: "دوز وارفارین (الگوریتم IWPC)." },
  { id: "cyp2c19", fa: "CYP2C19", en: "CYP2C19 Genotype", cat: "molecular", sp: "خون کامل EDTA", unit: "متابولایزر", ref: "*1/*1", sig: "کلوپیدوگرل/OME؛ مقاومت دارویی CYP2C19." },
  { id: "tpmt", fa: "TPMT/NUDT15", en: "TPMT & NUDT15", cat: "molecular", sp: "خون کامل EDTA", unit: "ژنوتایپ", ref: "عادی", sig: "توکسیسیتی‌بازوپورین/۶-MP؛ دوز ابتدایی ایمن." },
  { id: "ugt1a1", fa: "UGT1A1", en: "UGT1A1*28", cat: "molecular", sp: "خون کامل EDTA", unit: "ژنوتایپ", ref: "*1/*1", sig: "ریسک توکسیسیتی ایرینوتکان و ژیلبرت." },
  // --- Genetic disease ---
  { id: "cftr", fa: "CFTR (فیبروز کیستیک)", en: "CFTR Mutation Panel", cat: "molecular", sp: "خون کامل EDTA", unit: "واریانت", ref: "منفی", sig: "فیبروز کیستیک؛ با تثبیت سویت تست." },
  { id: "smn1", fa: "SMN1 (SMA)", en: "SMN1 Deletion", cat: "molecular", sp: "خون کامل EDTA", unit: "copy number", ref: "≥۲ کپی", sig: "آتروفی عضلانی اسپاینال؛ غربالگری حامل MLPA." },
  { id: "fragile-x", fa: "فراجایل X", en: "FMR1 CGG Repeat", cat: "molecular", sp: "خون کامل EDTA", unit: "کپی", ref: "<۴۵", sig: "عقب‌ماندگی X-محور؛ پرموتاسیون در خانواده." },
  { id: "a-thal", fa: "آلفا-تالاسمی (Gap-PCR)", en: "Alpha-Thalassemia Deletion", cat: "molecular", sp: "خون کامل EDTA", unit: "ژنوتایپ", ref: "αα/αα", sig: "حذف ژن‌های آلفا؛ در ایران شایع (−α3/7)." },
  { id: "b-thal", fa: "پانل جهش بتا-تالاسمی", en: "Beta-Thalassemia Mutation Panel", cat: "molecular", sp: "خون کامل EDTA", unit: "واریانت", ref: "منفی", sig: "جهش‌های شایع ایران (IVS-II-1، Codon 8/9، IVS-I-110)." },
  { id: "hfe", fa: "HFE C282Y/H63D", en: "Hemochromatosis HFE", cat: "molecular", sp: "خون کامل EDTA", unit: "ژنوتایپ", ref: "C282Y منفی", sig: "هموکروماتوز ارثی؛ با فریتین/TSAT." },
  { id: "mefv", fa: "MEFV (تب مدیترانه)", en: "MEFV Gene (FMF)", cat: "molecular", sp: "خون کامل EDTA", unit: "واریانت", ref: "منفی", sig: "تب مدیترانه‌ای خانوادگی؛ M694V شدیدترین." },
  { id: "cyp21a2", fa: "CYP21A2 (CAH)", en: "CYP21A2 Deletion", cat: "molecular", sp: "خون کامل EDTA", unit: "ژنوتایپ", ref: "منفی", sig: "هیپرپلازی فوق‌کلیوی مادرزادی؛ با 17-OHP." },
  // --- Cytogenetics ---
  { id: "karyotype", fa: "کاریوتایپ", en: "Chromosomal Karyotyping", cat: "molecular", sp: "خون/آمنیوسن", unit: "فرمول کاریوتایپ", ref: "46,XX یا 46,XY", sig: "آنیوپلوئیدی (داون/ترنر)، AML و INF‌ترتیب." },
  { id: "array-cgh", fa: "Array-CGH", en: "Chromosomal Microarray", cat: "molecular", sp: "خون/بافت", unit: "CNV", ref: "منفی", sig: "کپی-نامبری در تاخیر رشد و اوتیسم." },
  { id: "wes", fa: "توالی‌یابی کل اگزوم", en: "Whole Exome Sequencing", cat: "molecular", sp: "خون کامل EDTA", unit: "واریانت", ref: "منفی", sig: "بیماری‌های ژنتیکی نادر و دیاگنوز ژنومی." },
  { id: "mlpa", fa: "MLPA", en: "MLPA Copy Number", cat: "molecular", sp: "خون کامل EDTA", unit: "کپی", ref: "عادی", sig: "حذف/تکثیر ژنی (DMD، SMA، BRCA بزرگ)." },
  { id: "hla-b27", fa: "HLA-B27", en: "HLA-B27 Typing", cat: "molecular", sp: "خون کامل EDTA", unit: "مثبت/منفی", ref: "منفی", sig: "اسپوندیلوآرتریت محوری و یووئیت." },
  { id: "hla-typing", fa: "تایپ HLA (پیوند)", en: "HLA Typing", cat: "molecular", sp: "خون کامل EDTA", unit: "آلل", ref: "—", sig: "انطباق دهنده/گیرنده در پیوند (A,B,C,DR,DQ)." },
  { id: "prenatal-screen", fa: "غربالگری ژنتیک بارداری (cfDNA)", en: "Cell-free DNA Prenatal Screen", cat: "molecular", sp: "خون مادر", unit: "ریسک", ref: "کم‌خطر", sig: "غربالگری ترایزومی 21/18/13 غیرتهاجمی (NIPT)." },
];
