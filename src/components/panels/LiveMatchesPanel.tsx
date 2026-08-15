import { useAppStore } from '@/store/app';
import { useT } from '@/i18n';
import { Panel } from './Panel';

export function LiveMatchesPanel() {
  const t = useT();
  const { liveMatches, mapLayers } = useAppStore();
  if (!mapLayers.liveMatches) return null;

  const liveCount = liveMatches.filter((m) => m.status === 'live').length;

  const matchStatus = (m: (typeof liveMatches)[0]) => {
    if (m.status === 'live') return t('panels.liveMatches.set', { n: m.set });
    if (m.status === 'finished') return t('panels.liveMatches.finished');
    return t('panels.liveMatches.pending');
  };

  return (
    <Panel
      id="liveMatches"
      title={t('panels.liveMatches.title')}
      headerRight={<span className="badge bg-tt-muted/10 text-tt-muted border-tt-muted/20">{t('common.sampleTag')}</span>}
      badge={
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-tt-red animate-pulse" />
          <span className="text-[10px] text-tt-red font-mono">{t('panels.liveMatches.liveCount', { n: liveCount })}</span>
        </span>
      }
    >
      <ul className="space-y-2">
        {liveMatches.map((m) => (
          <li key={m.id} className="text-sm border-b border-tt-border/50 pb-2 last:border-0">
            <div className="text-[10px] text-tt-muted mb-1">{m.tournament}</div>
            {m.category && (
              <span className="badge bg-tt-surface text-tt-muted border-tt-border text-[8px] mb-1">
                {t(`panels.liveMatches.cat.${m.category}`)}
              </span>
            )}
            <div className="font-mono text-xs">{m.player1} <span className="text-tt-muted">({m.country1})</span></div>
            <div className="font-mono text-xs">{m.player2} <span className="text-tt-muted">({m.country2})</span></div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xs text-tt-accent">{m.score}</span>
              <span className={`badge text-[9px] ${
                m.status === 'live' ? 'bg-tt-red/20 text-tt-red border-tt-red/30' :
                m.status === 'finished' ? 'bg-tt-muted/10 text-tt-muted border-tt-muted/20' :
                'bg-tt-accent2/10 text-tt-accent2 border-tt-accent2/20'
              }`}>
                {matchStatus(m)}
              </span>
            </div>
            {m.upsetAlert && (
              <span className="badge bg-tt-gold/20 text-tt-gold border-tt-gold/30 text-[9px] mt-1">
                {t('panels.liveMatches.upset')}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
