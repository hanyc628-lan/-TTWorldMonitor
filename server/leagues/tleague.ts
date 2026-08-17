import type { League, Club, ClubFixture, LeagueStats, LeagueTeamStanding } from '../types/index.js';
import { cacheGetOrSet } from '../cache.js';

/**
 * 日本 T 联赛（tleague.jp）真实数据接入
 * 数据源：tleague.jp 官方 SSR HTML（免费、无需登录）
 * - 赛程/赛果: https://tleague.jp/schedule/
 * - 积分榜: https://tleague.jp/ranking/
 * - 俱乐部: 首页 TEAM 区块 /team/{slug}/
 * 截止 2026-08-17 已验证可抓取。采集失败时由调用方回退样本。
 */

const TLEAGUE_BASE = 'https://tleague.jp';
const FETCH_TTL_MS = 30 * 60 * 1000;

// 男6女12（官网抓取 2026-08-17）
const TEAM_META: Array<{ slug: string; name: string; gender: 'M' | 'W' }> = [
  { slug: 'tt-saitama', name: 'T.T彩たま', gender: 'M' },
  { slug: 'km-tokyo', name: '木下マイスター東京', gender: 'M' },
  { slug: 'kanazawa', name: '金沢ポート', gender: 'M' },
  { slug: 'shizuoka', name: '静岡ジェード', gender: 'M' },
  { slug: 'okayama', name: '岡山リベッツ', gender: 'M' },
  { slug: 'ryukyu', name: '琉球アスティーダ', gender: 'M' },
  { slug: 'ka-kanagawa', name: '木下アビエル神奈川', gender: 'W' },
  { slug: 'top-nagoya', name: 'トップおとめピンポンズ名古屋', gender: 'W' },
  { slug: 'kyoto', name: '京都カグヤライズ', gender: 'W' },
  { slug: 'red-elf', name: '日本生命レッドエルフ', gender: 'W' },
  { slug: 'np-mallets', name: '日本ペイントマレッツ', gender: 'W' },
  { slug: 'kyushu', name: '九州カリーナ', gender: 'W' },
];

// 短名（赛程页）→ 全称（积分榜/俱乐部）
const SHORT_TO_FULL: Record<string, string> = {
  'KM東京': '木下マイスター東京',
  'TT彩たま': 'T.T彩たま',
  金沢: '金沢ポート',
  静岡: '静岡ジェード',
  岡山: '岡山リベッツ',
  琉球: '琉球アスティーダ',
  'KA神奈川': '木下アビエル神奈川',
  トップ: 'トップおとめピンポンズ名古屋',
  京都: '京都カグヤライズ',
  日本生命: '日本生命レッドエルフ',
  ニッペM: '日本ペイントマレッツ',
  九州: '九州カリーナ',
};

const FULL_TO_SLUG: Record<string, string> = Object.fromEntries(TEAM_META.map((t) => [t.name, t.slug]));

async function fetchHtml(url: string, timeoutMs = 30000): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'TTWorldMonitor/0.1 (+league-data)' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`TLeague HTTP ${res.status}`);
  return res.text();
}

/** 提取 href="/team/slug/" 中的 slug */
function slugFromTeamHref(href: string): string | null {
  const m = href.match(/\/team\/([a-z0-9-]+)\/?/i);
  return m ? m[1] : null;
}

