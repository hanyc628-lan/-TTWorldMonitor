/**
 * TPI v2 scoring — 第一性原理五支柱加权
 * Server-authoritative; client displays only.
 */

import type { TPIComponents, CountryTPI } from '@/types';
import type { HeatmapMetric } from '@/config/tpi-axioms';
import { TPI_PILLAR_WEIGHTS } from '@/config/tpi-axioms';

export const TPI_FORMULA_VERSION = 'v2-fp';

export function computeTPIScore(components: TPIComponents): number {
  return Math.round(
    (Object.keys(TPI_PILLAR_WEIGHTS) as (keyof TPIComponents)[]).reduce(
      (sum, key) => sum + components[key] * TPI_PILLAR_WEIGHTS[key],
      0,
    ),
  );
}

export function getHeatmapValue(tpi: CountryTPI, metric: HeatmapMetric): number {
  if (metric === 'composite') return tpi.score;
  return tpi.components[metric];
}

export function getTPILevel(score: number): CountryTPI['level'] {
  if (score >= 85) return 'dominant';
  if (score >= 70) return 'strong';
  if (score >= 55) return 'rising';
  if (score >= 40) return 'stable';
  return 'declining';
}

export function deriveTPITrend(
  current: number,
  previous: number,
  deadband = 1,
): { trend: CountryTPI['trend']; change24h: number } {
  const delta = current - previous;
  if (Math.abs(delta) <= deadband) return { trend: 'stable', change24h: 0 };
  return { trend: delta > 0 ? 'up' : 'down', change24h: delta };
}

export function enrichTPIRecords(
  records: Array<{
    country: string;
    trend: CountryTPI['trend'];
    change24h: number;
    components: TPIComponents;
    topPlayers: CountryTPI['topPlayers'];
    brief: string;
  }>,
): CountryTPI[] {
  const now = new Date().toISOString();
  return records.map((r) => {
    const score = computeTPIScore(r.components);
    return {
      ...r,
      score,
      level: getTPILevel(score),
      methodologyVersion: TPI_FORMULA_VERSION,
      lastUpdated: now,
    };
  });
}

/** 热力图色阶：深红(强) → 金 → 蓝 → 灰(弱) */
export function getTPIColor(score: number): string {
  if (score >= 80) return '#ff4d4d';
  if (score >= 65) return '#f5c542';
  if (score >= 50) return '#4d9fff';
  if (score >= 30) return '#5a6a82';
  return '#3a4254';
}

export function getTrendIcon(trend: CountryTPI['trend']): string {
  return trend === 'up' ? '▲' : trend === 'down' ? '▼' : '─';
}

export function getTrendColor(trend: CountryTPI['trend']): string {
  return trend === 'up' ? 'text-tt-green' : trend === 'down' ? 'text-tt-red' : 'text-tt-muted';
}
