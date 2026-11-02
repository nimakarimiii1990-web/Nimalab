"use client";
import { useMemo, useState } from "react";
import { Download, Search, Settings2 } from "lucide-react";

type ParamFile = {
  analyzer: string;
  file: string;
};

const PARAMS: ParamFile[] = [
  { analyzer: "Hitachi 917", file: "1.Hitachi_917_BIOMEDIC.pdf" },
  { analyzer: "Hitachi 911", file: "11_Hitachi_911_BIOMEDIC.pdf" },
  { analyzer: "Hitachi 912", file: "2.Hitachi_912_BIOMEDIC (1).pdf" },
  { analyzer: "Mindray BS-800", file: "2w._MINDRAY_BS_800_BIOMEDIC (1).pdf" },
  { analyzer: "Olympus", file: "3._OLYMPUS_BIOMEDIC (1).pdf" },
  { analyzer: "BT 3000 / 3500", file: "3_F_BT_3000_3500_BIOMEDIC_AST_ALT.pdf" },
  { analyzer: "Dirui CS-400 / 800", file: "4_Dirui_CS_400_800_BIOMEDIC.pdf" },
  { analyzer: "Prestige 50i", file: "7_._Prestige_50i.pdf" },
  { analyzer: "Dirui CS-240", file: "Dirui_CS_240_BIOMEDIC (1).pdf" },
  { analyzer: "Hitachi 902 / 717 / 704", file: "Hitachi_902_717_704_BIOMEDIC (1).pdf" },
  { analyzer: "Mindray BS-430 Biomedic", file: "MINDRAY BS 430 BIOMEDIC.pdf" },
  { analyzer: "Mindray BS-430", file: "MINDRAY_BS_430.pdf" },
  { analyzer: "Mindray BS-480", file: "MINDRAY_BS_480 (1).pdf" },
  { analyzer: "Rayto 420", file: "Rayto_420_BIOMEDIC (1).pdf" },
  { analyzer: "Rayto 800", file: "Rayto_800_BIOMEDIC (1).pdf" },
];

export function ParamsView() {
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PARAMS.filter(
      (item) =>
        item.analyzer.toLowerCase().includes(q) ||
        item.file.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Settings2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">پارامترها</h1>
            <p className="mt-1 text-xs text-slate-500">
              {PARAMS.length} فایل PDF
            </p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی دستگاه..."
            className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right">دستگاه</th>
              <th className="px-4 py-3 text-right">نام فایل</th>
              <th className="px-4 py-3 text-center">PDF</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const href = encodeURI(`/parameters/${item.file}`);
              return (
                <tr key={item.file} className="border-t">
                  <td className="px-4 py-3 font-bold">{item.analyzer}</td>
                  <td className="px-4 py-3 break-all text-xs text-slate-500">{item.file}</td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      <Download className="h-3.5 w-3.5" />
                      باز کردن
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}