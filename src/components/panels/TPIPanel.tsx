import { useAppStore } from '@/store/app';
import { getTrendColor, getTrendIcon } from '@/server/tpi-scoring';
import { COUNTRY_MAP } from '@/data/countries';
import { TPI_FIRST_PRINCIPLES, TPI_PILLARS } from '@/config/tpi-axioms';
import { useT } from '@/i18n';
import { Panel } from './Panel';

interface Props {
  compact?: boolean;
}

export function TPIPanel({ compact }: Props) {
  const t = useT();
  const { tpiData } = useAppStore();
  const sorted = [...tpiData].sort((a, b) => b.score - a.score);
  const items = compact ? sorted.slice(0, 8) : sorted;

  return (
    <Panel
      id="tpi"
      title={t('panels.tpi.title')}
      badge={<span className="badge bg-tt-gold/10 text-tt-gold border-tt-gold/20">v2-fp</span>}
    >
      {!compact && (
        <div className="mb-2 p-2 rounded bg-tt-surface/50 border border-tt-border/40">
          <div className="text-[9px] text-tt-muted uppercase mb-1">{t('heatmap.axiomsTitle')}</div>
          <ul className="space-y-0.5">
            {TPI_FIRST_PRINCIPLES.slice(0, 3).map((a) => (
              <li key={a.id} className="text-[9px] text-tt-muted leading-snug">
                <span className="text-tt-accent2">{a.principle}</span> — {a.statement.slice(0, 28)}…
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {TPI_PILLARS.map((p) => (
              <span key={p.key} className="text-[8px] font-mono text-tt-muted">
                {t(`heatmap.pillar.${p.key}`)} {Math.round(p.weight * 100)}%
              </span>
            ))}
          </div>
        </div>
      )}

      <ul className="space-y-0.5">
        {items.map((row) => {
          const country = COUNTRY_MAP[row.country];
          return (
            <li
              key={row.country}
              className="flex items-center justify-between text-sm py-1 px-1 rounded hover:bg-tt-surface cursor-pointer"
              onClick={() => useAppStore.getState().selectCountry(row.country)}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs text-tt-muted w-8 shrink-0">{row.country}</span>
                {!compact && <span className="text-xs truncate">{country?.nameZh}</span>}
              </span>
              <span className="flex items-center gap-2 font-mono shrink-0">
                <span className="font-semibold">{row.score}</span>
                <span className={`text-xs ${getTrendColor(row.trend)}`}>
                  {getTrendIcon(row.trend)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      {!compact && (
        <div className="mt-2 pt-2 border-t border-tt-border/50 text-[10px] text-tt-muted font-mono">
          {t('panels.tpi.footer', { v: tpiData[0]?.methodologyVersion ?? 'v2-fp' })}
          {' · '}
          {t('heatmap.coverage', { n: tpiData.length })}
        </div>
      )}
    </Panel>
  );
}
