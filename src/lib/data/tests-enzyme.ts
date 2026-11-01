import type { LabTest } from "../nima-types";

export const TESTS_ENZYME: LabTest[] = [
  { id: "alt", fa: "ALT (SGPT)", en: "Alanine Aminotransferase", cat: "enzyme", sp: "سرم", unit: "U/L", ref: "مرد ۱۰–۴۰، زن ۷–۳۵", sig: "آنزیم اختصاصی‌تر کبد؛ در هپاتیت و NAFLD بالا می‌رود.", f: "de-ritis", intr: "ورزش سنگین و آسیب عضلانی کمی بالا می‌برد." },
  { id: "ast", fa: "AST (SGOT)", en: "Aspartate Aminotransferase", cat: "enzyme", sp: "سرم", unit: "U/L", ref: "۱۰–۳۵", sig: "کبد، قلب و عضله؛ نسبت AST/ALT الگوی آسیب را می‌گوید.", f: "de-ritis" },
  { id: "alp", fa: "ALP", en: "Alkaline Phosphatase", cat: "enzyme", sp: "سرم", unit: "U/L", ref: "۴۰–۱۲۹ (بزرگسال)", sig: "کولستانس و استخوان؛ در نوجوانان/بارداری فیزیولوژیک بالاست.", intr: "بعد از وعده چرب در گروه O می‌تواند کمی بالا برود (ایزوآنزیم اینتستینال)." },
  { id: "alp-iso", fa: "ایزوآنزیم ALP", en: "ALP Isoenzymes", cat: "enzyme", sp: "سرم", unit: "U/L", ref: "بستگی به فراکشن", sig: "جداسازی منشا کبدی/استخوانی/روده‌ای/پلاسنتار ALP." },
  { id: "ggt", fa: "GGT", en: "Gamma-Glutamyl Transferase", cat: "enzyme", sp: "سرم", unit: "U/L", ref: "مرد ۱۵–۷۳، زن ۵–۳۶", sig: "حساس‌ترین نشانگر آسیب الکل/کولستانس؛ ALP بالا را تفسیر می‌کند.", intr: "الکل و داروهای آنزیم‌درایور (فنی‌توئین) بالا می‌برند." },
  { id: "5nt", fa: "۵'-نوکلئوتیداز", en: "5'-Nucleotidase", cat: "enzyme", sp: "سرم", unit: "U/L", ref: "۲–۱۷", sig: "تأیید منشا کبدی ALP بالا (مخصوصاً در بارداری)." },
  { id: "ldh", fa: "LDH", en: "Lactate Dehydrogenase", cat: "enzyme", sp: "سرم", unit: "U/L", ref: "۱۲۰–۲۴۶", sig: "نشانگر عمومی بافت (کبد، قلب، همولیز، تومور)؛ در همولیز نمونه کاذب بالا.", intr: "همولیز شدید جواب کاذب بالا می‌دهد (آنزیم داخل RBC)." },
  { id: "amylase", fa: "آمیلاز", en: "Amylase", cat: "enzyme", sp: "سرم/ادرار", unit: "U/L", ref: "۲۵–۱۲۵ (سرم)", sig: "پانکراتیت حاد؛ ۳ برابر حد بالا با تصویر سازگار تشخیصی است.", intr: "بالا در پاروتید، روده، حاملگی خارج‌رحمی و ماکروآمیلازیمی." },
  { id: "lipase", fa: "لیپاز", en: "Lipase", cat: "enzyme", sp: "سرم", unit: "U/L", ref: "۱۳–۶۰", sig: "اختصاصی‌تر از آمیلاز برای پانکراتیت؛ ۳ برابر حد بالای تشخیصی.", intr: "در آسیب روده و کلیه کمی بالا می‌رود." },
  { id: "ace", fa: "ACE", en: "Angiotensin Converting Enzyme", cat: "enzyme", sp: "سرم", unit: "U/L", ref: "۸–۵۲", sig: "سارکوئیدوز و پایش درمان آن." },
  { id: "pche", fa: "پزودوکولین‌استراز", en: "Pseudocholinesterase", cat: "enzyme", sp: "سرم", unit: "U/L", ref: "۵۳۰۰–۱۲۹۲۰", sig: "مسمومیت ارگانوفسفره و حساسیت به سوکسینیل‌کولین." },
];

export const TESTS_CARDIAC: LabTest[] = [
  { id: "ck", fa: "کراتین کیناز (CK)", en: "Creatine Kinase", cat: "cardiac", sp: "سرم", unit: "U/L", ref: "مرد ۳۹–۳۰۸، زن ۲۶–۱۹۲", sig: "آسیب عضلانی قلب/اسکلتی؛ با CK-MB منشا مشخص می‌شود.", f: "ckmb-index", intr: "IM تزریق، ورزش سنگین و هیپوتیروئیدی بالا می‌برند." },
  { id: "ckmb", fa: "CK-MB (ماس)", en: "CK-MB Mass", cat: "cardiac", sp: "سرم", unit: "ng/mL", ref: "<۵ (روش‌محور)", sig: "نشانگر آسیب قلبی؛ بازگشت سریع‌تر از تروپونین برای تشخیص انفارکت مجدد.", f: "ckmb-index", intr: "CK-BB بالا و ماکرو-CK جواب را جعل می‌کنند؛ همولیز اثر ندارد." },
  { id: "tni", fa: "تروپونین I", en: "Troponin I", cat: "cardiac", sp: "سرم/پلاسما", unit: "ng/mL", ref: "<۰/۰۴ (کیت‌محور)", sig: "استاندارد طلایی آسیب میوکارد؛ ۱ ساعت پس از درد قابل اندازه‌گیری.", intr: "هیپوکلسمی و هپارین‌زدایی در برخی کیت‌ها مداخله دارند.", hot: "بالا با الگوی افزایش/کاهش = انفارکت" },
  { id: "tnt-hs", fa: "تروپونین T فوق‌حساس", en: "High-Sensitivity Troponin T", cat: "cardiac", sp: "سرم", unit: "ng/L", ref: "مرد <۲۲، زن <۱۴", sig: "کشف آسیب قلبی زودتر؛ اختلاف ۶ ساعت >50% → انفارکت حاد.", intr: "کلیه مزمن، سپسیس و سکته مغزی پایه تروپونین را بالا می‌برند (آسیب، نه انفارکت)." },
  { id: "myoglobin", fa: "میوگلوبین", en: "Myoglobin", cat: "cardiac", sp: "سرم", unit: "ng/mL", ref: "۱۲–۹۰", sig: "زودترین نشانگر آسیب عضله؛ اختصاص کم، برای ناتنی رد کردن." },
  { id: "bnp", fa: "BNP", en: "B-type Natriuretic Peptide", cat: "cardiac", sp: "خون کامل EDTA/سرم", unit: "pg/mL", ref: "<۱۰۰ نارسایی قلبی نامحتمل", sig: "تشخیص و پیش‌آگهی نارسایی قلبی؛ با نوباتین کاهش می‌یابد.", intr: "نتالیزلین (ARB/ARNI) BNP را بالا می‌برد؛ در این بیماران NT-proBNP بگیرید." },
  { id: "ntprobnp", fa: "NT-proBNP", en: "NT-proBNP", cat: "cardiac", sp: "سرم", unit: "pg/mL", ref: "<۳۰۰ رد کردن؛ سن‌محور", sig: "پایدارتر از BNP؛ راهنمای تشخیص و پایش درمان HF.", intr: "در چاقی جواب پایین‌تر و در کلیه بالاتر تفسیر شود." },
];