/** 解析赛程页：<tr> 行 → {date, gender, home, away, score, status, detailId} */
function parseScheduleRows(html: string) {
  const rows: Array<{ date: string; gender: 'M' | 'W'; home: string; away: string; score: string | null; status: 'finished' | 'scheduled' | 'live'; detailId: string | null }> = [];
  // 按 <tr ...>...</tr> 分块（大括号避免注释歧义）
  const trBlocks = html.split(/<tr[\s>]/i).slice(1);
  for (const block of trBlocks) {
    const dateM = block.match(/(\d{4})年\s*(\d{1,2})月(\d{1,2})日/);
    const timeM = block.match(/(\d{1,2}):(\d{2})/);
    if (!dateM) continue;
    const gender = block.includes('男子') ? 'M' : block.includes('女子') ? 'W' : null;
    const teamHrefs = [...block.matchAll(/href="(\/team\/[a-z0-9-]+\/?)"/gi)].map((m) => m[1]);
    if (teamHrefs.length < 2 || !gender) continue;
    const homeSlug = slugFromTeamHref(teamHrefs[0]);
    const awaySlug = slugFromTeamHref(teamHrefs[1]);
    if (!homeSlug || !awaySlug) continue;
    const homeShort = homeSlug === 'km-tokyo' ? 'KM東京' : TEAM_META.find((t) => t.slug === homeSlug)?.name ?? homeSlug;
    const awayShort = awaySlug === 'km-tokyo' ? 'KM東京' : TEAM_META.find((t) => t.slug === awaySlug)?.name ?? awaySlug;
    // 比分：<strong>4 - 0</strong> 或 <strong>3 - 2</strong>
    const scoreM = block.match(/<strong>\s*(\d+)\s*-\s*(\d+)\s*<\/strong>/);
    const detailM = block.match(/detail\.php\?id=(\d+)/);
    const score = scoreM ? `${scoreM[1]}-${scoreM[2]}` : null;
    const time = timeM ? `${timeM[1]}:${timeM[2]}` : '12:00';
    rows.push({
      date: `${dateM[1]}-${dateM[2].padStart(2, '0')}-${dateM[3].padStart(2, '0')}T${time}:00`,
      gender,
      home: SHORT_TO_FULL[homeShort] ?? homeShort,
      away: SHORT_TO_FULL[awayShort] ?? awayShort,
      score,
      status: score ? 'finished' : 'scheduled',
      detailId: detailM ? detailM[1] : null,
    });
  }
  return rows;
}

/** 解析积分榜页：<tr> 行（男子/女子表） */
function parseStandingsRows(html: string, gender: 'M' | 'W') {
  const teams: Array<{ name: string; rank: number; winPts: number; wins: number; losses: number; matches: number; setsWin: number; setsLoss: number; gamesWin: number; gamesLoss: number }> = [];
  // 定位性别表段
  const genderMarker = gender === 'M' ? 'チーム順位表（男子）' : 'チーム順位表（女子）';
  const nextMarker = gender === 'M' ? 'チーム順位表（女子）' : '対戦成績表';
  const gStart = html.indexOf(genderMarker);
  if (gStart < 0) return teams;
  const gEndMark = html.indexOf(nextMarker, gStart);
  const gEnd = gEndMark < 0 ? html.length : gEndMark;
  const section = html.slice(gStart, gEnd);
  const trBlocks = section.split(/<tr[\s>]/i).slice(1);
  for (const block of trBlocks) {
    // 只解析团队行：必须含 team.php 链接（排除个人顺位/个人ランキング）
    if (!block.includes('team.php?team=')) continue;
    // 队名在 <a href="team.php..."><img ...>&nbsp;<span>全称</span></a>
    const nameM = block.match(/<span[^>]*>([^<]+)<\/span>/);
    if (!nameM) continue;
    const name = nameM[1].replace(/\s+/g, ' ').trim();
    // 排名在 <th>...
    const thM = block.match(/<th[^>]*>\s*(\d{1,2})\s*<\/th>/);
    const rank = thM ? Number(thM[1]) : 0;
    // 数值列全部在 <td>，顺序：勝点, マッチ数, 勝利, (4P勝), 敗戦, (延長負), 獲得マッチ, 喪失マッチ, 得失マッチ, 獲得ゲーム, 喪失ゲーム, ...
    const cells = [...block.matchAll(/<td[^>]*>\s*(\(?\d+\)?|[－-]|[^<]{0,8})\s*<\/td>/g)]
      .map((m) => m[1].trim())
      .filter((s) => s !== '');
    const nums = cells.map((s) => Number(s.replace(/[()（）]/g, '')) || 0);
    teams.push({
      name,
      rank,
      winPts: nums[0] ?? 0,
      matches: nums[1] ?? 0,
      wins: nums[2] ?? 0,
      losses: nums[4] ?? 0,
      setsWin: nums[7] ?? 0,
      setsLoss: nums[8] ?? 0,
      gamesWin: nums[10] ?? 0,
      gamesLoss: nums[11] ?? 0,
    });
  }
  return teams;
}

