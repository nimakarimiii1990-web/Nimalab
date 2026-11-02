"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { 
  Settings2, 
  Plus, 
  Trash2, 
  FileText, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  X,
  Sliders,
  CheckCircle2
} from "lucide-react";

interface ParameterItem {
  id: string;
  testName: string;      // نام تست مثلا Glucose
  analyzer: string;      // نام دستگاه مثلا Cobas c311
  wavelength: string;    // طول موج مثلا 505 nm
  sampleVol: string;     // حجم نمونه مثلا 3 uL
  reagentVol: string;    // حجم معرف مثلا 250 uL
  pdfUrl?: string;       // آدرس فایل PDF برگه پارامتر (اختیاری)
  updatedAt: string;
}

// دیتای پیش‌فرض اولیه
const DEFAULT_PARAMS: ParameterItem[] = [
  {
    id: "1",
    testName: "Glucose (GLUC)",
    analyzer: "Roche Cobas c311",
    wavelength: "505 / 700 nm",
    sampleVol: "2 µL",
    reagentVol: "200 µL",
    pdfUrl: "/parameters/cobas-biochem-params.pdf",
    updatedAt: "2024-11-01",
  },
  {
    id: "2",
    testName: "SGPT / ALT",
    analyzer: "Mindray BS-200",
    wavelength: "340 nm",
    sampleVol: "10 µL",
    reagentVol: "200 µL",
    pdfUrl: "",
    updatedAt: "2024-10-20",
  },
  {
    id: "3",
    testName: "Urea (BUN)",
    analyzer: "BT 3000 Plus",
    wavelength: "340 nm",
    sampleVol: "3 µL",
    reagentVol: "250 µL",
    pdfUrl: "",
    updatedAt: "2024-10-15",
  }
];

export function ParamsView({ go }: { go: (r: string) => void }) {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<ParameterItem[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // فیلدهای فرم افزودن پارامتر جدید
  const [testName, setTestName] = useState("");
  const [analyzer, setAnalyzer] = useState("");
  const [wavelength, setWavelength] = useState("");
  const [sampleVol, setSampleVol] = useState("");
  const [reagentVol, setReagentVol] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  // خواندن اطلاعات ذخیره شده
  useEffect(() => {
    const saved = localStorage.getItem("nima_parameters");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems(DEFAULT_PARAMS);
      }
    } else {
      setItems(DEFAULT_PARAMS);
    }
  }, []);

  const saveItems = (newItems: ParameterItem[]) => {
    setItems(newItems);
    localStorage.setItem("nima_parameters", JSON.stringify(newItems));
  };

  // ثبت پارامتر جدید (فقط ادمین)
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName || !analyzer) return;

    const newItem: ParameterItem = {
      id: Date.now().toString(),
      testName,
      analyzer,
      wavelength: wavelength || "-",
      sampleVol: sampleVol || "-",
      reagentVol: reagentVol || "-",
      pdfUrl: pdfUrl ? (pdfUrl.startsWith("/") ? pdfUrl : `/${pdfUrl}`) : "",
      updatedAt: new Date().toISOString().split("T")[0],
    };

    saveItems([newItem, ...items]);
    setIsModalOpen(false);

    // پاک کردن فرم
    setTestName("");
    setAnalyzer("");
    setWavelength("");
    setSampleVol("");
    setReagentVol("");
    setPdfUrl("");
  };

  // حذف پارامتر (فقط ادمین)
  const handleDelete = (id: string) => {
    if (confirm("آیا مطمئن هستید که این پارامتر حذف شود؟")) {
      const filtered = items.filter((item) => item.id !== id);
      saveItems(filtered);
    }
  };

  const filteredItems = items.filter(
    (p) =>
      p.testName.toLowerCase().includes(search.toLowerCase()) ||
      p.analyzer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">پارامترهای آنالایزرهای آزمایشگاهی</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                تنظیمات فنی تست‌ها، طول موج، حجم نمونه، حجم معرف و فایل‌های PDF پارامتر
              </p>
            </div>
          </div>
        </div>

        {/* دکمه اختصاصی ادمین */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن پارامتر جدید</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>فقط ادمین مجاز به ثبت و تغییر پارامترهاست</span>
            </div>
          )}
        </div>
      </div>

      {/* جستجو */}
      <div className="mb-6 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی نام تست (مثلاً Glucose) یا دستگاه..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      {/* جدول نمایش پارامترها */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <th className="py-3 px-4">نام تست</th>
              <th className="py-3 px-4">آنالایزر / دستگاه</th>
              <th className="py-3 px-4">طول موج (Wavelength)</th>
              <th className="py-3 px-4">حجم نمونه</th>
              <th className="py-3 px-4">حجم معرف</th>
              <th className="py-3 px-4">فایل برگه پارامتر</th>
              {isAdmin && <th className="py-3 px-4 text-center">عملیات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">{item.testName}</td>
                <td className="py-3 px-4">
                  <span className="inline-block bg-sky-50 text-sky-800 border border-sky-100 text-xs font-semibold px-2 py-0.5 rounded">
                    {item.analyzer}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 font-mono text-xs">{item.wavelength}</td>
                <td className="py-3 px-4 text-slate-600 font-mono text-xs">{item.sampleVol}</td>
                <td className="py-3 px-4 text-slate-600 font-mono text-xs">{item.reagentVol}</td>
                <td className="py-3 px-4">
                  {item.pdfUrl ? (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>دانلود PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">ندارد</span>
                  )}
                </td>
                {isAdmin && (
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="حذف پارامتر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* فرم مدال افزودن پارامتر جدید مخصوص ادمین */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-sky-600" />
              افزودن پارامتر دستگاه جدید
            </h3>

            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">نام تست *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Glucose"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">نام دستگاه آنالایزر *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Roche Cobas c311"
                    value={analyzer}
                    onChange={(e) => setAnalyzer(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">طول موج</label>
                  <input
                    type="text"
                    placeholder="مثال: 505 nm"
                    value={wavelength}
                    onChange={(e) => setWavelength(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">حجم نمونه</label>
                  <input
                    type="text"
                    placeholder="مثال: 2 µL"
                    value={sampleVol}
                    onChange={(e) => setSampleVol(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">حجم معرف</label>
                  <input
                    type="text"
                    placeholder="مثال: 200 µL"
                    value={reagentVol}
                    onChange={(e) => setReagentVol(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  فایل برگه پارامتر PDF (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="مثال: /parameters/my-param.pdf"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 outline-none text-left ltr"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  اگر فایل PDF دارید داخل پوشه <code className="text-sky-700 font-bold">public/parameters</code> بگذارید و اسم آن را اینجا بنویسید.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ثبت و ذخیره پارامتر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}