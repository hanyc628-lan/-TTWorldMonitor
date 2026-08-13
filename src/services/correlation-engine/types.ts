export type TrendDirection = 'escalating' | 'de-escalating' | 'stable';

export interface SignalEvidence {
  type: string;
  label: string;
  severity: number;
  country?: string;
  lat?: number;
  lon?: number;
  timestamp: number;
  source?: string;
}

export interface ClusterState {
  key: string;
  centroidLat?: number;
  centroidLon?: number;
  country?: string;
  entityKey?: string;
  score: number;
  timestamp: number;
}

export interface ConvergenceCard {
  id: string;
  domain: string;
  title: string;
  score: number;
  signals: SignalEvidence[];
  location?: { lat: number; lon: number; label: string };
  countries: string[];
  trend: TrendDirection;
  timestamp: number;
  assessment?: string;
}

export type ClusterMode = 'country' | 'entity' | 'proximity';

export interface DomainAdapter {
  domain: string;
  threshold: number;
  clusterMode: ClusterMode;
  spatialRadius: number;
  weights: Record<string, number>;
  collectSignals: (ctx: AppContextSnapshot) => SignalEvidence[];
  generateTitle: (signals: SignalEvidence[], meta: { entityKey?: string; country?: string }) => string;
}

export interface AppContextSnapshot {
  signals: Array<{ type: string; title: string; countries: string[]; severity: string; timestamp: string }>;
  liveMatches: Array<{ status: string; upsetAlert?: boolean; country1: string; country2: string; player1: string; player2: string; tournament: string }>;
  rankingMovers: Array<{ player: string; country: string; change: number; reason: string }>;
  tournaments: Array<{ status: string; disruptionScore: number; name: string; country: string; lat: number; lng: number }>;
  tpiData: Array<{ country: string; score: number; trend: string; change24h: number }>;
}
