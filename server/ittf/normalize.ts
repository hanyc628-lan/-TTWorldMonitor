export interface NormalizedRanking {
  ittfId: string;
  name: string;
  country: string;
  countryName: string;
  rank: number;
  prevRank: number;
  change: number;
  points: number;
  gender: 'M' | 'W';
  publishDate: string;
}

export interface NormalizedPlayerProfile {
  ittfId: string;
  name: string;
  country: string;
  bestRank?: number;
  wins?: number;
  losses?: number;
  raw?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeRankings(raw: any[], gender: 'M' | 'W'): NormalizedRanking[] {
  return raw.map((row) => ({
    ittfId: String(row.IttfId ?? row.ittfId ?? ''),
    name: String(row.PlayerName ?? row.playerName ?? ''),
    country: String(row.CountryCode ?? row.countryCode ?? ''),
    countryName: String(row.CountryName ?? row.countryName ?? ''),
    rank: Number(row.CurrentRank ?? row.RankingPosition ?? row.rank ?? 0),
    prevRank: Number(row.PreviousRank ?? row.prevRank ?? row.rank ?? 0),
    change: Number(row.RankingDifference ?? row.change ?? 0),
    points: Number(row.RankingPointsYTD ?? row.points ?? 0),
    gender,
    publishDate: String(row.PublishDate ?? row.publishDate ?? ''),
  }));
}
