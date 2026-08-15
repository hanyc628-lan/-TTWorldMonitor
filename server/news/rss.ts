import type { Signal } from '../../src/types/index.js';
import { cacheGetOrSet } from '../cache.js';

/**
 * 实时乒乓球新闻聚合（Google News RSS）。
 * - 服务端抓取并解析，10 分钟缓存；
 * - Render 海外环境直连；抓取失败时由调用方回退到样本数据。
 */

const FEED_TTL_MS = 10 * 60 * 1000;

const FEEDS: Array<{ url: string; countries: string[] }> = [
  {
    url: 'https://news.google.com/rss/search?q=%22table+tennis%22+when:2d&hl=en-US&gl=US&ceid=US:en',
    countries: [],
  },
  {
    url: 'https://news.google.com/rss/search?q=WTT+table+tennis+when:2d&hl=en-US&gl=US&ceid=US:en',
    countries: [],
  },
  {
    url: 'https://news.google.com/rss/search?q=%E4%B9%92%E4%B9%93%E7%90%83+when:2d&hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
    countries: ['CHN'],
  },
];

const COUNTRY_KEYWORDS: Array<{ code: string; words: string[] }> = [
  { code: 'CHN', words: ['China', 'Chinese', '中国', '国乒', '孙颖莎', '王楚钦', '王曼昱', '林诗栋', '蒯曼', '樊振东', '陈幸同', '王艺迪'] },
  { code: 'JPN', words: ['Japan', 'Japanese', '日本', 'Harimoto', '張本', '张本', 'Hayata', '早田', 'Matsushima', '松岛'] },
  { code: 'KOR', words: ['Korea', 'Korean', '韩国', 'Shin Yubin', '申裕斌', 'Jang Woojin', '张禹珍'] },
  { code: 'FRA', words: ['France', 'French', '法国', 'Lebrun', '勒布伦'] },
  { code: 'SWE', words: ['Sweden', 'Swedish', '瑞典', 'Moregard', '莫雷加德'] },
  { code: 'GER', words: ['Germany', 'German', '德国', 'Bundesliga', '德甲', 'Qiu Dang'] },
  { code: 'BRA', words: ['Brazil', 'Calderano', '卡尔德拉诺', '雨果'] },
  { code: 'TPE', words: ['Lin Yun-Ju', '林昀儒', 'Taiwan', '中华台北'] },
];

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

function extractTag(item: string, tag: string): string {
  const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? decodeEntities(m[1]).trim() : '';
}

function detectCountries(title: string): string[] {
  const found = new Set<string>();
  for (const { code, words } of COUNTRY_KEYWORDS) {
    if (words.some((w) => title.toLowerCase().includes(w.toLowerCase()))) found.add(code);
  }
  return [...found];
}

function severityFromTitle(title: string): Signal['severity'] {
  if (/upset|stun|shock|爆冷|逆转|injur|withdraw|退赛|伤/i.test(title)) return 'high';
  if (/final|champion|wins?|title|夺冠|冠军|rank|排名/i.test(title)) return 'medium';
  return 'low';
}

/** 纯函数：解析 Google News RSS XML 为 Signal 列表（便于单测与复用）。 */
export function parseRssXml(xml: string, fallbackCountries: string[] = []): Signal[] {
  const items = xml.split(/<item>/i).slice(1);
  const signals: Signal[] = [];
  for (const item of items.slice(0, 12)) {
    const title = extractTag(item, 'title');
    if (!title) continue;
    const link = extractTag(item, 'link');
    const source = extractTag(item, 'source');
    const pubDate = extractTag(item, 'pubDate');
    const ts = pubDate && !Number.isNaN(Date.parse(pubDate)) ? new Date(pubDate).toISOString() : new Date().toISOString();
    const countries = detectCountries(title);
    signals.push({
      id: `rss-${Buffer.from(title).toString('base64url').slice(0, 16)}`,
      type: 'news',
      title,
      source: source || 'Google News',
      timestamp: ts,
      countries: countries.length ? countries : fallbackCountries,
      severity: severityFromTitle(title),
      url: link || undefined,
    });
  }
  return signals;
}

async function fetchFeed(url: string, fallbackCountries: string[], timeoutMs = 8000): Promise<Signal[]> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'User-Agent': 'TTWorldMonitor/0.1 (+news-aggregator)' },
  });
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  const xml = await res.text();
  return parseRssXml(xml, fallbackCountries);
}

export interface NewsFeedResult {
  signals: Signal[];
  live: boolean;
  fetchedAt: string;
}

/** 聚合所有 RSS 源；全部失败时返回 live:false 由调用方回退样本。 */
export async function fetchLiveNews(): Promise<NewsFeedResult> {
  try {
    return await cacheGetOrSet('news:rss:aggregate', FEED_TTL_MS, async () => {
      const results = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f.url, f.countries)));
      const merged: Signal[] = [];
      const seen = new Set<string>();
      for (const r of results) {
        if (r.status !== 'fulfilled') continue;
        for (const s of r.value) {
          if (seen.has(s.title)) continue;
          seen.add(s.title);
          merged.push(s);
        }
      }
      merged.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
      const live = merged.length > 0;
      return { signals: merged.slice(0, 30), live, fetchedAt: new Date().toISOString() };
    });
  } catch {
    return { signals: [], live: false, fetchedAt: new Date().toISOString() };
  }
}
