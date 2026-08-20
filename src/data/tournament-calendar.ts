/**
 * 自动更新的 WTT/ITTF 重点赛事日历
 * - status / disruptionScore 按当前日期实时计算
 * - 优先展示进行中 → 即将开始 → 刚结束的重点赛事
 * - 无 Parse.bot 密钥时作为 bootstrap 回退源
 */
import type { Tournament } from '@/types';

export interface CalendarEvent {
  id: string;
  name: string;
  tier: Tournament['tier'];
  location: string;
  country: string;
  lat: number;
  lng: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  participants?: number;
}

/** 2026 赛季重点赛事（Grand Smash / Champions / Worlds / 联赛窗口） */
export const CALENDAR_2026: CalendarEvent[] = [
  {
    id: 'cal-wtt-us-smash',
    name: 'WTT US Smash 2026',
    tier: 'grand-smash',
    location: 'Ontario, California',
    country: 'USA',
    lat: 34.06,
    lng: -117.65,
    startDate: '2026-06-26',
    endDate: '2026-07-05',
    participants: 128,
  },
  {
    id: 'cal-wtt-champions-yokohama',
    name: 'WTT Champions Yokohama 2026',
    tier: 'champions',
    location: 'Yokohama',
    country: 'JPN',
    lat: 35.44,
    lng: 139.64,
    startDate: '2026-08-04',
    endDate: '2026-08-09',
    participants: 32,
  },
  {
    id: 'cal-europe-smash',
    name: 'WTT Europe Smash 2026',
    tier: 'grand-smash',
    location: 'Sweden',
    country: 'SWE',
    lat: 59.33,
    lng: 18.07,
    startDate: '2026-08-13',
    endDate: '2026-08-23',
    participants: 128,
  },
  {
    id: 'cal-wtt-champions-macao',
    name: 'WTT Champions Macao 2026',
    tier: 'champions',
    location: 'Macao',
    country: 'CHN',
    lat: 22.2,
    lng: 113.55,
    startDate: '2026-09-08',
    endDate: '2026-09-13',
    participants: 32,
  },
  {
    id: 'cal-wtt-contender-almaty',
    name: 'WTT Contender Almaty 2026',
    tier: 'contender',
    location: 'Almaty',
    country: 'KAZ',
    lat: 43.22,
    lng: 76.85,
    startDate: '2026-09-01',
    endDate: '2026-09-06',
    participants: 64,
  },
  {
    id: 'cal-pingchao-2026',
    name: '中国乒超联赛 2026',
    tier: 'league',
    location: '全国赛会制',
    country: 'CHN',
    lat: 39.9,
    lng: 116.4,
    startDate: '2026-07-23',
    endDate: '2026-12-27',
    participants: 18,
  },
  {
    id: 'cal-ittf-worlds-2026',
    name: 'ITTF World Championships 2026',
    tier: 'worlds',
    location: 'London',
    country: 'GBR',
    lat: 51.5,
    lng: -0.12,
    startDate: '2026-05-17',
    endDate: '2026-05-25',
    participants: 200,
  },
  {
    id: 'cal-wtt-champions-montpellier',
    name: 'WTT Champions Montpellier 2026',
    tier: 'champions',
    location: 'Montpellier',
    country: 'FRA',
    lat: 43.61,
    lng: 3.87,
    startDate: '2026-10-27',
    endDate: '2026-11-01',
    participants: 32,
  },
  {
    id: 'cal-wtt-champions-frankfurt',
    name: 'WTT Champions Frankfurt 2026',
    tier: 'champions',
    location: 'Frankfurt',
    country: 'GER',
    lat: 50.11,
    lng: 8.68,
    startDate: '2026-11-03',
    endDate: '2026-11-08',
    participants: 32,
  },
  {
    id: 'cal-olympics-2028',
    name: 'Olympic Games Los Angeles 2028',
    tier: 'olympic',
    location: 'Los Angeles',
    country: 'USA',
    lat: 34.05,
    lng: -118.24,
    startDate: '2028-07-14',
    endDate: '2028-07-30',
    participants: 172,
  },
];

function dayStart(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}

function dayEnd(iso: string): number {
  return new Date(`${iso}T23:59:59Z`).getTime();
}

export function resolveStatus(startDate: string, endDate: string, now = Date.now()): Tournament['status'] {
  if (now < dayStart(startDate)) return 'upcoming';
  if (now > dayEnd(endDate)) return 'completed';
  return 'live';
}

