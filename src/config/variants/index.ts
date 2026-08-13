import type { MapLayers, VariantConfig } from '@/types';

const BASE_LAYERS: MapLayers = {
  rankings: true,
  tournaments: true,
  liveMatches: true,
  liveStreams: true,
  clubs: false,
  youthPipeline: false,
  equipment: false,
  federations: true,
  tpiChoropleth: true,
  upsetHeatmap: false,
};

export const WORLD_VARIANT: VariantConfig = {
  name: 'TTWorldMonitor',
  description: 'Full table tennis intelligence — rankings, events, nations, correlation',
  panels: {
    tpi: { id: 'tpi', title: 'TPI 强国指数', side: 'left', refreshIntervalMs: 300_000, bootstrapKeys: ['tpi'] },
    signals: { id: 'signals', title: '热门信号', side: 'left', refreshIntervalMs: 60_000, bootstrapKeys: ['signals'] },
    correlation: { id: 'correlation', title: '关联引擎', side: 'left', refreshIntervalMs: 120_000 },
    evolution: { id: 'evolution', title: 'AI 进化引擎', side: 'left', refreshIntervalMs: 300_000 },
    liveStreams: { id: 'liveStreams', title: '直播信号', side: 'left', refreshIntervalMs: 60_000, bootstrapKeys: ['streamStatuses'] },
    leagues: { id: 'leagues', title: '联赛俱乐部', side: 'left', refreshIntervalMs: 300_000, bootstrapKeys: ['leagues', 'clubs', 'clubFixtures', 'leagueStats'] },
    leagueData: { id: 'leagueData', title: '联赛数据中心', side: 'right', refreshIntervalMs: 300_000, bootstrapKeys: ['leagueStats'] },
    grassroots: { id: 'grassroots', title: '青少年与大众', side: 'left', refreshIntervalMs: 300_000, bootstrapKeys: ['grassrootsEvents', 'participationStats'] },
    gear: { id: 'gear', title: '器材与教学', side: 'right', refreshIntervalMs: 600_000, bootstrapKeys: ['equipmentTrends', 'apparelItems', 'learningModules'] },
    liveMatches: { id: 'liveMatches', title: '实时比分', side: 'right', refreshIntervalMs: 15_000, bootstrapKeys: ['liveMatches'] },
    tournaments: { id: 'tournaments', title: '赛事枢纽', side: 'right', refreshIntervalMs: 300_000, bootstrapKeys: ['tournaments'] },
    rankings: { id: 'rankings', title: '排名变动', side: 'right', refreshIntervalMs: 600_000, bootstrapKeys: ['rankings'] },
  },
  mapLayers: BASE_LAYERS,
  mobileMapLayers: {
    ...BASE_LAYERS,
    clubs: false,
    youthPipeline: false,
    equipment: false,
    federations: false,
  },
};

export const PRO_VARIANT: VariantConfig = {
  ...WORLD_VARIANT,
  name: 'TT Pro Monitor',
  description: 'Professional tour focus — WTT, rankings, live matches',
  panels: {
    tpi: WORLD_VARIANT.panels.tpi,
    signals: WORLD_VARIANT.panels.signals,
    leagues: WORLD_VARIANT.panels.leagues,
    leagueData: WORLD_VARIANT.panels.leagueData,
    liveMatches: WORLD_VARIANT.panels.liveMatches,
    tournaments: WORLD_VARIANT.panels.tournaments,
    rankings: WORLD_VARIANT.panels.rankings,
    correlation: WORLD_VARIANT.panels.correlation,
  },
  mapLayers: {
    ...BASE_LAYERS,
    youthPipeline: false,
    equipment: false,
    clubs: true,
  },
  mobileMapLayers: {
    ...BASE_LAYERS,
    youthPipeline: false,
    equipment: false,
    clubs: false,
    federations: false,
  },
};

export const YOUTH_VARIANT: VariantConfig = {
  ...WORLD_VARIANT,
  name: 'TT Youth Monitor',
  description: 'Junior pipeline — U15/U18/U21 rankings and youth events',
  panels: {
    ...WORLD_VARIANT.panels,
    grassroots: WORLD_VARIANT.panels.grassroots,
    gear: { ...WORLD_VARIANT.panels.gear, bootstrapKeys: ['learningModules'] },
  },
  mapLayers: {
    ...BASE_LAYERS,
    youthPipeline: true,
    rankings: true,
    liveMatches: false,
    clubs: false,
    equipment: false,
    tpiChoropleth: false,
  },
  mobileMapLayers: {
    ...BASE_LAYERS,
    youthPipeline: true,
    liveMatches: false,
    clubs: false,
    equipment: false,
    federations: false,
    tpiChoropleth: false,
  },
};

export const EQUIPMENT_VARIANT: VariantConfig = {
  ...WORLD_VARIANT,
  name: 'TT Equipment Monitor',
  description: 'Blade, rubber, and gear trend intelligence',
  panels: {
    gear: WORLD_VARIANT.panels.gear,
    signals: WORLD_VARIANT.panels.signals,
    correlation: WORLD_VARIANT.panels.correlation,
  },
  mapLayers: {
    ...BASE_LAYERS,
    equipment: true,
    rankings: false,
    liveMatches: false,
    youthPipeline: false,
    tpiChoropleth: false,
  },
  mobileMapLayers: {
    ...BASE_LAYERS,
    equipment: true,
    rankings: false,
    liveMatches: false,
    youthPipeline: false,
    federations: false,
    tpiChoropleth: false,
  },
};

export const ASIA_VARIANT: VariantConfig = {
  ...WORLD_VARIANT,
  name: 'TT Asia Monitor',
  description: 'Asia-Pacific table tennis intelligence',
};

export const EUROPE_VARIANT: VariantConfig = {
  ...WORLD_VARIANT,
  name: 'TT Europe Monitor',
  description: 'European leagues and national team intelligence',
  panels: {
    ...WORLD_VARIANT.panels,
    leagues: WORLD_VARIANT.panels.leagues,
  },
  mapLayers: {
    ...BASE_LAYERS,
    clubs: true,
  },
  mobileMapLayers: {
    ...BASE_LAYERS,
    clubs: false,
    youthPipeline: false,
    equipment: false,
    federations: false,
  },
};

export const VARIANT_CONFIGS: Record<string, VariantConfig> = {
  world: WORLD_VARIANT,
  pro: PRO_VARIANT,
  youth: YOUTH_VARIANT,
  equipment: EQUIPMENT_VARIANT,
  asia: ASIA_VARIANT,
  europe: EUROPE_VARIANT,
};

export function getVariantConfig(variant: string): VariantConfig {
  return VARIANT_CONFIGS[variant] ?? WORLD_VARIANT;
}
