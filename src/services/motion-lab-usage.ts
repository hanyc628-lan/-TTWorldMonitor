import type { MotionDomain, StrokeId } from '@/data/motion-lab';

const USAGE_KEY = 'ttwm:motion-lab-usage';

export interface MotionLabUsage {
  strokes: Partial<Record<StrokeId, number>>;
  domains: Partial<Record<MotionDomain, number>>;
  sessions: number;
  lastVisitedAt: string;
}

function emptyUsage(): MotionLabUsage {
  return { strokes: {}, domains: {}, sessions: 0, lastVisitedAt: '' };
}

export function loadMotionLabUsage(): MotionLabUsage {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw) return JSON.parse(raw) as MotionLabUsage;
  } catch { /* fresh */ }
  return emptyUsage();
}

export function saveMotionLabUsage(usage: MotionLabUsage): void {
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

export function recordMotionLabVisit(domain: MotionDomain, strokeId: StrokeId): void {
  const usage = loadMotionLabUsage();
  usage.sessions += 1;
  usage.strokes[strokeId] = (usage.strokes[strokeId] ?? 0) + 1;
  usage.domains[domain] = (usage.domains[domain] ?? 0) + 1;
  usage.lastVisitedAt = new Date().toISOString();
  saveMotionLabUsage(usage);
}

export function topMotionPreference(usage: MotionLabUsage): {
  stroke: StrokeId | null;
  domain: MotionDomain | null;
} {
  const stroke = Object.entries(usage.strokes).sort((a, b) => b[1] - a[1])[0]?.[0] as StrokeId | undefined;
  const domain = Object.entries(usage.domains).sort((a, b) => b[1] - a[1])[0]?.[0] as MotionDomain | undefined;
  return { stroke: stroke ?? null, domain: domain ?? null };
}
