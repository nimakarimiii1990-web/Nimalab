"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { 
  FileStack, 
  Plus, 
  Trash2, 
  FileText, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  X,
  Upload
} from "lucide-react";

interface BrochureItem {
  id: string;
  title: string;
  device: string;
  category: string;
  fileUrl: string;
  dateAdded: string;
}

const DEFAULT_BROCHURES: BrochureItem[] = [
  {
    id: "1",
    title: "کاتالوگ و راهنمای کاربری Cobas c311",
    device: "Roche Cobas c311",
    category: "Biochemistry",
    fileUrl: "/brochures/cobas-c311.pdf",
    dateAdded: "2024-11-01",
  },
  {
    id: "2",
    title: "بروشور کنترل کیفی و کالیبراتور بیوشیمی",
    device: "General Lab",
    category: "Quality Control",
    fileUrl: "/brochures/qc-guide.pdf",
    dateAdded: "2024-10-25",
  }
];

export function BrochuresView({ go }: { go: (r: string) => void }) {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<BrochureItem[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // فیلدهای فرم افزودن
  const [title, setTitle] = useState("");
  const [device, setDevice] = useState("");
  const [category, setCategory] = useState("Biochemistry");
  const [fileUrl, setFileUrl] = useState("");

  // بارگذاری لیست از حافظه
  useEffect(() => {
    const saved = localStorage.getItem("nima_brochures");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems(DEFAULT_BROCHURES);
      }
    } else {
      setItems(DEFAULT_BROCHURES);
    }
  }, []);

  // ذخیره سازی
  const saveItems = (newItems: BrochureItem[]) => {
    setItems(newItems);
    localStorage.setItem("nima_brochures", JSON.stringify(newItems));
  };

  // افزودن بروشور جدید (فقط ادمین)
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileUrl) return;

    const newItem: BrochureItem = {
      id: Date.now().toString(),
      title,
      device: device || "General",
      category,
      fileUrl: fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`,
      dateAdded: new Date().toISOString().split("T")[0],
    };

    saveItems([newItem, ...items]);
    setIsModalOpen(false);
    setTitle("");
    setDevice("");
    setFileUrl("");
  };

  // حذف بروشور (فقط ادمین)
  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این بروشور اطمینان دارید؟")) {
      const filtered = items.filter((item) => item.id !== id);
      saveItems(filtered);
    }
  };

  const filteredItems = items.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.device.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
              <FileStack className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">بروشورها و کاتالوگ‌های آزمایشگاهی</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                دانلود بروشورهای کیت‌ها، دستگاه‌ها و دستورالعمل‌های کنترل کیفی
              </p>
            </div>
          </div>
        </div>

        {/* دکمه ادمین برای افزودن فایل */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن بروشور (PDF)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>فقط ادمین قابلیت آپلود و ویرایش دارد</span>
            </div>
          )}
        </div>
      </div>

      {/* سرچ‌بار */}
      <div className="mb-6 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی نام بروشور، دستگاه یا بخش..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      {/* کارت‌های فایل‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="border border-slate-200 hover:border-sky-300 rounded-2xl p-5 bg-white shadow-sm hover:shadow transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-md">
                  {item.category}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                    title="حذف بروشور"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2">{item.title}</h3>
              <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                <span>دستگاه/کیت:</span>
                <b className="text-slate-700">{item.device}</b>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
              <span className="text-[11px] text-slate-400">{item.dateAdded}</span>
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline bg-sky-50 px-3 py-1.5 rounded-lg"
              >
                <FileText className="w-4 h-4" />
                <span>دانلود / مشاهده PDF</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* فرم مدال افزودن فایل مخصوص ادمین */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-sky-600" />
              افزودن بروشور جدید
            </h3>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">عنوان بروشور</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: راهنمای آنالایزر بیوشیمی کوباس"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">دستگاه یا کیت مربوطه</label>
                <input
                  type="text"
                  placeholder="مثلاً: Roche Cobas c311"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">بخش آزمایشگاه</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 outline-none"
                >
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Hematology">Hematology</option>
                  <option value="Hormone">Hormone</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Coagulation">Coagulation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  نام فایل یا آدرس PDF
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: /brochures/my-file.pdf یا لینک مستقیم اینترنتی"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 outline-none text-left ltr"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  فایل PDF خود را در پوشه <code className="text-sky-700 font-bold">public/brochures</code> کپی کنید و نام آن را اینجا بنویسید.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow transition-all"
                >
                  ذخیره و انتشار بروشور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}