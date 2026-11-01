import type { Article, NewsItem, LabEvent } from "../nima-types";

const now = "2026-11-01";

export const SEED_ARTICLES: Article[] = [
  {
    id: "art-kdigo-2024",
    title: "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease",
    journal: "Kidney International",
    year: 2024,
    doi: "10.1016/j.kint.2023.10.018",
    pmid: "38468016",
    url: "https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf",
    summaryFa:
      "راهنمای جدید KDIGO: اگر سیستاتین C در دسترس است، رده‌بندی GFR باید با ترکیب کراتینین و سیستاتین C (eGFRcr-cys) انجام شود؛ فرمول CKD-EPI 2021 بدون فاکتور نژاد استاندارد رسمی است و آلبومینوری (ACR) فاکتور ریسک اصلی باقی می‌ماند.",
    tags: ["egfr", "crea", "cysc", "acr-test"],
    source: "seed",
    addedAt: now,
  },
  {
    id: "art-24ldl-2025",
    title: "Comparative Evaluation of 24 LDL-C Estimation Equations Against Direct Assays in Two Independent Cohorts",
    journal: "Diagnostics (Basel)",
    year: 2025,
    doi: "10.3390/diagnostics15182298",
    pmid: "41008672",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12468580/",
    summaryFa:
      "مقایسه ۲۴ فرمول LDL روی ۳۱٬۲۶۵ نمونه (Roche و Abbott): سوگیری فری‌دوالد ‎−۷/۴٪ تا ‎−۶/۶٪، مارتین–هاپکینز ‎−۵/۸٪ و سامسون ‎−۵/۵٪ تا ‎−۴/۹٪ بود؛ فرمول‌های کمترشناخته مثل Vujovic و Bauer دقت طبقه‌بندی بهتری داشتند اما جایگزینی فوری فری‌دوالد ضروری ارزیابی نشد.",
    tags: ["ldl", "tc", "tg", "hdl", "ldl-direct"],
    source: "seed",
    addedAt: now,
  },
  {
    id: "art-ldl-onboard-2025",
    title: "Why isn't everyone onboard yet with the new LDL-C equations?",
    journal: "PMC11903449 (2025)",
    year: 2025,
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11903449/",
    summaryFa:
      "مرور استدلال‌های موافق و مخالف جایگزینی فری‌دوالد با مارتین–هاپکینز/سامسون: سادگی و هزینه فری‌دوالد همچنان پذیرش جهانی را توضیح می‌دهد؛ مارتین–هاپکینز در LDL پایین و TG متوسط دقیق‌تر است ولی نیازمند جدول فاکتور و پلتفرم هماهنگ است.",
    tags: ["ldl", "ldl-friedewald"],
    source: "seed",
    addedAt: now,
  },
  {
    id: "art-biotin-2025",
    title: "An Overview of Biotin Interference Impact on Immunoassays",
    journal: "Cyprus Journal of Medical Sciences",
    year: 2025,
    doi: "10.4274/cjms.2025.2024-71",
    url: "https://cyprusjmedsci.com/articles/an-overview-of-biotin-interference-impact-on-immunoassays/cjms.2025.2024-71",
    summaryFa:
      "مرور مکانیسم مداخله بایوتین در ایمیونواسی‌ها: در تست‌های ساندویچی (TSH، هورمون‌ها) نتیجه کاذب پایین و در تست‌های رقابتی (FT4، FT3، تروپونین در برخی کیت‌ها) کاذب بالا می‌شود؛ توصیه: پرسش مصرف مکمل و توقف ۲–۷۲ ساعت پیش از نمونه‌گیری.",
    tags: ["tsh", "ft4", "ft3", "b12"],
    source: "seed",
    addedAt: now,
  },
  {
    id: "art-ada-2025",
    title: "Standards of Care in Diabetes—2025",
    journal: "Diabetes Care",
    year: 2025,
    url: "https://diabetesjournals.org/care/article/48/Supplement_1",
    summaryFa:
      "نسخه ۲۰۲۵ استانداردهای مراقبت دیابت ADA: تشخیص با FBS/A1c/OGTT، اهمیت پایش ACR سالانه و eGFR، و تأکید بر تعریف اهداف فردی HbA1c؛ eAG برای ترجمه A1c به میانگین قند روزانه کاربرد دارد.",
    tags: ["hba1c", "glu-fbs", "acr-test", "egfr"],
    source: "seed",
    addedAt: now,
  },
  {
    id: "art-pct-burn-2026",
    title: "The Diagnostic and Prognostic Value of Procalcitonin and High-Sensitivity C-Reactive Protein in Early-Stage Burn Sepsis",
    journal: "PMC (2026)",
    year: 2026,
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=procalcitonin+hs-CRP+burn+sepsis+2026",
    summaryFa:
      "مطالعه کوهورت ۲۰۲۶: در سپسیس سوختگی زودرس، ترکیب PCT و hs-CRP و IL-6 دقت تشخیصی و پیش‌آگهی بهتری نسبت به هر مارکر تنها دارد؛ PCT برای شروع سریع آنتی‌بیوتیک راهنما است.",
    tags: ["pct", "hs-crp"],
    source: "seed",
    addedAt: now,
  },
  {
    id: "art-pct-abx-2026",
    title: "Procalcitonin-guided antibiotic therapy in adult sepsis: A biochemical perspective from a retrospective cohort study",
    journal: "PMC (2026)",
    year: 2026,
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=procalcitonin-guided+antibiotic+therapy+sepsis+2026",
    summaryFa:
      "درمان آنتی‌بیوتیکی راهنما با پروکلسیتونین: کاهش روزهای مصرف آنتی‌بیوتیک بدون افزایش مرگ‌ومیر؛ الگوریتم قطع درمان بر اساس افت روزانه PCT بیش از ۸۰٪ از اوج، کاربرد عملی در ICU دارد.",
    tags: ["pct"],
    source: "seed",
    addedAt: now,
  },
  {
    id: "art-sigma-2024",
    title: "Application of Six Sigma Metrics for assessing the quality management of biochemical analytes in the clinical laboratory",
    journal: "(December 2024, Westgard QC bibliography)",
    year: 2024,
    url: "https://www.westgard.com/resources/resources/six-sigma-papers.html",
    summaryFa:
      "کاربرد متریک‌های شش‌سیگما برای ارزیابی کیفیت آنالیت‌های بیوشیمی: سیگما = (TEa − bias) / CV؛ آنالیت‌های با سیگما ≥۶ فقط قاعده ۱-۳s کافی دارند و در سیگما <۴ کنترل سخت‌گیرتر و حداقل ۲ سطح کنترل لازم است.",
    tags: ["qc", "sigma"],
    source: "seed",
    addedAt: now,
  },
];

