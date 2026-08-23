/**
 * 对战模拟名册
 * - active: ITTF 现役积分榜（运行时由 API 前 200 + 姓名搜索注入）
 * - domestic: 未上榜/退国际赛但仍活跃的高手（国乒名将等）
 * - legend: 历史不同时期著名球员（跨时代对战用，Elo 为巅峰折算）
 *
 * Elo 与 topspin-lab 同量纲思路：期望分公式不变，名册只提供输入。
 */

import type { Player } from '@/types';

export type SimTier = 'active' | 'domestic' | 'legend';

export interface SimPlayer extends Player {
  tier: SimTier;
  /** 巅峰或代表年代，如 2015–2019 */
  era?: string;
  /** 说明（退役、专注国内联赛等） */
  note?: string;
  /** 直接指定 Elo 时优先于 points 映射（历史名将） */
  eloOverride?: number;
}

/** 未进当前 ITTF 公开榜、仍活跃或刚转型的高手 */
export const DOMESTIC_ELITE: SimPlayer[] = [

  {
    id: 'dom-fzd',
    name: 'FAN Zhendong',
    nameZh: '樊振东',
    country: 'CHN',
    gender: 'M',
    rank: 0,
    prevRank: 1,
    points: 9500,
    age: 29,
    style: '降维进攻',
    tier: 'domestic',
    era: '2018–2024',
    note: '奥运/世乒赛冠军，近年国际公开赛减少，德甲/国内活跃',
    eloOverride: 2720,
  },
  {
    id: 'dom-ml',
    name: 'MA Long',
    nameZh: '马龙',
    country: 'CHN',
    gender: 'M',
    rank: 0,
    prevRank: 1,
    points: 8200,
    age: 37,
    style: '全能大满贯',
    tier: 'domestic',
    era: '2012–2024',
    note: '双圈大满贯，状态随赛事选择波动',
    eloOverride: 2680,
  },
  {
    id: 'dom-xx',
    name: 'XU Xin',
    nameZh: '许昕',
    country: 'CHN',
    gender: 'M',
    rank: 0,
    prevRank: 3,
    points: 6200,
    age: 36,
    style: '直板横打',
    tier: 'domestic',
    era: '2013–2022',
    note: '直板代表人物，联赛/表演赛为主',
    eloOverride: 2550,
  },
  {
    id: 'dom-lgy',
    name: 'LIN Gaoyuan',
    nameZh: '林高远',
    country: 'CHN',
    gender: 'M',
    rank: 0,
    prevRank: 8,
    points: 4800,
    age: 31,
    style: '左手快攻',
    tier: 'domestic',
    era: '2017–2024',
    note: '国乒主力层，积分榜时有时无',
    eloOverride: 2480,
  },
  {
    id: 'dom-cm',
    name: 'CHEN Meng',
    nameZh: '陈梦',
    country: 'CHN',
    gender: 'W',
    rank: 0,
    prevRank: 1,
    points: 9000,
    age: 32,
    style: '稳健相持',
    tier: 'domestic',
    era: '2019–2024',
    note: '奥运冠军，国际赛程收缩后仍具顶级实力',
    eloOverride: 2700,
  },
  {
    id: 'dom-lsw',
    name: 'LIU Shiwen',
    nameZh: '刘诗雯',
    country: 'CHN',
    gender: 'W',
    rank: 0,
    prevRank: 1,
    points: 7000,
    age: 34,
    style: '快攻节奏',
    tier: 'domestic',
    era: '2010–2021',
    note: '五届世界杯冠军，状态以国内/选拔为主',
    eloOverride: 2620,
  },
];

