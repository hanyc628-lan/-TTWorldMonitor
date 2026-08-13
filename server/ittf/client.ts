import { ittfPingPong } from 'ittf-pingpong';
import { cacheGetOrSet, CACHE_TTL } from '../cache.js';
import { normalizeRankings, type NormalizedRanking, type NormalizedPlayerProfile } from './normalize.js';

let client: InstanceType<typeof ittfPingPong> | null = null;

function getClient(): InstanceType<typeof ittfPingPong> {
  if (!client) client = new ittfPingPong();
  return client;
}

export async function fetchRankings(
  type: 'SEN' | 'YOU',
  gender: 'M' | 'W' | 'X',
  category: 'S' | 'D' | 'DI',
  topN: number | 'all' = 100,
): Promise<NormalizedRanking[]> {
  const cacheKey = `ittf:${type}:${gender}:${category}:${topN}`;
  return cacheGetOrSet(cacheKey, CACHE_TTL.rankings, async () => {
    const raw = await getClient().currentRankings(type, gender, category, topN);
    const g = gender === 'X' ? 'M' : gender;
    return normalizeRankings(raw as never[], g);
  });
}

export async function fetchWorldRankings(
  gender: 'M' | 'W',
  topN = 100,
): Promise<NormalizedRanking[]> {
  return fetchRankings('SEN', gender, 'S', topN);
}

export async function fetchYouthRankings(
  gender: 'M' | 'W',
  topN = 50,
): Promise<NormalizedRanking[]> {
  return fetchRankings('YOU', gender, 'S', topN);
}

export async function fetchDoublesRankings(
  gender: 'M' | 'W' | 'X',
  topN = 50,
): Promise<NormalizedRanking[]> {
  return fetchRankings('SEN', gender, 'D', topN);
}

export async function fetchDoublesIndividualRankings(
  gender: 'M' | 'W',
  topN = 50,
): Promise<NormalizedRanking[]> {
  return fetchRankings('SEN', gender, 'DI', topN);
}

export interface CountryRankingAggregate {
  country: string;
  countryName: string;
  playerCount: number;
  totalPoints: number;
  avgPoints: number;
  bestRank: number;
  topPlayer: string;
}

export function aggregateByCountry(rankings: NormalizedRanking[]): CountryRankingAggregate[] {
  const map = new Map<string, NormalizedRanking[]>();
  for (const r of rankings) {
    const list = map.get(r.country) ?? [];
    list.push(r);
    map.set(r.country, list);
  }
  return [...map.entries()]
    .map(([country, players]) => {
      const totalPoints = players.reduce((s, p) => s + p.points, 0);
      const best = players.reduce((a, b) => (a.rank < b.rank ? a : b));
      return {
        country,
        countryName: best.countryName,
        playerCount: players.length,
        totalPoints,
        avgPoints: Math.round(totalPoints / players.length),
        bestRank: best.rank,
        topPlayer: best.name,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

export function computeMovers(rankings: NormalizedRanking[], minChange = 1) {
  const risers = rankings
    .filter((r) => r.change > 0 && Math.abs(r.change) >= minChange)
    .sort((a, b) => b.change - a.change);
  const fallers = rankings
    .filter((r) => r.change < 0 && Math.abs(r.change) >= minChange)
    .sort((a, b) => a.change - b.change);
  return { risers, fallers };
}

export async function getPlayersByCountry(
  countryCode: string,
  gender: 'M' | 'W' = 'M',
  topN = 200,
): Promise<NormalizedRanking[]> {
  const rankings = await fetchWorldRankings(gender, topN);
  const code = countryCode.toUpperCase();
  return rankings.filter((r) => r.country === code);
}

export async function searchPlayersByFamilyName(name: string) {
  const cacheKey = `ittf:search:family:${name.toLowerCase()}`;
  return cacheGetOrSet(cacheKey, CACHE_TTL.profile, async () => {
    const results = await getClient().playerIttfId({ playerFamilyName: name });
    return (results as Array<{ IttfId?: string; PlayerFamilyNameFirst?: string }>).map((r) => ({
      ittfId: String(r.IttfId ?? ''),
      name: String(r.PlayerFamilyNameFirst ?? name),
    }));
  });
}

export async function searchPlayersByGivenName(name: string) {
  const cacheKey = `ittf:search:given:${name.toLowerCase()}`;
  return cacheGetOrSet(cacheKey, CACHE_TTL.profile, async () => {
    const results = await getClient().playerIttfId({ playerGivenName: name });
    return (results as Array<{ IttfId?: string; PlayerFamilyNameFirst?: string }>).map((r) => ({
      ittfId: String(r.IttfId ?? ''),
      name: String(r.PlayerFamilyNameFirst ?? name),
    }));
  });
}

export async function fetchPlayerProfileExtended(ittfId: number): Promise<NormalizedPlayerProfile> {
  const cacheKey = `ittf:profile:ext:${ittfId}`;
  return cacheGetOrSet(cacheKey, CACHE_TTL.profile, async () => {
    const stats = await getClient().playerProfile({ playerIttfId: ittfId }, { includeExtendedDetails: true });
    const s = stats as Record<string, unknown>;
    const player = (s.player ?? {}) as Record<string, unknown>;
    return {
      ittfId: String(ittfId),
      name: String(player.PlayerName ?? player.playerName ?? ''),
      country: String(player.Org ?? player.org ?? ''),
      bestRank: s.ranking ? Number((s.ranking as Record<string, unknown>).BestPos?.[0] ?? 0) || undefined : undefined,
      wins: s.stats ? Number((s.stats as Record<string, unknown>).total?.[0] ?? 0) || undefined : undefined,
      losses: undefined,
      raw: stats,
    };
  });
}

export async function searchPlayers(name: string): Promise<Array<{ ittfId: string; name: string }>> {
  const cacheKey = `ittf:search:${name.toLowerCase()}`;
  return cacheGetOrSet(cacheKey, CACHE_TTL.profile, async () => {
    const results = await getClient().playerIttfId({ playerFullName: name });
    return (results as Array<{ IttfId?: string; PlayerName?: string }>).map((r) => ({
      ittfId: String(r.IttfId ?? ''),
      name: String(r.PlayerName ?? name),
    }));
  });
}

export async function fetchPlayerProfile(ittfId: number): Promise<NormalizedPlayerProfile> {
  const cacheKey = `ittf:profile:${ittfId}`;
  return cacheGetOrSet(cacheKey, CACHE_TTL.profile, async () => {
    const stats = await getClient().playerProfile({ playerIttfId: ittfId });
    const s = stats as Record<string, unknown>;
    return {
      ittfId: String(ittfId),
      name: String(s.PlayerName ?? s.playerName ?? ''),
      country: String(s.CountryCode ?? s.countryCode ?? ''),
      bestRank: s.BestRank != null ? Number(s.BestRank) : undefined,
      wins: s.Wins != null ? Number(s.Wins) : undefined,
      losses: s.Losses != null ? Number(s.Losses) : undefined,
      raw: stats,
    };
  });
}

export async function getRankingMeta(): Promise<{ source: string; cached: boolean; week: string }> {
  const men = await fetchWorldRankings('M', 1);
  const week = men[0]?.publishDate ?? new Date().toISOString();
  return { source: 'ittf-pingpong', cached: true, week };
}
