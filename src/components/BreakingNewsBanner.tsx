import { useEffect } from 'react';
import { useAppStore } from '@/store/app';
import { formatRelativeTime } from '@/services/analysis-core';
import { useT } from '@/i18n';

export function BreakingNewsBanner() {
  const t = useT();
  const { breakingAlerts } = useAppStore();

  useEffect(() => {
    for (const alert of breakingAlerts) {
      const dismissMs = alert.threatLevel === 'critical' ? 60_000 : 30_000;
      const timer = setTimeout(() => {
        useAppStore.setState((s) => ({
          breakingAlerts: s.breakingAlerts.filter((a) => a.id !== alert.id),
        }));
      }, dismissMs);
      return () => clearTimeout(timer);
    }
  }, [breakingAlerts]);

  if (breakingAlerts.length === 0) return null;

  return (
    <div className="fixed top-11 inset-x-0 z-40 flex flex-col gap-1 px-3 pointer-events-none">
      {breakingAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`panel px-4 py-2 flex items-center gap-3 pointer-events-auto animate-fade-in border ${
            alert.threatLevel === 'critical'
              ? 'border-tt-red/50 bg-tt-red/10'
              : 'border-tt-gold/50 bg-tt-gold/10'
          }`}
          onClick={() => {
            useAppStore.getState().revealPanel('signals');
            useAppStore.setState((s) => ({
              breakingAlerts: s.breakingAlerts.filter((a) => a.id !== alert.id),
            }));
          }}
        >
          <span className={`badge text-[9px] ${
            alert.threatLevel === 'critical'
              ? 'bg-tt-red/30 text-tt-red border-tt-red/40'
              : 'bg-tt-gold/30 text-tt-gold border-tt-gold/40'
          }`}>
            {alert.threatLevel === 'critical' ? t('breaking.critical') : t('breaking.important')}
          </span>
          <span className="text-sm flex-1 truncate">{alert.headline}</span>
          <span className="text-[10px] text-tt-muted shrink-0">
            {alert.source} · {formatRelativeTime(alert.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}
