import type { IncomingMessage, ServerResponse } from 'node:http';
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

    const all: Record<string, unknown> = {
      tpi: enrichTPIRecords(COUNTRY_TPI),
      signals: SIGNALS,
      tournaments: TOURNAMENTS,
      liveMatches: LIVE_MATCHES,
      rankingMovers: RANKING_MOVERS,
      streamStatuses: simulateStreamStatuses(),
      rankings: { men: menRankings, women: womenRankings, source: 'ittf' },
      leagues: LEAGUES,
      clubs: CLUBS,
      clubFixtures: CLUB_FIXTURES,
      leagueStats: LEAGUE_STATS,
      equipmentTrends: EQUIPMENT_TRENDS,
      apparelItems: APPAREL_ITEMS,
      learningModules: LEARNING_MODULES,
      participationStats: PARTICIPATION_STATS,
      grassrootsEvents: GRASSROOTS_EVENTS,
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
