"use client";
import { useMemo, useState } from "react";
import { Download, FileStack, Search } from "lucide-react";

type BrochureItem = {
  title: string;
  file: string;
};

const BROCHURES: BrochureItem[] = [
  { title: "467AD", file: "467AD  2025-02.pdf" },
  { title: "482AD", file: "482AD.pdf" },
  { title: "ACE", file: "ACE_BIOMEDIC.pdf" },
  { title: "ADA", file: "ADA_BIOMEDIC.pdf" },
  { title: "Albumin", file: "Albumin-BIOMEDIC_-_030820.pdf" },
  { title: "ALP", file: "ALP-BIOMEDIC_-_030820.pdf" },
  { title: "ALT / GPT", file: "ALT-GPT-BIOMEDIC_-_031010.pdf" },
  { title: "Amylase", file: "Amylase-BIOMEDIC_-_030819.pdf" },
  { title: "ASO", file: "ASO 040203.pdf" },
  { title: "AST / GOT", file: "AST-GOT-BIOMEDIC_-_031010.pdf" },
  { title: "C3", file: "C3-BIOMEDIC_-_020828.pdf" },
  { title: "C4", file: "C4-BIOMEDIC_-_020828.pdf" },
  { title: "Calcium", file: "Calcium-BIOMEDIC_-_021128.pdf" },
  { title: "Cholesterol", file: "Cholesterol-BIOMEDIC_-_021128.pdf" },
  { title: "CK-MB", file: "CK-MB-BIOMEDIC - 021025.pdf" },
  { title: "Creatinine", file: "Creatinine-BIOMEDIC_-_030830.pdf" },
  { title: "CRP", file: "CRP_-BIOMEDIC_-__020906.pdf" },
  { title: "D-Dimer", file: "DDIMER BIOMEDIC-1.pdf" },
  { title: "Direct Bilirubin", file: "Direct Bilirubin.pdf" },
  { title: "Direct HDL-Cholesterol", file: "Direct HDL-Cholesterol-BIOMEDIC - 020906.pdf" },
  { title: "Direct LDL-Cholesterol", file: "Direct LDL-Cholesterol-BIOMEDIC - 020906.pdf" },
  { title: "Glucose", file: "Glucose-BIOMEDIC_-_021128.pdf" },
  { title: "IgA", file: "IgA-BIOMEDIC_-020828.pdf" },
  { title: "IgG", file: "IgG-BIOMEDIC_-_020828.pdf" },
  { title: "IgM", file: "IgM-BIOMEDIC_-020828.pdf" },
  { title: "LDH", file: "LDH-BIOMEDIC_-020906..pdf" },
  { title: "Lipase", file: "Lipase-BIOMEDIC._020828.pdf" },
  { title: "Micro Albumin", file: "Micro_Albumin-BIOMEDIC_-_020906.pdf" },
  { title: "Phosphorus", file: "Phosphorus-BIOMEDIC030820.pdf" },
  { title: "Total Bilirubin", file: "Total Bilirubin.pdf" },
  { title: "Total Protein", file: "Total_Protein-BIOMEDIC-_021128.pdf" },
  { title: "TP Urine", file: "TP URINE BIOMEDIC.pdf" },
  { title: "Transferrin", file: "TRANSFERRIN BIOMEDIC.pdf" },
  { title: "Triglycerides", file: "Triglycerides-BIOMEDIC_-_021128.pdf" },
  { title: "Urea", file: "Urea-BIOMEDIC._030307.pdf" },
  { title: "Uric Acid", file: "Uric_Acid-BIOMEDIC._030603.pdf" },
  { title: "Zinc", file: "Zinc-BIOMEDIC- 030820.pdf" },
];

export function BrochuresView() {
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return BROCHURES.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.file.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <FileStack className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">بروشورها</h1>
            <p className="mt-1 text-xs text-slate-500">
              {BROCHURES.length} فایل PDF
            </p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو..."
            className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const href = encodeURI(`/brochures/${item.file}`);
          return (
            <div key={item.file} className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-900">{item.title}</h2>
              <p className="mt-2 break-all text-xs text-slate-500">{item.file}</p>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white"
              >
                <Download className="h-4 w-4" />
                مشاهده / دانلود PDF
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}