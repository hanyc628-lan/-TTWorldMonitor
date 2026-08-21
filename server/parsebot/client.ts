import type { LiveMatch, Tournament } from '../types/index.js';
import { COUNTRIES } from '../../src/data/countries.js';
import { cacheGetOrSet, cacheSet, cacheGet } from '../cache.js';

/**
 * Parse.bot 托管的 ITTF 官方数据 API：
 * - get_events        完整年度赛事日历（含 WTT/ITTF，100+ 场）
 * - get_event_results 单场赛事赛果（局比分/总比分/选手/国家/OFFICIAL）
 * API Key 通过环境变量 TTWM_PARSEBOT_KEY 注入（Render 控制台配置）。
 * 免费档 200 次/月：赛事日历每日 1 次 + 高扰动/进行中赛事按需刷赛果。
 * 注意：这是第三方托管封装，非 ITTF 官方 API；免费档有频率限制(5 req/min)。
 */

const ENDPOINT = 'https://api.parse.bot/scraper/d332c82e-1b62-499e-99ac-490db85dd8d3';
const KEY = process.env.TTWM_PARSEBOT_KEY ?? '';

/** 事件类型 → 站内 tier 映射（WTT/ITTF 覆盖常用类型） */
const TYPE_TIER: Record<string, Tournament['tier']> = {
  'WTT Grand Smash': 'grand-smash',
  'WTT Champions': 'champions',
  'WTT Star Contender': 'star-contender',
  'WTT Contender': 'contender',
  'WTT Finals': 'champions',
  'WTT Feeder': 'contender',
  'WTT Youth': 'youth',
  WTTC: 'worlds',
  Olympic: 'olympic',
  'Olympic Games': 'olympic',
  'World Championships': 'worlds',
  'World Cup': 'continental-cup',
  'Asian Games': 'continental-games',
  'Continental Championships': 'continental-championship',
  'Veteran Championships': 'veteran',
  'Paralympic': 'veteran',
  'T-League': 'league',
  'Ping Chao': 'league',
  'TTBL': 'league',
  League: 'league',
  'Others': 'league',
};

interface ParseEvent {
  EventId: number;
  EventName: string;
  EventType: string;
  Country: string | null;
  City: string | null;
  ContinentCode?: string;
  StartDateTime: string;
  EndDateTime: string;
}

interface ParseResult {
  eventId: string;
  subEventType?: string;
  fullResults?: string;
  match_card?: {
    subEventName?: string;
    venueName?: string;
    competitors?: Array<{
      competitorType?: string;
      competitiorName?: string;
      competitiorOrg?: string;
      scores?: string;
    }>;
    overallScores?: string;
    gameScores?: string;
    matchDateTime?: { startDateLocal?: string; startDateUTC?: string };
    resultStatus?: string;
  };
}

const countryCodeToName = new Map(COUNTRIES.map((c) => [c.code, c.name]));
const countryNameToCode = new Map<string, string>();
for (const c of COUNTRIES) {
  countryNameToCode.set(c.name.toLowerCase(), c.code);
  countryNameToCode.set(c.nameZh.toLowerCase(), c.code);
}

function countryCodeOf(name: string | null, country: string | null): string {
  if (country) {
    const code = country.trim().toUpperCase();
    if (countryCodeToName.has(code)) return code;
  }
  if (name) {
    const hit = countryNameToCode.get(name.trim().toLowerCase());
    if (hit) return hit;
  }
  // 常见映射兜底
  const fixed: Record<string, string> = {
    'UNITED STATES': 'USA', 'USA': 'USA', 'GREAT BRITAIN': 'GBR', 'ENGLAND': 'GBR',
    'SOUTH KOREA': 'KOR', 'CHINESE TAIPEI': 'TPE', 'HONG KONG': 'HKG', 'CZECH REPUBLIC': 'CZE',
    'IRAN': 'IRN', 'THAILAND': 'THA', 'SINGAPORE': 'SGP', 'INDIA': 'IND',
    QATAR: 'QAT', 'SAUDI ARABIA': 'KSA', TURKEY: 'TUR', EGYPT: 'EGY',
  };
  return fixed[(name ?? country ?? '').trim().toUpperCase()] ?? 'UNK';
}

