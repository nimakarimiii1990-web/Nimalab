"use client";
import React, { useState } from "react";
import { Settings2, FileText, Download, Search, ExternalLink } from "lucide-react";

interface DeviceParamFile {
  id: string;
  analyzer: string;
  description: string;
  fileUrl: string;
}

// لیست تمام فایل‌های PDF پارامترهای دستگاه‌های شما
const MY_DEVICE_PARAMS: DeviceParamFile[] = [
  { id: "p1", analyzer: "Hitachi 917", description: "پارامترهای آنالایزر هیتاچی ۹۱۷", fileUrl: "/parameters/1. Hitachi_917_BIOMEDIC.pdf" },
  { id: "p2", analyzer: "Hitachi 911", description: "پارامترهای آنالایزر هیتاچی ۹۱۱", fileUrl: "/parameters/11_Hitachi_911_BIOMEDIC.pdf" },
  { id: "p3", analyzer: "Hitachi 912", description: "پارامترهای آنالایزر هیتاچی ۹۱۲", fileUrl: "/parameters/2. Hitachi_912_BIOMEDIC (1).pdf" },
  { id: "p4", analyzer: "Hitachi 902 / 717 / 704", description: "پارامترهای جامع هیتاچی سری ۹۰۲ و ۷۱۷", fileUrl: "/parameters/Hitachi_902_717_704_BIOMEDIC (1).pdf" },
  { id: "p5", analyzer: "Mindray BS-800", description: "پارامترهای بیوشیمی مایندری BS 800", fileUrl: "/parameters/2w._MINDRAY_BS_800_BIOMEDIC (1).pdf" },
  { id: "p6", analyzer: "Mindray BS-430 (Biomedic)", description: "پارامترهای مایندری BS 430 بیومدیک", fileUrl: "/parameters/Mindray BS 430 BIOMEDIC.pdf" },
  { id: "p7", analyzer: "Mindray BS-430", description: "تنظیمات اختصاصی مایندری BS 430", fileUrl: "/parameters/Mindray_BS_430.pdf" },
  { id: "p8", analyzer: "Mindray BS-480", description: "پارامترهای مایندری BS 480", fileUrl: "/parameters/Mindray_BS_480 (1).pdf" },
  { id: "p9", analyzer: "Olympus", description: "برگه پارامترهای آنالایزر المپیوس", fileUrl: "/parameters/3._OLYMPUS_BIOMEDIC (1).pdf" },
  { id: "p10", analyzer: "BT 3000 / 3500", description: "پارامترهای دستگاه BT3000 تست‌های AST و ALT", fileUrl: "/parameters/3_F_BT_3000_3500_BIOMEDIC_AST_ALT.pdf" },
  { id: "p11", analyzer: "Dirui CS-400", description: "پارامترهای آنالایزر دیروی CS 400", fileUrl: "/parameters/4_Dirui_CS_400_BIOMEDIC.pdf" },
  { id: "p12", analyzer: "Dirui CS-240", description: "پارامترهای دستگاه دیروی CS 240", fileUrl: "/parameters/Dirui_CS_240_BIOMEDIC (1).pdf" },
  { id: "p13", analyzer: "Prestige 50i", description: "پارامترهای تست‌های دستگاه Prestige 50i", fileUrl: "/parameters/7_._Prestige_50i.pdf" },
  { id: "p14", analyzer: "Rayto 420", description: "پارامترهای آنالایزر ریتو ۴۲۰", fileUrl: "/parameters/Rayto_420_BIOMEDIC (1).pdf" },
  { id: "p15", analyzer: "Rayto 800", description: "تنظیمات و پارامترهای ریتو ۸۰۰", fileUrl: "/parameters/Rayto_800_BIOMEDIC (1).pdf" },
];

export function ParamsView({ go }: { go: (r: string) => void }) {
  const [search, setSearch] = useState("");

  const filtered = MY_DEVICE_PARAMS.filter(
    (p) =>
      p.analyzer.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* سربرگ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-100 text-sky-700 shadow-sm">
            <Settings2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">برگه‌های پارامتر دستگاه‌های آنالایزر</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              دانلود مستقیم فایل‌های PDF پارامترهای هیتاچی، مایندری، دیروی، المپیوس و BT
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
            placeholder="جستجوی نام دستگاه (مثلاً Hitachi)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 outline-none"
          />
        </div>
      </div>

      {/* جدول/کارت‌های دانلود PDF پارامترها */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="border border-slate-200 hover:border-sky-400 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <span className="font-extrabold text-slate-900 text-base">{item.analyzer}</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">{item.description}</p>
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <span className="text-[11px] text-slate-400">PDF اصل برگه</span>
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-2 rounded-xl transition-all"
              >
                <Download className="w-3.5 h-3.5 text-sky-700" />
                <span>دانلود برگه پارامتر</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}