/** 历史不同时期著名球员（跨时代对战；Elo 为巅峰折算到同一标尺） */
export const LEGENDS: SimPlayer[] = [
  // 男
  {
    id: 'leg-wdj',
    name: 'Waldner Jan-Ove',
    nameZh: '瓦尔德内尔',
    country: 'SWE',
    gender: 'M',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '诡道全能',
    tier: 'legend',
    era: '1989–1997 巅峰',
    eloOverride: 2650,
  },
  {
    id: 'leg-sk',
    name: 'Samsonov Vladimir',
    nameZh: '萨姆索诺夫',
    country: 'BLR',
    gender: 'M',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '欧洲相持',
    tier: 'legend',
    era: '1996–2009',
    eloOverride: 2580,
  },
  {
    id: 'leg-wliqin',
    name: 'WANG Liqin',
    nameZh: '王励勤',
    country: 'CHN',
    gender: 'M',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '正手暴力',
    tier: 'legend',
    era: '2001–2007',
    eloOverride: 2670,
  },
  {
    id: 'leg-mh',
    name: 'MA Lin',
    nameZh: '马琳',
    country: 'CHN',
    gender: 'M',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '直板生胶变化',
    tier: 'legend',
    era: '2002–2008',
    eloOverride: 2640,
  },
  {
    id: 'leg-wht',
    name: 'WANG Hao',
    nameZh: '王皓',
    country: 'CHN',
    gender: 'M',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '直板横打',
    tier: 'legend',
    era: '2004–2010',
    eloOverride: 2660,
  },
  {
    id: 'leg-zjk',
    name: 'ZHANG Jike',
    nameZh: '张继科',
    country: 'CHN',
    gender: 'M',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '爆发快攻',
    tier: 'legend',
    era: '2011–2015',
    eloOverride: 2710,
  },
  {
    id: 'leg-boll',
    name: 'Boll Timo',
    nameZh: '波尔',
    country: 'GER',
    gender: 'M',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '左手弧圈',
    tier: 'legend',
    era: '2002–2012',
    eloOverride: 2600,
  },
  {
    id: 'leg-primorac',
    name: 'Primorac Zoran',
    nameZh: '普里莫拉茨',
    country: 'CRO',
    gender: 'M',
    rank: 0,
    prevRank: 5,
    points: 0,
    style: '欧洲经典',
    tier: 'legend',
    era: '1990s',
    eloOverride: 2480,
  },
  // 女
  {
    id: 'leg-dyp',
    name: 'DENG Yaping',
    nameZh: '邓亚萍',
    country: 'CHN',
    gender: 'W',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '近台快攻',
    tier: 'legend',
    era: '1991–1997',
    eloOverride: 2680,
  },
  {
    id: 'leg-wnan',
    name: 'WANG Nan',
    nameZh: '王楠',
    country: 'CHN',
    gender: 'W',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '左手全面',
    tier: 'legend',
    era: '1998–2004',
    eloOverride: 2660,
  },
  {
    id: 'leg-zying',
    name: 'ZHANG Yining',
    nameZh: '张怡宁',
    country: 'CHN',
    gender: 'W',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '无短板王朝',
    tier: 'legend',
    era: '2001–2008',
    eloOverride: 2720,
  },
  {
    id: 'leg-li',
    name: 'LI Xiaoxia',
    nameZh: '李晓霞',
    country: 'CHN',
    gender: 'W',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '力量相持',
    tier: 'legend',
    era: '2012–2016',
    eloOverride: 2670,
  },
  {
    id: 'leg-ding',
    name: 'DING Ning',
    nameZh: '丁宁',
    country: 'CHN',
    gender: 'W',
    rank: 0,
    prevRank: 1,
    points: 0,
    style: '左手相持',
    tier: 'legend',
    era: '2011–2017',
    eloOverride: 2665,
  },
];

export function buildActiveFromIttf(
  men: Array<{ name: string; country: string; rank: number; points?: number }>,
  women: Array<{ name: string; country: string; rank: number; points?: number }>,
): SimPlayer[] {
  const mapOne = (
    r: { name: string; country: string; rank: number; points?: number },
    gender: 'M' | 'W',
    i: number,
  ): SimPlayer => ({
    id: `ittf-${gender}-${r.rank}-${i}`,
    name: r.name,
    country: r.country,
    gender,
    rank: r.rank,
    prevRank: r.rank,
    points: r.points ?? Math.max(500, 12000 - r.rank * 80),
    tier: 'active',
    era: '2026 现役',
  });
  return [
    ...men.slice(0, 100).map((r, i) => mapOne(r, 'M', i)),
    ...women.slice(0, 100).map((r, i) => mapOne(r, 'W', i)),
  ];
}


/** 始终并入模拟池的 ITTF 收录选手（可能不在当周前 200） */
export const FEATURED_ITTF_PLAYERS: SimPlayer[] = [
  {
    id: 'ittf-han-yichen',
    name: 'HAN YIchen',
    nameZh: '韩奕辰（小韩老师）',
    country: 'CHN',
    gender: 'W',
    rank: 0,
    prevRank: 0,
    points: 1200,
    style: '教学/技术讲解',
    tier: 'active',
    era: 'ITTF 收录',
    note: 'ITTF 官网收录女运动员；小韩老师教学直播',
    eloOverride: 1850,
  },
];

export function mergeSimRoster(active: SimPlayer[]): SimPlayer[] {
  const key = (p: SimPlayer) => p.name.toUpperCase().replace(/\s+/g, '');
  const seen = new Set<string>();
  const out: SimPlayer[] = [];
  for (const p of [...active, ...FEATURED_ITTF_PLAYERS, ...DOMESTIC_ELITE, ...LEGENDS]) {
    const k = key(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

/** 将 ITTF 搜索结果转为可模拟选手 */
export function simPlayerFromSearch(r: {
  ittfId: string;
  name: string;
  country?: string;
  gender?: 'M' | 'W';
  rank?: number;
  points?: number;
}): SimPlayer {
  return {
    id: `ittf-search-${r.ittfId || r.name}`,
    name: r.name,
    country: r.country ?? 'UNK',
    gender: r.gender ?? 'M',
    rank: r.rank ?? 0,
    prevRank: r.rank ?? 0,
    points: r.points ?? 1000,
    tier: 'active',
    era: 'ITTF 检索',
    note: r.ittfId ? `ITTF ID ${r.ittfId}` : undefined,
  };
}
