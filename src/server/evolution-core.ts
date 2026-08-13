import type {
  EvolutionState,
  EvolutionObservation,
  Signal,
  LiveMatch,
  StreamStatus,
  CountryTPI,
  LeagueStats,
} from '@/types';
import type { HeatmapMetric } from '@/config/tpi-axioms';
import { CORE_AXIOMS } from '@/config/evolution-axioms';
import { STROKE_PRESETS } from '@/data/motion-lab';
import { STREAM_SOURCES } from '@/config/stream-sources';

export const EVOLUTION_CYCLE_MS = 24 * 60 * 60 * 1000;

export interface EvolutionInput {
  signals: Signal[];
  liveMatches: LiveMatch[];
  streamStatuses: StreamStatus[];
  tpiData?: CountryTPI[];
  leagueStats?: LeagueStats[];
  heatmapMetric?: HeatmapMetric;
}

export interface MotionUsageSnapshot {
  sessions: number;
  strokeFocus?: string;
  domainFocus?: string;
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createDefaultEvolutionState(): EvolutionState {
  return {
    version: 2,
    cycleDay: todayKey(),
    cycle: 1,
    axioms: CORE_AXIOMS.map((a) => ({ ...a })),
    observations: [],
    adjustedWeights: Object.fromEntries(CORE_AXIOMS.map((a) => [a.id, a.weight])),
    insights: [],
    motionInsights: [],
    learnedPreferences: {},
    lastEvolvedAt: new Date().toISOString(),
  };
}

export function migrateEvolutionState(raw: EvolutionState): EvolutionState {
  const base = createDefaultEvolutionState();
  const mergedAxioms = CORE_AXIOMS.map((a) => {
    const existing = raw.axioms?.find((x) => x.id === a.id);
    return existing ?? { ...a };
  });
  const weights = { ...base.adjustedWeights, ...raw.adjustedWeights };
  for (const axiom of CORE_AXIOMS) {
    if (weights[axiom.id] === undefined) weights[axiom.id] = axiom.weight;
  }
  return {
    ...base,
    ...raw,
    version: 2,
    cycle: raw.cycle ?? 1,
    axioms: mergedAxioms,
    adjustedWeights: weights,
    motionInsights: raw.motionInsights ?? [],
    learnedPreferences: raw.learnedPreferences ?? {},
  };
}

export function rollCycleDay(state: EvolutionState): EvolutionState {
  if (state.cycleDay === todayKey()) return state;
  return { ...state, cycleDay: todayKey(), cycle: state.cycle + 1 };
}

function generateInsights(
  observations: EvolutionObservation[],
  streams: StreamStatus[],
  cycle: number,
): string[] {
  const insights: string[] = [];
  const teachingObs = observations.find((o) => o.axiomId === 'teaching-match-bridge');
  if (teachingObs) {
    insights.push(`[教学洞察] ${teachingObs.evidence} — 关注正手弧圈/反手拧拉技术趋势`);
  }

  const liveCount = streams.filter((s) => s.live).length;
  if (liveCount > 0) {
    const names = streams
      .filter((s) => s.live)
      .map((s) => STREAM_SOURCES.find((src) => src.id === s.id)?.name ?? s.id)
      .join('、');
    insights.push(`[直播洞察] 当前 ${liveCount} 路信号活跃：${names}`);
  }

  const causalityObs = observations.find((o) => o.axiomId === 'causality-match-ranking' && o.supports);
  if (causalityObs && causalityObs.confidence > 0.8) {
    insights.push('[排名洞察] 赛果-排名因果链完整，当前排名变动可信度高');
  }

  const contradictObs = observations.find((o) => !o.supports);
  if (contradictObs) {
    insights.push(`[进化修正] ${contradictObs.evidence}，已下调相关公理权重`);
  }

  const tpiObs = observations.find((o) => o.axiomId === 'tpi-first-principles');
  if (tpiObs) {
    insights.push(`[TPI 洞察] ${tpiObs.evidence}`);
  }

  insights.push(`[周期 #${cycle}] 完成观察 ${observations.length} 条，公理库 v2 自我调权`);

  return insights;
}

/** 核心进化周期 — 客户端与云端共用 */
export function runEvolutionCycle(
  state: EvolutionState,
  input: EvolutionInput,
  options: {
    force?: boolean;
    motionUsage?: MotionUsageSnapshot;
    source?: 'cloud' | 'client';
  } = {},
): EvolutionState {
  const { force = false, motionUsage, source = 'client' } = options;
  let current = rollCycleDay(state);

  if (!force && current.observations.length > 0) {
    const elapsed = Date.now() - new Date(current.lastEvolvedAt).getTime();
    if (elapsed < EVOLUTION_CYCLE_MS && source === 'client') return current;
  }

  const newObservations: EvolutionObservation[] = [];
  const ts = new Date().toISOString();

  const resultSignals = input.signals.filter((s) => s.type === 'result' || s.type === 'upset');
  const rankingSignals = input.signals.filter((s) => s.type === 'ranking');
  if (rankingSignals.length > 0 && resultSignals.length > 0) {
    newObservations.push({
      id: `obs-${Date.now()}-causality`,
      axiomId: 'causality-match-ranking',
      source: `${source}-signal`,
      evidence: `${resultSignals.length} 条赛果信号支撑 ${rankingSignals.length} 条排名变动`,
      supports: true,
      confidence: Math.min(0.95, resultSignals.length / rankingSignals.length),
      timestamp: ts,
    });
  } else if (rankingSignals.length > 0 && resultSignals.length === 0) {
    newObservations.push({
      id: `obs-${Date.now()}-causality-x`,
      axiomId: 'causality-match-ranking',
      source: `${source}-signal`,
      evidence: `${rankingSignals.length} 条排名变动缺乏赛果支撑，标记为噪声`,
      supports: false,
      confidence: 0.7,
      timestamp: ts,
    });
  }

  const teachingLive = input.streamStatuses.filter(
    (s) => s.live && STREAM_SOURCES.find((src) => src.id === s.id)?.category === 'teaching',
  );
  if (teachingLive.length > 0) {
    const xiaohan = teachingLive.find((s) => s.id === 'douyin-xiaohan');
    newObservations.push({
      id: `obs-${Date.now()}-teaching`,
      axiomId: 'teaching-match-bridge',
      source: xiaohan ? 'douyin-xiaohan' : 'teaching-stream',
      evidence: xiaohan
        ? `小韩老师直播中${xiaohan.viewers ? ` · ${xiaohan.viewers} 观看` : ''}：${xiaohan.title ?? '乒乓球教学'}`
        : `${teachingLive.length} 路教学直播活跃`,
      supports: true,
      confidence: 0.82,
      timestamp: ts,
    });
  }

  const upsets = input.liveMatches.filter((m) => m.upsetAlert);
  if (upsets.length > 0) {
    newObservations.push({
      id: `obs-${Date.now()}-momentum`,
      axiomId: 'momentum-decay',
      source: `${source}-matches`,
      evidence: `${upsets.length} 场冷门验证势头衰减规律`,
      supports: true,
      confidence: Math.min(0.95, 0.75 + upsets.length * 0.05),
      timestamp: ts,
    });
  }

  const liveStreams = input.streamStatuses.filter((s) => s.live);
  const recentSignals = input.signals.filter(
    (s) => Date.now() - new Date(s.timestamp).getTime() < 3600000,
  );
  if (liveStreams.length > 0 && recentSignals.length >= 2) {
    newObservations.push({
      id: `obs-${Date.now()}-info`,
      axiomId: 'information-asymmetry',
      source: `${source}-stream`,
      evidence: `${liveStreams.length} 路直播 + ${recentSignals.length} 条/小时信号，信息领先新闻`,
      supports: true,
      confidence: 0.78,
      timestamp: ts,
    });
  }

  const countries = new Set(input.signals.flatMap((s) => s.countries));
  const asiaCodes = ['CHN', 'JPN', 'KOR', 'TPE'];
  const asiaRatio = [...countries].filter((c) => asiaCodes.includes(c)).length / Math.max(countries.size, 1);
  if (asiaRatio > 0.5) {
    newObservations.push({
      id: `obs-${Date.now()}-geo`,
      axiomId: 'geographic-clustering',
      source: `${source}-geo`,
      evidence: `亚洲信号占比 ${Math.round(asiaRatio * 100)}%，符合强国地理聚类`,
      supports: true,
      confidence: asiaRatio,
      timestamp: ts,
    });
  }

  if (input.tpiData && input.tpiData.length > 0) {
    const top = [...input.tpiData].sort((a, b) => b.score - a.score)[0];
    if (top?.components) {
      const vals = Object.values(top.components);
      const spread = Math.max(...vals) - Math.min(...vals);
      newObservations.push({
        id: `obs-${Date.now()}-tpi`,
        axiomId: 'tpi-first-principles',
        source: `${source}-tpi`,
        evidence: `${top.country} TPI ${top.score.toFixed(1)}，五维极差 ${spread.toFixed(0)}，${spread < 25 ? '结构均衡' : '存在短板'}`,
        supports: spread < 30,
        confidence: 0.8,
        timestamp: ts,
      });
    }
  }

  if (input.leagueStats && input.leagueStats.length > 0) {
    const wtt = input.leagueStats.find((l) => l.leagueId === 'wtt');
    const ttbl = input.leagueStats.find((l) => l.leagueId === 'ttbl');
    if (wtt && ttbl) {
      const wttTop = wtt.standings[0]?.winRate ?? 0;
      const ttblTop = ttbl.standings[0]?.winRate ?? 0;
      newObservations.push({
        id: `obs-${Date.now()}-league`,
        axiomId: 'league-signal-bridge',
        source: `${source}-league`,
        evidence: `WTT 榜首胜率 ${(wttTop * 100).toFixed(0)}% · 德甲 ${(ttblTop * 100).toFixed(0)}%，联赛强度分化`,
        supports: Math.abs(wttTop - ttblTop) < 0.15,
        confidence: 0.72,
        timestamp: ts,
      });
    }
  }

  const motionInsights: string[] = [];
  if (motionUsage && motionUsage.sessions > 0) {
    const strokePreset = STROKE_PRESETS.find((s) => s.id === motionUsage.strokeFocus);
    newObservations.push({
      id: `obs-${Date.now()}-biomech`,
      axiomId: 'biomech-efficiency',
      source: 'motion-lab',
      evidence: `运动实验室 ${motionUsage.sessions} 次访问，聚焦 ${strokePreset?.nameZh ?? motionUsage.strokeFocus ?? '综合'}`,
      supports: true,
      confidence: Math.min(0.9, 0.5 + motionUsage.sessions * 0.05),
      timestamp: ts,
    });
    if (strokePreset) {
      const avgAngle = strokePreset.jointAngles.reduce((s, j) => s + j.angle, 0) / strokePreset.jointAngles.length;
      motionInsights.push(
        `[力学学习] 用户偏好 ${strokePreset.nameZh}，平均关节角 ${avgAngle.toFixed(0)}°，建议强化动力链训练`,
      );
    }
  }

  if (source === 'cloud' && newObservations.length === 0) {
    newObservations.push({
      id: `obs-${Date.now()}-cloud-pulse`,
      axiomId: 'conservation-skill',
      source: 'cloud-worker',
      evidence: `[云端脉冲] 持续学习中 · 周期 #${current.cycle}`,
      supports: true,
      confidence: 0.4,
      timestamp: ts,
    });
  }

  const adjustedWeights = { ...current.adjustedWeights };
  for (const obs of newObservations) {
    const w = adjustedWeights[obs.axiomId] ?? 0.5;
    const delta = obs.supports ? 0.02 * obs.confidence : -0.03 * obs.confidence;
    adjustedWeights[obs.axiomId] = Math.max(0.1, Math.min(1.5, w + delta));
  }

  const insights = generateInsights(newObservations, input.streamStatuses, current.cycle);
  if (source === 'cloud') {
    insights.unshift(`[云端进化] 后台持续学习 · ${ts}`);
  }

  const learnedPreferences = {
    strokeFocus: motionUsage?.strokeFocus ?? current.learnedPreferences.strokeFocus,
    domainFocus: motionUsage?.domainFocus ?? current.learnedPreferences.domainFocus,
    heatmapMetric: input.heatmapMetric ?? current.learnedPreferences.heatmapMetric,
  };

  return {
    ...current,
    cycleDay: todayKey(),
    adjustedWeights,
    observations: [...newObservations, ...current.observations].slice(0, 80),
    insights: [...insights, ...current.insights].slice(0, 12),
    motionInsights: [...motionInsights, ...current.motionInsights].slice(0, 8),
    learnedPreferences,
    lastEvolvedAt: ts,
  };
}

/** 合并云端与本地状态 — 取 cycle 更高、观察更多的版本 */
export function mergeEvolutionStates(cloud: EvolutionState, local: EvolutionState): EvolutionState {
  const cloudScore = cloud.cycle * 1000 + cloud.observations.length;
  const localScore = local.cycle * 1000 + local.observations.length;
  const primary = cloudScore >= localScore ? cloud : local;
  const secondary = primary === cloud ? local : cloud;

  return migrateEvolutionState({
    ...primary,
    learnedPreferences: {
      ...primary.learnedPreferences,
      ...secondary.learnedPreferences,
    },
    motionInsights: [...new Set([...primary.motionInsights, ...secondary.motionInsights])].slice(0, 8),
  });
}
