import type { Category } from "../nima-types";

export const CATEGORIES: Category[] = [
  {
    id: "biochem",
    fa: "بیوشیمی بالینی",
    en: "Clinical Biochemistry",
    icon: "FlaskConical",
    desc: "الکترولیت‌ها، متابولیت‌ها، پروتئین‌ها، لیپیدها، قند و ویتامین‌ها",
  },
  {
    id: "enzyme",
    fa: "آنزیم‌ها",
    en: "Enzymes",
    icon: "Activity",
    desc: "آنزیم‌های کبدی، قلبی، پانکراسی و عضلانی",
  },
  {
    id: "cardiac",
    fa: "مارکرهای قلبی",
    en: "Cardiac Markers",
    icon: "HeartPulse",
    desc: "تروپونین، CK-MB، BNP و مارکرهای آسیب قلبی",
  },
  {
    id: "hormone",
    fa: "هورمون‌ها",
    en: "Hormones",
    icon: "Dna",
    desc: "تیروئید، غدد فوق‌کلیوی، هیپوفیز و تناسلی",
  },
  {
    id: "hematology",
    fa: "هماتولوژی",
    en: "Hematology",
    icon: "Droplets",
    desc: "CBC، رتیکولوسیت، هموگلوبینوپاتی، انگل خون و سیتومتری",
  },
  {
    id: "coag",
    fa: "انعقاد",
    en: "Coagulation",
    icon: "Timer",
    desc: "PT/INR، PTT، فیبرینوژن، D-dimer و فاکتورهای انعقادی",
  },
  {
    id: "immuno",
    fa: "ایمونولوژی و سرولوژی",
    en: "Immunology",
    icon: "ShieldPlus",
    desc: "اتوآنتی‌بادی‌ها، کمپلمنت، ایمونوگلوبولین‌ها و پروتئین‌های سرم",
  },
  {
    id: "viral",
    fa: "ویروس‌شناسی",
    en: "Virology",
    icon: "Bug",
    desc: "هپاتیت‌ها، HIV، CMV/EBV، آنفلوآنزا و سرولوژی ویروسی",
  },
  {
    id: "micro",
    fa: "میکروب‌شناسی",
    en: "Microbiology",
    icon: "Microscope",
    desc: "کشت‌ها، رنگ‌آمیزی، انگل‌شناسی، قارچ‌شناسی و سرولوژی باکتریایی",
  },
  {
    id: "molecular",
    fa: "مولکولی و ژنتیک",
    en: "Molecular & Genetics",
    icon: "Atom",
    desc: "PCR، وایرال‌لود، جهش‌ها، فارماکوژنومیک و کاریوتایپ",
  },
  {
    id: "tumor",
    fa: "مارکرهای توموری",
    en: "Tumor Markers",
    icon: "Target",
    desc: "AFP، CEA، PSA، CA ها و مارکرهای پایش سرطان",
  },
  {
    id: "urine",
    fa: "ادرار و مدفوع",
    en: "Urine & Stool",
    icon: "FlaskRound",
    desc: "آنالیز ادرار، پروتئین ۲۴ ساعته، سنگ و مدفوع",
  },
  {
    id: "tox",
    fa: "دارو و سم‌شناسی",
    en: "Drugs & Toxicology",
    icon: "Pill",
    desc: "سطح دارویی (TDM)، سموم، فلزات سنگین و غربالگری مواد",
  },
  {
    id: "bank",
    fa: "بانک خون",
    en: "Blood Banking",
    icon: "Building2",
    desc: "گروه خونی، کومبس، کراس‌مچ و غربالگری آنتی‌بادی",
  },
];

export const CAT_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);
