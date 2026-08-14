/** Map layer boolean toggles — mirrors World Monitor's MapLayers type */
export interface MapLayers {
  rankings: boolean;
  tournaments: boolean;
  liveMatches: boolean;
  clubs: boolean;
  youthPipeline: boolean;
  equipment: boolean;
  federations: boolean;
  tpiChoropleth: boolean;
  upsetHeatmap: boolean;
  liveStreams: boolean;
}

export type MapLayerKey = keyof MapLayers;

export type SiteVariant = 'world' | 'pro' | 'youth' | 'equipment' | 'asia' | 'europe';

export type Lens = SiteVariant;

export type SignalType =
  | 'news'
  | 'result'
  | 'ranking'
  | 'upset'
  | 'injury'
  | 'transfer'
  | 'velocity_spike'
  | 'convergence'
  | 'equipment'
  | 'grassroots';

export interface Country {
  code: string;
  name: string;
  nameZh: string;
  lat: number;
  lng: number;
  federation: string;
}

export interface Player {
  id: string;
  name: string;
  nameZh?: string;
  country: string;
  gender: 'M' | 'W';
  rank: number;
  prevRank: number;
  points: number;
  age?: number;
  style?: string;
  ageGroup?: 'u18' | 'u23' | 'senior' | 'veteran';
}

/** TPI v2 支柱 — 从第一性原理不可约维度推导 */
export interface TPIComponents {
  /** 顶尖产出：当前世界一流选手密度 */
  eliteOutput: number;
  /** 梯队厚度：青少年与未来十年可持续人才 */
  pipelineDepth: number;
  /** 赛事引力：职业赛事与联赛生态引力 */
  eventGravity: number;
  /** 参与基础：草根人口与俱乐部网络 */
  massBase: number;
  /** 体系动能：双打深度、舆论与近期动量 */
  systemMomentum: number;
}

export interface CountryTPI {
  country: string;
  score: number;
  level: 'dominant' | 'strong' | 'rising' | 'stable' | 'declining';
  trend: 'up' | 'down' | 'stable';
  change24h: number;
  methodologyVersion: string;
  components: TPIComponents;
  topPlayers: { name: string; rank: number; gender: 'M' | 'W' }[];
  brief: string;
  lastUpdated: string;
}

export interface Signal {
  id: string;
  type: SignalType;
  title: string;
  source: string;
  timestamp: string;
  countries: string[];
  severity: 'low' | 'medium' | 'high';
  importanceScore?: number;
  url?: string;
}

export interface Tournament {
  id: string;
  name: string;
  tier: 'olympic' | 'olympics' | 'worlds' | 'grand-smash' | 'champions' | 'star-contender' | 'contender' | 'youth' | 'youth-worlds' | 'youth-regional' | 'professional-league' | 'international-league' | 'continental-games' | 'continental-cup' | 'continental-championship' | 'league' | 'veteran' | 'regional-amateur' | 'regional-league' | 'club-league' | 'student-league' | 'school-league' | 'senior-league' | 'community-open';
  location: string;
  country: string;
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'completed';
  disruptionScore: number;
  participants?: number;
}

export interface LiveMatch {
  id: string;
  tournament: string;
  player1: string;
  player2: string;
  country1: string;
  country2: string;
  score: string;
  set: number;
  status: 'live' | 'scheduled' | 'finished';
  upsetAlert?: boolean;
  category?: 'pro' | 'league' | 'youth' | 'veteran';
}

export interface RankingMover {
  player: string;
  country: string;
  gender: 'M' | 'W';
  change: number;
  newRank: number;
  reason: string;
}

export interface BreakingAlert {
  id: string;
  headline: string;
  source: string;
  link?: string;
  threatLevel: 'critical' | 'high';
  timestamp: string;
  origin: 'rss_alert' | 'keyword_spike' | 'upset_result' | 'ranking_shock' | 'injury_report';
  importanceScore?: number;
  countryCode?: string;
  description?: string;
}

export interface Command {
  id: string;
  keywords: string[];
  label: string;
  icon: string;
  category: 'navigate' | 'layers' | 'panels' | 'view' | 'actions' | 'country';
}

export interface PanelConfig {
  id: string;
  title: string;
  defaultRowSpan?: number;
  refreshIntervalMs?: number;
  bootstrapKeys?: string[];
  side: 'left' | 'right';
}

export interface VariantConfig {
  name: string;
  description: string;
  panels: Record<string, PanelConfig>;
  mapLayers: MapLayers;
  mobileMapLayers: MapLayers;
}

export interface LayerDefinition {
  key: MapLayerKey;
  icon: string;
  label: string;
  labelZh: string;
  explanation: string;
  bootstrapKeys?: string[];
}

export interface BootstrapTier {
  fast: string[];
  slow: string[];
  onDemand: string[];
}

