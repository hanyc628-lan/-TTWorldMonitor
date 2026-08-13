import {
  COUNTRY_TPI,
  SIGNALS,
  LIVE_MATCHES,
} from '../../src/data/seed.js';
import { LEAGUE_STATS } from '../../src/data/ecosystem.js';
import { enrichTPIRecords } from '../../src/server/tpi-scoring.js';
import { simulateStreamStatuses } from '../streams.js';
import {
  runEvolutionCycle,
  type MotionUsageSnapshot,
} from '../../src/server/evolution-core.js';
import type { EvolutionState } from '../../src/types/index.js';
import { loadCloudEvolutionState, saveCloudEvolutionState } from './store.js';

export interface CloudWorkerStatus {
  running: boolean;
  tickCount: number;
  lastTickAt: string | null;
  intervalMs: number;
  cloud: true;
  stateFile: string;
  errors: number;
}

let tickCount = 0;
let lastTickAt: string | null = null;
let errors = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let motionUsage: MotionUsageSnapshot = { sessions: 0 };

const INTERVAL_MS = Number(process.env.TTWM_EVOLVE_INTERVAL_MS ?? 5 * 60 * 1000);

async function gatherInput() {
  return {
    signals: SIGNALS,
    liveMatches: LIVE_MATCHES,
    streamStatuses: simulateStreamStatuses(),
    tpiData: enrichTPIRecords(COUNTRY_TPI),
    leagueStats: LEAGUE_STATS,
  };
}

export async function cloudEvolutionTick(force = false): Promise<EvolutionState> {
  try {
    const state = await loadCloudEvolutionState();
    const input = await gatherInput();
    const next = runEvolutionCycle(state, input, {
      force,
      motionUsage: motionUsage.sessions > 0 ? motionUsage : undefined,
      source: 'cloud',
    });
    await saveCloudEvolutionState(next);
    tickCount += 1;
    lastTickAt = new Date().toISOString();
    return next;
  } catch (err) {
    errors += 1;
    console.error('[cloud-evolution] tick failed:', err);
    throw err;
  }
}

export function getCloudWorkerStatus(): CloudWorkerStatus {
  return {
    running: timer !== null,
    tickCount,
    lastTickAt,
    intervalMs: INTERVAL_MS,
    cloud: true,
    stateFile: process.env.TTWM_DATA_DIR ?? './data/cloud-evolution-state.json',
    errors,
  };
}

export async function getCloudEvolutionState(): Promise<EvolutionState> {
  return loadCloudEvolutionState();
}

export async function updateCloudPreferences(prefs: {
  strokeFocus?: string;
  domainFocus?: string;
  heatmapMetric?: string;
  sessions?: number;
}): Promise<EvolutionState> {
  const state = await loadCloudEvolutionState();
  if (prefs.sessions !== undefined) {
    motionUsage = {
      sessions: prefs.sessions,
      strokeFocus: prefs.strokeFocus ?? motionUsage.strokeFocus,
      domainFocus: prefs.domainFocus ?? motionUsage.domainFocus,
    };
  }
  const next: EvolutionState = {
    ...state,
    learnedPreferences: {
      ...state.learnedPreferences,
      strokeFocus: prefs.strokeFocus ?? state.learnedPreferences.strokeFocus,
      domainFocus: prefs.domainFocus ?? state.learnedPreferences.domainFocus,
      heatmapMetric: prefs.heatmapMetric ?? state.learnedPreferences.heatmapMetric,
    },
  };
  await saveCloudEvolutionState(next);
  return next;
}

/** 启动云端后台进化 — 永不停止 */
export function startCloudEvolutionWorker(): void {
  if (timer) return;

  console.log(`[cloud-evolution] starting worker · interval ${INTERVAL_MS / 1000}s`);

  void cloudEvolutionTick(true).then((s) => {
    console.log(`[cloud-evolution] initial tick · cycle #${s.cycle} · ${s.observations.length} observations`);
  }).catch(() => { /* logged in tick */ });

  timer = setInterval(() => {
    void cloudEvolutionTick(false).then((s) => {
      console.log(`[cloud-evolution] tick #${tickCount} · cycle #${s.cycle}`);
    }).catch(() => { /* logged */ });
  }, INTERVAL_MS);
}

export function stopCloudEvolutionWorker(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
