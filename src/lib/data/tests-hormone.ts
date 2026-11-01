import type { LabTest } from "../nima-types";

export const TESTS_HORMONE: LabTest[] = [
  // --- Thyroid ---
  { id: "tsh", fa: "TSH", en: "Thyroid Stimulating Hormone", cat: "hormone", sp: "سرم", unit: "mIU/L", ref: "۰/۴۵–۴/۵", sig: "حساس‌ترین آزمایش اولیه تیروئید؛ آینه FT4 از طریق محور هیپوفیزی.", intr: "بایوتین بالا TSH را کاذب کم و FT4 را کاذب زیاد می‌کند؛ آنتی‌بادی هتروفیل مداخله دارد." },
  { id: "ft4", fa: "FT4", en: "Free T4", cat: "hormone", sp: "سرم", unit: "ng/dL", ref: "۰/۸–۱/۸", sig: "تیروکسین آزاد فعال؛ تشخیص هیپو/هایپرتیروئیدی واقعی.", intr: "بایوتین، هپارین و فارنوسیتون جواب FT4 را بالا می‌برند." },
  { id: "tt4", fa: "T4 توتال", en: "Total T4", cat: "hormone", sp: "سرم", unit: "µg/dL", ref: "۴/۵–۱۱/۷", sig: "کل T4 متصل و آزاد؛ وابسته به TBG (بارداری/OCP بالا می‌برد)." },
  { id: "ft3", fa: "FT3", en: "Free T3", cat: "hormone", sp: "سرم", unit: "pg/mL", ref: "۲/۳–۴/۲", sig: "هورمون فعال‌ترین تیروئید؛ در توکسیکوز T3-محور بالا." },
  { id: "tt3", fa: "T3 توتال", en: "Total T3", cat: "hormone", sp: "سرم", unit: "ng/dL", ref: "۸۰–۱۷۰", sig: "اندازه‌گیری T3 کل؛ در بیماری‌های غیرتیروئیدی کم می‌شود." },
  { id: "tgab", fa: "آنتی‌بادی تیروگلوبولین", en: "Anti-Thyroglobulin (TG-Ab)", cat: "hormone", sp: "سرم", unit: "IU/mL", ref: "منفی", sig: "آتوایمیونی تیروئید (هایشیموتو)؛ مداخله سنجش تیروگلوبولین." },
  { id: "tpoab", fa: "آنتی‌بادی TPO", en: "Anti-TPO Antibody", cat: "hormone", sp: "سرم", unit: "IU/mL", ref: "منفی", sig: "شایع‌ترین مارکر تیروئیدیت آتوایمیون؛ پیش‌بینی هیپوتیروئیدی." },
  { id: "trab", fa: "آنتی‌بادی TSH-R (TRAb)", en: "TSH Receptor Antibody", cat: "hormone", sp: "سرم", unit: "IU/L", ref: "منفی", sig: "تأیید گریوز؛ پیش‌بینی عود و مادری/جنینی." },
  { id: "thyroglobulin", fa: "تیروگلوبولین", en: "Thyroglobulin", cat: "hormone", sp: "سرم", unit: "ng/mL", ref: "<۳ (پس از تیروئیدکتومی)", sig: "پایش عود کارسینوم پاپیلاری/فولیکولار پس از درمان.", intr: "TG-Ab موجود جواب را کاذب کم می‌کند." },
  { id: "calcitonin", fa: "کلسی‌تونین", en: "Calcitonin", cat: "hormone", sp: "سرم", unit: "pg/mL", ref: "مرد <۸/۴، زن <۵/۰", sig: "مارکر کارسینوم مدولار تیروئید (C-cell)." },
  // --- Parathyroid / Bone ---
  { id: "pth", fa: "PTH (پاراتورمون)", en: "Intact PTH", cat: "hormone", sp: "سرم", unit: "pg/mL", ref: "۱۵–۶۵", sig: "تشخیص هایپرپاراتیروئیدی اولیه/ثانویه؛ با کلسیم و ویتامین D.", intr: "نمونه باید سرد و سریع پردازش شود." },
  { id: "osteocalcin", fa: "اوستئوکالسین", en: "Osteocalcin", cat: "hormone", sp: "سرم", unit: "ng/mL", ref: "۱۱–۴۶", sig: "مارکر تشکیل استخوان؛ پایش استئوپوروز." },
  // --- Adrenal ---
  { id: "cortisol-am", fa: "کورتیزول صبحگاهی", en: "Cortisol (8 AM)", cat: "hormone", sp: "سرم", unit: "µg/dL", ref: "۶–۲۳ (۸ صبح)", sig: "پایه محور HPA؛ کمتر از ۵ با ACTH پایین → نارسایی فوق‌کلیوی محتمل.", intr: "استرس، خواب نامنظم و OCP جواب را بالا می‌برند." },
  { id: "cortisol-pm", fa: "کورتیزول عصرگاهی", en: "Cortisol (4 PM)", cat: "hormone", sp: "سرم", unit: "µg/dL", ref: "۳–۱۲", sig: "ریتم شبانه‌روزی؛ از بین رفتن نوسان نشانه سندرم کوشینگ." },
  { id: "acth", fa: "ACTH", en: "Adrenocorticotropic Hormone", cat: "hormone", sp: "سرم (یخ، فوری)", unit: "pg/mL", ref: "۱۰–۶۰", sig: "تفریق کوشینگ مرکزی/فوق‌کلیوی و نارسایی اولیه/ثانویه." },
  { id: "aldosterone", fa: "آلدوسترون", en: "Aldosterone", cat: "hormone", sp: "سرم/پلاسما", unit: "ng/dL", ref: "۳–۲۳ (ناشتا، نشسته)", sig: "هایپرآلدوسترونیسم اولیه در فشارخون مقاوم؛ با رنین." },
  { id: "renin", fa: "رنین", en: "Renin Activity", cat: "hormone", sp: "پلاسما (EDTA یخ)", unit: "ng/mL/h", ref: "۰/۲۵–۵/۸۲", sig: "نسبت آلدوسترون/رنین >30 → هایپرآلدوسترونیسم اولیه." },
  { id: "dheas", fa: "DHEA-S", en: "DHEA Sulfate", cat: "hormone", sp: "سرم", unit: "µg/dL", ref: "مرد ۸۰–۵۶۰، زن ۳۵–۴۳۰", sig: "منشا فوق‌کلیوی آندروژن؛ تومور فوق‌کلیوی در هایپرآندروژنیسم شدید." },
  { id: "17ohp", fa: "۱۷-اوپروژسترون", en: "17-Hydroxyprogesterone", cat: "hormone", sp: "سرم", unit: "ng/dL", ref: "<۱۰۰ (فولیکولار)", sig: "غربالگری هیپرپلازی فوق‌کلیوی مادرزادی (CAH)." },
  { id: "androstenedione", fa: "آندروستندیون", en: "Androstenedione", cat: "hormone", sp: "سرم", unit: "ng/dL", ref: "۶۰–۳۰۰ (زن)", sig: "آندروژن فوق‌کلیوی/غددی؛ در PCOS و CAH بالا." },
  // --- Pituitary ---
  { id: "gh", fa: "هورمون رشد (GH)", en: "Growth Hormone", cat: "hormone", sp: "سرم", unit: "ng/mL", ref: "<۵ (ناشتا، سن‌محور)", sig: "آکرومگالی/ژانتیسم؛ با IGF-1 و تست تحریک." },
  { id: "igf1", fa: "IGF-1", en: "Insulin-like Growth Factor 1", cat: "hormone", sp: "سرم", unit: "ng/mL", ref: "سن‌محور", sig: "شاخص پایدار GH؛ تشخیص آکرومگالی و ارزیابی GH کمبود." },
  { id: "prolactin", fa: "پرولاکتین", en: "Prolactin", cat: "hormone", sp: "سرم", unit: "ng/mL", ref: "مرد ۴–۲۳، زن ۴–۲۹", sig: "گالاکتوره و بی‌تقارنی؛ استرس و بارداری بالا می‌برند.", intr: "ماکروپرولاکتینمی: dilution/POLY-PEG بررسی شود؛ استرس نمونه‌گیری جعل بالا." },
  // --- Reproductive ---
  { id: "fsh", fa: "FSH", en: "Follicle Stimulating Hormone", cat: "hormone", sp: "سرم", unit: "mIU/mL", ref: "روز ۳: ۳–۱۰؛ یائسگی >۳۰", sig: "ذخیره تخمدان و نارسایی بیضه/تخمدان؛ با LH تفسیر شود.", f: "fsh-lh" },
  { id: "lh", fa: "LH", en: "Luteinizing Hormone", cat: "hormone", sp: "سرم", unit: "mIU/mL", ref: "روز ۳: ۲–۱۰؛ اوولاسیون: پیک", sig: "پیک اوولاسیون و محور هیپوفیز-گناد.", f: "fsh-lh" },
  { id: "e2", fa: "استرادیول", en: "Estradiol (E2)", cat: "hormone", sp: "سرم", unit: "pg/mL", ref: "فولیکولار ۲۰–۱۵۰؛ اوولاسیون ۲۰۰–۴۰۰", sig: "پایش IVF، بلوغ و یائسگی." },
  { id: "prog", fa: "پروژسترون", en: "Progesterone", cat: "hormone", sp: "سرم", unit: "ng/mL", ref: "فولیکولار <۱؛ لوتئال >۵", sig: "تأیید اوولاسیون (روز ۲۱) و پایش حاملگی زودرس." },
  { id: "testost-t", fa: "تستوسترون توتال", en: "Total Testosterone", cat: "hormone", sp: "سرم (صبح)", unit: "ng/dL", ref: "مرد ۳۰۰–۱۰۰۰؛ زن <۷۰", sig: "بازرسی هیپرآندروژنیسم و هیپوگنادیسم؛ با SHBG آزاد محاسبه شود.", intr: "SHBG (OCP، چاقی، هیپوتیروئیدی) تفسیر توتال را خراب می‌کند." },
  { id: "testost-f", fa: "تستوسترون آزاد", en: "Free Testosterone", cat: "hormone", sp: "سرم", unit: "pg/mL", ref: "مرد ۹–۳۰، زن ۰/۳–۲", sig: "شکل فعال؛ در PCOS و هایپوگنادیسم حساس‌تر از توتال." },
  { id: "shbg", fa: "SHBG", en: "Sex Hormone Binding Globulin", cat: "hormone", sp: "سرم", unit: "nmol/L", ref: "مرد ۱۰–۵۷، زن ۱۸–۱۴۴", sig: "حامل تستوسترون؛ در PCOS پایین و هیپرتیروئیدی بالا." },
  { id: "inhibinb", fa: "اینهیبین B", en: "Inhibin B", cat: "hormone", sp: "سرم", unit: "pg/mL", ref: "مرد ۵۰–۳۵۰", sig: "عملکرد سلول سرتولی؛ پایش اسپرماتوژنز و IVF." },
  { id: "amh", fa: "AMH", en: "Anti-Müllerian Hormone", cat: "hormone", sp: "سرم", unit: "ng/mL", ref: "زن ۰/۷–۴ (سن‌محور)", sig: "ذخیره تخمدان؛ در PCOS بالا و نارسایی زودرس پایین." },
  { id: "bhcg", fa: "β-hCG کمی", en: "Beta-hCG Quantitative", cat: "hormone", sp: "سرم", unit: "mIU/mL", ref: "غیر باردار <۵", sig: "حاملگی، حاملگی خارج‌رحمی و تومورهای جفتی؛ پایش سری با دلتا-تایم.", f: "hcg-doubling", hot: "ممکن است در حاملگی مولار/سرطان بسیار بالا باشد" },
];