export const SEED_NEWS: NewsItem[] = [
  {
    id: "news-roche-adlm-2026",
    titleFa: "روچ در ADLM 2026: راهکارهای آزمایشگاه هوشمند و دستگاه‌های پرسیتولیتی جدید",
    summaryFa:
      "روچ در گردهمایی ADLM 2026 (ایالات متحده) راهکارهای اتوماسیون هوشمند و مجموعه cobas pro با واحدهای آنالیزی cobas c 703 و ISE neo را برای کاهش فشار نیروی کار آزمایشگاه‌ها معرفی کرد.",
    sourceName: "Roche Diagnostics",
    url: "https://diagnostics.roche.com/us/en/news-listing/2026/intelligent-lab-solutions-high-precision-instruments-adlm-2026.html",
    date: "2026-07-22",
    source: "seed",
  },
  {
    id: "news-cobas-703",
    titleFa: "راهنمای مقایسه آنالایزرهای بیوشیمی ۲۰۲۶: cobas pro با ۳۳ پیکربندی",
    summaryFa:
      "طبق راهنمای Clinical Laboratory Products در سال ۲۰۲۶، سامانه cobas pro برای آزمایشگاه‌های میان‌تا-بالابدهی تا ۸٬۱۰۰ تست/ساعت ارائه می‌شود؛ نگهداری خودکار و cobas AutoCal کارایی را افزایش می‌دهد.",
    sourceName: "Clinical Lab Products (CLP)",
    url: "https://clpmag.com/resource-center/comparison-guides/2026-clinical-chemistry-analyzers-comparison-guide",
    date: "2026-05-01",
    source: "seed",
  },
  {
    id: "news-caredx-ivdr",
    titleFa: "کارت‌دکس: گواهی IVDR برای AlloSeq Tx و QTYPE دریافت کرد",
    summaryFa:
      "شرکت CareDx در گردهمایی ASHI 2025 اعلام کرد تست‌های تایپ HLA و پایش پیوند با NGS، گواهی IVDR اروپا را دریافت کرده‌اند؛ این یعنی دسترسی گسترده‌تر به آزمون‌های NGS-based در بازار اروپا.",
    sourceName: "CareDx (GlobeNewswire)",
    url: "https://www.globenewswire.com/news-release/2025/10/06/",
    date: "2025-10-06",
    source: "seed",
  },
  {
    id: "news-alivedx-autoimmune",
    titleFa: "AliveDx (منارینی) راهکار یکپارچه اتوایمیون‌شناسی با MosaiQ معرفی کرد",
    summaryFa:
      "برند جدید دیاگنوستیک گروه منارینی با نام AliveDx (پیش‌تر Menarini Diagnostics) پلتفرم MosaiQ AioloQ و LumiQ IFA را برای اتوایمیون‌شناسی خودکار و دقیق عرضه کرد.",
    sourceName: "AliveDx / ANP Persportaal",
    url: "https://persportaal.anp.nl/artikel/CSN-300724055/",
    date: "2024-07-30",
    source: "seed",
  },
  {
    id: "news-westgard-sigma-bib",
    titleFa: "بایوگرافی متریک سیگما وستگارد به ۲۳۰+ مقاله رسید (آپدیت سپتامبر ۲۰۲۶)",
    summaryFa:
      "کتابخانه آنلاین وستگارد مرجع متریک سیگما را با بیش از ۲۳۰ مقاله از ۹۰ ژورنال به‌روزرسانی کرد؛ HbA1c بیشترین استانداردسازی با سیگما را در میان آنالیت‌ها دارد.",
    sourceName: "Westgard QC",
    url: "https://www.westgard.com/resources/resources/six-sigma-papers.html",
    date: "2026-09-04",
    source: "seed",
  },
];

