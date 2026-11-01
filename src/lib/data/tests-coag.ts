import type { LabTest } from "../nima-types";

export const TESTS_COAG: LabTest[] = [
  { id: "pt", fa: "PT", en: "Prothrombin Time", cat: "coag", sp: "سیترات (نسبت ۹:۱)", unit: "ثانیه", ref: "۱۱–۱۳/۵", sig: "مسیر اکسترینسک و فاکتورهای I,II,V,VII,X؛ پایش وارفارین.", f: "inr", intr: "نسبت نادرست لوله، هماتوکریت >55% و نمونه لخته‌شده جواب را خراب می‌کنند." },
  { id: "inr-calc", fa: "INR", en: "INR", cat: "coag", sp: "محاسباتی", unit: "—", ref: "طبیعی ≤۱/۱؛ وارفارین هدف ۲–۳", sig: "استانداردسازی PT بین آزمایشگاه‌ها با ISI معرف.", f: "inr" },
  { id: "ptt", fa: "PTT", en: "Partial Thromboplastin Time", cat: "coag", sp: "سیترات", unit: "ثانیه", ref: "۲۵–۳۵", sig: "مسیر اینترینسک (VIII,IX,XI,XII)؛ پایش هپارین غیرکسره‌ای.", intr: "هپارین، LA و هموپلیا مخدوش می‌کنند." },
  { id: "tt", fa: "زمان ترومبین", en: "Thrombin Time", cat: "coag", sp: "سیترات", unit: "ثانیه", ref: "۱۵–۱۹", sig: "تبدیل فیبرینوژن به فیبرین؛ هپارین/افلاگلوبینوژنمی طولانی می‌کند." },
  { id: "fib", fa: "فیبرینوژن", en: "Fibrinogen", cat: "coag", sp: "سیترات", unit: "mg/dL", ref: "۲۰۰–۴۰۰", sig: "فاکتور I؛ در DIC کم و فاز حاد بالا." },
  { id: "ddimer", fa: "D-dimer", en: "D-dimer", cat: "coag", sp: "سیترات", unit: "µg/mL FEU", ref: "<۰/۵", sig: "محصول شکست فیبرین؛ رد کردن VTE/DIC با حساسیت بالا.", intr: "بعد از جراحی، بارداری، سن بالا و التهاب کاذب بالا می‌رود." },
  { id: "fdp", fa: "FDP", en: "Fibrin Degradation Products", cat: "coag", sp: "سیترات", unit: "µg/mL", ref: "<۵", sig: "فیبرینولیز؛ در DIC و فیبرینولیز اولیه بالا." },
  { id: "at3", fa: "آنتی‌ترومبین III", en: "Antithrombin III", cat: "coag", sp: "سیترات", unit: "%", ref: "۸۰–۱۲۰", sig: "ترومبوفیلی ارثی؛ مقاومت به هپارین در کمبود." },
  { id: "protc", fa: "پروتئین C", en: "Protein C", cat: "coag", sp: "سیترات", unit: "%", ref: "۷۰–۱۴۰", sig: "تنظیم‌کننده آنتی‌کوآگولانت؛ کمبود → ترومبوز." },
  { id: "prots", fa: "پروتئین S", en: "Protein S", cat: "coag", sp: "سیترات", unit: "%", ref: "۶۵–۱۴۰ (آزاد)", sig: "کوفاکتور پروتئین C؛ در بارداری/OCP کم می‌شود." },
  { id: "la", fa: "آنتی‌کوآگولانت لوپوسی", en: "Lupus Anticoagulant", cat: "coag", sp: "سیترات", unit: "نسبت", ref: "منفی", sig: "ترومبوز و سقط مکرر؛ PTT طولانی با تصحیح مخلوط." },
  { id: "mixing", fa: "مطالعه مخلوط", en: "Mixing Study", cat: "coag", sp: "سیترات", unit: "کیفی", ref: "تصحیح کامل PTT", sig: "افتراق نقص فاکتور (تصحیح) از مهارکننده (عدم تصحیح)." },
  { id: "factor-assay", fa: "سنجش فاکتور انعقادی", en: "Factor Assay", cat: "coag", sp: "سیترات", unit: "%", ref: "۷۰–۱۵۰", sig: "هموفیلی A/B و بیماری فون‌ویلبراند (سطح فاکتور)." },
  { id: "plasminogen", fa: "پلاسمینوژن", en: "Plasminogen", cat: "coag", sp: "سیترات", unit: "%", ref: "۸۰–۱۲۰", sig: "سیستم فیبرینولیتیک؛ کمبود نوع I/II." },
  { id: "bt", fa: "زمان خونریزی", en: "Bleeding Time", cat: "coag", sp: "in vivo", unit: "دقیقه", ref: "۲–۹", sig: "هموستاز اولیه؛ جای خود را به PFA داده است." },
  { id: "heparin-axa", fa: "آنتی Xa هپارین", en: "Anti-Xa Heparin Level", cat: "coag", sp: "سیترات", unit: "IU/mL", ref: "LMWH اوج: ۰/۵–۱/۰", sig: "پایش دقیق هپارین؛ جایگزین بهتر PTT در بیماران ICU." },
  { id: "platelet-agg", fa: "تجمع پلاکتی", en: "Platelet Aggregation", cat: "coag", sp: "PRP تازه", unit: "%", ref: "وابسته به آگونیست", sig: "برنارد-سولیه، گلانزمن‌ترومبا و اثر داروهای آنتی‌پلاکتی." },
];
