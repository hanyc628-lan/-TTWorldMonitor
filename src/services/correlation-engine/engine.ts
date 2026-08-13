import type {
  DomainAdapter,
  SignalEvidence,
  ConvergenceCard,
  ClusterState,
  TrendDirection,
  AppContextSnapshot,
} from './types';
import { TT_EVENTS, dispatchTTEvent } from '@/utils/event-bus';

const RUN_TARGET_MS = 100;

interface SignalCluster {
  signals: SignalEvidence[];
  country?: string;
  entityKey?: string;
}

interface ScoredCluster {
  cluster: SignalCluster;
  score: number;
  countries: string[];
  centroidLat?: number;
  centroidLon?: number;
  state: ClusterState;
}

interface ScoredClusterWithTrend extends ScoredCluster {
  trend: TrendDirection;
}

export class CorrelationEngine {
  private adapters: DomainAdapter[] = [];
  private cards = new Map<string, ConvergenceCard[]>();
  private previousClusters = new Map<string, ClusterState[]>();
  private running = false;

  registerAdapter(adapter: DomainAdapter): void {
    this.adapters.push(adapter);
    this.cards.set(adapter.domain, []);
    this.previousClusters.set(adapter.domain, []);
  }

  async run(ctx: AppContextSnapshot): Promise<boolean> {
    if (this.running) return false;
    this.running = true;
    const t0 = performance.now();

    try {
      for (const adapter of this.adapters) {
        const signals = adapter.collectSignals(ctx);
        const clusters = this.clusterSignals(signals, adapter);
        const scored = this.scoreClusters(clusters, adapter);
        const filtered = scored.filter((c) => c.score >= adapter.threshold);
        const withTrend = this.applyTrends(filtered, adapter);
        const cards = withTrend.map((c) => this.toCard(c, adapter));
        cards.sort((a, b) => b.score - a.score);
        this.cards.set(adapter.domain, cards);
        this.previousClusters.set(
          adapter.domain,
          withTrend.map((c) => c.state),
        );
      }

      const elapsed = performance.now() - t0;
      if (elapsed > RUN_TARGET_MS) {
        console.warn(`[CorrelationEngine] run() took ${elapsed.toFixed(0)}ms`);
      }

      dispatchTTEvent(TT_EVENTS.CORRELATION_UPDATED, {
        domains: this.adapters.map((a) => a.domain),
      });
    } finally {
      this.running = false;
    }
    return true;
  }

  getCards(domain: string): ConvergenceCard[] {
    return this.cards.get(domain) ?? [];
  }

  getAllCards(): ConvergenceCard[] {
    return Array.from(this.cards.values()).flat().sort((a, b) => b.score - a.score);
  }

  private clusterSignals(signals: SignalEvidence[], adapter: DomainAdapter): SignalCluster[] {
    if (signals.length === 0) return [];
    switch (adapter.clusterMode) {
      case 'country':
        return this.clusterByCountry(signals);
      case 'entity':
        return this.clusterByEntity(signals);
      default:
        return this.clusterByProximity(signals, adapter.spatialRadius);
    }
  }

  private clusterByCountry(signals: SignalEvidence[]): SignalCluster[] {
    const byCountry = new Map<string, SignalEvidence[]>();
    for (const s of signals) {
      if (!s.country) continue;
      const list = byCountry.get(s.country) ?? [];
      list.push(s);
      byCountry.set(s.country, list);
    }
    const clusters: SignalCluster[] = [];
    for (const [country, sigs] of byCountry) {
      if (sigs.length >= 2) clusters.push({ signals: sigs, country });
    }
    return clusters;
  }

  private clusterByEntity(signals: SignalEvidence[]): SignalCluster[] {
    const ENTITY_KEYS = ['wtt', 'olympic', 'worlds', 'grand smash', '德甲', 'ttbl', 'ittf'];
    const tokenMap = new Map<string, SignalEvidence[]>();

    for (const s of signals) {
      const lower = s.label.toLowerCase();
      const key = ENTITY_KEYS.find((k) => lower.includes(k));
      if (!key) continue;
      const list = tokenMap.get(key) ?? [];
      list.push(s);
      tokenMap.set(key, list);
    }

    const clusters: SignalCluster[] = [];
    for (const [key, sigs] of tokenMap) {
      if (sigs.length >= 2) clusters.push({ signals: sigs, entityKey: key });
    }
    return clusters;
  }

