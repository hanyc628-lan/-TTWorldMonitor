import type { CacheToolDef } from '../types.js';
import { readOnlyTool } from '../types.js';
import { LAYER_REGISTRY } from '../../../src/config/map-layer-definitions.js';
import { VARIANT_CONFIGS } from '../../../src/config/variants/index.js';
import { COMMANDS } from '../../../src/config/commands.js';
import { FEED_SOURCES } from '../../../src/data/seed.js';
import { envelope } from './helpers.js';

export const CONFIG_TOOLS: CacheToolDef[] = [
  {
    ...readOnlyTool({
      name: 'get_map_layers',
      description: 'All registered map layer definitions with icons and bootstrap keys.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ layers: { type: 'array' } }),
    }),
    _getData: async () => ({
      layers: Object.values(LAYER_REGISTRY).map((l) => ({
        key: l.key,
        label: l.label,
        labelZh: l.labelZh,
        icon: l.icon,
        explanation: l.explanation,
        bootstrapKeys: l.bootstrapKeys,
      })),
      count: Object.keys(LAYER_REGISTRY).length,
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_dashboard_variants',
      description: 'Dashboard lens variants: world, pro, youth, equipment, asia, europe.',
      _outputBudgetBytes: 131072,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ variants: { type: 'object' } }),
    }),
    _getData: async () => ({
      variants: Object.fromEntries(
        Object.entries(VARIANT_CONFIGS).map(([key, v]) => [
          key,
          { name: v.name, description: v.description, panels: Object.keys(v.panels) },
        ]),
      ),
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_bootstrap_data',
      description: 'Bootstrap tier keys available for dashboard initial load.',
      _outputBudgetBytes: 8192,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ keys: { type: 'array' } }),
      _apiPaths: ['GET /api/bootstrap'],
    }),
    _getData: async () => ({
      keys: ['tpi', 'signals', 'tournaments', 'liveMatches', 'rankingMovers', 'streamStatuses', 'rankings'],
      endpoint: '/api/bootstrap?keys=tpi,signals',
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_methodology',
      description: 'TPI v1 scoring methodology and data source documentation.',
      _outputBudgetBytes: 16384,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ methodology: { type: 'object' } }),
    }),
    _getData: async () => ({
      methodology: {
        tpiVersion: 'v1',
        components: ['eliteOutput', 'pipelineDepth', 'eventGravity', 'massBase', 'systemMomentum'],
        rankingsSource: 'ittf-pingpong (live ITTF)',
        signalsSource: 'curated multi-source feed',
        correlationEngine: '4-domain adapter pattern (results, ranking, tournament, news)',
      },
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_feed_sources',
      description: 'Curated intelligence feed sources with category and volume.',
      _outputBudgetBytes: 32768,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ sources: { type: 'array' } }),
    }),
    _getData: async () => ({
      sources: FEED_SOURCES,
      totalSources: FEED_SOURCES.length,
      totalArticles: FEED_SOURCES.reduce((s, f) => s + f.count, 0),
    }),
  },
  {
    ...readOnlyTool({
      name: 'get_command_palette',
      description: 'SearchModal command palette entries for dashboard navigation.',
      _outputBudgetBytes: 65536,
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: envelope({ commands: { type: 'array' } }),
    }),
    _getData: async () => ({
      commands: COMMANDS.map((c) => ({ id: c.id, label: c.label, category: c.category, keywords: c.keywords })),
      count: COMMANDS.length,
    }),
  },
];