export const SEED_EVENTS: LabEvent[] = [
  {
    id: "evt-medica-2026",
    titleFa: "MEDICA 2026 — بزرگ‌ترین نمایشگاه فناوری پزشکی جهان",
    en: "MEDICA 2026",
    city: "دوسلدورف",
    country: "آلمان",
    dateStart: "2026-11-16",
    dateEnd: "2026-11-19",
    site: "https://www.medica-tradefair.com",
    descFa:
      "تالارهای تجهیزات آزمایشگاهی و دیاگنوستیک دروازه اصلی بازار جهانی IVD هستند؛ MEDICA 2026 از ۱۶ تا ۱۹ نوامبر ۲۰۲۶ برگزار می‌شود (تأیید رسمی).",
    verified: true,
    source: "seed",
  },
  {
    id: "evt-iranlab-2026",
    titleFa: "چهاردهمین نمایشگاه «ایران‌ساخت» تجهیزات و مواد آزمایشگاهی",
    en: "Iran LabExpo 1405",
    city: "تهران",
    country: "ایران",
    dateStart: "2026-12-17",
    dateEnd: "2026-12-20",
    site: "https://iranlabexpo.ir",
    descFa:
      "۲۶ تا ۲۹ آذر ۱۴۰۵ در محل دائمی نمایشگاه‌های بین‌المللی تهران؛ بزرگ‌ترین رویداد سالانه صنعت IVD ایران با شرکت تولیدکنندگان داخلی کیت و دستگاه (تأیید خبر رسمی دبیرخانه).",
    verified: true,
    source: "seed",
  },
  {
    id: "evt-whx-dubai-2027",
    titleFa: "WHX Dubai 2027 (پیش‌تر Arab Health)",
    en: "WHX Dubai 2027 — formerly Arab Health",
    city: "دبی",
    country: "امارات",
    dateStart: "2027-01-25",
    dateEnd: "2027-01-28",
    site: "https://www.worldhealthexpo.com",
    descFa:
      "بزرگ‌ترین نمایشگاه سلامت جهان از ۲۵ تا ۲۸ ژانویه ۲۰۲۷ با بخش ویژه تجهیزات آزمایشگاهی بالینی (تأیید رسمی).",
    verified: true,
    source: "seed",
  },
  {
    id: "evt-whx-labs-2027",
    titleFa: "WHX Labs Dubai 2027 (پیش‌تر Medlab Middle East)",
    en: "WHX Labs Dubai 2027",
    city: "دبی",
    country: "امارات",
    dateStart: "2027-02-08",
    dateEnd: "2027-02-11",
    site: "https://www.worldhealthexpo.com/events/healthcare/whx-labs-dubai",
    descFa:
      "نمایشگاه تخصصی دیاگنوستیک و آزمایشگاهی منطقه؛ برگزار کننده تاریخ دقیق ۲۰۲۷ را در سایت رسمی منتشر می‌کند (تاریخ تقریبی بر اساس الگوی سالانه، به‌روزرسانی شود).",
    verified: false,
    source: "seed",
  },
  {
    id: "evt-adlm-2027",
    titleFa: "ADLM 2027 — گردهمایی سالانه آزمایشگاه و پزشکی تشخیصی",
    en: "ADLM 2027 Annual Scientific Meeting & Clinical Lab Expo",
    city: "شیکاگو",
    country: "آمریکا",
    dateStart: "2027-07-25",
    dateEnd: "2027-07-29",
    site: "https://meeting.myadlm.org",
    descFa:
      "برایست‌ترین گردهمایی علمی پزشکی آزمایشگاهی از ۲۵ تا ۲۹ ژوئیه ۲۰۲۷ در McCormick Place شیکاگو (تأیید رسمی ADLM).",
    verified: true,
    source: "seed",
  },
];