export interface TLeagueData {
  leagues: League[];
  clubs: Club[];
  clubFixtures: ClubFixture[];
  leagueStats: LeagueStats[];
  fetchedAt: string;
  ok: boolean;
}

export async function fetchTLeagueData(): Promise<TLeagueData> {
  const cacheKey = 'leagues:tleague:all';
  return cacheGetOrSet(cacheKey, FETCH_TTL_MS, async () => {
    try {
      const [scheduleHtml, rankingHtml] = await Promise.all([
        fetchHtml(`${TLEAGUE_BASE}/schedule/`),
        fetchHtml(`${TLEAGUE_BASE}/ranking/`),
      ]);

      const scheduleRows = parseScheduleRows(scheduleHtml);
      const menStandings = parseStandingsRows(rankingHtml, 'M');
      const womenStandings = parseStandingsRows(rankingHtml, 'W');
      const standings = [...menStandings, ...womenStandings];

      // League
      const leagues: League[] = [
        {
          id: 't-league',
          name: 'ノジマＴリーグ (日本T联赛)',
          country: 'JPN',
          region: '亚洲',
          level: 'pro',
          season: '2026-2027',
          teams: TEAM_META.length,
          lat: 35.68,
          lng: 139.76,
        },
      ];

      // Clubs
      const clubs: Club[] = TEAM_META.map((t) => ({
        id: `tleague-${t.slug}`,
        name: t.name,
        leagueId: 't-league',
        city: '',
        country: 'JPN',
        lat: 35.68,
        lng: 139.76,
      }));

      // Fixtures
      const clubFixtures: ClubFixture[] = scheduleRows.map((r, i) => ({
        id: `tleague-fx-${r.detailId ?? i}`,
        leagueId: 't-league',
        homeClub: r.home,
        awayClub: r.away,
        status: r.status,
        score: r.score ?? undefined,
        scheduledAt: r.date,
      }));

      // LeagueStats (standings 表 → 积分榜)
      const standingsByClub: LeagueTeamStanding[] = standings.map((s) => {
        const slug = FULL_TO_SLUG[s.name];
        const winRate = s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0;
        return {
          clubId: slug ? `tleague-${slug}` : `tleague-${s.name}`,
          clubName: s.name,
          wins: s.wins,
          losses: s.losses,
          winRate,
          leaguePoints: s.winPts,
        };
      });
      const leagueStats: LeagueStats[] = [
        {
          leagueId: 't-league',
          season: '2026-2027',
          matchesPlayed: clubFixtures.filter((f) => f.status !== 'scheduled').length,
          avgSetsPerMatch: 4,
          spotlight: {
            singlesWins: 0,
            singlesLosses: 0,
            singlesWinRate: 0,
            teamWins: 0,
            teamLosses: 0,
            teamWinRate: 0,
            form: [],
          },
          standings: standingsByClub,
          winRateTrend: [],
        },
      ];

      return {
        leagues,
        clubs,
        clubFixtures,
        leagueStats,
        fetchedAt: new Date().toISOString(),
        ok: scheduleRows.length > 0 || standings.length > 0,
      };
    } catch {
      return { leagues: [], clubs: [], clubFixtures: [], leagueStats: [], fetchedAt: '', ok: false };
    }
  });
}