function disruptionFor(tier: Tournament['tier'], status: Tournament['status']): number {
  const base: Record<string, number> = {
    olympic: 100,
    worlds: 95,
    'grand-smash': 90,
    champions: 75,
    'star-contender': 60,
    contender: 50,
    league: 55,
    youth: 40,
  };
  const b = base[tier] ?? 40;
  if (status === 'live') return Math.min(100, b + 10);
  if (status === 'upcoming') return b;
  return Math.max(20, b - 25);
}

/** 将日历条目转为带实时 status 的 Tournament */
export function toTournament(ev: CalendarEvent, now = Date.now()): Tournament {
  const status = resolveStatus(ev.startDate, ev.endDate, now);
  return {
    id: ev.id,
    name: ev.name,
    tier: ev.tier,
    location: ev.location,
    country: ev.country,
    lat: ev.lat,
    lng: ev.lng,
    startDate: ev.startDate,
    endDate: ev.endDate,
    status,
    disruptionScore: disruptionFor(ev.tier, status),
    participants: ev.participants,
  };
}

/**
 * 自动更新后的赛事列表：
 * 1. 全部按日期刷新 status
 * 2. 排序：live → upcoming（按开赛日）→ completed（按结束日倒序）
 * 3. 同级 Grand Smash 只突出「当前窗口」相关项，避免陈旧站霸榜
 */
export function getAutoTournaments(now = Date.now()): Tournament[] {
  const list = CALENDAR_2026.map((ev) => toTournament(ev, now));

  const rank = (s: Tournament['status']) => (s === 'live' ? 0 : s === 'upcoming' ? 1 : 2);

  return list.sort((a, b) => {
    const ra = rank(a.status);
    const rb = rank(b.status);
    if (ra !== rb) return ra - rb;
    if (a.status === 'upcoming') return a.startDate.localeCompare(b.startDate);
    if (a.status === 'completed') return b.endDate.localeCompare(a.endDate);
    return b.disruptionScore - a.disruptionScore;
  });
}

/** 当前应展示的「同级大满贯/冠军赛」焦点名称（供信号与直播文案） */
export function getCurrentFocusTournamentName(now = Date.now()): string {
  const all = getAutoTournaments(now);
  const liveMajor = all.find(
    (t) => t.status === 'live' && (t.tier === 'grand-smash' || t.tier === 'champions' || t.tier === 'worlds'),
  );
  if (liveMajor) return liveMajor.name;
  const nextMajor = all.find(
    (t) => t.status === 'upcoming' && (t.tier === 'grand-smash' || t.tier === 'champions' || t.tier === 'worlds'),
  );
  if (nextMajor) return nextMajor.name;
  const recent = all.find(
    (t) => t.status === 'completed' && (t.tier === 'grand-smash' || t.tier === 'champions'),
  );
  return recent?.name ?? 'WTT Tour';
}

/**
 * 合并 Parse.bot 实时日历与本地自动日历：
 * - 有远程数据时以远程为主，并用日期逻辑校正 status
 * - 远程为空时回退本地自动日历
 */
export function mergeTournamentSources(remote: Tournament[], now = Date.now()): Tournament[] {
  if (!remote.length) return getAutoTournaments(now);

  const normalized = remote.map((t) => {
    const status = resolveStatus(t.startDate, t.endDate, now);
    return {
      ...t,
      status,
      disruptionScore: disruptionFor(t.tier, status),
    };
  });

  // 补充本地重点赛事中远程可能缺失的项（按名称模糊去重）
  const names = new Set(normalized.map((t) => t.name.toLowerCase()));
  for (const local of getAutoTournaments(now)) {
    const key = local.name.toLowerCase();
    const exists = [...names].some((n) => n.includes(key.slice(0, 12)) || key.includes(n.slice(0, 12)));
    if (!exists) {
      normalized.push(local);
      names.add(key);
    }
  }

  const rank = (s: Tournament['status']) => (s === 'live' ? 0 : s === 'upcoming' ? 1 : 2);
  return normalized.sort((a, b) => {
    const ra = rank(a.status);
    const rb = rank(b.status);
    if (ra !== rb) return ra - rb;
    if (a.status === 'upcoming') return a.startDate.localeCompare(b.startDate);
    return b.disruptionScore - a.disruptionScore;
  });
}
