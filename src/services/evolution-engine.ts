import type { EvolutionState } from '@/types';
import {
  createDefaultEvolutionState,
  migrateEvolutionState,
  rollCycleDay,
  runEvolutionCycle,
  type EvolutionInput,
} from '@/server/evolution-core';
import { loadMotionLabUsage, topMotionPreference } from '@/services/motion-lab-usage';
import { TT_EVENTS, dispatchTTEvent } from '@/utils/event-bus';

const STORAGE_KEY = 'ttwm:evolution-state';

function loadState(): EvolutionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return rollCycleDay(migrateEvolutionState(JSON.parse(raw) as EvolutionState));
  } catch { /* fresh */ }
  return createDefaultEvolutionState();
}

function saveState(state: EvolutionState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export type { EvolutionInput };

export class EvolutionEngine {
  private state: EvolutionState;

  constructor() {
    this.state = loadState();
  }

  getState(): EvolutionState {
    return this.state;
  }

  setState(state: EvolutionState): void {
    this.state = migrateEvolutionState(state);
    saveState(this.state);
  }

  evolve(input: EvolutionInput, force = false): EvolutionState {
    const motionUsage = loadMotionLabUsage();
    const pref = topMotionPreference(motionUsage);
    this.state = runEvolutionCycle(this.state, input, {
      force,
      motionUsage: motionUsage.sessions > 0
        ? { sessions: motionUsage.sessions, strokeFocus: pref.stroke ?? undefined, domainFocus: pref.domain ?? undefined }
        : undefined,
      source: 'client',
    });
    saveState(this.state);
    dispatchTTEvent(TT_EVENTS.EVOLUTION_UPDATED, this.state);
    return this.state;
  }

  forceEvolve(input: EvolutionInput): EvolutionState {
    return this.evolve(input, true);
  }
}

export const evolutionEngine = new EvolutionEngine();
