import type { RpcToolDef } from '../types.js';
import { readOnlyTool } from '../types.js';
import { enrichTPIRecords } from '../../../src/server/tpi-scoring.js';
import { COUNTRY_TPI, SIGNALS, TOURNAMENTS, LIVE_MATCHES } from '../../../src/data/seed.js';
import { fetchWorldRankings, getPlayersByCountry } from '../../ittf/client.js';
import { analyzeSignals } from '../../../src/services/analysis-core.js';
import { simpleOutput } from './helpers.js';

export const ANALYSIS_TOOLS: RpcToolDef[] = [
  {
    ...readOnlyTool({
      name: 'get_world_brief',
      description: 'Synthesized world table tennis brief: top nations, live rankings leaders, active signals.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: simpleOutput({ brief: { type: 'string' }, leaders: { type: 'object' } }),
    }),
    _execute: async () => {
      const tpi = enrichTPIRecords(COUNTRY_TPI).sort((a, b) => b.score - a.score);
      const men = await fetchWorldRankings('M', 3);
      const women = await fetchWorldRankings('W', 3);
      const liveTournaments = TOURNAMENTS.filter((t) => t.status === 'live');
      const brief = [
        `TPI 榜首：${tpi[0]?.country}（${tpi[0]?.score}分）`,
        `男单 #1 ${men[0]?.name}，女单 #1 ${women[0]?.name}`,
        `${liveTournaments.length} 场赛事进行中，${SIGNALS.filter((s) => s.severity === 'high').length} 条高优先级信号`,
      ].join('。');
      return {
        brief,
        leaders: { men: men[0], women: women[0], topTPI: tpi.slice(0, 3) },
        generatedAt: new Date().toISOString(),
      };
    },
  },
  {
    ...readOnlyTool({
      name: 'analyze_country_situation',
      description: 'Multi-signal country situation analysis combining TPI, signals, and live players.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: { country_code: { type: 'string' } },
        required: ['country_code'],
      },
      outputSchema: simpleOutput({ assessment: { type: 'string' } }),
    }),
    _execute: async (params) => {
      const code = String(params.country_code).toUpperCase();
      const tpi = enrichTPIRecords(COUNTRY_TPI).find((t) => t.country === code);
      const signals = SIGNALS.filter((s) => s.countries.includes(code));
      const players = await getPlayersByCountry(code, 'M', 5).catch(() => []);
      const womenPlayers = await getPlayersByCountry(code, 'W', 5).catch(() => []);
      if (!tpi) return { error: 'Country not found', country_code: code };
      const assessment = [
        tpi.brief,
        `活跃信号 ${signals.length} 条，TPI ${tpi.score}（${tpi.trend}）`,
        players[0] ? `男单最高排名 #${players[0].rank} ${players[0].name}` : '',
        womenPlayers[0] ? `女单最高排名 #${womenPlayers[0].rank} ${womenPlayers[0].name}` : '',
      ].filter(Boolean).join(' ');
      return { country: code, tpi, signals, assessment, topMen: players.slice(0, 3), topWomen: womenPlayers.slice(0, 3) };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_correlation_summary',
      description: 'Correlation engine summary across results, ranking, tournament, and news domains.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: simpleOutput({ domains: { type: 'array' } }),
    }),
    _execute: async () => {
      const analysis = analyzeSignals(SIGNALS);
      const upsetMatches = LIVE_MATCHES.filter((m) => m.upsetAlert);
      return {
        domains: ['results', 'ranking', 'tournament', 'news'],
        convergenceCount: analysis.filter((a) => a.type === 'convergence').length,
        velocitySpikeCount: analysis.filter((a) => a.type === 'velocity_spike').length,
        upsetMatches: upsetMatches.length,
        liveTournaments: TOURNAMENTS.filter((t) => t.status === 'live').length,
        topAnalysis: analysis.slice(0, 5),
      };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_breaking_alerts',
      description: 'Breaking news alerts: high-severity signals and live upset matches.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: simpleOutput({ alerts: { type: 'array' } }),
    }),
    _execute: async () => {
      const signalAlerts = SIGNALS.filter((s) => s.severity === 'high').map((s) => ({
        type: 'signal',
        title: s.title,
        timestamp: s.timestamp,
        countries: s.countries,
      }));
      const matchAlerts = LIVE_MATCHES.filter((m) => m.upsetAlert || m.status === 'live').map((m) => ({
        type: m.upsetAlert ? 'upset' : 'live',
        title: `${m.player1} vs ${m.player2} — ${m.tournament}`,
        score: m.score,
      }));
      return { alerts: [...signalAlerts, ...matchAlerts], count: signalAlerts.length + matchAlerts.length };
    },
  },
];
