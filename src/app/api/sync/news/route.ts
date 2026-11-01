import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RssItem {
  title: string;
  link: string;
  date: string;
  source: string;
}

function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const blocks = xml.split("<item>").slice(1);
  for (const b of blocks) {
    const title = decodeHtml(b.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] || "");
    const link = b.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || "";
    const date = b.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || "";
    const source = decodeHtml(b.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "");
    if (title && link) items.push({ title, link, date, source });
  }
  return items;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "clinical laboratory diagnostics";
  const summarize = searchParams.get("summarize") === "1";

  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(rssUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NimaLabApp/1.0)" },
    });
    if (!res.ok) throw new Error(`rss ${res.status}`);
    const xml = await res.text();
    let items = parseRss(xml).slice(0, 12);

    // Optional: Persian translation of titles via LLM (backend only)
    if (summarize && items.length > 0) {
      try {
        const { default: ZAI } = await import("z-ai-web-dev-sdk");
        const zai = await ZAI.create();
        const list = items.slice(0, 8).map((it, i) => `${i + 1}. ${it.title}`).join("\n");
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: "assistant",
              content:
                "تو مترجم خبرهای حوزه آزمایشگاه و دیاگنوستیک هستی. برای هر خبر یک جمله فارسی روان (حداکثر ۲۵ کلمه) بنویس. خروجی فقط به شکل «1. ترجمه/خلاصه فارسی» خط به خط.",
            },
            { role: "user", content: list },
          ],
          thinking: { type: "disabled" },
        });
        const raw = completion.choices[0]?.message?.content || "";
        raw.split("\n").forEach((line) => {
          const m = line.match(/^\s*(\d+)[.\-)]\s*(.+)$/);
          if (m) {
            const it = items[Number(m[1]) - 1];
            if (it) (it as RssItem & { titleFa?: string }).titleFa = m[2].trim();
          }
        });
      } catch {
        // translation optional — return raw titles
      }
    }

    return NextResponse.json({ items, ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "sync failed", items: [] },
      { status: 200 }
    );
  }
}