export type StreamCategory = 'match' | 'teaching' | 'official' | 'league';
export type StreamPlatform = 'cctv' | 'douyin' | 'youtube' | 'wtt' | 'hls' | 'embed';

export interface LiveStreamSource {
  id: string;
  name: string;
  host: string;
  category: StreamCategory;
  platform: StreamPlatform;
  url: string;
  embedUrl?: string;
  /** YouTube 频道 ID（UC 开头），用于 live embed */
  youtubeChannelId?: string;
  /** 央视直播流标识（cctv5 / cctv5plus） */
  cctvChannel?: 'cctv5' | 'cctv5plus';
  schedule: string;
  region: string;
  lat: number;
  lng: number;
  priority: number;
  free: boolean;
  tags: string[];
}

export interface StreamStatus {
  id: string;
  live: boolean;
  viewers?: number;
  title?: string;
  checkedAt: string;
}

export interface EvolutionAxiom {
  id: string;
  principle: string;
  description: string;
  weight: number;
}

export interface EvolutionObservation {
  id: string;
  axiomId: string;
  source: string;
  evidence: string;
  supports: boolean;
  confidence: number;
  timestamp: string;
}

export interface EvolutionState {
  version: number;
  cycleDay: string;
  cycle: number;
  axioms: EvolutionAxiom[];
  observations: EvolutionObservation[];
  adjustedWeights: Record<string, number>;
  insights: string[];
  motionInsights: string[];
  learnedPreferences: {
    strokeFocus?: string;
    domainFocus?: string;
    heatmapMetric?: string;
  };
  lastEvolvedAt: string;
}

export type { ConvergenceCard, SignalEvidence, TrendDirection } from '@/services/correlation-engine/types';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  countries: string[];
  isAlert?: boolean;
  threatLevel?: 'critical' | 'high' | 'medium' | 'low';
  importanceScore?: number;
}

export interface League {
  id: string;
  name: string;
  country: string;
  region: string;
  level: 'pro' | 'semi-pro' | 'national';
  season: string;
  teams: number;
  lat: number;
  lng: number;
}

export interface Club {
  id: string;
  name: string;
  leagueId: string;
  city: string;
  country: string;
  province?: string;
  county?: string;
  district?: string;
  level?: 'county' | 'district' | 'city' | 'regional' | 'national';
  lat: number;
  lng: number;
  notablePlayers?: string[];
}

export interface ClubFixture {
  id: string;
  leagueId: string;
  homeClub: string;
  awayClub: string;
  status: 'live' | 'scheduled' | 'finished';
  score?: string;
  scheduledAt: string;
  /** 本场焦点选手（如德甲樊振东） */
  spotlightPlayer?: string;
}

export interface LeagueSpotlight {
  leagueId: string;
  player: string;
  playerZh: string;
  club: string;
  clubId: string;
  role: string;
  summary: string;
  seasonStats?: string;
}

export interface LeagueTeamStanding {
  clubId: string;
  clubName: string;
  wins: number;
  losses: number;
  winRate: number;
  leaguePoints?: number;
}

export interface LeagueSpotlightMetrics {
  singlesWins: number;
  singlesLosses: number;
  singlesWinRate: number;
  teamWins: number;
  teamLosses: number;
  teamWinRate: number;
  /** 近几场战绩，从左到右为时间顺序 */
  form: ('W' | 'L')[];
}

export interface LeagueRoundTrend {
  round: string;
  winRate: number;
}

export interface LeagueStats {
  leagueId: string;
  season: string;
  matchesPlayed: number;
  avgSetsPerMatch: number;
  spotlight: LeagueSpotlightMetrics;
  standings: LeagueTeamStanding[];
  winRateTrend: LeagueRoundTrend[];
}

export interface EquipmentTrend {
  id: string;
  category: 'blade' | 'rubber' | 'ball' | 'tech';
  title: string;
  brand?: string;
  adoption: number;
  trend: 'rising' | 'stable' | 'emerging';
  lat: number;
  lng: number;
  region: string;
  summary: string;
}

export interface ApparelItem {
  id: string;
  type: 'shirt' | 'shorts' | 'shoes' | 'bag';
  brand: string;
  model: string;
  priceRange: string;
  trend: 'rising' | 'stable' | 'declining';
  summary: string;
  tags: string[];
}

export interface LearningModule {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  topics: string[];
  duration: string;
  source: string;
  locale: string;
  url?: string;
}

export interface ParticipationStat {
  country: string;
  populationMillions: number;
  activePlayersMillions: number;
  registeredClubs: number;
  growthPct: number;
  youthPct?: number;
  seniorPct?: number;
}

export interface GrassrootsEvent {
  id: string;
  name: string;
  category: 'youth' | 'veteran';
  location: string;
  country: string;
  lat: number;
  lng: number;
  status: 'live' | 'upcoming' | 'completed';
}