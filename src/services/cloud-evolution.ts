import type { EvolutionState } from '@/types';
import { mergeEvolutionStates } from '@/server/evolution-core';
import { evolutionEngine } from '@/services/evolution-engine';
import { loadMotionLabUsage, topMotionPreference } from '@/services/motion-lab-usage';

export interface CloudEvolutionStatus {
  running: boolean;
  tickCount: number;
  lastTickAt: string | null;
  intervalMs: number;
  cloud: boolean;
}

const SYNC_INTERVAL_MS = 300_000 * 60 * 1000;
let syncTimer: ReturnType<typeof setInterval> | null = null;

export async function fetchCloudEvolutionState(): Promise<EvolutionState | null> {
  try {
    const resp = await fetch('/api/evolution/state');
    if (!resp.ok) return null;
    const data = await resp.json() as { state: EvolutionState };
    return data.state;
  } catch {
    return null;
  }
}

export async function fetchCloudStatus(): Promise<CloudEvolutionStatus | null> {
  try {
    const resp = await fetch('/api/evolution/status');
    if (!resp.ok) return null;
    return resp.json() as Promise<CloudEvolutionStatus>;
  } catch {
    return null;
  }
}

export async function syncPreferencesToCloud(): Promise<void> {
  const usage = loadMotionLabUsage();
  const pref = topMotionPreference(usage);
  try {
    await fetch('/api/evolution/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessions: usage.sessions,
        strokeFocus: pref.stroke,
        domainFocus: pref.domain,
      }),
    });
  } catch { /* offline */ }
}

/** 从云端拉取并合并进化状态 */
export async function syncEvolutionFromCloud(): Promise<EvolutionState | null> {
  const cloud = await fetchCloudEvolutionState();
  if (!cloud) return null;

  const local = evolutionEngine.getState();
  const merged = mergeEvolutionStates(cloud, local);
  evolutionEngine.setState(merged);
  return merged;
}

export function startCloudEvolutionSync(onUpdate?: (state: EvolutionState) => void): void {
  if (syncTimer) return;

  const tick = async () => {
    if (document.visibilityState !== 'visible') return;
    await syncPreferencesToCloud();
    const state = await syncEvolutionFromCloud();
    if (state) onUpdate?.(state);
  };

  void tick();
  syncTimer = setInterval(() => void tick(), SYNC_INTERVAL_MS);
}

export function stopCloudEvolutionSync(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}
