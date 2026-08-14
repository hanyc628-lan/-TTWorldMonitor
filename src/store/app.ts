import { create } from 'zustand';
import type {
  SiteVariant,
  MapLayers,
  MapLayerKey,
  CountryTPI,
  Signal,
  Tournament,
  LiveMatch,
  RankingMover,
  ConvergenceCard,
  BreakingAlert,
  LiveStreamSource,
  StreamStatus,
  EvolutionState,
  League,
  Club,
  ClubFixture,
  EquipmentTrend,
  ApparelItem,
  LearningModule,
  ParticipationStat,
  GrassrootsEvent,
  LeagueStats,
} from '@/types';
import type { HeatmapMetric } from '@/config/tpi-axioms';
import type { CorrelationSignalCore } from '@/services/analysis-core';
import { detectVariant } from '@/config/variant';
import { getVariantConfig } from '@/config/variants';
import { layersToSet, normalizeExclusiveChoropleths, setFromLayers } from '@/config/map-layer-definitions';
import { parseUrlState, parseLayersFromUrl, syncUrlState, loadPersistedLayers, persistLayers } from '@/utils/url-state';
import { CorrelationEngine } from '@/services/correlation-engine/engine';
import { analyzeSignals } from '@/services/analysis-core';
import { fetchBootstrapData } from '@/services/bootstrap';
import { processSignalsForAlerts } from '@/services/breaking-alerts';
import { enrichTPIRecords } from '@/server/tpi-scoring';
import type { IttfRanking } from '@/services/ittf-api';
import { evolutionEngine } from '@/services/evolution-engine';
import { syncEvolutionFromCloud, syncPreferencesToCloud } from '@/services/cloud-evolution';
import { fetchStreamStatuses } from '@/services/stream-monitor';
import { STREAM_SOURCES } from '@/config/stream-sources';
import {
  COUNTRY_TPI as SEED_TPI,
  SIGNALS as SEED_SIGNALS,
  TOURNAMENTS as SEED_TOURNAMENTS,
  LIVE_MATCHES as SEED_LIVE,
  RANKING_MOVERS as SEED_MOVERS,
} from '@/data/seed';
import {
  LEAGUES,
  CLUBS,
  CLUB_FIXTURES,
  LEAGUE_STATS,
  EQUIPMENT_TRENDS,
  APPAREL_ITEMS,
  LEARNING_MODULES,
  PARTICIPATION_STATS,
  GRASSROOTS_EVENTS,
} from '@/data/ecosystem';

interface AppState {
  // Boot state
  booted: boolean;
  bootError: string | null;

  // Variant & layers
  variant: SiteVariant;
  mapLayers: MapLayers;
  selectedCountry: string | null;
  searchOpen: boolean;
  sidebarCollapsed: boolean;
  breakingAlerts: BreakingAlert[];

  // Data
  tpiData: CountryTPI[];
  signals: Signal[];
  tournaments: Tournament[];
  liveMatches: LiveMatch[];
  rankingMovers: RankingMover[];
  ittfRankings: { men: IttfRanking[]; women: IttfRanking[]; source: string } | null;
  convergenceCards: ConvergenceCard[];
  analysisSignals: CorrelationSignalCore[];

  // Live streams & evolution
  streamSources: LiveStreamSource[];
  streamStatuses: StreamStatus[];
  activeStreamId: string | null;
  evolutionState: EvolutionState | null;

  leagues: League[];
  clubs: Club[];
  clubFixtures: ClubFixture[];
  leagueStats: LeagueStats[];
  equipmentTrends: EquipmentTrend[];
  apparelItems: ApparelItem[];
  learningModules: LearningModule[];
  participationStats: ParticipationStat[];
  grassrootsEvents: GrassrootsEvent[];

  /** 热力图当前指标维度 */
  heatmapMetric: HeatmapMetric;

  // Engine
  correlationEngine: CorrelationEngine | null;

