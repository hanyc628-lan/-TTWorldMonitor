import type { CacheToolDef } from '../types.js';
import { readOnlyTool } from '../types.js';
import { fetchWorldRankings, fetchYouthRankings } from '../../ittf/client.js';
import { enrichTPIRecords } from '../../../src/server/tpi-scoring.js';
import { COUNTRY_TPI, SIGNALS, TOURNAMENTS, LIVE_MATCHES, RANKING_MOVERS } from '../../../src/data/seed.js';
import { simulateStreamStatuses } from '../../streams.js';
import { STREAM_SOURCES } from '../../../src/config/stream-sources.js';
import { analyzeSignals } from '../../../src/services/analysis-core.js';

const envelope = (props: Record<string, unknown>) => ({
  type: 'object',
  properties: { data: { type: 'object', properties: props }, fetchedAt: { type: 'string' } },
});

export const CACHE_TOOLS: CacheToolDef[] = [
  {
    ...readOnlyTool({
      name: 'get_world_rankings',
      description: 'ITTF world ranking table. Returns ranked players with position, name, country, points, and rank changes. Live data from ITTF via ittf-pingpong.',
      _outputBudgetBytes: 262144,
      inputSchema: {
        type: 'object',
        properties: {
          gender: { type: 'string', enum: ['M', 'W'], description: 'M=Men, W=Women' },
          top: { type: 'number', description: 'Number of players (default 100)' },
        },
        required: [],
      },
      outputSchema: envelope({
        rankings: { type: 'array', items: { type: 'object' } },
        source: { type: 'string' },
      }),
      _apiPaths: ['GET /api/rankings'],
    }),
    _getData: async (params) => {
      const gender = (params.gender as 'M' | 'W') ?? 'M';
      const top = Number(params.top ?? 100);
      const rankings = await fetchWorldRankings(gender, top);
      return { rankings, source: 'ittf', gender, count: rankings.length };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_youth_rankings',
      description: 'ITTF youth (U15/U18/U21 aggregate) world rankings.',
      _outputBudgetBytes: 131072,
      inputSchema: {
        type: 'object',
        properties: {
          gender: { type: 'string', enum: ['M', 'W'] },
          top: { type: 'number' },
        },
        required: [],
      },
      outputSchema: envelope({ rankings: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const gender = (params.gender as 'M' | 'W') ?? 'M';
      const rankings = await fetchYouthRankings(gender, Number(params.top ?? 50));
      return { rankings, source: 'ittf', count: rankings.length };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_country_tpi',
      description: 'Table Tennis Power Index v1 for a nation. Composite score from senior strength, youth pipeline, tournament momentum, doubles depth, and news velocity.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: { country_code: { type: 'string', description: 'ISO country code e.g. CHN, JPN' } },
        required: ['country_code'],
      },
      outputSchema: envelope({ country: { type: 'string' }, score: { type: 'number' }, components: { type: 'object' } }),
    }),
    _getData: async (params) => {
      const code = String(params.country_code).toUpperCase();
      const tpi = enrichTPIRecords(COUNTRY_TPI).find((t) => t.country === code);
      if (!tpi) return { error: 'Country not found', country_code: code };
      return tpi;
    },
  },
  {
    ...readOnlyTool({
      name: 'get_all_tpi',
      description: 'All nations TPI scores sorted by composite power index.',
      _outputBudgetBytes: 131072,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ countries: { type: 'array' } }),
    }),
    _getData: async () => ({
      countries: enrichTPIRecords(COUNTRY_TPI).sort((a, b) => b.score - a.score),
      methodologyVersion: 'v1',
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_live_matches',
      description: 'Currently live or recent match scores from WTT events.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ matches: { type: 'array' } }),
    }),
    _getData: async () => ({ matches: LIVE_MATCHES }),
  },
  {
    ...readOnlyTool({
      name: 'get_tournaments',
      description: 'Tournament calendar with disruption scores. Major events: WTT Grand Smash, Worlds, Olympics.',
      _outputBudgetBytes: 131072,
      inputSchema: {
        type: 'object',
        properties: { status: { type: 'string', enum: ['live', 'upcoming', 'completed'] } },
        required: [],
      },
      outputSchema: envelope({ tournaments: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const status = params.status as string | undefined;
      const tournaments = status
        ? TOURNAMENTS.filter((t) => t.status === status)
        : TOURNAMENTS;
      return { tournaments, count: tournaments.length };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_signals',
      description: 'Fused intelligence signals: news, results, upsets, ranking changes, injuries, transfers.',
      _outputBudgetBytes: 131072,
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'Filter by signal type' },
          limit: { type: 'number' },
        },
        required: [],
      },
      outputSchema: envelope({ signals: { type: 'array' } }),
    }),
    _getData: async (params) => {
      let signals = [...SIGNALS];
      if (params.type) signals = signals.filter((s) => s.type === params.type);
      const limit = Number(params.limit ?? 20);
      return { signals: signals.slice(0, limit), count: signals.length };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_ranking_movers',
      description: 'Weekly biggest ranking changes with reasons.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ movers: { type: 'array' } }),
    }),
    _getData: async () => ({ movers: RANKING_MOVERS }),
  },
  {
    ...readOnlyTool({
      name: 'get_stream_status',
      description: 'Live stream signal status for CCTV, WTT YouTube, Douyin teaching streams (小韩老师).',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ streams: { type: 'array' } }),
    }),
    _getData: async () => {
      const statuses = simulateStreamStatuses();
      return {
        streams: statuses,
        liveCount: statuses.filter((s) => s.live).length,
      };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_stream_sources',
      description: 'All registered live stream sources with URLs and schedules.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ sources: { type: 'array' } }),
    }),
    _getData: async () => ({ sources: STREAM_SOURCES }),
  },
  {
    ...readOnlyTool({
      name: 'analyze_signals',
      description: 'Run correlation analysis on signals: velocity spikes and multi-signal convergence detection.',
      _outputBudgetBytes: 131072,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ analysis: { type: 'array' } }),
    }),
    _getData: async () => ({
      analysis: analyzeSignals(SIGNALS),
      convergence: analyzeSignals(SIGNALS).filter((a) => a.type === 'convergence'),
      signalCount: SIGNALS.length,
    }),
  },
];
