"use client";
import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { FileStack, FileText, ExternalLink, Search, Download } from "lucide-react";

interface BrochureItem {
  id: string;
  title: string;
  device: string;
  category: string;
  fileUrl: string;
}

// لیست تمام فایل‌های PDF بروشور شما
const MY_BROCHURES: BrochureItem[] = [
  { id: "b1", title: "بروشور Micro Albumin", device: "BIOMEDIC", category: "Biochemistry", fileUrl: "/brochures/Micro_Albumin-BIOMEDIC-_-020906.pdf" },
  { id: "b2", title: "بروشور Phosphorus (فسفر)", device: "BIOMEDIC", category: "Biochemistry", fileUrl: "/brochures/Phosphorus-BIOMEDIC030820.pdf" },
  { id: "b3", title: "بروشور TP URINE (پروتئین ادرار)", device: "BIOMEDIC", category: "Biochemistry", fileUrl: "/brochures/TP URINE BIOMEDIC.pdf" },
  { id: "b4", title: "بروشور TRANSFERRIN (ترانسفرین)", device: "BIOMEDIC", category: "Immuno", fileUrl: "/brochures/TRANSFERRIN BIOMEDIC.pdf" },
  { id: "b5", title: "بروشور Total Bilirubin (بیلی‌روبین توتال)", device: "BIOMEDIC", category: "Biochemistry", fileUrl: "/brochures/Total Bilirubin.pdf" },
  { id: "b6", title: "بروشور Total Protein (پروتئین توتال)", device: "BIOMEDIC", category: "Biochemistry", fileUrl: "/brochures/Total_Protein-BIOMEDIC-_-021128.pdf" },
  { id: "b7", title: "بروشور Triglycerides (تری‌گلیسیرید)", device: "BIOMEDIC", category: "Biochemistry", fileUrl: "/brochures/Triglycerides-BIOMEDIC-_-021128.pdf" },
  { id: "b8", title: "بروشور Urea (اوره)", device: "BIOMEDIC", category: "Biochemistry", fileUrl: "/brochures/Urea-BIOMEDIC._030307.pdf" },
  { id: "b9", title: "بروشور Uric Acid (اسید اوریک)", device: "BIOMEDIC", category: "Biochemistry", fileUrl: "/brochures/Uric_Acid-BIOMEDIC._030603.pdf" },
  { id: "b10", title: "بروشور Zinc (روی)", device: "BIOMEDIC", category: "Biochemistry", fileUrl: "/brochures/Zinc-BIOMEDIC-_030820.pdf" },
];

export function BrochuresView({ go }: { go: (r: string) => void }) {
  const [search, setSearch] = useState("");

  const filtered = MY_BROCHURES.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.device.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* سربرگ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-100 text-sky-700 shadow-sm">
            <FileStack className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">بروشورها و کاتالوگ‌های کیت‌ها</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              مشاهده و دریافت فایل‌های راهنمای کیت‌های آزمایشگاهی Biomedic
            </p>
          </div>
        </div>

        {/* جستجو */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام کیت یا تست..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 outline-none"
          />
        </div>
      </div>

      {/* نمایش کارتی فایل‌های PDF بروشور */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="border border-slate-200 hover:border-sky-400 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-100">
                  {item.category}
                </span>
                <span className="text-xs font-semibold text-slate-500">{item.device}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-4 line-clamp-1">{item.title}</h3>
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <span className="text-[11px] text-slate-400">PDF آماده دانلود</span>
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-3.5 py-2 rounded-xl shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود بروشور</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}