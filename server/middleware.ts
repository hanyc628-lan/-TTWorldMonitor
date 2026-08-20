import type { IncomingMessage, ServerResponse } from 'node:http';
import type { LiveMatch } from '../src/types/index.js';
import jmespath from 'jmespath';
import { handleMcpRequest } from './mcp/handler.js';
import { fetchWorldRankings, fetchYouthRankings, searchPlayers, fetchPlayerProfile } from './ittf/client.js';
import {
  COUNTRY_TPI,
  SIGNALS,
  TOURNAMENTS,
  LIVE_MATCHES,
  RANKING_MOVERS,
} from '../src/data/seed.js';
import { mergeTournamentSources, getCurrentFocusTournamentName } from '../src/data/tournament-calendar.js';
import {
  LEAGUES,
  CLUBS,
  CLUB_FIXTURES,
  LEAGUE_STATS,
  EQUIPMENT_TRENDS,
  APPAREL_ITEMS,
  LEARNING_MODULES,
  PARTICIPATION_STATS,
  GRASSROOTS_EVENTS,
} from '../src/data/ecosystem.js';
import { enrichTPIRecords } from '../src/server/tpi-scoring.js';
import { STREAM_SOURCES } from '../src/config/stream-sources.js';
import { simulateStreamStatuses } from './streams.js';
import { resolveStream } from './streams/resolver.js';
import { handleManifestRequest, handleSegmentRequest } from './streams/hls-proxy.js';
import { TOOL_REGISTRY } from './mcp/registry/index.js';
import {
  cloudEvolutionTick,
  getCloudEvolutionState,
  getCloudWorkerStatus,
  updateCloudPreferences,
} from './evolution/worker.js';
import { getPublicStats, loadVisitStats, recordVisit, type HitPayload } from './analytics/visits.js';
import { fetchLiveNews } from './news/rss.js';
import { buildLiveRankingMovers, enrichTPIWithLivePlayers } from './realtime/derived.js';
import { fetchParseTournaments, fetchParseEventResults } from './parsebot/client.js';
import { fetchTLeagueData } from './leagues/tleague.js';
import { fetchTTBLData } from './leagues/ttbl.js';
import { fetchGrassrootsData } from './grassroots/england.js';

/** 实时新闻优先，样本补充；附带 live 标记供前端诚实展示来源。 */
async function buildSignals() {
  const live = await fetchLiveNews();
  const samples = SIGNALS.map((s) => ({ ...s }));
  if (live.live) {
    const seenTitles = new Set(live.signals.map((s) => s.title));
    const merged = [...live.signals, ...samples.filter((s) => !seenTitles.has(s.title))];
    return { signals: merged, meta: { live: true, fetchedAt: live.fetchedAt } };
  }
  return { signals: samples, meta: { live: false, fetchedAt: live.fetchedAt } };
}

function sendJson(res: ServerResponse, data: unknown, status = 200, headers: Record<string, string> = {}): void {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(data));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function applyJmespath(data: unknown, expression?: string): unknown {
  if (!expression || typeof expression !== 'string') return data;
  try {
    return jmespath.search(data, expression);
  } catch {
    return data;
  }
}

