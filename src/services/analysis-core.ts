import type { Signal } from '@/types';

export interface CorrelationSignalCore {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  timestamp: number;
  data: {
    velocity?: number;
    sourceNames?: string[];
    countries?: string[];
  };
}

const DEDUPE_TTLS: Record<string, number> = {
  velocity_spike: 30 * 60 * 1000,
  convergence: 60 * 60 * 1000,
  upset: 15 * 60 * 1000,
};

const dedupeCache = new Map<string, number>();

export function generateDedupeKey(type: string, countries: string[]): string {
  return `${type}:${[...countries].sort().join(',')}`;
}

export function isDuplicate(type: string, countries: string[]): boolean {
  const key = generateDedupeKey(type, countries);
  const last = dedupeCache.get(key);
  const ttl = DEDUPE_TTLS[type] ?? 30 * 60 * 1000;
  if (last && Date.now() - last < ttl) return true;
  dedupeCache.set(key, Date.now());
  return false;
}

/** Pure analysis — mirrors World Monitor analysis-core.ts */
export function detectVelocitySpikes(
  signals: Signal[],
  windowMs = 60 * 60 * 1000,
): CorrelationSignalCore[] {
  const now = Date.now();
  const recent = signals.filter((s) => now - new Date(s.timestamp).getTime() < windowMs);

  const countryCounts = new Map<string, Signal[]>();
  for (const s of recent) {
    for (const c of s.countries) {
      const list = countryCounts.get(c) ?? [];
      list.push(s);
      countryCounts.set(c, list);
    }
  }

  const results: CorrelationSignalCore[] = [];
  for (const [country, sigs] of countryCounts) {
    if (sigs.length < 3) continue;
    if (isDuplicate('velocity_spike', [country])) continue;

    results.push({
      id: `velocity-${country}-${now}`,
      type: 'velocity_spike',
      title: `${country} 信号速度异常`,
      description: `${sigs.length} 条信号在 1 小时内指向 ${country}，超过基线 2 倍`,
      confidence: Math.min(0.95, 0.5 + sigs.length * 0.08),
      timestamp: now,
      data: {
        velocity: sigs.length,
        countries: [country],
        sourceNames: [...new Set(sigs.map((s) => s.source))],
      },
    });
  }
  return results;
}

export function detectConvergence(
  signals: Signal[],
  windowMs = 24 * 60 * 60 * 1000,
): CorrelationSignalCore[] {
  const now = Date.now();
  const recent = signals.filter((s) => now - new Date(s.timestamp).getTime() < windowMs);
  const results: CorrelationSignalCore[] = [];

  const byCountry = new Map<string, Set<string>>();
  for (const s of recent) {
    for (const c of s.countries) {
      const types = byCountry.get(c) ?? new Set();
      types.add(s.type);
      byCountry.set(c, types);
    }
  }

  for (const [country, types] of byCountry) {
    if (types.size < 2) continue;
    if (isDuplicate('convergence', [country])) continue;

    results.push({
      id: `convergence-${country}-${now}`,
      type: 'convergence',
      title: `${country} 多信号汇聚`,
      description: `${types.size} 类独立信号同时活跃：${[...types].join(' + ')}`,
      confidence: Math.min(0.95, 0.5 + types.size * 0.15),
      timestamp: now,
      data: { countries: [country] },
    });
  }
  return results;
}

export function analyzeSignals(signals: Signal[]): CorrelationSignalCore[] {
  return [...detectVelocitySpikes(signals), ...detectConvergence(signals)];
}

import { getT } from '@/i18n';

export function formatRelativeTime(iso: string): string {
  const t = getT();
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('time.justNow');
  if (minutes < 60) return t('time.minutesAgo', { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('time.hoursAgo', { n: hours });
  return t('time.daysAgo', { n: Math.floor(hours / 24) });
}

export function getSeverityColor(severity: Signal['severity']): string {
  switch (severity) {
    case 'high': return 'bg-tt-red/20 text-tt-red border-tt-red/30';
    case 'medium': return 'bg-tt-gold/20 text-tt-gold border-tt-gold/30';
    default: return 'bg-tt-accent2/10 text-tt-accent2 border-tt-accent2/20';
  }
}

export function getSignalTypeLabel(type: Signal['type']): string {
  const key = `signalType.${type}`;
  const translated = getT()(key);
  return translated === key ? type : translated;
}
