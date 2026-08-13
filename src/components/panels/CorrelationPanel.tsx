import { useAppStore } from '@/store/app';
import type { TrendDirection } from '@/types';
import { useT } from '@/i18n';
import { Panel } from './Panel';

export function CorrelationPanel() {
  const t = useT();
  const { convergenceCards, analysisSignals } = useAppStore();
  const total = convergenceCards.length + analysisSignals.length;

  const trendLabel = (trend: TrendDirection) => {
    if (trend === 'escalating') return { text: t('panels.correlation.escalating'), color: 'text-tt-red' };
    if (trend === 'de-escalating') return { text: t('panels.correlation.deEscalating'), color: 'text-tt-green' };
    return { text: t('panels.correlation.stable'), color: 'text-tt-muted' };
  };

  return (
    <Panel
      id="correlation"
      title={t('panels.correlation.title')}
      badge={
        <span className="badge bg-tt-accent2/10 text-tt-accent2 border-tt-accent2/20">
          {t('panels.correlation.count', { n: total })}
        </span>
      }
    >
      <ul className="space-y-3">
        {convergenceCards.map((a) => {
          const trend = trendLabel(a.trend);
          return (
            <li key={a.id} className="text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-tt-accent2">{a.title}</span>
                <span className="flex items-center gap-2">
                  <span className={`text-[10px] ${trend.color}`}>{trend.text}</span>
                  <span className="text-[10px] font-mono text-tt-muted">{a.score}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge bg-tt-surface text-tt-muted border-tt-border text-[9px]">
                  {a.domain}
                </span>
                {a.countries.map((c) => (
                  <span key={c} className="badge bg-tt-surface text-tt-muted border-tt-border text-[9px]">
                    {c}
                  </span>
                ))}
                <span className="text-[10px] text-tt-muted ml-auto">
                  {t('panels.correlation.signals', { n: a.signals.length })}
                </span>
              </div>
            </li>
          );
        })}

        {analysisSignals.map((a) => (
          <li key={a.id} className="text-sm border-t border-tt-border/30 pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-tt-gold">{a.title}</span>
              <span className="text-[10px] font-mono text-tt-muted">
                {Math.round(a.confidence * 100)}%
              </span>
            </div>
            <p className="text-xs text-tt-muted leading-relaxed">{a.description}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
