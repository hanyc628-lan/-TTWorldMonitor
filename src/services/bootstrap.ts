import type { BootstrapTier } from '@/types';

/** Bootstrap tier membership — mirrors World Monitor CONCEPTS.md */
export const BOOTSTRAP_TIERS: BootstrapTier = {
  fast: ['tpi', 'signals', 'signalsMeta', 'liveMatches', 'streamStatuses'],
  slow: ['rankings', 'tournaments', 'rankingMovers', 'correlations', 'leagues', 'clubs', 'clubFixtures', 'leagueStats', 'grassrootsEvents', 'participationStats'],
  onDemand: ['countryBrief', 'playerProfile', 'h2h', 'upsets', 'equipmentTrends', 'apparelItems', 'learningModules', 'youthRankings'],
};

const TIER_CACHE_PREFIX = 'ttwm:bootstrap:v2:tier:';
const TIER_MAX_AGE_MS: Record<'fast' | 'slow', number> = {
  fast: 5 * 60 * 1000,
  slow: 60 * 60 * 1000,
};

type HydratedData = Record<string, unknown>;

let hydrationCache: HydratedData | null = null;
const inFlight = new Map<string, Promise<unknown>>();

async function fetchBootstrapKeys(keys: string[]): Promise<HydratedData> {
  const params = new URLSearchParams({ keys: keys.join(',') });
  const resp = await fetch(`/api/bootstrap?${params}`);
  if (!resp.ok) throw new Error(`Bootstrap failed: ${resp.status}`);
  return resp.json() as Promise<HydratedData>;
}

function loadTierCache(tier: 'fast' | 'slow'): HydratedData | null {
  try {
    const raw = localStorage.getItem(`${TIER_CACHE_PREFIX}${tier}`);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw) as { data: HydratedData; timestamp: number };
    if (Date.now() - timestamp > TIER_MAX_AGE_MS[tier]) return null;
    return data;
  } catch {
    return null;
  }
}

function saveTierCache(tier: 'fast' | 'slow', data: HydratedData): void {
  try {
    localStorage.setItem(
      `${TIER_CACHE_PREFIX}${tier}`,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {
    // quota exceeded — non-fatal
  }
}

/** One-shot hydration cache — consumed on read (WM pattern) */
export function getHydratedData(key: string): unknown | undefined {
  if (!hydrationCache) return undefined;
  const val = hydrationCache[key];
  if (val !== undefined) delete hydrationCache[key];
  return val;
}

export async function fetchBootstrapData(): Promise<HydratedData> {
  const fastCached = loadTierCache('fast');
  const slowCached = loadTierCache('slow');

  if (fastCached && slowCached) {
    hydrationCache = { ...fastCached, ...slowCached };
    return hydrationCache;
  }

  const [fast, slow] = await Promise.all([
    fastCached ?? fetchBootstrapKeys(BOOTSTRAP_TIERS.fast),
    slowCached ?? fetchBootstrapKeys(BOOTSTRAP_TIERS.slow),
  ]);

  if (!fastCached) saveTierCache('fast', fast);
  if (!slowCached) saveTierCache('slow', slow);

  hydrationCache = { ...fast, ...slow };
  return hydrationCache;
}

/** On-demand key fetch — CDN-shielded per-key URL (WM pattern) */
export async function ensureHydrated(key: string): Promise<unknown> {
  const fromCache = getHydratedData(key);
  if (fromCache !== undefined) return fromCache;

  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = fetchBootstrapKeys([key]).then((data) => data[key]);
  inFlight.set(key, promise);

  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

export function getBootstrapTierForKey(key: string): 'fast' | 'slow' | 'on-demand' {
  if (BOOTSTRAP_TIERS.fast.includes(key)) return 'fast';
  if (BOOTSTRAP_TIERS.slow.includes(key)) return 'slow';
  return 'on-demand';
}
