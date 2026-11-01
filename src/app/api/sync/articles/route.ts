import { NextResponse } from "next/server";
import type { PubmedArticle } from "@/lib/nima-types";

export const dynamic = "force-dynamic";

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

interface ESummaryResult {
  result?: Record<
    string,
    {
      uid?: string;
      title?: string;
      fulljournalname?: string;
      pubdate?: string;
      elocationid?: string;
      articleids?: { idtype: string; value: string }[];
    }
  >;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "laboratory medicine";
  const minYear = searchParams.get("minYear") || "2024";
  const limit = Math.min(Number(searchParams.get("limit") || 10), 25);
  const summarize = searchParams.get("summarize") === "1";

  try {
    const term = encodeURIComponent(`${query} AND ${minYear}:3000[dp] AND english[lang]`);
    const searchRes = await fetch(`${EUTILS}/esearch.fcgi?db=pubmed&term=${term}&retmax=${limit}&sort=date&retmode=json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!searchRes.ok) throw new Error(`esearch ${searchRes.status}`);
    const searchJson = (await searchRes.json()) as { esearchresult?: { idlist?: string[] } };
    const ids = searchJson?.esearchresult?.idlist || [];
    if (ids.length === 0) {
      return NextResponse.json({ articles: [], ok: true, note: "no results" });
    }

    const sumRes = await fetch(`${EUTILS}/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!sumRes.ok) throw new Error(`esummary ${sumRes.status}`);
    const sumJson = (await sumRes.json()) as ESummaryResult;

    const articles: PubmedArticle[] = ids
      .map((id) => {
        const r = sumJson.result?.[id];
        if (!r) return null;
        const doi = r.articleids?.find((a) => a.idtype === "doi")?.value;
        return {
          pmid: id,
          title: (r.title || "").replace(/\s*\.$/, ""),
          journal: r.fulljournalname || "",
          year: Number((r.pubdate || "0").slice(0, 4)) || minYear && Number(minYear),
          date: r.pubdate || "",
          doi,
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        } as PubmedArticle;
      })
      .filter(Boolean) as PubmedArticle[];

    // Optional: Persian one-line summaries via LLM (backend only)
    let summaries: Record<string, string> = {};
    if (summarize && articles.length > 0) {
      try {
        const { default: ZAI } = await import("z-ai-web-dev-sdk");
        const zai = await ZAI.create();
        const list = articles.slice(0, 5).map((a, i) => `${i + 1}. ${a.title}`).join("\n");
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: "assistant",
              content:
                "تو دستیار پزشکی آزمایشگاهی هستی. برای هر مقاله، یک جمله فارسی کوتاه (حداکثر ۳۰ کلمه) بنویس که محتوای آن را خلاصه کند. خروجی را به شکل شماره‌ی مرتب بده: «1. خلاصه فارسی» — بدون متن اضافه.",
            },
            { role: "user", content: list },
          ],
          thinking: { type: "disabled" },
        });
        const raw = completion.choices[0]?.message?.content || "";
        raw.split("\n").forEach((line) => {
          const m = line.match(/^\s*(\d+)[.\-)]\s*(.+)$/);
          if (m) {
            const a = articles[Number(m[1]) - 1];
            if (a) summaries[a.pmid] = m[2].trim();
          }
        });
      } catch {
        summaries = {};
      }
    }

    return NextResponse.json({ articles, summaries, ok: true });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "sync failed",
        articles: [],
        summaries: {},
      },
      { status: 200 }
    );
  }
}
