import type { RpcToolDef } from '../types.js';
import { readOnlyTool } from '../types.js';
import { searchPlayers, fetchPlayerProfile, fetchWorldRankings } from '../../ittf/client.js';
import { enrichTPIRecords } from '../../../src/server/tpi-scoring.js';
import { COUNTRY_TPI } from '../../../src/data/seed.js';

export const RPC_TOOLS: RpcToolDef[] = [
  {
    ...readOnlyTool({
      name: 'search_players',
      description: 'Search ITTF player database by name. Returns ITTF IDs for profile lookup. Live ITTF data.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Player full name e.g. "WANG Chuqin"' },
        },
        required: ['name'],
      },
      outputSchema: { type: 'object', properties: { players: { type: 'array' } } },
      _apiPaths: ['GET /api/players/search'],
    }),
    _execute: async (params) => {
      const players = await searchPlayers(String(params.name));
      return { players, query: params.name };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_player_profile',
      description: 'Full ITTF player profile by ITTF ID: career stats, best rank, win/loss record.',
      _outputBudgetBytes: 131072,
      inputSchema: {
        type: 'object',
        properties: {
          ittf_id: { type: 'number', description: 'ITTF player ID' },
        },
        required: ['ittf_id'],
      },
      outputSchema: { type: 'object', properties: { profile: { type: 'object' } } },
      _apiPaths: ['GET /api/players/:id/profile'],
    }),
    _execute: async (params) => {
      const profile = await fetchPlayerProfile(Number(params.ittf_id));
      return { profile };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_player_ranking',
      description: 'Look up a specific player current world ranking by name.',
      _outputBudgetBytes: 32768,
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          gender: { type: 'string', enum: ['M', 'W'] },
        },
        required: ['name'],
      },
      outputSchema: { type: 'object', properties: { player: { type: 'object' } } },
    }),
    _execute: async (params) => {
      const gender = (params.gender as 'M' | 'W') ?? 'M';
      const rankings = await fetchWorldRankings(gender, 200);
      const q = String(params.name).toLowerCase();
      const player = rankings.find((r) => r.name.toLowerCase().includes(q));
      return player ? { player } : { error: 'Player not found in top 200', name: params.name };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_country_brief',
      description: 'AI-generated country dossier: TPI breakdown, top players, strategic brief.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: { country_code: { type: 'string' } },
        required: ['country_code'],
      },
      outputSchema: { type: 'object', properties: { brief: { type: 'string' }, tpi: { type: 'object' } } },
    }),
    _execute: async (params) => {
      const code = String(params.country_code).toUpperCase();
      const tpi = enrichTPIRecords(COUNTRY_TPI).find((t) => t.country === code);
      if (!tpi) return { error: 'Country not found' };
      return { country_code: code, tpi, brief: tpi.brief, topPlayers: tpi.topPlayers };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_douyin_teaching_stream',
      description: '小韩老师 Douyin table tennis teaching live stream status and URL.',
      _outputBudgetBytes: 16384,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: { type: 'object', properties: { url: { type: 'string' }, live: { type: 'boolean' } } },
    }),
    _execute: async () => {
      const { simulateStreamStatuses } = await import('../../streams.js');
      const { STREAM_SOURCES } = await import('../../../src/config/stream-sources.js');
      const src = STREAM_SOURCES.find((s) => s.id === 'douyin-xiaohan');
      const status = simulateStreamStatuses().find((s) => s.id === 'douyin-xiaohan');
      return {
        name: src?.name,
        url: src?.url ?? 'https://live.douyin.com/57194239656',
        live: status?.live ?? false,
        title: status?.title,
        viewers: status?.viewers,
        schedule: src?.schedule,
      };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_evolution_state',
      description: 'AI self-evolution engine state: first-principles axioms, adjusted weights, daily insights.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: { type: 'object', properties: { axioms: { type: 'array' }, insights: { type: 'array' } } },
    }),
    _execute: async () => {
      const { CORE_AXIOMS } = await import('../../../src/config/evolution-axioms.js');
      const { MOTION_AXIOMS } = await import('../../../src/data/motion-lab.js');
      const { getCloudEvolutionState, getCloudWorkerStatus } = await import('../../evolution/worker.js');
      const state = await getCloudEvolutionState();
      const status = getCloudWorkerStatus();
      return {
        version: 2,
        axioms: CORE_AXIOMS,
        motionAxioms: MOTION_AXIOMS,
        state,
        cloud: status,
        pipeline: ['observe', 'hypothesize', 'verify', 'adjust', 'insight', 'learn'],
        note: 'Cloud-persisted evolution state; worker runs continuously on server.',
        methodology: 'first-principles',
      };
    },
  },
];
