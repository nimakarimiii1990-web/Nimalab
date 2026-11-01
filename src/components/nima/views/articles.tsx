"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, RefreshCw, ExternalLink, Search, Trash2, Sparkles } from "lucide-react";
import { useArticles } from "@/lib/store";
import { useAuth, ReadOnlyNotice } from "@/lib/auth";
import { ALL_TESTS } from "@/lib/data/tests";
import type { Article } from "@/lib/nima-types";
import { toast } from "@/hooks/use-toast";

export function ArticlesView() {
  const [articles, setArticles] = useArticles();
  const [q, setQ] = useState("");
  const [syncQuery, setSyncQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return articles
      .filter((a) => a.year >= 2024)
      .filter((a) => {
        if (!query) return true;
        return (
          a.title.toLowerCase().includes(query) ||
          (a.titleFa || "").includes(q) ||
          a.journal.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query)) ||
          a.summaryFa.includes(q)
        );
      })
      .sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt));
  }, [articles, q]);

  const sync = async () => {
    setLoading(true);
    try {
      const term = syncQuery.trim() || "laboratory medicine clinical chemistry";
      const res = await fetch(`/api/sync/articles?query=${encodeURIComponent(term)}&limit=10&summarize=1`);
      const json = (await res.json()) as {
        ok: boolean;
        articles?: { pmid: string; title: string; journal: string; year: number; date: string; doi?: string; url: string }[];
        summaries?: Record<string, string>;
        error?: string;
      };
      if (!json.ok) throw new Error(json.error || "sync failed");
      const incoming: Article[] = (json.articles || [])
        .filter((a) => a.year >= 2024)
        .map((a) => ({
          id: `pm-${a.pmid}`,
          title: a.title,
          journal: a.journal,
          year: a.year,
          doi: a.doi,
          pmid: a.pmid,
          url: a.url,
          summaryFa:
            json.summaries?.[a.pmid] ||
            "مقاله جدید یافت‌شده از PubMed — خلاصه فارسی با همگام‌سازی مجدد (گزینه «با خلاصه هوشمند») تولید می‌شود.",
          tags: [],
          source: "sync",
          addedAt: new Date().toISOString(),
        }));
      setArticles((prev) => [
        ...incoming.filter((n) => !prev.some((p) => p.id === n.id || (p.pmid && p.pmid === n.pmid))),
        ...prev,
      ]);
      toast({ title: `${incoming.length} new articles added from PubMed ✓` });
    } catch {
      toast({
        title: "Sync failed",
        description: "Could not reach PubMed (offline or server off). Stored articles were kept.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <BookOpenCheck className="w-6 h-6 text-primary" />
        Laboratory Articles — 2024 and newer
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Each article with a brief Persian summary and the full reference; the sync button lets the app find new
        articles on PubMed automatically. Only the admin can sync or remove articles.
      </p>

      {/* Sync bar */}
      {isAdmin ? (
        <div className="bg-white rounded-2xl border p-4 mb-6 flex flex-wrap gap-2 items-center">
          <input
            value={syncQuery}
            onChange={(e) => setSyncQuery(e.target.value)}
            placeholder="Sync topic (English): e.g. HbA1c accuracy, troponin"
            className="flex-1 min-w-56 px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30 ltr-inline"
          />
          <button
            onClick={sync}
            disabled={loading}
            className="bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync from PubMed
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <ReadOnlyNotice what="sync or remove articles" />
        </div>
      )}

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles…"
          className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((a) => (
          <article key={a.id} className="bg-white rounded-2xl border p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] bg-secondary rounded-full px-2.5 py-1 ltr-inline">{a.year}</span>
              <span className="text-[11px] text-muted-foreground ltr-inline">{a.journal}</span>
              {a.source === "sync" && (
                <span className="text-[11px] bg-cyan-100 text-cyan-700 rounded-full px-2.5 py-1">synced</span>
              )}
              {a.source === "sync" && isAdmin && (
                <button
                  onClick={() => setArticles((prev) => prev.filter((x) => x.id !== a.id))}
                  className="p-1 rounded hover:bg-red-50 ml-auto"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
            <h3 className="font-bold leading-7 ltr-inline text-left w-full" dir="ltr">
              {a.title}
            </h3>
            <p className="text-sm text-foreground/80 leading-6 mt-2 flex-1" dir="rtl">
              {a.summaryFa}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Full reference
              </a>
              {a.doi && <span className="text-[11px] text-muted-foreground ltr-inline">doi: {a.doi}</span>}
            </div>
            {a.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.tags.slice(0, 5).map((t) => {
                  const test = ALL_TESTS.find((x) => x.id === t);
                  return (
                    <span key={t} className="text-[11px] bg-cyan-50 text-cyan-700 rounded-full px-2 py-0.5 ltr-inline">
                      {test?.en || t}
                    </span>
                  );
                })}
              </div>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            No articles found — the admin can fetch new ones with “Sync from PubMed”.
          </div>
        )}
      </div>
    </div>
  );
}
