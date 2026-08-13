import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { EvolutionState } from '@/types';
import { createDefaultEvolutionState, migrateEvolutionState } from '@/server/evolution-core.js';

const DATA_DIR = process.env.TTWM_DATA_DIR ?? join(process.cwd(), 'data');
const STATE_FILE = join(DATA_DIR, 'cloud-evolution-state.json');

export async function loadCloudEvolutionState(): Promise<EvolutionState> {
  try {
    const raw = await readFile(STATE_FILE, 'utf-8');
    return migrateEvolutionState(JSON.parse(raw) as EvolutionState);
  } catch {
    return createDefaultEvolutionState();
  }
}

export async function saveCloudEvolutionState(state: EvolutionState): Promise<void> {
  await mkdir(dirname(STATE_FILE), { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export function getStateFilePath(): string {
  return STATE_FILE;
}
