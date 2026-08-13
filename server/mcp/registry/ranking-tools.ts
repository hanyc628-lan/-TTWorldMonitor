import type { CacheToolDef } from '../types.js';
import { readOnlyTool } from '../types.js';
import {
  fetchWorldRankings,
  fetchDoublesRankings,
  fetchDoublesIndividualRankings,
  aggregateByCountry,
  computeMovers,
  getRankingMeta,
} from '../../ittf/client.js';
import { envelope } from './helpers.js';

export const RANKING_TOOLS: CacheToolDef[] = [
  {
    ...readOnlyTool({
      name: 'get_doubles_pair_rankings_men',
      description: 'ITTF senior men doubles pair rankings (team pairs).',
      _outputBudgetBytes: 131072,
      inputSchema: { type: 'object', properties: { top: { type: 'number' } }, required: [] },
      outputSchema: envelope({ rankings: { type: 'array' } }),
    }),
    _getData: async (params) => ({
      rankings: await fetchDoublesRankings('M', Number(params.top ?? 50)),
      category: 'doubles_pair',
      gender: 'M',
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_doubles_pair_rankings_women',
      description: 'ITTF senior women doubles pair rankings (team pairs).',
      _outputBudgetBytes: 131072,
      inputSchema: { type: 'object', properties: { top: { type: 'number' } }, required: [] },
      outputSchema: envelope({ rankings: { type: 'array' } }),
    }),
    _getData: async (params) => ({
      rankings: await fetchDoublesRankings('W', Number(params.top ?? 50)),
      category: 'doubles_pair',
      gender: 'W',
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_mixed_doubles_rankings',
      description: 'ITTF senior mixed doubles pair rankings.',
      _outputBudgetBytes: 131072,
      inputSchema: { type: 'object', properties: { top: { type: 'number' } }, required: [] },
      outputSchema: envelope({ rankings: { type: 'array' } }),
    }),
    _getData: async (params) => ({
      rankings: await fetchDoublesRankings('X', Number(params.top ?? 50)),
      category: 'mixed_doubles',
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_doubles_individual_men',
      description: 'ITTF senior men doubles individual rankings.',
      _outputBudgetBytes: 131072,
      inputSchema: { type: 'object', properties: { top: { type: 'number' } }, required: [] },
      outputSchema: envelope({ rankings: { type: 'array' } }),
    }),
    _getData: async (params) => ({
      rankings: await fetchDoublesIndividualRankings('M', Number(params.top ?? 50)),
      category: 'doubles_individual',
      gender: 'M',
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_doubles_individual_women',
      description: 'ITTF senior women doubles individual rankings.',
      _outputBudgetBytes: 131072,
      inputSchema: { type: 'object', properties: { top: { type: 'number' } }, required: [] },
      outputSchema: envelope({ rankings: { type: 'array' } }),
    }),
    _getData: async (params) => ({
      rankings: await fetchDoublesIndividualRankings('W', Number(params.top ?? 50)),
      category: 'doubles_individual',
      gender: 'W',
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_country_ranking_aggregate',
      description: 'Aggregate ITTF ranking points by nation from live singles rankings.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: {
          gender: { type: 'string', enum: ['M', 'W'] },
          top: { type: 'number', description: 'Players to scan (default 200)' },
        },
        required: [],
      },
      outputSchema: envelope({ countries: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const gender = (params.gender as 'M' | 'W') ?? 'M';
      const rankings = await fetchWorldRankings(gender, Number(params.top ?? 200));
      return { countries: aggregateByCountry(rankings), gender };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_top_risers',
      description: 'Biggest ranking climbers from live ITTF data this week.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: {
          gender: { type: 'string', enum: ['M', 'W'] },
          min_change: { type: 'number' },
          limit: { type: 'number' },
        },
        required: [],
      },
      outputSchema: envelope({ risers: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const gender = (params.gender as 'M' | 'W') ?? 'M';
      const rankings = await fetchWorldRankings(gender, 200);
      const { risers } = computeMovers(rankings, Number(params.min_change ?? 1));
      const limit = Number(params.limit ?? 20);
      return { risers: risers.slice(0, limit), gender };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_top_fallers',
      description: 'Biggest ranking drops from live ITTF data this week.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: {
          gender: { type: 'string', enum: ['M', 'W'] },
          min_change: { type: 'number' },
          limit: { type: 'number' },
        },
        required: [],
      },
      outputSchema: envelope({ fallers: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const gender = (params.gender as 'M' | 'W') ?? 'M';
      const rankings = await fetchWorldRankings(gender, 200);
      const { fallers } = computeMovers(rankings, Number(params.min_change ?? 1));
      const limit = Number(params.limit ?? 20);
      return { fallers: fallers.slice(0, limit), gender };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_ranking_week_meta',
      description: 'ITTF ranking publication week and data source metadata.',
      _outputBudgetBytes: 4096,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ source: { type: 'string' }, week: { type: 'string' } }),
    }),
    _getData: async () => getRankingMeta(),
  },
];