export async function handleApiRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  searchParams: URLSearchParams,
): Promise<boolean> {
  // MCP endpoint
  if (pathname === '/mcp' || pathname === '/api/mcp') {
    await handleMcpRequest(req, res);
    return true;
  }

  if (pathname === '/.well-known/mcp' || pathname === '/.well-known/mcp.json') {
    sendJson(res, {
      name: 'TTWorldMonitor MCP',
      version: '0.1.0',
      transport: { type: 'streamableHttp' },
      endpoint: '/mcp',
      tools: TOOL_REGISTRY.length,
      documentation: 'https://github.com/ttworldmonitor',
    });
    return true;
  }

  // Evolution axioms (server-side reference)
  if (pathname === '/api/evolution/axioms') {
    const { CORE_AXIOMS } = await import('../src/config/evolution-axioms.js');
    const { MOTION_AXIOMS } = await import('../src/data/motion-lab.js');
    const { ELITE_DEMONSTRATIONS } = await import('../src/data/elite-demonstrations.js');
    sendJson(res, {
      version: 2,
      coreAxioms: CORE_AXIOMS,
      motionAxioms: MOTION_AXIOMS,
      eliteDemonstrations: ELITE_DEMONSTRATIONS.length,
      pipeline: ['observe', 'hypothesize', 'verify', 'adjust', 'insight', 'learn'],
    });
    return true;
  }

  // Bootstrap
  if (pathname === '/api/bootstrap') {
    const keys = searchParams.get('keys')?.split(',').filter(Boolean);
    const menRankings = await fetchWorldRankings('M', 100).catch(() => []);
    const womenRankings = await fetchWorldRankings('W', 100).catch(() => []);

    const { signals: mergedSignals, meta: signalsMeta } = await buildSignals();
    const tpi = await enrichTPIWithLivePlayers().catch(() => enrichTPIRecords(COUNTRY_TPI));
    const liveMovers = await buildLiveRankingMovers();
    const parseTournaments = await fetchParseTournaments(2026).catch(() => []);
    let parseMatches: LiveMatch[] = [];
    if (parseTournaments.length) {
      try {
        const liveEvents = parseTournaments.filter((t) => t.status === 'live').slice(0, 3);
        parseMatches = (await Promise.all(
          liveEvents.map((t) => fetchParseEventResults(t.id.replace('p-', '')).catch(() => [] as LiveMatch[])),
        )).flat().slice(0, 20);
      } catch { /* fallback below */ }
    }

    // 真实联赛数据（T联赛/TTBL）+ 基层赛事（异步并行，失败回退样本）
    const [tleague, ttbl, grassroots] = await Promise.allSettled([
      fetchTLeagueData(),
      fetchTTBLData(),
      fetchGrassrootsData(),
    ]);
    const tleagueOk = tleague.status === 'fulfilled' && tleague.value.ok;
    const ttblOk = ttbl.status === 'fulfilled' && ttbl.value.ok;
    const grassrootsOk = grassroots.status === 'fulfilled' && grassroots.value.ok;
    const tleagueData = tleagueOk ? tleague.value : null;
    const ttblData = ttblOk ? ttbl.value : null;
    const grassrootsData = grassrootsOk ? grassroots.value : null;

    const all: Record<string, unknown> = {
      tpi,
      signals: mergedSignals,
      signalsMeta,
      tournaments: mergeTournamentSources(parseTournaments),
      liveMatches: parseMatches.length ? parseMatches : LIVE_MATCHES,
      rankingMovers: liveMovers.length ? liveMovers : RANKING_MOVERS,
      streamStatuses: simulateStreamStatuses(),
      rankings: { men: menRankings, women: womenRankings, source: 'ittf' },
      leagues: [...(tleagueData?.leagues ?? []), ...(ttblData?.leagues ?? []), ...LEAGUES],
      clubs: [...(tleagueData?.clubs ?? []), ...(ttblData?.clubs ?? []), ...CLUBS],
      clubFixtures: [...(tleagueData?.clubFixtures ?? []), ...(ttblData?.clubFixtures ?? []), ...CLUB_FIXTURES],
      leagueStats: [...(tleagueData?.leagueStats ?? []), ...(ttblData?.leagueStats ?? []), ...LEAGUE_STATS],
      equipmentTrends: EQUIPMENT_TRENDS,
      apparelItems: APPAREL_ITEMS,
      learningModules: LEARNING_MODULES,
      participationStats: [...(grassrootsData?.participation ?? []), ...PARTICIPATION_STATS],
      grassrootsEvents: [...(grassrootsData?.events ?? []), ...GRASSROOTS_EVENTS],
    };

    if (!keys) {
      sendJson(res, all);
      return true;
    }

    const result: Record<string, unknown> = {};
    for (const key of keys) {
      if (key in all) result[key] = all[key];
    }
    sendJson(res, result);
    return true;
  }

  // ITTF REST API
  if (pathname === '/api/rankings') {
    const gender = (searchParams.get('gender') ?? 'M').toUpperCase() as 'M' | 'W';
    const topN = Number(searchParams.get('top') ?? 100);
    const data = await fetchWorldRankings(gender, topN);
    sendJson(res, applyJmespath(data, searchParams.get('jmespath') ?? undefined));
    return true;
  }

  if (pathname === '/api/rankings/youth') {
    const gender = (searchParams.get('gender') ?? 'M').toUpperCase() as 'M' | 'W';
    const data = await fetchYouthRankings(gender, Number(searchParams.get('top') ?? 50));
    sendJson(res, applyJmespath(data, searchParams.get('jmespath') ?? undefined));
    return true;
  }

  if (pathname === '/api/players/search') {
    const q = searchParams.get('q') ?? searchParams.get('name') ?? '';
    if (!q) {
      sendJson(res, { error: 'Missing q parameter' }, 400);
      return true;
    }
    const data = await searchPlayers(q);
    sendJson(res, applyJmespath(data, searchParams.get('jmespath') ?? undefined));
    return true;
  }

  if (pathname.startsWith('/api/players/') && pathname.endsWith('/profile')) {
    const id = Number(pathname.split('/')[3]);
    if (!id) {
      sendJson(res, { error: 'Invalid player id' }, 400);
      return true;
    }
    const data = await fetchPlayerProfile(id);
    sendJson(res, applyJmespath(data, searchParams.get('jmespath') ?? undefined));
    return true;
  }

  if (pathname === '/api/tpi') {
    sendJson(res, enrichTPIRecords(COUNTRY_TPI));
    return true;
  }

  if (pathname === '/api/streams/status') {
    sendJson(res, simulateStreamStatuses(), 200, { 'Cache-Control': 'no-cache' });
    return true;
  }

  const resolveMatch = pathname.match(/^\/api\/streams\/resolve\/([^/]+)$/);
  if (resolveMatch) {
    const streamId = decodeURIComponent(resolveMatch[1]);
    const resolved = await resolveStream(streamId);
    if (!resolved) {
      sendJson(res, { error: 'Unknown stream' }, 404);
      return true;
    }
    sendJson(res, {
      ...resolved,
      manifestUrl: resolved.mode === 'hls' ? `/api/streams/manifest/${streamId}` : undefined,
    });
    return true;
  }

  const manifestMatch = pathname.match(/^\/api\/streams\/manifest\/([^/]+)$/);
  if (manifestMatch) {
    const streamId = decodeURIComponent(manifestMatch[1]);
    const ok = await handleManifestRequest(streamId, res);
    if (!ok) sendJson(res, { error: 'Cannot resolve stream manifest' }, 502);
    return true;
  }

  const segmentMatch = pathname.match(/^\/api\/streams\/segment\/([^/]+)$/);
  if (segmentMatch) {
    const streamId = decodeURIComponent(segmentMatch[1]);
    const target = searchParams.get('u');
    if (!target) {
      sendJson(res, { error: 'Missing u parameter' }, 400);
      return true;
    }
    await handleSegmentRequest(streamId, target, res);
    return true;
  }

  if (pathname === '/api/health') {
    const cloud = getCloudWorkerStatus();
    sendJson(res, {
      status: 'ok',
      ittf: true,
      mcp: true,
      tools: TOOL_REGISTRY.length,
      cloud: cloud.running,
      evolution: cloud,
      analytics: getPublicStats(await loadVisitStats()),
    });
    return true;
  }

  // Cloud evolution API
  if (pathname === '/api/evolution/state' && req.method === 'GET') {
    const state = await getCloudEvolutionState();
    sendJson(res, { state, status: getCloudWorkerStatus() });
    return true;
  }

  if (pathname === '/api/evolution/status' && req.method === 'GET') {
    sendJson(res, getCloudWorkerStatus());
    return true;
  }

  if (pathname === '/api/evolution/tick' && req.method === 'POST') {
    const secret = process.env.TTWM_CRON_SECRET;
    if (secret && req.headers['x-ttworldmonitor-key'] !== secret) {
      sendJson(res, { error: 'Unauthorized' }, 401);
      return true;
    }
    const force = searchParams.get('force') === '1';
    const state = await cloudEvolutionTick(force);
    sendJson(res, { state, status: getCloudWorkerStatus() });
    return true;
  }

  if (pathname === '/api/evolution/preferences' && req.method === 'POST') {
    let body: Record<string, unknown> = {};
    try {
      const raw = await readBody(req);
      if (raw) body = JSON.parse(raw) as Record<string, unknown>;
    } catch { /* empty body */ }
    const state = await updateCloudPreferences({
      strokeFocus: body.strokeFocus as string | undefined,
      domainFocus: body.domainFocus as string | undefined,
      heatmapMetric: body.heatmapMetric as string | undefined,
      sessions: typeof body.sessions === 'number' ? body.sessions : undefined,
    });
    sendJson(res, { state });
    return true;
  }

  if (pathname === '/api/analytics/stats' && req.method === 'GET') {
    const stats = await loadVisitStats();
    sendJson(res, getPublicStats(stats), 200, { 'Cache-Control': 'public, max-age=30' });
    return true;
  }

  if (pathname === '/api/analytics/hit' && req.method === 'POST') {
    let body: HitPayload = { path: '/' };
    try {
      const raw = await readBody(req);
      if (raw) body = JSON.parse(raw) as HitPayload;
    } catch { /* defaults */ }
    const stats = await recordVisit(body, req);
    sendJson(res, getPublicStats(stats));
    return true;
  }

  return false;
}

export function createMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url) return next();
    const url = new URL(req.url, 'http://localhost');
    try {
      const handled = await handleApiRoute(req, res, url.pathname, url.searchParams);
      if (!handled) next();
    } catch (err) {
      sendJson(res, { error: String(err) }, 500);
    }
  };
}
