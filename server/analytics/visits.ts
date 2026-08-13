import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { IncomingMessage } from 'node:http';

const DATA_DIR = process.env.TTWM_DATA_DIR ?? join(process.cwd(), 'data');
const STATS_FILE = join(DATA_DIR, 'visit-stats.json');

export interface VisitStats {
  version: 1;
  publishedAt: string;
  totalPageViews: number;
  totalSessions: number;
  today: string;
  todayPageViews: number;
  todaySessions: number;
  byPath: Record<string, number>;
  lastVisitAt: string | null;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyStats(): VisitStats {
  return {
    version: 1,
    publishedAt: process.env.TTWM_PUBLISHED_AT ?? new Date().toISOString().slice(0, 10),
    totalPageViews: 0,
    totalSessions: 0,
    today: todayKey(),
    todayPageViews: 0,
    todaySessions: 0,
    byPath: {},
    lastVisitAt: null,
  };
}

export async function loadVisitStats(): Promise<VisitStats> {
  try {
    const raw = await readFile(STATS_FILE, 'utf-8');
    const stats = JSON.parse(raw) as VisitStats;
    if (stats.today !== todayKey()) {
      return { ...stats, today: todayKey(), todayPageViews: 0, todaySessions: 0 };
    }
    return stats;
  } catch {
    return emptyStats();
  }
}

async function saveVisitStats(stats: VisitStats): Promise<void> {
  await mkdir(dirname(STATS_FILE), { recursive: true });
  await writeFile(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
}

const BOT_PATTERN = /bot|crawl|spider|slurp|mediapartners|headless|preview|wget|curl\/|python-requests/i;

export function isBotUserAgent(ua: string | undefined): boolean {
  if (!ua) return false;
  return BOT_PATTERN.test(ua);
}

export interface HitPayload {
  path: string;
  sessionId?: string;
}

export async function recordVisit(
  payload: HitPayload,
  req?: IncomingMessage,
): Promise<VisitStats> {
  const ua = req?.headers['user-agent'];
  if (isBotUserAgent(typeof ua === 'string' ? ua : undefined)) {
    return loadVisitStats();
  }

  const path = payload.path?.split('?')[0] || '/';
  if (path.startsWith('/api/') || path.startsWith('/mcp')) {
    return loadVisitStats();
  }

  const stats = await loadVisitStats();
  const isNewDay = stats.today !== todayKey();
  const base = isNewDay
    ? { ...stats, today: todayKey(), todayPageViews: 0, todaySessions: 0 }
    : stats;

  const sessionKey = payload.sessionId?.slice(0, 64);
  const sessionSeenKey = sessionKey ? `__sess_${sessionKey}` : null;
  const isNewSession = sessionSeenKey && !base.byPath[sessionSeenKey];

  base.totalPageViews += 1;
  base.todayPageViews += 1;
  base.byPath[path] = (base.byPath[path] ?? 0) + 1;
  if (isNewSession && sessionSeenKey) {
    base.byPath[sessionSeenKey] = 1;
    base.totalSessions += 1;
    base.todaySessions += 1;
  }
  base.lastVisitAt = new Date().toISOString();

  await saveVisitStats(base);
  return base;
}

export function getPublicStats(stats: VisitStats) {
  const byPath = Object.fromEntries(
    Object.entries(stats.byPath).filter(([k]) => !k.startsWith('__sess_')),
  );
  return {
    totalPageViews: stats.totalPageViews,
    totalSessions: stats.totalSessions,
    todayPageViews: stats.todayPageViews,
    todaySessions: stats.todaySessions,
    publishedAt: stats.publishedAt,
    lastVisitAt: stats.lastVisitAt,
    byPath,
    siteUrl: process.env.TTWM_SITE_URL ?? null,
  };
}