  // Actions
  boot: () => Promise<void>;
  setVariant: (v: SiteVariant) => void;
  toggleLayer: (layer: MapLayerKey) => void;
  setLayerPreset: (layers: MapLayerKey[]) => void;
  setAllLayers: (enabled: boolean) => void;
  selectCountry: (code: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  addBreakingAlert: (alert: BreakingAlert) => void;
  refreshData: () => Promise<void>;
  runCorrelationEngine: () => Promise<void>;
  refreshStreams: () => Promise<void>;
  runEvolution: (force?: boolean) => void;
  setActiveStream: (id: string) => void;
  revealPanel: (panelId: string) => void;
  setHeatmapMetric: (metric: HeatmapMetric) => void;
}

function buildContextSnapshot(state: Pick<AppState, 'signals' | 'liveMatches' | 'rankingMovers' | 'tournaments' | 'tpiData'>) {
  return {
    signals: state.signals,
    liveMatches: state.liveMatches,
    rankingMovers: state.rankingMovers,
    tournaments: state.tournaments,
    tpiData: state.tpiData,
  };
}

const urlState = parseUrlState();
const variant = urlState.variant ?? detectVariant();
const variantConfig = getVariantConfig(variant);
const initialLayers = urlState.layers
  ? { ...variantConfig.mapLayers, ...parseLayersFromUrl(urlState.layers) }
  : loadPersistedLayers() ?? variantConfig.mapLayers;

export const useAppStore = create<AppState>((set, get) => ({
  booted: false,
  bootError: null,
  variant,
  mapLayers: initialLayers,
  selectedCountry: urlState.country ?? null,
  searchOpen: false,
  sidebarCollapsed: false,
  breakingAlerts: [],

  tpiData: enrichTPIRecords(SEED_TPI),
  signals: SEED_SIGNALS,
  tournaments: SEED_TOURNAMENTS,
  liveMatches: SEED_LIVE,
  rankingMovers: SEED_MOVERS,
  ittfRankings: null,
  convergenceCards: [],
  analysisSignals: [],
  streamSources: STREAM_SOURCES,
  streamStatuses: [],
  activeStreamId: 'douyin-xiaohan',
  evolutionState: null,
  leagues: LEAGUES,
  clubs: CLUBS,
  clubFixtures: CLUB_FIXTURES,
  leagueStats: LEAGUE_STATS,
  equipmentTrends: EQUIPMENT_TRENDS,
  apparelItems: APPAREL_ITEMS,
  learningModules: LEARNING_MODULES,
  participationStats: PARTICIPATION_STATS,
  grassrootsEvents: GRASSROOTS_EVENTS,
  heatmapMetric: 'composite',
  correlationEngine: null,

  boot: async () => {
    try {
      const engine = new CorrelationEngine();
      const { registerAllAdapters } = await import('@/services/correlation-engine/adapters');
      registerAllAdapters(engine);

      let data: Record<string, unknown> = {};
      try {
        data = await fetchBootstrapData();
      } catch {
        // fallback to seed data
      }

      let streamStatuses: StreamStatus[] = [];
      try {
        streamStatuses = await fetchStreamStatuses();
      } catch { /* use empty */ }

      set({
        correlationEngine: engine,
        tpiData: (data.tpi as CountryTPI[]) ?? enrichTPIRecords(SEED_TPI),
        signals: (data.signals as Signal[]) ?? SEED_SIGNALS,
        tournaments: (data.tournaments as Tournament[]) ?? SEED_TOURNAMENTS,
        liveMatches: (data.liveMatches as LiveMatch[]) ?? SEED_LIVE,
        rankingMovers: (data.rankingMovers as RankingMover[]) ?? SEED_MOVERS,
        streamStatuses: (data.streamStatuses as StreamStatus[]) ?? streamStatuses,
        ittfRankings: (data.rankings as { men: IttfRanking[]; women: IttfRanking[]; source: string }) ?? null,
        leagues: (data.leagues as League[]) ?? LEAGUES,
        clubs: (data.clubs as Club[]) ?? CLUBS,
        clubFixtures: (data.clubFixtures as ClubFixture[]) ?? CLUB_FIXTURES,
        leagueStats: (data.leagueStats as LeagueStats[]) ?? LEAGUE_STATS,
        equipmentTrends: (data.equipmentTrends as EquipmentTrend[]) ?? EQUIPMENT_TRENDS,
        apparelItems: (data.apparelItems as ApparelItem[]) ?? APPAREL_ITEMS,
        learningModules: (data.learningModules as LearningModule[]) ?? LEARNING_MODULES,
        participationStats: (data.participationStats as ParticipationStat[]) ?? PARTICIPATION_STATS,
        grassrootsEvents: (data.grassrootsEvents as GrassrootsEvent[]) ?? GRASSROOTS_EVENTS,
        booted: true,
      });

      await get().runCorrelationEngine();
      get().runEvolution(true);
      await syncPreferencesToCloud();
      await syncEvolutionFromCloud();
      const cloudState = evolutionEngine.getState();
      set({ evolutionState: cloudState });
      processSignalsForAlerts(get().signals);
    } catch (err) {
      set({ bootError: String(err), booted: true });
    }
  },

  setVariant: (v) => {
    const config = getVariantConfig(v);
    set({ variant: v, mapLayers: config.mapLayers });
    localStorage.setItem('ttworldmonitor-variant', v);
    syncUrlState({ variant: v, layers: config.mapLayers });
  },

  toggleLayer: (layer) => {
    const next = normalizeExclusiveChoropleths(get().mapLayers, layer);
    persistLayers(next);
    syncUrlState({ layers: next, variant: get().variant });
    set({ mapLayers: next });
  },

  setLayerPreset: (keys) => {
    const next = setFromLayers(new Set(keys));
    persistLayers(next);
    syncUrlState({ layers: next, variant: get().variant });
    set({ mapLayers: next });
  },

  setAllLayers: (enabled) => {
    const next = setFromLayers(enabled ? new Set(Object.keys(get().mapLayers) as MapLayerKey[]) : new Set());
    persistLayers(next);
    syncUrlState({ layers: next, variant: get().variant });
    set({ mapLayers: next });
  },

  selectCountry: (code) => {
    syncUrlState({ country: code, layers: get().mapLayers, variant: get().variant });
    set({ selectedCountry: code });
  },

  setSearchOpen: (open) => set({ searchOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  addBreakingAlert: (alert) => {
    set((s) => ({
      breakingAlerts: [alert, ...s.breakingAlerts].slice(0, 3),
    }));
  },

  refreshData: async () => {
    try {
      const data = await fetchBootstrapData();
      set({
        tpiData: (data.tpi as CountryTPI[]) ?? get().tpiData,
        signals: (data.signals as Signal[]) ?? get().signals,
        liveMatches: (data.liveMatches as LiveMatch[]) ?? get().liveMatches,
      });
      await get().runCorrelationEngine();
    } catch {
      // circuit breaker handles fallback
    }
  },

  runCorrelationEngine: async () => {
    const { correlationEngine } = get();
    if (!correlationEngine) return;
    const snapshot = buildContextSnapshot(get());
    await correlationEngine.run(snapshot);
    const cards = correlationEngine.getAllCards();
    const analysisSignals = analyzeSignals(get().signals);
    set({ convergenceCards: cards, analysisSignals });
  },

  refreshStreams: async () => {
    const statuses = await fetchStreamStatuses();
    set({ streamStatuses: statuses });
    get().runEvolution();
  },

  runEvolution: (force = false) => {
    const s = get();
    const evolve = force ? evolutionEngine.forceEvolve.bind(evolutionEngine) : evolutionEngine.evolve.bind(evolutionEngine);
    const state = evolve({
      signals: s.signals,
      liveMatches: s.liveMatches,
      streamStatuses: s.streamStatuses,
      tpiData: s.tpiData,
      leagueStats: s.leagueStats,
      heatmapMetric: s.heatmapMetric,
    });
    set({ evolutionState: state });
    void syncPreferencesToCloud();
  },

  setActiveStream: (id) => set({ activeStreamId: id }),

  setHeatmapMetric: (metric) => set({ heatmapMetric: metric }),

  revealPanel: (panelId) => {
    const el = document.getElementById(`panel-${panelId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    el?.classList.add('panel-highlight');
    setTimeout(() => el?.classList.remove('panel-highlight'), 2000);
  },
}));

// Derived selector for active layer set
export function useActiveLayers(): Set<MapLayerKey> {
  return layersToSet(useAppStore((s) => s.mapLayers));
}
