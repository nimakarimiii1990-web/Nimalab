"use client";

import { useState } from "react";
import { Newspaper, RefreshCw, ExternalLink } from "lucide-react";
import { useNews } from "@/lib/store";
import { useAuth, ReadOnlyNotice } from "@/lib/auth";
import type { NewsItem } from "@/lib/nima-types";
import { toast } from "@/hooks/use-toast";

function enDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export function NewsView() {
  const [news, setNews] = useNews();
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  const sync = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync/news?q=clinical%20laboratory%20diagnostics&summarize=1");
      const json = (await res.json()) as {
        ok: boolean;
        items?: { title: string; link: string; date: string; source: string; titleFa?: string }[];
        error?: string;
      };
      if (!json.ok) throw new Error(json.error || "sync failed");
      const incoming: NewsItem[] = (json.items || []).map((it, i) => ({
        id: `sync-${Date.now()}-${i}`,
        titleFa: it.titleFa || it.title,
        summaryFa: it.titleFa ? `خبر یافت‌شده: ${it.title}` : "خبر یافت‌شده از جستجوی اینترنتی — برای جزئیات لینک را باز کنید.",
        sourceName: it.source || "Google News",
        url: it.link,
        date: it.date ? new Date(it.date).toISOString() : new Date().toISOString(),
        source: "sync",
      }));
      setNews((prev) => [...incoming.filter((n) => !prev.some((p) => p.url === n.url)), ...prev].slice(0, 60));
      toast({ title: `${incoming.length} new items added ✓` });
    } catch {
      toast({
        title: "Sync failed",
        description: "Internet/server not reachable — stored news were kept.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" />
            World Laboratory News
          </h1>
          <p className="text-muted-foreground text-sm">
            IVD industry trends, new products and standards — always up to date with one click (admin).
          </p>
        </div>
        {isAdmin ? (
          <button
            onClick={sync}
            disabled={loading}
            className="bg-primary text-white rounded-xl px-5 py-3 text-sm font-bold hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Fetch latest news
          </button>
        ) : null}
      </div>
      {!isAdmin && (
        <div className="mb-6">
          <ReadOnlyNotice what="fetch new news" />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {news.map((n) => (
          <article key={n.id} className="bg-white rounded-2xl border p-5 flex flex-col">
            <div className="text-xs text-muted-foreground mb-2">
              {n.sourceName} — {enDate(n.date)}
            </div>
            <h3 className="font-bold leading-7 flex-1" dir="rtl">
              {n.titleFa}
            </h3>
            <p className="text-sm text-foreground/75 leading-6 mt-2" dir="rtl">
              {n.summaryFa}
            </p>
            <a
              href={n.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Source
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
