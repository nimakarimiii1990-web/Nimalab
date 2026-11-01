import type { LabTest } from "../nima-types";

export const TESTS_BANK: LabTest[] = [
  { id: "abo-rh", fa: "گروه خونی و Rh", en: "ABO & Rh Typing", cat: "bank", sp: "خون کامل EDTA", unit: "گروه", ref: "A/B/AB/O و Rh+ /−", sig: "تعیین گروه خونی و فاکتور Rh؛ پایه انتقال خون." },
  { id: "ab-screen", fa: "غربالگری آنتی‌بادی غیرمنتظره", en: "Antibody Screen", cat: "bank", sp: "سرم/پلاسما", unit: "کیفی/مثبت", ref: "منفی", sig: "کشف آنتی‌بادی‌های RBC (Kell، Duffy، Kidd، MNS)." },
  { id: "iat", fa: "کومبس غیرمستقیم", en: "Indirect Coombs (IAT)", cat: "bank", sp: "سرم", unit: "کیفی/مثبت", ref: "منفی", sig: "آنتی‌بادی‌های آزاد در سرم؛ غربالگری بارداری/پیش از کراس‌مچ." },
  { id: "dat", fa: "کومبس مستقیم", en: "Direct Coombs (DAT)", cat: "bank", sp: "خون کامل EDTA", unit: "کیفی/مثبت", ref: "منفی", sig: "آنمی همولیتیک اتوایمون و واکنش انتقال خون." },
  { id: "crossmatch", fa: "کراس‌مچ", en: "Crossmatch", cat: "bank", sp: "خون گیرنده + واحد خون", unit: "سازگار/ناسازگار", ref: "سازگار", sig: "تأیید نهایی سازگاری پیش از انتقال خون." },
  { id: "rbc-pheno", fa: "فنوتایپ گلبول‌های قرمز", en: "RBC Phenotyping", cat: "bank", sp: "خون کامل EDTA", unit: "آنتی‌ژن", ref: "—", sig: "Kell/Duffy/Kidd/MNS در بیماران چندبار انتقال‌یافته." },
  { id: "weakd", fa: "Rh ضعیف (Weak D)", en: "Weak D Testing", cat: "bank", sp: "خون کامل EDTA", unit: "مثبت/منفی", ref: "—", sig: "افتراق فنوتیپ Weak D؛ تصمیم Rh دادن." },
  { id: "nb-bilirubin", fa: "همولیز نوزادی (DAT نوزاد)", en: "Neonatal Hemolysis Panel", cat: "bank", sp: "خون نوزاد + مادر", unit: "DAT", ref: "DAT منفی", sig: "هیپربیلی‌روبینیمی نوزاد؛ ناسازگاری ABO/Rh." },
];
