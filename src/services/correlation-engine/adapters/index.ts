import type { CorrelationEngine } from '../engine';
import type { DomainAdapter, AppContextSnapshot } from '../types';
import { COUNTRY_MAP } from '@/data/countries';

const severityMap = { low: 30, medium: 60, high: 85 };

function toSeverity(s: string): number {
  return severityMap[s as keyof typeof severityMap] ?? 40;
}

const resultsAdapter: DomainAdapter = {
  domain: 'results',
  threshold: 50,
  clusterMode: 'country',
  spatialRadius: 500,
  weights: { upset: 0.4, result: 0.3, ranking: 0.2, injury: 0.1 },
  collectSignals(ctx: AppContextSnapshot) {
    const evidence = [];
    for (const m of ctx.liveMatches) {
      if (m.upsetAlert) {
        evidence.push({
          type: 'upset',
          label: `${m.player1} vs ${m.player2} — ${m.tournament}`,
          severity: 85,
          country: m.country1,
          timestamp: Date.now(),
        });
      }
      if (m.status === 'live') {
        evidence.push({
          type: 'result',
          label: `LIVE: ${m.player1} vs ${m.player2}`,
          severity: 70,
          country: m.country1,
          timestamp: Date.now(),
        });
      }
    }
    for (const s of ctx.signals.filter((x) => x.type === 'result' || x.type === 'upset')) {
      evidence.push({
        type: s.type,
        label: s.title,
        severity: toSeverity(s.severity),
        country: s.countries[0],
        timestamp: new Date(s.timestamp).getTime(),
      });
    }
    return evidence;
  },
  generateTitle(signals, meta) {
    const country = meta.country ?? '多国籍';
    const c = COUNTRY_MAP[country];
    return `${c?.nameZh ?? country} 赛果信号汇聚 (${signals.length} 条)`;
  },
};

const rankingAdapter: DomainAdapter = {
  domain: 'ranking',
  threshold: 45,
  clusterMode: 'country',
  spatialRadius: 0,
  weights: { ranking: 0.5, upset: 0.3, transfer: 0.2 },
  collectSignals(ctx) {
    const evidence = [];
    for (const m of ctx.rankingMovers.filter((r) => Math.abs(r.change) >= 2)) {
      evidence.push({
        type: 'ranking',
        label: `${m.player} ${m.change > 0 ? '↑' : '↓'}${Math.abs(m.change)} — ${m.reason}`,
        severity: Math.min(90, 50 + Math.abs(m.change) * 10),
        country: m.country,
        timestamp: Date.now(),
      });
    }
    for (const t of ctx.tpiData.filter((t) => Math.abs(t.change24h) >= 3)) {
      evidence.push({
        type: 'ranking',
        label: `TPI ${t.country} ${t.change24h > 0 ? '+' : ''}${t.change24h}`,
        severity: 60,
        country: t.country,
        timestamp: Date.now(),
      });
    }
    return evidence;
  },
  generateTitle(_signals, meta) {
    const c = COUNTRY_MAP[meta.country ?? ''];
    return `${c?.nameZh ?? meta.country} 排名震荡`;
  },
};

const tournamentAdapter: DomainAdapter = {
  domain: 'tournament',
  threshold: 55,
  clusterMode: 'proximity',
  spatialRadius: 200,
  weights: { result: 0.3, upset: 0.4, news: 0.3 },
  collectSignals(ctx) {
    return ctx.tournaments
      .filter((t) => t.status === 'live' && t.disruptionScore >= 60)
      .flatMap((t) => [
        {
          type: 'news',
          label: `${t.name} 扰动指数 ${t.disruptionScore}`,
          severity: t.disruptionScore,
          country: t.country,
          lat: t.lat,
          lon: t.lng,
          timestamp: Date.now(),
        },
        ...ctx.liveMatches
          .filter((m) => m.tournament.includes(t.name.split(' ')[1] ?? t.name))
          .map((m) => ({
            type: m.upsetAlert ? 'upset' : 'result',
            label: `${m.player1} vs ${m.player2}`,
            severity: m.upsetAlert ? 80 : 55,
            country: t.country,
            lat: t.lat,
            lon: t.lng,
            timestamp: Date.now(),
          })),
      ]);
  },
  generateTitle(signals, meta) {
    return `赛事枢纽信号 — ${meta.entityKey ?? signals[0]?.label.split(' ')[0] ?? '未知'} (${signals.length} 条)`;
  },
};

const newsAdapter: DomainAdapter = {
  domain: 'news',
  threshold: 40,
  clusterMode: 'entity',
  spatialRadius: 0,
  weights: { news: 0.4, transfer: 0.3, injury: 0.3 },
  collectSignals(ctx) {
    return ctx.signals
      .filter((s) => ['news', 'transfer', 'injury'].includes(s.type))
      .map((s) => ({
        type: s.type,
        label: s.title,
        severity: toSeverity(s.severity),
        country: s.countries[0],
        timestamp: new Date(s.timestamp).getTime(),
        source: s.title,
      }));
  },
  generateTitle(_signals, meta) {
    return `媒体信号汇聚 — ${meta.entityKey ?? '综合'}`;
  },
};

export function registerAllAdapters(engine: CorrelationEngine): void {
  engine.registerAdapter(resultsAdapter);
  engine.registerAdapter(rankingAdapter);
  engine.registerAdapter(tournamentAdapter);
  engine.registerAdapter(newsAdapter);
}
