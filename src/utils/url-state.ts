import type { SiteVariant, MapLayers } from '@/types';

const STORAGE_KEYS = {
  mapLayers: 'ttwm:map-layers',
  variant: 'ttworldmonitor-variant',
} as const;

export interface UrlState {
  layers?: string;
  variant?: SiteVariant;
  country?: string;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function parseUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search);
  return {
    layers: params.get('layers') ?? undefined,
    variant: (params.get('variant') as SiteVariant) ?? undefined,
    country: params.get('country') ?? undefined,
  };
}

export function parseLayersFromUrl(layersParam: string): Partial<MapLayers> {
  const active = new Set(layersParam.split(',').filter(Boolean));
  const result: Partial<MapLayers> = {};
  const keys: (keyof MapLayers)[] = [
    'rankings', 'tournaments', 'liveMatches', 'clubs', 'youthPipeline',
    'equipment', 'federations', 'tpiChoropleth', 'upsetHeatmap', 'liveStreams',
  ];
  for (const key of keys) {
    result[key] = active.has(key);
  }
  return result;
}

export function layersToUrlParam(layers: MapLayers): string {
  return (Object.keys(layers) as (keyof MapLayers)[])
    .filter((k) => layers[k])
    .join(',');
}

export function syncUrlState(state: {
  layers?: MapLayers;
  variant?: SiteVariant;
  country?: string | null;
}): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const params = new URLSearchParams(window.location.search);
    if (state.layers) {
      const param = layersToUrlParam(state.layers);
      if (param) params.set('layers', param);
      else params.delete('layers');
    }
    if (state.variant) params.set('variant', state.variant);
    if (state.country) params.set('country', state.country);
    else params.delete('country');
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, 250);
}

export function loadPersistedLayers(): MapLayers | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.mapLayers);
    return raw ? (JSON.parse(raw) as MapLayers) : null;
  } catch {
    return null;
  }
}

export function persistLayers(layers: MapLayers): void {
  localStorage.setItem(STORAGE_KEYS.mapLayers, JSON.stringify(layers));
}
