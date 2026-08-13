import type { CacheToolDef } from '../types.js';
import { readOnlyTool } from '../types.js';
import { enrichTPIRecords } from '../../../src/server/tpi-scoring.js';
import { COUNTRY_TPI, SIGNALS } from '../../../src/data/seed.js';
import { envelope } from './helpers.js';

const ASIA = new Set(['CHN', 'JPN', 'KOR', 'TPE', 'HKG', 'SGP', 'IND', 'THA']);
const EUROPE = new Set(['SWE', 'FRA', 'GER', 'ENG', 'POR', 'ROU', 'AUT', 'POL']);

export const COUNTRY_TOOLS: CacheToolDef[] = [
  {
    ...readOnlyTool({
      name: 'get_tpi_leaderboard',
      description: 'All nations ranked by Table Tennis Power Index v1 composite score.',
      _outputBudgetBytes: 131072,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ countries: { type: 'array' } }),
      _apiPaths: ['GET /api/tpi'],
    }),
    _getData: async () => ({
      countries: enrichTPIRecords(COUNTRY_TPI).sort((a, b) => b.score - a.score),
      methodologyVersion: 'v1',
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_tpi_by_region',
      description: 'TPI scores filtered by region: asia, europe, or americas.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: { region: { type: 'string', enum: ['asia', 'europe', 'americas'] } },
        required: ['region'],
      },
      outputSchema: envelope({ countries: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const region = String(params.region).toLowerCase();
      let all = enrichTPIRecords(COUNTRY_TPI);
      if (region === 'asia') all = all.filter((t) => ASIA.has(t.country));
      else if (region === 'europe') all = all.filter((t) => EUROPE.has(t.country));
      else if (region === 'americas') all = all.filter((t) => ['BRA', 'USA', 'CAN'].includes(t.country));
      return { countries: all.sort((a, b) => b.score - a.score), region };
    },
  },
  {
    ...readOnlyTool({
      name: 'compare_countries_tpi',
      description: 'Side-by-side TPI comparison for two or more nations.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: {
          country_codes: { type: 'array', items: { type: 'string' }, description: 'e.g. ["CHN","JPN"]' },
        },
        required: ['country_codes'],
      },
      outputSchema: envelope({ comparison: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const codes = (params.country_codes as string[]).map((c) => c.toUpperCase());
      const all = enrichTPIRecords(COUNTRY_TPI);
      const comparison = codes.map((code) => all.find((t) => t.country === code) ?? { country: code, error: 'not found' });
      return { comparison };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_tpi_movers',
      description: 'Nations with largest 24h TPI score changes.',
      _outputBudgetBytes: 32768,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ movers: { type: 'array' } }),
    }),
    _getData: async () => ({
      movers: enrichTPIRecords(COUNTRY_TPI)
        .filter((t) => t.change24h !== 0)
        .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
        .map((t) => ({ country: t.country, change24h: t.change24h, trend: t.trend, score: t.score })),
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_national_federation_status',
      description: 'Federation-level status: TPI score, top players, and strategic brief per nation.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: { country_code: { type: 'string' } },
        required: ['country_code'],
      },
      outputSchema: envelope({ federation: { type: 'object' } }),
    }),
    _getData: async (params) => {
      const code = String(params.country_code).toUpperCase();
      const tpi = enrichTPIRecords(COUNTRY_TPI).find((t) => t.country === code);
      if (!tpi) return { error: 'Country not found', country_code: code };
      return { federation: { country: code, tpi, brief: tpi.brief, topPlayers: tpi.topPlayers } };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_country_risk_score',
      description: 'Inverse TPI risk score with active signal count — higher means more instability.',
      _outputBudgetBytes: 32768,
      inputSchema: {
        type: 'object',
        properties: { country_code: { type: 'string' } },
        required: ['country_code'],
      },
      outputSchema: envelope({ risk: { type: 'object' } }),
    }),
    _getData: async (params) => {
      const code = String(params.country_code).toUpperCase();
      const tpi = enrichTPIRecords(COUNTRY_TPI).find((t) => t.country === code);
      const signalCount = SIGNALS.filter((s) => s.countries.includes(code)).length;
      const highSeverity = SIGNALS.filter((s) => s.countries.includes(code) && s.severity === 'high').length;
      const riskScore = tpi ? Math.min(100, Math.round(100 - tpi.score + signalCount * 5 + highSeverity * 10)) : 50;
      return {
        risk: {
          country: code,
          riskScore,
          tpiScore: tpi?.score,
          signalCount,
          highSeverityCount: highSeverity,
          trend: tpi?.trend,
        },
      };
    },
  },
];
