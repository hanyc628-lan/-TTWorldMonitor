/**
 * 球员对战模拟 — 基于 topspin-lab（Roni-quant）的 Elo 期望分公式
 * https://github.com/Roni-quant/topspin-lab
 *
 * expected = 1 / (1 + 10^((eloB - eloA) / 400))
 * 再以局胜率做 Monte Carlo 模拟整场（BO5 / BO7）
 */

import type { Player } from '@/types';
import type { SimPlayer } from '@/data/sim-roster';

/** 将 ITTF 积分近似映射为 Elo（与 topspin-lab 同量纲思路） */
export function pointsToElo(points: number, rank: number): number {
  // 世界前排积分约 2000–11000 → Elo 约 1800–2800
  const fromPoints = 1500 + Math.log10(Math.max(points, 100)) * 280;
  const rankBonus = Math.max(0, 40 - rank) * 8;
  return Math.round(fromPoints + rankBonus);
}

export function playerElo(p: Player | SimPlayer): number {
  const o = (p as SimPlayer).eloOverride;
  if (typeof o === 'number' && o > 0) return o;
  return pointsToElo(p.points, p.rank > 0 ? p.rank : 50);
}

/** topspin-lab ratings/elo.py → expected_score */
export function expectedScore(eloA: number, eloB: number): number {
  return 1 / (1 + 10 ** ((eloB - eloA) / 400));
}

export type BestOf = 5 | 7;

export interface GameResult {
  scoreA: number;
  scoreB: number;
  winner: 'A' | 'B';
}

export interface MatchSimResult {
  playerA: Player;
  playerB: Player;
  eloA: number;
  eloB: number;
  /** A 赢整场的先验概率 */
  priorWinProbA: number;
  bestOf: BestOf;
  games: GameResult[];
  gamesWonA: number;
  gamesWonB: number;
  winner: 'A' | 'B';
  /** 多次模拟后的胜场占比（本次为单场模拟 + 先验） */
  note: string;
}

function simulateGame(pWinPointA: number): GameResult {
  let a = 0;
  let b = 0;
  // 11 分制，至少领先 2 分
  while (true) {
    if (Math.random() < pWinPointA) a += 1;
    else b += 1;
    if ((a >= 11 || b >= 11) && Math.abs(a - b) >= 2) break;
    // 安全阀
    if (a + b > 60) break;
  }
  return { scoreA: a, scoreB: b, winner: a > b ? 'A' : 'B' };
}

/**
 * 模拟一场单打。
 * 局内得分率由 Elo 期望分经 logistic 压缩得到（避免极端 0/1）。
 */
export function simulateMatch(playerA: Player, playerB: Player, bestOf: BestOf = 5): MatchSimResult {
  const eloA = playerElo(playerA);
  const eloB = playerElo(playerB);
  const priorWinProbA = expectedScore(eloA, eloB);

  // 局胜率略向 0.5 收缩，体现单局波动；跨时代对战额外收缩（不确定性）
  const eraCross =
    Boolean((playerA as SimPlayer).era && (playerB as SimPlayer).era) &&
    (playerA as SimPlayer).era !== (playerB as SimPlayer).era;
  const shrink = eraCross ? 0.7 : 0.85;
  const pGameA = 0.5 + (priorWinProbA - 0.5) * shrink;
  // 分胜率再平滑一层
  const pPointA = 0.5 + (pGameA - 0.5) * 0.7;

  const need = Math.ceil(bestOf / 2);
  const games: GameResult[] = [];
  let gamesWonA = 0;
  let gamesWonB = 0;

  while (gamesWonA < need && gamesWonB < need) {
    const g = simulateGame(pPointA);
    games.push(g);
    if (g.winner === 'A') gamesWonA += 1;
    else gamesWonB += 1;
  }

  return {
    playerA,
    playerB,
    eloA,
    eloB,
    priorWinProbA,
    bestOf,
    games,
    gamesWonA,
    gamesWonB,
    winner: gamesWonA > gamesWonB ? 'A' : 'B',
    note: '模拟基于 topspin-lab Elo 期望分 + 局分 Monte Carlo，非官方赛果；跨时代为巅峰折算推演',
  };
}

/** 批量模拟 n 场，返回 A 胜率（更接近 topspin-lab 概率校准） */
export function estimateWinRate(
  playerA: Player,
  playerB: Player,
  bestOf: BestOf = 5,
  trials = 500,
): { winRateA: number; eloA: number; eloB: number; prior: number } {
  const eloA = playerElo(playerA);
  const eloB = playerElo(playerB);
  const prior = expectedScore(eloA, eloB);
  let wins = 0;
  for (let i = 0; i < trials; i++) {
    if (simulateMatch(playerA, playerB, bestOf).winner === 'A') wins += 1;
  }
  return { winRateA: wins / trials, eloA, eloB, prior };
}
