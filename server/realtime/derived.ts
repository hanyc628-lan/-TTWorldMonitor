import type { CountryTPI, RankingMover } from '../types/index.js';
import { fetchWorldRankings } from '../ittf/client.js';
import { computeTPIScore, getTPILevel, TPI_FORMULA_VERSION } from './tpi-scoring.js';
import { COUNTRY_TPI as TPI_RECORDS } from '../../src/data/seed.js';

/**
 * 基于 ITTF 实时排名派生：
 * - rankingMovers：真实排名变动（上榜/跌榜）
 * - tpi.topPlayers：按实时排名聚合的各国顶尖选手（替代种子写死名单）
 */

export interface LiveTPIRecord extends CountryTPI {
  topPlayers: CountryTPI['topPlayers'];
}

/** 用实时男女前 100 排名计算 movers；失败时回退种子 */
export async function buildLiveRankingMovers(): Promise<RankingMover[]> {
  const [men, women] = await Promise.all([
    fetchWorldRankings('M', 100).catch(() => []),
    fetchWorldRankings('W', 100).catch(() => []),
  ]);
  if (men.length === 0 && women.length === 0) return [];

  const movers: RankingMover[] = [
    ...men
      .filter((r) => r.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 3)
      .map((r) => ({
        player: r.name,
        country: r.country,
        gender: 'M' as const,
        change: r.change,
        newRank: r.rank,
        reason: `↑${r.change}`,
      })),
    ...women
      .filter((r) => r.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 3)
      .map((r) => ({
        player: r.name,
        country: r.country,
        gender: 'W' as const,
        change: r.change,
        newRank: r.rank,
        reason: `↑${r.change}`,
      })),
  ];
  return movers.slice(0, 6);
}

/** 用实时排名填充 TPI topPlayers */
export async function enrichTPIWithLivePlayers(): Promise<LiveTPIRecord[]> {
  const [men, women] = await Promise.all([
    fetchWorldRankings('M', 100).catch(() => []),
    fetchWorldRankings('W', 100).catch(() => []),
  ]);
  const byCountry = new Map<string, NonNullable<CountryTPI['topPlayers']>>();
  for (const r of men) {
    const list = byCountry.get(r.country) ?? [];
    if (list.length < 3) list.push({ name: r.name, rank: r.rank, gender: 'M' });
    byCountry.set(r.country, list);
  }
  for (const r of women) {
    const list = byCountry.get(r.country) ?? [];
    if (list.length < 3) list.push({ name: r.name, rank: r.rank, gender: 'W' });
    byCountry.set(r.country, list);
  }

  return TPI_RECORDS.map((rec) => {
    const score = computeTPIScore(rec.components);
    const livePlayers = byCountry.get(rec.country);
    return {
      ...rec,
      score,
      level: getTPILevel(score),
      methodologyVersion: TPI_FORMULA_VERSION,
      lastUpdated: new Date().toISOString(),
      topPlayers: livePlayers && livePlayers.length ? livePlayers : rec.topPlayers,
    };
  });
}