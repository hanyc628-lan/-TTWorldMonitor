import type { RpcToolDef } from '../types.js';
import { readOnlyTool } from '../types.js';
import {
  searchPlayers,
  searchPlayersByFamilyName,
  searchPlayersByGivenName,
  fetchPlayerProfile,
  fetchPlayerProfileExtended,
  getPlayersByCountry,
  fetchWorldRankings,
} from '../../ittf/client.js';
import { simpleOutput } from './helpers.js';

export const PLAYER_TOOLS: RpcToolDef[] = [
  {
    ...readOnlyTool({
      name: 'get_players_by_country',
      description: 'List ITTF-ranked players from a nation. Live singles data.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: {
          country_code: { type: 'string' },
          gender: { type: 'string', enum: ['M', 'W'] },
          limit: { type: 'number' },
        },
        required: ['country_code'],
      },
      outputSchema: simpleOutput({ players: { type: 'array' } }),
      _apiPaths: ['GET /api/rankings'],
    }),
    _execute: async (params) => {
      const players = await getPlayersByCountry(
        String(params.country_code),
        (params.gender as 'M' | 'W') ?? 'M',
        200,
      );
      return { players: players.slice(0, Number(params.limit ?? 20)), country: String(params.country_code).toUpperCase() };
    },
  },
  {
    ...readOnlyTool({
      name: 'search_by_family_name',
      description: 'Search ITTF player database by family name (e.g. WANG, HARIMOTO).',
      _outputBudgetBytes: 32768,
      inputSchema: {
        type: 'object',
        properties: { family_name: { type: 'string' } },
        required: ['family_name'],
      },
      outputSchema: simpleOutput({ players: { type: 'array' } }),
    }),
    _execute: async (params) => ({
      players: await searchPlayersByFamilyName(String(params.family_name)),
      query: params.family_name,
    }),
  },
  {
    ...readOnlyTool({
      name: 'search_by_given_name',
      description: 'Search ITTF player database by given name.',
      _outputBudgetBytes: 32768,
      inputSchema: {
        type: 'object',
        properties: { given_name: { type: 'string' } },
        required: ['given_name'],
      },
      outputSchema: simpleOutput({ players: { type: 'array' } }),
    }),
    _execute: async (params) => ({
      players: await searchPlayersByGivenName(String(params.given_name)),
      query: params.given_name,
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_player_extended_profile',
      description: 'Full ITTF player profile with extended career statistics.',
      _outputBudgetBytes: 131072,
      inputSchema: {
        type: 'object',
        properties: { ittf_id: { type: 'number' } },
        required: ['ittf_id'],
      },
      outputSchema: simpleOutput({ profile: { type: 'object' } }),
    }),
    _execute: async (params) => ({
      profile: await fetchPlayerProfileExtended(Number(params.ittf_id)),
    }),
  },
  {
    ...readOnlyTool({
      name: 'compare_players',
      description: 'Compare two players by current ITTF ranking and points.',
      _outputBudgetBytes: 32768,
      inputSchema: {
        type: 'object',
        properties: {
          player1: { type: 'string', description: 'Player 1 name' },
          player2: { type: 'string', description: 'Player 2 name' },
          gender: { type: 'string', enum: ['M', 'W'] },
        },
        required: ['player1', 'player2'],
      },
      outputSchema: simpleOutput({ comparison: { type: 'object' } }),
    }),
    _execute: async (params) => {
      const gender = (params.gender as 'M' | 'W') ?? 'M';
      const rankings = await fetchWorldRankings(gender, 200);
      const q1 = String(params.player1).toLowerCase();
      const q2 = String(params.player2).toLowerCase();
      const p1 = rankings.find((r) => r.name.toLowerCase().includes(q1));
      const p2 = rankings.find((r) => r.name.toLowerCase().includes(q2));
      return {
        comparison: {
          player1: p1 ?? { error: 'not found', query: params.player1 },
          player2: p2 ?? { error: 'not found', query: params.player2 },
          rankGap: p1 && p2 ? Math.abs(p1.rank - p2.rank) : null,
          pointsGap: p1 && p2 ? Math.abs(p1.points - p2.points) : null,
        },
      };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_player_win_loss',
      description: 'Player win/loss record and best ranking from ITTF profile.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: {
          ittf_id: { type: 'number' },
          name: { type: 'string', description: 'Alternative: search by name first' },
        },
        required: [],
      },
      outputSchema: simpleOutput({ stats: { type: 'object' } }),
    }),
    _execute: async (params) => {
      let ittfId = Number(params.ittf_id);
      if (!ittfId && params.name) {
        const found = await searchPlayers(String(params.name));
        ittfId = Number(found[0]?.ittfId);
      }
      if (!ittfId) return { error: 'Provide ittf_id or name' };
      const profile = await fetchPlayerProfile(ittfId);
      return {
        stats: {
          ittfId: profile.ittfId,
          name: profile.name,
          country: profile.country,
          bestRank: profile.bestRank,
          wins: profile.wins,
          losses: profile.losses,
        },
      };
    },
  },
];
