import type { NewsItem, BreakingAlert, Signal } from '@/types';
import { TT_EVENTS, dispatchTTEvent } from '@/utils/event-bus';

const RECENCY_MS = 15 * 60 * 1000;
const GLOBAL_COOLDOWN_MS = 60 * 1000;
const MIN_IMPORTANCE = 30;

const recentAlertIds = new Set<string>();
let lastDispatchTime = 0;
let startupGrace = true;

setTimeout(() => { startupGrace = false; }, 5000);

export function checkBatchForBreakingAlerts(items: NewsItem[]): BreakingAlert[] {
  const alerts: BreakingAlert[] = [];
  const now = Date.now();

  for (const item of items) {
    if (!item.isAlert && (item.importanceScore ?? 0) < MIN_IMPORTANCE) continue;
    if (now - new Date(item.timestamp).getTime() > RECENCY_MS) continue;
    if (recentAlertIds.has(item.id)) continue;

    const alert: BreakingAlert = {
      id: `alert-${item.id}`,
      headline: item.title,
      source: item.source,
      threatLevel: item.threatLevel === 'critical' ? 'critical' : 'high',
      timestamp: item.timestamp,
      origin: 'rss_alert',
      importanceScore: item.importanceScore,
      countryCode: item.countries[0],
    };
    alerts.push(alert);
  }
  return alerts;
}

export function dispatchBreakingAlert(alert: BreakingAlert): boolean {
  if (startupGrace) return false;
  if (recentAlertIds.has(alert.id)) return false;
  if (Date.now() - lastDispatchTime < GLOBAL_COOLDOWN_MS) return false;

  recentAlertIds.add(alert.id);
  lastDispatchTime = Date.now();
  setTimeout(() => recentAlertIds.delete(alert.id), 5 * 60 * 1000);

  dispatchTTEvent(TT_EVENTS.BREAKING_NEWS, alert);
  return true;
}

export function signalToBreakingAlert(signal: Signal): BreakingAlert | null {
  if (signal.type !== 'upset' && signal.severity !== 'high') return null;
  return {
    id: `alert-${signal.id}`,
    headline: signal.title,
    source: signal.source,
    threatLevel: signal.type === 'upset' ? 'critical' : 'high',
    timestamp: signal.timestamp,
    origin: signal.type === 'upset' ? 'upset_result' : 'keyword_spike',
    importanceScore: signal.importanceScore ?? (signal.severity === 'high' ? 70 : 40),
    countryCode: signal.countries[0],
  };
}

export function processSignalsForAlerts(signals: Signal[]): void {
  for (const signal of signals) {
    const alert = signalToBreakingAlert(signal);
    if (alert) dispatchBreakingAlert(alert);
  }
}
