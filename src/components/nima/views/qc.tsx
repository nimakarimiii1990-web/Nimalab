"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Plus, Trash2, LineChart as LineChartIcon, FlaskConical, Download, Upload } from "lucide-react";
import { useQcSeries } from "@/lib/store";
import { evaluateWestgard, sigmaMetric, sigmaInterp, uid } from "@/lib/checks";
import type { QcSeries } from "@/lib/nima-types";
import { toast } from "@/hooks/use-toast";

export function QcView() {
  const [seriesList, setSeriesList] = useQcSeries();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({ analyte: "", level: "Normal", unit: "", mean: "", sd: "", tea: "", bias: "" });
  const [entryForm, setEntryForm] = useState({ value: "" });

  const selected = seriesList.find((s) => s.id === selectedId) || seriesList[0];

  const addSeries = () => {
    const mean = parseFloat(newForm.mean);
    const sd = parseFloat(newForm.sd);
    if (!newForm.analyte || isNaN(mean) || isNaN(sd) || sd <= 0) {
      toast({ title: "Error", description: "Enter a valid analyte name, mean and SD." });
      return;
    }
    const s: QcSeries = {
      id: uid(),
      analyte: newForm.analyte,
      level: newForm.level,
      unit: newForm.unit || "—",
      mean,
      sd,
      lot: "",
      tea: parseFloat(newForm.tea) || undefined,
      bias: parseFloat(newForm.bias) || undefined,
      entries: [],
      createdAt: new Date().toISOString(),
    };
    setSeriesList((prev) => [...prev, s]);
    setSelectedId(s.id);
    setNewForm({ analyte: "", level: "Normal", unit: "", mean: "", sd: "", tea: "", bias: "" });
    toast({ title: "QC series created ✓" });
  };

  const addEntry = () => {
    if (!selected) return;
    const v = parseFloat(entryForm.value);
    if (isNaN(v)) {
      toast({ title: "Error", description: "Enter the control value." });
      return;
    }
    setSeriesList((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? { ...s, entries: [...s.entries, { id: uid(), date: new Date().toISOString(), value: v }] }
          : s
      )
    );
    setEntryForm({ value: "" });
  };

  const removeSeries = (id: string) => {
    setSeriesList((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const deleteEntry = (seriesId: string, entryId: string) => {
    setSeriesList((prev) =>
      prev.map((s) => (s.id === seriesId ? { ...s, entries: s.entries.filter((e) => e.id !== entryId) } : s))
    );
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(seriesList, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nima-qc-data.json";
    a.click();
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data)) {
          setSeriesList(data as QcSeries[]);
          toast({ title: "QC data imported ✓" });
        }
      } catch {
        toast({ title: "Invalid file" });
      }
    };
    reader.readAsText(file);
  };

  const chartData = useMemo(() => {
    if (!selected) return [];
    return selected.entries.map((e, i) => ({
      idx: i + 1,
      value: e.value,
      date: new Date(e.date).toLocaleDateString("en-GB", { month: "2-digit", day: "2-digit" }),
    }));
  }, [selected]);

  const westgard = useMemo(() => (selected ? evaluateWestgard(selected) : []), [selected]);
  const sigma = selected ? sigmaMetric(selected.tea, selected.bias, (selected.sd / selected.mean) * 100) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <LineChartIcon className="w-6 h-6 text-primary" />
        Internal Quality Control (IQC)
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Levey-Jennings chart with Westgard rules (1-2s, 1-3s, 2-2s, R-4s, 3-1s, 4-1s, 10x) and the sigma metric —
        data is stored on your own device. Anyone can create series and enter daily values.
      </p>

      <div className="grid lg:grid-cols-[340px,1fr] gap-6 items-start">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-sm">
              <FlaskConical className="w-4 h-4 text-primary" />
              New QC series
            </h2>
            <div className="space-y-2.5">
              <input
                value={newForm.analyte}
                onChange={(e) => setNewForm((f) => ({ ...f, analyte: e.target.value }))}
                placeholder="Analyte name (e.g. Glucose)"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newForm.unit}
                  onChange={(e) => setNewForm((f) => ({ ...f, unit: e.target.value }))}
                  placeholder="Unit"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <select
                  value={newForm.level}
                  onChange={(e) => setNewForm((f) => ({ ...f, level: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option>Normal</option>
                  <option>High</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newForm.mean}
                  onChange={(e) => setNewForm((f) => ({ ...f, mean: e.target.value }))}
                  type="number"
                  placeholder="Mean"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  value={newForm.sd}
                  onChange={(e) => setNewForm((f) => ({ ...f, sd: e.target.value }))}
                  type="number"
                  placeholder="SD"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newForm.tea}
                  onChange={(e) => setNewForm((f) => ({ ...f, tea: e.target.value }))}
                  type="number"
                  placeholder="TEa % (for sigma)"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  value={newForm.bias}
                  onChange={(e) => setNewForm((f) => ({ ...f, bias: e.target.value }))}
                  type="number"
                  placeholder="Bias %"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button onClick={addSeries} className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-bold hover:bg-primary/90 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Create series
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border">
            <div className="p-3 border-b flex items-center justify-between">
              <h2 className="font-bold text-sm">My series ({seriesList.length.toLocaleString("en-US")})</h2>
              <div className="flex gap-1">
                <button onClick={exportJson} title="Export JSON" className="p-1.5 rounded hover:bg-secondary">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
                <label title="Import JSON" className="p-1.5 rounded hover:bg-secondary cursor-pointer">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <input type="file" accept=".json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
                </label>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto nice-scroll">
              {seriesList.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between px-4 py-3 border-b last:border-0 text-sm ${
                    s.id === selected?.id ? "bg-secondary font-bold" : ""
                  }`}
                >
                  <button onClick={() => setSelectedId(s.id)} className="text-left flex-1">
                    <div className="ltr-inline">{s.analyte}</div>{" "}
                    <span className="text-xs text-muted-foreground">({s.level})</span>
                    <div className="text-xs text-muted-foreground ltr-inline">
                      mean {s.mean} · SD {s.sd} · {s.entries.length} pts
                    </div>
                  </button>
                  <button onClick={() => removeSeries(s.id)} className="p-1 rounded hover:bg-red-50" title="Delete series">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              ))}
              {seriesList.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">No QC series yet.</div>
              )}
            </div>
          </div>
        </div>

        {selected ? (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border p-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">New control value ({selected.unit})</label>
                <input
                  value={entryForm.value}
                  onChange={(e) => setEntryForm({ value: e.target.value })}
                  type="number"
                  step="any"
                  className="w-40 px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button onClick={addEntry} className="bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-primary/90">
                Add point
              </button>
              <div className="text-xs text-muted-foreground ltr-inline sm:ml-auto">
                mean {selected.mean} · SD {selected.sd} · CV {((selected.sd / selected.mean) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">Sigma metric</h3>
                {sigma !== null && (
                  <span
                    className={`text-white text-sm font-extrabold rounded-full px-4 py-1.5 ltr-inline ${
                      sigma >= 6 ? "bg-emerald-500" : sigma >= 4 ? "bg-amber-500" : "bg-red-500"
                    }`}
                  >
                    σ {sigma}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{sigmaInterp(sigma)}</p>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <h3 className="font-bold text-sm mb-3">Levey-Jennings chart</h3>
              {chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-xl">
                  No points recorded yet.
                </div>
              ) : (
                <div className="h-80" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="idx" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        domain={[
                          Number((selected.mean - 4 * selected.sd).toFixed(2)),
                          Number((selected.mean + 4 * selected.sd).toFixed(2)),
                        ]}
                      />
                      <Tooltip
                        formatter={(v) => [String(v), selected.analyte]}
                        labelFormatter={(l) => `Point ${l}`}
                      />
                      <ReferenceLine y={selected.mean} stroke="#0b5cad" label="mean" />
                      <ReferenceLine y={selected.mean + selected.sd} stroke="#94a3b8" strokeDasharray="4 4" label="+1SD" />
                      <ReferenceLine y={selected.mean - selected.sd} stroke="#94a3b8" strokeDasharray="4 4" label="-1SD" />
                      <ReferenceLine y={selected.mean + 2 * selected.sd} stroke="#f59e0b" strokeDasharray="4 4" label="+2SD" />
                      <ReferenceLine y={selected.mean - 2 * selected.sd} stroke="#f59e0b" strokeDasharray="4 4" label="-2SD" />
                      <ReferenceLine y={selected.mean + 3 * selected.sd} stroke="#ef4444" strokeDasharray="4 4" label="+3SD" />
                      <ReferenceLine y={selected.mean - 3 * selected.sd} stroke="#ef4444" strokeDasharray="4 4" label="-3SD" />
                      <Line
                        type="linear"
                        dataKey="value"
                        stroke="#0d6fb8"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#0d6fb8" }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border overflow-hidden">
              <h3 className="font-bold text-sm p-4 pb-2">Westgard rule evaluation</h3>
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Value</th>
                    <th className="px-4 py-2 text-left">z</th>
                    <th className="px-4 py-2 text-left">Rules</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {selected.entries.map((e, i) => {
                    const z = selected.sd ? +((e.value - selected.mean) / selected.sd).toFixed(2) : "—";
                    const w = westgard[i];
                    return (
                      <tr key={e.id} className="border-t">
                        <td className="px-4 py-2 ltr-inline">{i + 1}</td>
                        <td className="px-4 py-2 ltr-inline text-xs">{new Date(e.date).toLocaleDateString("en-GB")}</td>
                        <td className="px-4 py-2 ltr-inline font-medium">{e.value}</td>
                        <td className="px-4 py-2 ltr-inline">{z}</td>
                        <td className="px-4 py-2">
                          {w?.violations?.length ? (
                            <span className="flex flex-wrap gap-1">
                              {w.violations.map((v: string) => (
                                <span
                                  key={v}
                                  className={`text-[11px] rounded-full px-2 py-0.5 ltr-inline ${
                                    v.includes("❌") ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {v}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span className="text-emerald-600 text-xs">✓ acceptable</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <button onClick={() => deleteEntry(selected.id, e.id)} className="p-1 rounded hover:bg-red-50" title="Delete">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {selected.entries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No points recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            Create a QC series, enter daily control values, and the Levey-Jennings chart and Westgard rules update automatically.
          </div>
        )}
      </div>
    </div>
  );
}