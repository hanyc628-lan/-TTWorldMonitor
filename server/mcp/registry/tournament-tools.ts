import type { CacheToolDef } from '../types.js';
import { readOnlyTool } from '../types.js';
import { TOURNAMENTS, LIVE_MATCHES } from '../../../src/data/seed.js';
import { envelope } from './helpers.js';

export const TOURNAMENT_TOOLS: CacheToolDef[] = [
  {
    ...readOnlyTool({
      name: 'get_match_by_id',
      description: 'Single match details by match ID from live score feed.',
      _outputBudgetBytes: 16384,
      inputSchema: {
        type: 'object',
        properties: { match_id: { type: 'string' } },
        required: ['match_id'],
      },
      outputSchema: envelope({ match: { type: 'object' } }),
    }),
    _getData: async (params) => {
      const match = LIVE_MATCHES.find((m) => m.id === params.match_id);
      return match ? { match } : { error: 'Match not found', match_id: params.match_id };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_active_matches',
      description: 'Matches currently in progress across all live tournaments.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ matches: { type: 'array' } }),
    }),
    _getData: async () => ({
      matches: LIVE_MATCHES.filter((m) => m.status === 'live'),
      count: LIVE_MATCHES.filter((m) => m.status === 'live').length,
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_upset_heatmap_data',
      description: 'Upset frequency data by tournament for map upset heatmap layer.',
      _outputBudgetBytes: 32768,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ venues: { type: 'array' } }),
    }),
    _getData: async () => {
      const upsets = LIVE_MATCHES.filter((m) => m.upsetAlert);
      const venues = TOURNAMENTS.map((t) => ({
        tournament: t.name,
        country: t.country,
        lat: t.lat,
        lng: t.lng,
        upsetCount: upsets.filter((m) => m.tournament.includes(t.name.split(' ')[1] ?? t.name)).length,
        disruptionScore: t.disruptionScore,
      }));
      return { venues, totalUpsets: upsets.length };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_chokepoint_tournaments',
      description: 'High-disruption tournament chokepoints — Grand Smash, Worlds, Olympics.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: { min_score: { type: 'number' } },
        required: [],
      },
      outputSchema: envelope({ chokepoints: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const min = Number(params.min_score ?? 80);
      const chokepoints = TOURNAMENTS
        .filter((t) => t.disruptionScore >= min)
        .sort((a, b) => b.disruptionScore - a.disruptionScore);
      return { chokepoints, threshold: min };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_tournament_calendar_month',
      description: 'Tournament calendar filtered by month (YYYY-MM format).',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: { month: { type: 'string', description: 'YYYY-MM e.g. 2026-03' } },
        required: ['month'],
      },
      outputSchema: envelope({ tournaments: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const month = String(params.month);
      const tournaments = TOURNAMENTS.filter(
        (t) => t.startDate.startsWith(month) || t.endDate.startsWith(month),
      );
      return { tournaments, month, count: tournaments.length };
    },
  },
];
