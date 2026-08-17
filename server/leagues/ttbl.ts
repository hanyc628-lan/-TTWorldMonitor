import type { League, Club, ClubFixture, LeagueStats, LeagueTeamStanding } from '../types/index.js';
import { cacheGetOrSet } from '../cache.js';

/**
 * 德国 TTBL 德甲联赛（ttbl.de）真实数据接入
 * 数据源：ttbl.de 页面内嵌 __NEXT_DATA__ JSON（免费、无需登录）
 * - 积分榜: https://www.ttbl.de/bundesliga/table
 * - 赛程:   https://www.ttbl.de/bundesliga/gameschedule/current/current/all
 * 服务器在欧洲；已验证 2026-08-17。采集失败时由调用方回退样本。
 */

const STANDINGS_URL = 'https://www.ttbl.de/bundesliga/table';
const SCHEDULE_URL = 'https://www.ttbl.de/bundesliga/gameschedule/current/current/all';
const NEXT_DATA_RE = /<script\s+id="__NEXT_DATA__"\s+type="application\/json"\s*>([\s\S]*?)<\/script>/;
const FETCH_TTL_MS = 30 * 60 * 1000;

async function fetchNextData(url: string, retries = 2) {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'TTWorldMonitor/0.1 (+league-data)', 'Accept-Language': 'de-DE,de;q=0.9' },
        redirect: 'follow',
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`TTBL HTTP ${res.status}`);
      const html = await res.text();
      const m = html.match(NEXT_DATA_RE);
      if (!m) throw new Error('TTBL no __NEXT_DATA__');
      return JSON.parse(m[1]);
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw lastErr;
}

/** 德国 12 队短名 → 全称/城市（来自程序抓取的 seasonTeam） */
interface TTBLTeamRef {
  id: string;
  short: string;
  full: string;
  city: string;
}

function parseTeams(data: unknown): TTBLTeamRef[] {
  const teams = (data as { props?: { pageProps?: { teams?: Array<{ seasonTeam?: { id?: string; name?: string; shortname?: string; place?: string } }> } } })?.props?.pageProps?.teams ?? [];
  return teams.map((t) => ({
    id: String(t.seasonTeam?.id ?? ''),
    short: t.seasonTeam?.shortname ?? '',
    full: t.seasonTeam?.name ?? '',
    city: t.seasonTeam?.place ?? '',
  }));
}

function parseStandings(data: unknown) {
  const teams = (data as { props?: { pageProps?: { teams?: Array<{ rank?: number; matchWins?: number; matchLosses?: number; matchCount?: number; gameWins?: number; gameLosses?: number; plusPoints?: number; minusPoints?: number; seasonTeam?: { id?: string; name?: string } }> } } })?.props?.pageProps?.teams ?? [];
  return teams.map((t) => ({
    rank: t.rank ?? 0,
    id: String(t.seasonTeam?.id ?? ''),
    name: t.seasonTeam?.name ?? '',
    wins: t.matchWins ?? 0,
    losses: t.matchLosses ?? 0,
    played: t.matchCount ?? 0,
    gameWins: t.gameWins ?? 0,
    gameLosses: t.gameLosses ?? 0,
    plusPoints: t.plusPoints ?? 0,
    minusPoints: t.minusPoints ?? 0,
  }));
}

function parseMatches(data: unknown) {
  const matches = (data as { props?: { pageProps?: { matches?: Array<{ id?: string; timeStamp?: number; matchState?: string; homeGames?: number; awayGames?: number; homeTeam?: { seasonTeam?: { name?: string; id?: string } }; awayTeam?: { seasonTeam?: { name?: string; id?: string } } }> } } })?.props?.pageProps?.matches ?? [];
  return matches.map((g) => {
    const ts = g.timeStamp ? new Date(g.timeStamp * 1000).toISOString() : null;
    const homeScore = g.homeGames != null ? g.homeGames : null;
    const awayScore = g.awayGames != null ? g.awayGames : null;
    const state = g.matchState ?? 'unknown';
    const status: ClubFixture['status'] = state === 'Finished' ? 'finished' : state === 'Live' ? 'live' : 'scheduled';
    return {
      id: String(g.id ?? ''),
      date: ts ?? new Date().toISOString(),
      home: g.homeTeam?.seasonTeam?.name ?? '',
      homeId: String(g.homeTeam?.seasonTeam?.id ?? ''),
      away: g.awayTeam?.seasonTeam?.name ?? '',
      awayId: String(g.awayTeam?.seasonTeam?.id ?? ''),
      homeScore,
      awayScore,
      score: homeScore != null && awayScore != null ? `${homeScore}:${awayScore}` : null,
      status,
    };
  });
}

export interface TTBLData {
  leagues: League[];
  clubs: Club[];
  clubFixtures: ClubFixture[];
  leagueStats: LeagueStats[];
  fetchedAt: string;
  ok: boolean;
}

export async function fetchTTBLData(): Promise<TTBLData> {
  const cacheKey = 'leagues:ttbl:all';
  return cacheGetOrSet(cacheKey, FETCH_TTL_MS, async () => {
    try {
      const [tableData, scheduleData] = await Promise.all([
        fetchNextData(STANDINGS_URL),
        fetchNextData(SCHEDULE_URL),
      ]);

      const teamRefs = parseTeams(tableData);
      const standings = parseStandings(tableData);
      const matches = parseMatches(scheduleData);

      const leagues: League[] = [
        {
          id: 'ttbl',
          name: 'TTBL 德国乒乓球甲级联赛',
          country: 'GER',
          region: '欧洲',
          level: 'pro',
          season: '2026-2027',
          teams: teamRefs.length || 12,
          lat: 51.16,
          lng: 10.45,
        },
      ];

      const clubs: Club[] = teamRefs.map((t) => ({
        id: `ttbl-${t.id}`,
        name: t.full,
        leagueId: 'ttbl',
        city: t.city,
        country: 'GER',
        lat: 51.16,
        lng: 10.45,
      }));

      const clubFixtures: ClubFixture[] = matches.map((m) => ({
        id: `ttbl-fx-${m.id}`,
        leagueId: 'ttbl',
        homeClub: m.home,
        awayClub: m.away,
        status: m.status,
        score: m.score ?? undefined,
        scheduledAt: m.date,
      }));

      const standingsRows: LeagueTeamStanding[] = standings.map((s) => {
        const winRate = s.played > 0 ? Math.round((s.wins / s.played) * 100) : 0;
        return {
          clubId: `ttbl-${s.id}`,
          clubName: s.name,
          wins: s.wins,
          losses: s.losses,
          winRate,
          leaguePoints: s.plusPoints,
        };
      });

      const leagueStats: LeagueStats[] = [
        {
          leagueId: 'ttbl',
          season: '2026-2027',
          matchesPlayed: clubFixtures.filter((f) => f.status !== 'scheduled').length,
          avgSetsPerMatch: 6,
          spotlight: {
            singlesWins: 0,
            singlesLosses: 0,
            singlesWinRate: 0,
            teamWins: 0,
            teamLosses: 0,
            teamWinRate: 0,
            form: [],
          },
          standings: standingsRows,
          winRateTrend: [],
        },
      ];

      return {
        leagues,
        clubs,
        clubFixtures,
        leagueStats,
        fetchedAt: new Date().toISOString(),
        ok: standings.length > 0 || matches.length > 0,
      };
    } catch {
      return { leagues: [], clubs: [], clubFixtures: [], leagueStats: [], fetchedAt: '', ok: false };
    }
  });
}