  private clusterByProximity(signals: SignalEvidence[], radiusKm: number): SignalCluster[] {
    const clusters: SignalCluster[] = [];
    const used = new Set<number>();

    for (let i = 0; i < signals.length; i++) {
      if (used.has(i)) continue;
      const si = signals[i]!;
      if (si.lat == null || si.lon == null) continue;

      const group: SignalEvidence[] = [si];
      used.add(i);

      for (let j = i + 1; j < signals.length; j++) {
        if (used.has(j)) continue;
        const sj = signals[j]!;
        if (sj.lat == null || sj.lon == null) continue;
        const dist = haversineKm(si.lat, si.lon, sj.lat, sj.lon);
        if (dist <= radiusKm) {
          group.push(sj);
          used.add(j);
        }
      }

      if (group.length >= 2) clusters.push({ signals: group });
    }
    return clusters;
  }

  private scoreClusters(clusters: SignalCluster[], adapter: DomainAdapter): ScoredCluster[] {
    return clusters.map((cluster) => {
      const perType = new Map<string, number>();
      for (const s of cluster.signals) {
        perType.set(s.type, Math.max(perType.get(s.type) ?? 0, s.severity));
      }

      let weightedSum = 0;
      for (const [type, severity] of perType) {
        weightedSum += severity * (adapter.weights[type] ?? 0);
      }

      const diversityBonus = Math.min(30, Math.max(0, (perType.size - 2) * 12));
      const finalScore = Math.min(100, weightedSum + diversityBonus);

      const geoSignals = cluster.signals.filter((s) => s.lat != null && s.lon != null);
      let centroidLat: number | undefined;
      let centroidLon: number | undefined;
      if (geoSignals.length > 0) {
        centroidLat = geoSignals.reduce((sum, s) => sum + s.lat!, 0) / geoSignals.length;
        centroidLon = geoSignals.reduce((sum, s) => sum + s.lon!, 0) / geoSignals.length;
      }

      const countries = [...new Set(cluster.signals.map((s) => s.country).filter(Boolean) as string[])];

      return {
        cluster,
        score: finalScore,
        countries,
        centroidLat,
        centroidLon,
        state: {
          key: cluster.country ?? cluster.entityKey ?? `${centroidLat?.toFixed(1)},${centroidLon?.toFixed(1)}`,
          centroidLat,
          centroidLon,
          country: cluster.country,
          entityKey: cluster.entityKey,
          score: finalScore,
          timestamp: Date.now(),
        },
      };
    });
  }

  private applyTrends(scored: ScoredCluster[], adapter: DomainAdapter): ScoredClusterWithTrend[] {
    const previous = this.previousClusters.get(adapter.domain) ?? [];
    return scored.map((sc) => {
      let trend: TrendDirection = 'stable';
      const match = previous.find((prev) => {
        if (sc.state.country && prev.country) return sc.state.country === prev.country;
        if (sc.state.entityKey && prev.entityKey) return sc.state.entityKey === prev.entityKey;
        return false;
      });
      if (match) {
        const delta = sc.score - match.score;
        if (delta > 5) trend = 'escalating';
        else if (delta < -5) trend = 'de-escalating';
      }
      return { ...sc, trend };
    });
  }

  private toCard(sc: ScoredClusterWithTrend, adapter: DomainAdapter): ConvergenceCard {
    const title = adapter.generateTitle(sc.cluster.signals, {
      entityKey: sc.cluster.entityKey,
      country: sc.cluster.country,
    });
    return {
      id: `${adapter.domain}:${sc.state.key}`,
      domain: adapter.domain,
      title,
      score: Math.round(sc.score),
      signals: sc.cluster.signals,
      location:
        sc.centroidLat != null && sc.centroidLon != null
          ? { lat: sc.centroidLat, lon: sc.centroidLon, label: sc.state.key }
          : undefined,
      countries: sc.countries,
      trend: sc.trend,
      timestamp: Date.now(),
    };
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function createCorrelationEngine(): CorrelationEngine {
  const engine = new CorrelationEngine();
  // Lazy import adapters to avoid circular deps
  import('./adapters').then(({ registerAllAdapters }) => registerAllAdapters(engine));
  return engine;
}
