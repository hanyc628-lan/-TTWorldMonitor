export interface IttfRanking {
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

export interface RankingsResponse {
  men: IttfRanking[];
  women: IttfRanking[];
  source: string;
}

export async function fetchLiveRankings(gender: 'M' | 'W', top = 100): Promise<IttfRanking[]> {
  const resp = await fetch(`/api/rankings?gender=${gender}&top=${top}`);
  if (!resp.ok) throw new Error(`ITTF API error: ${resp.status}`);
  return resp.json() as Promise<IttfRanking[]>;
}

export async function searchIttfPlayers(name: string) {
  const resp = await fetch(`/api/players/search?q=${encodeURIComponent(name)}`);
  if (!resp.ok) throw new Error(`Search failed: ${resp.status}`);
  return resp.json();
}

export async function fetchPlayerProfile(ittfId: number) {
  const resp = await fetch(`/api/players/${ittfId}/profile`);
  if (!resp.ok) throw new Error(`Profile failed: ${resp.status}`);
  return resp.json();
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const resp = await fetch('/api/health');
    return resp.ok;
  } catch {
    return false;
  }
}