function latLngOf(country: string): { lat: number; lng: number } {
  const c = COUNTRIES.find((x) => x.code === country);
  return c ? { lat: c.lat, lng: c.lng } : { lat: 0, lng: 0 };
}

async function callApi<T>(path: string, params: Record<string, string>, ttlMs: number, cacheKey: string): Promise<T | null> {
  const cached = cacheGet<T>(cacheKey);
  if (cached !== null) return cached;
  if (!KEY) return null;
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${ENDPOINT}/${path}?${qs}`, {
    headers: { 'X-API-Key': KEY, Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 429) throw new Error('parsebot-rate-limited');
  if (!res.ok) throw new Error(`parsebot ${res.status}`);
  const body = (await res.json()) as { status?: string; data?: T };
  if (body.status !== 'success' || body.data === undefined) return null;
  cacheSet(cacheKey, body.data, ttlMs);
  return body.data;
}

/** 拉取年度赛事日历 → 站内 Tournament[] */
export async function fetchParseTournaments(year = 2026): Promise<Tournament[]> {
  const data = await callApi<{ events: ParseEvent[] }>(
    'get_events',
    { year: String(year) },
    12 * 60 * 60 * 1000,
    `parsebot:events:${year}`,
  );
  if (!data?.events?.length) return [];

  const now = Date.now();
  return data.events
    .filter((e) => e.EventName && e.StartDateTime)
    .map((e) => {
      const start = new Date(e.StartDateTime).getTime();
      const end = new Date(e.EndDateTime || e.StartDateTime).getTime();
      const status: Tournament['status'] = now < start ? 'upcoming' : now > end ? 'completed' : 'live';
      const country = countryCodeOf(e.City, e.Country);
      const ll = latLngOf(country);
      return {
        id: `p-${e.EventId}`,
        name: e.EventName,
        tier: TYPE_TIER[e.EventType] ?? 'contender',
        location: [e.City, e.Country].filter(Boolean).join(', '),
        country,
        lat: ll.lat,
        lng: ll.lng,
        startDate: e.StartDateTime.slice(0, 10),
        endDate: (e.EndDateTime || e.StartDateTime).slice(0, 10),
        status,
        disruptionScore: status === 'live' ? 60 : 20,
        participants: undefined,
      };
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** 拉取单场赛事赛果 → 站内 LiveMatch[]（进行中/已完赛） */
export async function fetchParseEventResults(eventId: string): Promise<LiveMatch[]> {
  const data = await callApi<{ results: ParseResult[] }>(
    'get_event_results',
    { event_id: eventId },
    10 * 60 * 1000,
    `parsebot:results:${eventId}`,
  );
  if (!data?.results?.length) return [];

  return data.results
    .filter((r) => r.match_card?.competitors?.length === 2)
    .slice(0, 8)
    .map((r) => {
      const comps = r.match_card!.competitors!;
      const overall = r.match_card!.overallScores ?? '0-0';
      const sets = String(overall).split('-').map(Number);
      const status: LiveMatch['status'] = String(r.fullResults ?? r.match_card?.resultStatus ?? '').includes('OFFICIAL')
        ? 'finished'
        : 'live';
      return {
        id: `pr-${r.iD ?? r.eventId + comps[0].competitiorOrg + comps[1].competitiorOrg}`,
        tournament: r.match_card?.subEventName ?? 'Match',
        player1: comps[0].competitiorName ?? 'TBD',
        player2: comps[1].competitiorName ?? 'TBD',
        country1: comps[0].competitiorOrg ?? 'UNK',
        country2: comps[1].competitiorOrg ?? 'UNK',
        score: overall,
        set: Math.max(sets[0], sets[1]) + 1,
        status,
        upsetAlert: /^OFFICIAL/.test(String(r.fullResults)) ? undefined : undefined,
        category: r.subEventType?.toLowerCase().includes('youth') ? 'youth' : 'pro',
      };
    });
}