import {
  COUNTRY_TPI,
  SIGNALS,
  TOURNAMENTS,
  LIVE_MATCHES,
  RANKING_MOVERS,
  TOP_MEN,
  TOP_WOMEN,
} from '@/data/seed';
import { enrichTPIRecords } from '@/server/tpi-scoring';

const API_BASE = '/api';

export const api = {
  async getRankings(gender: 'M' | 'W' = 'M') {
    return gender === 'M' ? TOP_MEN : TOP_WOMEN;
  },

  async getTPI() {
    return enrichTPIRecords(COUNTRY_TPI);
  },

  async getSignals(limit = 20) {
    return SIGNALS.slice(0, limit);
  },

  async getTournaments(status?: 'live' | 'upcoming' | 'completed') {
    if (!status) return TOURNAMENTS;
    return TOURNAMENTS.filter((t) => t.status === status);
  },

  async getLiveMatches() {
    return LIVE_MATCHES;
  },

  async getCountryBrief(code: string) {
    return enrichTPIRecords(COUNTRY_TPI).find((t) => t.country === code) ?? null;
  },

  async getRankingMovers() {
    return RANKING_MOVERS;
  },
};

export const API_ROUTES = [
  { method: 'GET', path: `${API_BASE}/bootstrap`, description: 'Tiered bootstrap hydration (fast/slow/on-demand keys)' },
  { method: 'GET', path: `${API_BASE}/rankings`, description: 'ITTF world rankings' },
  { method: 'GET', path: `${API_BASE}/tpi`, description: 'Table Tennis Power Index v1 (server-authoritative)' },
  { method: 'GET', path: `${API_BASE}/signals`, description: 'Fused signal feed' },
  { method: 'GET', path: `${API_BASE}/tournaments`, description: 'Tournament calendar with disruption scores' },
  { method: 'GET', path: `${API_BASE}/matches/live`, description: 'Live match scores' },
  { method: 'GET', path: `${API_BASE}/country/:code/brief`, description: 'Country dossier with AI brief' },
  { method: 'GET', path: `${API_BASE}/correlations`, description: 'Cross-stream correlation cards' },
] as const;
