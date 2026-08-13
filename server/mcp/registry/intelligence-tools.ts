import type { CacheToolDef } from '../types.js';
import { readOnlyTool } from '../types.js';
import { SIGNALS } from '../../../src/data/seed.js';
import {
  analyzeSignals,
  detectVelocitySpikes,
  detectConvergence,
  formatRelativeTime,
} from '../../../src/services/analysis-core.js';
import { envelope } from './helpers.js';

export const INTELLIGENCE_TOOLS: CacheToolDef[] = [
  {
    ...readOnlyTool({
      name: 'get_signal_convergence',
      description: 'Multi-signal convergence detection — nations with 2+ independent signal types active.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ convergence: { type: 'array' } }),
    }),
    _getData: async () => ({
      convergence: detectConvergence(SIGNALS),
      signalCount: SIGNALS.length,
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_velocity_spikes',
      description: 'Signal velocity spikes — nations with abnormally high signal density in 1 hour.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ spikes: { type: 'array' } }),
    }),
    _getData: async () => ({ spikes: detectVelocitySpikes(SIGNALS) }),
  },
  {
    ...readOnlyTool({
      name: 'get_alert_digest',
      description: 'High-severity signal digest sorted by recency.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: { limit: { type: 'number' } }, required: [] },
      outputSchema: envelope({ alerts: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const alerts = SIGNALS
        .filter((s) => s.severity === 'high' || s.severity === 'medium')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, Number(params.limit ?? 10))
        .map((s) => ({ ...s, relativeTime: formatRelativeTime(s.timestamp) }));
      return { alerts, count: alerts.length };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_intel_timeline',
      description: 'Chronological intelligence timeline of all signals.',
      _outputBudgetBytes: 131072,
      inputSchema: { type: 'object', properties: { limit: { type: 'number' } }, required: [] },
      outputSchema: envelope({ timeline: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const timeline = [...SIGNALS]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, Number(params.limit ?? 50))
        .map((s) => ({ ...s, relativeTime: formatRelativeTime(s.timestamp) }));
      return { timeline };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_country_signal_feed',
      description: 'All signals affecting a specific nation.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: { country_code: { type: 'string' } },
        required: ['country_code'],
      },
      outputSchema: envelope({ signals: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const code = String(params.country_code).toUpperCase();
      const signals = SIGNALS.filter((s) => s.countries.includes(code));
      return { signals, country: code, count: signals.length };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_signal_by_severity',
      description: 'Filter signals by severity level: high, medium, or low.',
      _outputBudgetBytes: 65536,
      inputSchema: {
        type: 'object',
        properties: { severity: { type: 'string', enum: ['high', 'medium', 'low'] } },
        required: ['severity'],
      },
      outputSchema: envelope({ signals: { type: 'array' } }),
    }),
    _getData: async (params) => {
      const severity = String(params.severity);
      const signals = SIGNALS.filter((s) => s.severity === severity);
      return { signals, severity, count: signals.length };
    },
  },
  {
    ...readOnlyTool({
      name: 'get_hotspot_countries',
      description: 'Countries ranked by total signal count and severity weight.',
      _outputBudgetBytes: 32768,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ hotspots: { type: 'array' } }),
    }),
    _getData: async () => {
      const weights = { high: 3, medium: 2, low: 1 };
      const scores = new Map<string, number>();
      for (const s of SIGNALS) {
        const w = weights[s.severity];
        for (const c of s.countries) {
          scores.set(c, (scores.get(c) ?? 0) + w);
        }
      }
      const hotspots = [...scores.entries()]
        .map(([country, score]) => ({ country, score }))
        .sort((a, b) => b.score - a.score);
      return { hotspots, analysis: analyzeSignals(SIGNALS).length };
    },
  },
];
