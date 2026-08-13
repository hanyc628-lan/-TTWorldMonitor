import type { MapLayers, MapLayerKey, LayerDefinition } from '@/types';

export const LAYER_REGISTRY: Record<MapLayerKey, LayerDefinition> = {
  rankings: {
    key: 'rankings',
    icon: '🏆',
    label: 'World Rankings',
    labelZh: '世界排名',
    explanation: 'ITTF world ranking choropleth by nation aggregate points',
    bootstrapKeys: ['rankings'],
  },
  tournaments: {
    key: 'tournaments',
    icon: '📍',
    label: 'Tournaments',
    labelZh: '赛事分布',
    explanation: 'WTT/ITTF event calendar with live and upcoming markers',
    bootstrapKeys: ['tournaments'],
  },
  liveMatches: {
    key: 'liveMatches',
    icon: '🔴',
    label: 'Live Matches',
    labelZh: '实时比分',
    explanation: 'Point-by-point live scores from active WTT events',
    bootstrapKeys: ['liveMatches'],
  },
  clubs: {
    key: 'clubs',
    icon: '🏢',
    label: 'Pro Clubs',
    labelZh: '职业俱乐部',
    explanation: 'Bundesliga, French Pro A, and national league club locations',
    bootstrapKeys: ['clubs'],
  },
  youthPipeline: {
    key: 'youthPipeline',
    icon: '🌱',
    label: 'Youth Pipeline',
    labelZh: '青训梯队',
    explanation: 'U15/U18/U21 ranking density by nation',
    bootstrapKeys: ['youthRankings'],
  },
  equipment: {
    key: 'equipment',
    icon: '🏓',
    label: 'Equipment Trends',
    labelZh: '器材趋势',
    explanation: 'Blade/rubber adoption hotspots from tournament gear data',
    bootstrapKeys: ['equipment'],
  },
  federations: {
    key: 'federations',
    icon: '🏛️',
    label: 'Federations',
    labelZh: '协会总部',
    explanation: 'National table tennis association headquarters',
  },
  tpiChoropleth: {
    key: 'tpiChoropleth',
    icon: '📊',
    label: 'TPI Choropleth',
    labelZh: 'TPI 热力图',
    explanation: 'TPI v2 first-principles heatmap — 5 pillars, 38+ nations, switchable metrics',
    bootstrapKeys: ['tpi'],
  },
  liveStreams: {
    key: 'liveStreams',
    icon: '📡',
    label: 'Live Streams',
    labelZh: '直播信号',
    explanation: 'CCTV, WTT, Douyin teaching streams — daily real-time monitoring',
    bootstrapKeys: ['streamStatuses'],
  },
  upsetHeatmap: {
    key: 'upsetHeatmap',
    icon: '⚡',
    label: 'Upset Heatmap',
    labelZh: '冷门热力',
    explanation: 'Seed upset frequency in last 30 days by venue',
    bootstrapKeys: ['upsets'],
  },
};

/** Exclusive choropleth pairs — only one active at a time (WM pattern) */
export const EXCLUSIVE_CHOROPLETHS: MapLayerKey[][] = [
  ['tpiChoropleth', 'upsetHeatmap'],
];

export const VARIANT_LAYER_ORDER: Record<string, MapLayerKey[]> = {
  world: ['rankings', 'tournaments', 'liveMatches', 'liveStreams', 'federations', 'tpiChoropleth', 'clubs', 'youthPipeline', 'equipment', 'upsetHeatmap'],
  pro: ['rankings', 'liveMatches', 'liveStreams', 'tournaments', 'clubs', 'tpiChoropleth'],
  youth: ['youthPipeline', 'rankings', 'tournaments', 'federations'],
  equipment: ['equipment', 'rankings', 'tournaments'],
  asia: ['rankings', 'tournaments', 'liveMatches', 'federations', 'tpiChoropleth'],
  europe: ['rankings', 'clubs', 'tournaments', 'liveMatches', 'tpiChoropleth'],
};

export const LAYER_PRESETS: Record<string, MapLayerKey[]> = {
  competitive: ['rankings', 'liveMatches', 'liveStreams', 'tournaments', 'tpiChoropleth'],
  scouting: ['youthPipeline', 'rankings', 'clubs', 'equipment'],
  events: ['tournaments', 'liveMatches', 'upsetHeatmap', 'federations'],
  minimal: ['rankings', 'tournaments'],
};

export function getLayersForVariant(variant: string): MapLayerKey[] {
  return VARIANT_LAYER_ORDER[variant] ?? VARIANT_LAYER_ORDER.world;
}

export function normalizeExclusiveChoropleths(layers: MapLayers, toggled: MapLayerKey): MapLayers {
  const next = { ...layers, [toggled]: !layers[toggled] };
  if (!next[toggled]) return next;

  for (const group of EXCLUSIVE_CHOROPLETHS) {
    if (group.includes(toggled)) {
      for (const key of group) {
        if (key !== toggled) next[key] = false;
      }
    }
  }
  return next;
}

export function layersToSet(layers: MapLayers): Set<MapLayerKey> {
  return new Set(
    (Object.keys(layers) as MapLayerKey[]).filter((k) => layers[k]),
  );
}

export function setFromLayers(active: Set<MapLayerKey>): MapLayers {
  const result = {} as MapLayers;
  for (const key of Object.keys(LAYER_REGISTRY) as MapLayerKey[]) {
    result[key] = active.has(key);
  }
  return result;
}
