"use client";

import { useMemo, useState } from "react";
import { GaugeCircle, Play, Lightbulb, Table2, AlertTriangle, CheckCircle2, Info as InfoIcon, XCircle } from "lucide-react";
import {
  INTEGRITY_RULES,
  EXAMPLES,
  resolveKey,
  runIntegrity,
  type IntegrityResult,
  type ParsedInput,
} from "@/lib/integrity";

const STATUS_STYLE: Record<string, { chip: string; icon: React.ReactNode }> = {
  ok: { chip: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
  info: { chip: "bg-sky-50 text-sky-700 border-sky-200", icon: <InfoIcon className="w-4 h-4 text-sky-600" /> },
  warning: { chip: "bg-amber-50 text-amber-800 border-amber-200", icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
  error: { chip: "bg-red-50 text-red-700 border-red-200", icon: <XCircle className="w-4 h-4 text-red-600" /> },
};

const STATUS_COLOR: Record<string, string> = {
  ok: "#10b981",
  info: "#0ea5e9",
  warning: "#f59e0b",
  error: "#ef4444",
};

// ---------- pure-CSS charts ----------
function DonutChart({ pct, color, expectedLabel }: { pct: number; color: string; expectedLabel?: string }) {
  return (
    <div className="flex items-center gap-4" dir="ltr">
      <div
        className="relative w-24 h-24 rounded-full shrink-0"
        style={{ background: `conic-gradient(${color} 0% ${pct}%, #e2e8f0 ${pct}% 100%)` }}
      >
        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
          <span className="text-lg font-extrabold" style={{ color }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      {expectedLabel && <div className="text-xs text-muted-foreground max-w-32">{expectedLabel}</div>}
    </div>
  );
}

function BandChart({ band, color }: { band: NonNullable<IntegrityResult["chart"]>["band"]; color: string }) {
  if (!band) return null;
  const clamp = (x: number) => Math.max(0, Math.min(100, (x / band.axisMax) * 100));
  const lo = band.lo !== undefined ? clamp(band.lo) : null;
  const hi = band.hi !== undefined ? clamp(band.hi) : null;
  const marker = clamp(band.value);
  const inZone = band.lo !== undefined && band.hi !== undefined && band.value >= band.lo && band.value <= band.hi;
  const markerColor = inZone ? "#10b981" : color;
  return (
    <div dir="ltr" className="w-full max-w-md">
      <div className="relative h-8">
        {/* expected zone */}
        {lo !== null && hi !== null && (
          <div
            className="absolute top-2.5 h-3 rounded bg-emerald-100 border border-emerald-300"
            style={{ left: `${lo}%`, width: `${Math.max(1.5, hi - lo)}%` }}
          />
        )}
        {/* marker */}
        <div
          className="absolute top-0 w-1.5 rounded"
          style={{ left: `calc(${marker}% - 3px)`, height: "32px", background: markerColor }}
        />
        <div
          className="absolute top-8 text-[10px] font-bold whitespace-nowrap -translate-x-1/2"
          style={{ left: `${marker}%`, color: markerColor }}
        >
          {Math.round(band.value * 10) / 10}
          {band.unit ? ` ${band.unit}` : ""}
        </div>
      </div>
      <div className="h-6" />
      {band.zoneLabel && <div className="text-[11px] text-muted-foreground">{band.zoneLabel} (green zone)</div>}
    </div>
  );
}

function BalanceChart({ balance, color }: { balance: NonNullable<IntegrityResult["chart"]>["balance"]; color: string }) {
  if (!balance) return null;
  const sum = balance.parts.reduce((a, p) => a + p.value, 0);
  const max = Math.max(sum, balance.total) || 1;
  return (
    <div dir="ltr" className="w-full max-w-xl space-y-3">
      <div>
        <div className="text-[11px] font-bold text-muted-foreground mb-1">Sum of fractions</div>
        <div className="flex h-7 rounded-lg overflow-hidden border border-border bg-secondary/40">
          {balance.parts.map((p) => (
            <div
              key={p.name}
              title={`${p.name}: ${Math.round(p.value)} ${balance.unit} (${Math.round((p.value / max) * 100)}%)`}
              className="h-full flex items-center justify-center text-[10px] font-bold text-white overflow-hidden whitespace-nowrap"
              style={{ width: `${(p.value / max) * 100}%`, background: p.color }}
            >
              {(p.value / max) * 100 > 9 ? `${Math.round(p.value)}` : ""}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-bold text-muted-foreground mb-1">{balance.totalLabel}</div>
        <div className="flex h-7 rounded-lg overflow-hidden border border-border bg-secondary/40">
          <div
            className="h-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ width: `${(balance.total / max) * 100}%`, background: "#083a6b" }}
          >
            {Math.round(balance.total)}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
        {balance.parts.map((p) => (
          <span key={p.name} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
            {p.name}: <b>{Math.round(p.value)}</b> {balance.unit}
            {balance.total > 0 && <span className="text-muted-foreground">({Math.round((p.value / balance.total) * 100)}%)</span>}
          </span>
        ))}
        {balance.residualPct !== undefined && (
          <span className="inline-flex items-center gap-1.5 font-bold" style={{ color }}>
            residual = {Math.round(balance.residualPct * 10) / 10}%
          </span>
        )}
      </div>
    </div>
  );
}

function RuleCard({ r }: { r: IntegrityResult }) {
  const st = STATUS_STYLE[r.status] || STATUS_STYLE.ok;
  const color = STATUS_COLOR[r.status] || STATUS_COLOR.ok;
  return (
    <div className={`bg-white rounded-2xl border p-5 ${r.status === "error" ? "border-red-300 shadow-sm" : ""}`}>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`text-xs font-bold rounded-full px-3 py-1 border ${st.chip} uppercase tracking-wide`}>{r.status}</span>
        <span className="text-[11px] text-muted-foreground bg-secondary rounded-full px-2.5 py-1">{r.panel}</span>
        <b className="text-sm">{r.title}</b>
      </div>
      <p className="text-sm text-foreground/85 leading-6 mb-3">{r.message}</p>
      {r.chart?.kind === "donut" && r.chart.pct !== undefined && (
        <DonutChart pct={r.chart.pct} color={color} expectedLabel={r.chart.expectedLabel} />
      )}
      {r.chart?.kind === "band" && <BandChart band={r.chart.band} color={color} />}
      {r.chart?.kind === "balance" && <BalanceChart balance={r.chart.balance} color={color} />}
    </div>
  );
}

export function IntegrityView() {
  const [raw, setRaw] = useState("");
  const [ran, setRan] = useState(false);

  const parsed = useMemo<{ inputs: ParsedInput[]; unknown: string[] }>(() => {
    const inputs: ParsedInput[] = [];
    const unknown: string[] = [];
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^(.+?)\s*[=:]\s*(-?[\d.,]+)\s*(.*)$/);
      if (!m) return;
      const name = m[1].trim();
      const value = parseFloat(m[2].replace(/,/g, ""));
      if (isNaN(value)) return;
      const key = resolveKey(name);
      if (!key) {
        unknown.push(name);
        return;
      }
      const existing = inputs.findIndex((x) => x.key === key);
      if (existing >= 0) inputs[existing] = { key, name, value };
      else inputs.push({ key, name, value });
    });
    return { inputs, unknown };
  }, [raw]);

  const { results, unused } = useMemo(() => (ran ? runIntegrity(parsed.inputs) : { results: [], unused: [] }), [ran, parsed]);

  const counts = useMemo(() => {
    const c = { ok: 0, info: 0, warning: 0, error: 0 };
    results.forEach((r) => c[r.status]++);
    return c;
  }, [results]);

  const loadExample = (i: number) => {
    setRaw(EXAMPLES[i].lines.join("\n"));
    setRan(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <GaugeCircle className="w-6 h-6 text-primary" />
        Result Integrity — Cross-Test Consistency
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Enter the results of one sample; Nima checks every known relationship between analytes
        (CK-MB vs CPK, direct vs total bilirubin, LDL+HDL+VLDL vs total cholesterol, anion gap, rule of three, …)
        and warns you with a percentage chart when a result pattern is implausible.
      </p>

      <div className="grid lg:grid-cols-[420px,1fr] gap-6 items-start">
        {/* Input column */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-bold text-sm mb-2">Enter results (one per line: Name = value)</h2>
            <textarea
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                setRan(false);
              }}
              rows={10}
              dir="ltr"
              placeholder={"CPK = 150\nCK-MB = 60\nTotal Bilirubin = 1.2\nDirect Bilirubin = 0.9\nCholesterol = 200\nHDL = 45\nTriglycerides = 150"}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30 font-mono"
            />
            <button
              onClick={() => setRan(true)}
              disabled={parsed.inputs.length === 0}
              className="mt-3 w-full bg-primary text-white rounded-lg py-3 text-sm font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Run Integrity Check ({parsed.inputs.length} analytes)
            </button>
            {parsed.unknown.length > 0 && (
              <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Not recognised (skipped): <span className="font-mono">{parsed.unknown.join(", ")}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-bold text-sm mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Load an example
            </h2>
            <div className="grid gap-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(i)}
                  className="text-left text-xs bg-secondary hover:bg-secondary/70 rounded-lg px-3 py-2 font-medium"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rules catalog */}
          <div className="bg-white rounded-2xl border p-4">
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Table2 className="w-4 h-4 text-primary" />
              Supported relationships ({INTEGRITY_RULES.length})
            </h2>
            <div className="max-h-80 overflow-y-auto nice-scroll divide-y text-xs">
              {INTEGRITY_RULES.map((r) => (
                <div key={r.id} className="py-2">
                  <div className="font-bold">{r.title}</div>
                  <div className="text-muted-foreground leading-5 mt-0.5">{r.relation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results column */}
        <div className="space-y-4">
          {ran && parsed.inputs.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  ["error", counts.error],
                  ["warning", counts.warning],
                  ["info", counts.info],
                  ["ok", counts.ok],
                ] as const
              ).map(([k, n]) => (
                <div key={k} className={`rounded-xl border p-3 text-center ${STATUS_STYLE[k].chip}`}>
                  <div className="text-2xl font-extrabold">{n}</div>
                  <div className="text-[11px] font-bold uppercase tracking-wide">{k}</div>
                </div>
              ))}
            </div>
          )}

          {ran && results.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed p-10 text-center text-muted-foreground text-sm">
              No cross-test relationship found for the entered analytes — enter more related tests
              (e.g. a full lipid panel, electrolytes, or CBC).
            </div>
          )}

          {results
            .slice()
            .sort((a, b) => {
              const order = { error: 0, warning: 1, info: 2, ok: 3 } as const;
              return order[a.status] - order[b.status];
            })
            .map((r) => (
              <RuleCard key={r.ruleId} r={r} />
            ))}

          {ran && unused.length > 0 && (
            <div className="bg-white rounded-2xl border p-4 text-xs text-muted-foreground">
              Entered but not used in any cross-check: <span className="font-mono">{unused.join(", ")}</span>
            </div>
          )}

          {!ran && (
            <div className="bg-white rounded-2xl border border-dashed p-10 text-center text-muted-foreground text-sm">
              Enter results on the left (or load an example) and press <b>Run Integrity Check</b>.
              <div className="mt-3 text-xs leading-5">
                Example: with CPK = 150 and CK-MB = 60, Nima flags a 40% CK-MB fraction as an analytical error —
                and with direct bilirubin far from ≈ 20% of total, it flags the bilirubin pair, each with its chart.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
