"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Target, Plus, Trash2, Download, Lock } from "lucide-react";
import { useAccuracyStudies } from "@/lib/store";
import { uid } from "@/lib/checks";
import { useAuth, ReadOnlyNotice } from "@/lib/auth";
import type { AccuracyStudy, AccuracyPoint } from "@/lib/nima-types";
import { toast } from "@/hooks/use-toast";

export function AccuracyView() {
  const [studies, setStudies] = useAccuracyStudies();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ analyte: "", unit: "", tea: "12" });
  const [pointForm, setPointForm] = useState({ sample: "", target: "", measured: "" });
  const { isAdmin } = useAuth();

  const selected = studies.find((s) => s.id === selectedId) || studies[0];

  const addStudy = () => {
    if (!form.analyte || isNaN(parseFloat(form.tea))) {
      toast({ title: "Error", description: "Enter a valid analyte name and TEa." });
      return;
    }
    const s: AccuracyStudy = {
      id: uid(),
      analyte: form.analyte,
      unit: form.unit || "—",
      tea: parseFloat(form.tea),
      points: [],
      createdAt: new Date().toISOString(),
    };
    setStudies((prev) => [...prev, s]);
    setSelectedId(s.id);
    setForm({ analyte: "", unit: "", tea: "12" });
  };

  const addPoint = () => {
    if (!selected) return;
    const target = parseFloat(pointForm.target);
    const measured = parseFloat(pointForm.measured);
    if (isNaN(target) || isNaN(measured) || target <= 0) {
      toast({ title: "Error", description: "Enter valid target and measured values." });
      return;
    }
    setStudies((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? {
              ...s,
              points: [
                ...s.points,
                { id: uid(), sample: pointForm.sample || `Sample ${s.points.length + 1}`, target, measured },
              ],
            }
          : s
      )
    );
    setPointForm({ sample: "", target: "", measured: "" });
  };

  const removeStudy = (id: string) => {
    setStudies((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const deletePoint = (sid: string, pid: string) => {
    setStudies((prev) =>
      prev.map((s) => (s.id === sid ? { ...s, points: s.points.filter((p) => p.id !== pid) } : s))
    );
  };

  const chartData = useMemo(() => {
    if (!selected) return [];
    return selected.points.map((p) => ({
      name: p.sample,
      bias: +(((p.measured - p.target) / p.target) * 100).toFixed(2),
    }));
  }, [selected]);

  const meanBias = useMemo(() => {
    if (!chartData.length) return null;
    return +(chartData.reduce((a, b) => a + b.bias, 0) / chartData.length).toFixed(2);
  }, [chartData]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(studies, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nima-accuracy-data.json";
    a.click();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <Target className="w-6 h-6 text-primary" />
        Bias &amp; Accuracy Study
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Compare your laboratory result with a target value (EQA, stabilized control or reference method); the percent
        bias of each sample is judged against the allowable total error (TEa). Editing is reserved for the admin.
      </p>

      <div className="grid lg:grid-cols-[340px,1fr] gap-6 items-start">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-bold mb-3 text-sm flex items-center gap-2">
              New accuracy study
              {!isAdmin && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            </h2>
            {isAdmin ? (
              <div className="space-y-2.5">
                <input
                  value={form.analyte}
                  onChange={(e) => setForm((f) => ({ ...f, analyte: e.target.value }))}
                  placeholder="Analyte name (e.g. Creatinine)"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    placeholder="Unit"
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    value={form.tea}
                    onChange={(e) => setForm((f) => ({ ...f, tea: e.target.value }))}
                    type="number"
                    placeholder="TEa %"
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button onClick={addStudy} className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-bold hover:bg-primary/90 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create study
                </button>
              </div>
            ) : (
              <ReadOnlyNotice what="create accuracy studies" />
            )}
          </div>

          <div className="bg-white rounded-2xl border">
            <div className="p-3 border-b flex items-center justify-between">
              <h2 className="font-bold text-sm">Studies ({studies.length.toLocaleString("en-US")})</h2>
              <button onClick={exportJson} className="p-1.5 rounded hover:bg-secondary" title="Export JSON">
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {studies.map((s) => (
              <div
                key={s.id}
                className={`flex items-center justify-between px-4 py-3 border-b last:border-0 text-sm ${
                  s.id === selected?.id ? "bg-secondary font-bold" : ""
                }`}
              >
                <button onClick={() => setSelectedId(s.id)} className="text-left flex-1">
                  <span className="ltr-inline">{s.analyte}</span>
                  <span className="block text-xs text-muted-foreground ltr-inline">
                    TEa {s.tea}% · {s.points.length} pts
                  </span>
                </button>
                {isAdmin && (
                  <button onClick={() => removeStudy(s.id)} className="p-1.5 rounded hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            ))}
            {studies.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No studies created yet.</div>
            )}
          </div>
        </div>

        {selected ? (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border p-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Sample</label>
                <input
                  value={pointForm.sample}
                  onChange={(e) => setPointForm((f) => ({ ...f, sample: e.target.value }))}
                  disabled={!isAdmin}
                  className="w-32 px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-secondary/40"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Target value ({selected.unit})</label>
                <input
                  value={pointForm.target}
                  onChange={(e) => setPointForm((f) => ({ ...f, target: e.target.value }))}
                  type="number"
                  step="any"
                  disabled={!isAdmin}
                  className="w-32 px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-secondary/40"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Laboratory result</label>
                <input
                  value={pointForm.measured}
                  onChange={(e) => setPointForm((f) => ({ ...f, measured: e.target.value }))}
                  type="number"
                  step="any"
                  disabled={!isAdmin}
                  className="w-32 px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-secondary/40"
                />
              </div>
              {isAdmin ? (
                <button onClick={addPoint} className="bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-primary/90">
                  Add point
                </button>
              ) : (
                <span className="text-[11px] text-muted-foreground mb-2">admin only</span>
              )}
              {meanBias !== null && (
                <div className="text-xs sm:ml-auto">
                  Mean bias:{" "}
                  <b className={`ltr-inline ${Math.abs(meanBias) > selected.tea ? "text-red-600" : "text-emerald-600"}`}>
                    {meanBias > 0 ? "+" : ""}
                    {meanBias}%
                  </b>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <h3 className="font-bold text-sm mb-3">Bias chart (%)</h3>
              {chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-xl">
                  No points recorded.
                </div>
              ) : (
                <div className="h-80" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [`${v}%`, "Bias"]} />
                      <ReferenceLine y={selected.tea} stroke="#ef4444" strokeDasharray="4 4" label="+TEa" />
                      <ReferenceLine y={-selected.tea} stroke="#ef4444" strokeDasharray="4 4" label="−TEa" />
                      <ReferenceLine y={0} stroke="#0b5cad" />
                      <Bar dataKey="bias" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                        {chartData.map((d, i) => (
                          <Cell
                            key={i}
                            fill={
                              Math.abs(d.bias) > selected.tea
                                ? "#ef4444"
                                : Math.abs(d.bias) > selected.tea / 2
                                ? "#f59e0b"
                                : "#10b981"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border overflow-hidden">
              <h3 className="font-bold text-sm p-4 pb-2">Comparison table</h3>
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-xs">
                  <tr>
                    <th className="px-4 py-2 text-left">Sample</th>
                    <th className="px-4 py-2 text-left">Target</th>
                    <th className="px-4 py-2 text-left">Measured</th>
                    <th className="px-4 py-2 text-left">Bias %</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {selected.points.map((p) => {
                    const bias = +(((p.measured - p.target) / p.target) * 100).toFixed(2);
                    const ok = Math.abs(bias) <= selected.tea;
                    return (
                      <tr key={p.id} className={`border-t ${ok ? "" : "bg-red-50"}`}>
                        <td className="px-4 py-2">{p.sample}</td>
                        <td className="px-4 py-2 ltr-inline">{p.target}</td>
                        <td className="px-4 py-2 ltr-inline font-medium">{p.measured}</td>
                        <td className="px-4 py-2 ltr-inline">{bias > 0 ? "+" : ""}{bias}</td>
                        <td className="px-4 py-2">
                          {ok ? (
                            <span className="text-emerald-600 text-xs">✓ within limits</span>
                          ) : (
                            <span className="text-red-600 text-xs">✗ outside TEa — check calibration/method</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {isAdmin && (
                            <button onClick={() => deletePoint(selected.id, p.id)} className="p-1 rounded hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {selected.points.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No points recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            Create an accuracy study (admin) and enter target / measured values. Everyone can view and export.
          </div>
        )}
      </div>
    </div>
  );
}
