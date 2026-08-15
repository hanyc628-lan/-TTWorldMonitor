import { useAppStore } from '@/store/app';
import { useT } from '@/i18n';
import { Panel } from './Panel';

export function TournamentsPanel() {
  const t = useT();
  const { tournaments } = useAppStore();
  const disrupted = tournaments.filter((tm) => tm.disruptionScore >= 70).length;

  const statusLabel = (status: string) => {
    if (status === 'live') return t('common.live');
    if (status === 'upcoming') return t('common.upcoming');
    return t('common.finished');
  };

  return (
    <Panel
      id="tournaments"
      title={t('panels.tournaments.title')}
      badge={<span className="badge bg-tt-muted/10 text-tt-muted border-tt-muted/20">{t('common.sampleTag')}</span>}
      headerRight={<span className="text-[10px] text-tt-muted">{t('panels.tournaments.highDisruption', { n: disrupted })}</span>}
    >
      <ul className="space-y-2">
        {tournaments.map((tm) => (
          <li key={tm.id} className="text-sm">
            <div className="flex items-center justify-between">
              <span className="truncate font-medium">{tm.name}</span>
              <span className={`badge text-[9px] shrink-0 ml-1 ${
                tm.status === 'live' ? 'bg-tt-red/20 text-tt-red border-tt-red/30' :
                tm.status === 'upcoming' ? 'bg-tt-accent2/10 text-tt-accent2 border-tt-accent2/20' :
                'bg-tt-muted/10 text-tt-muted border-tt-muted/20'
              }`}>
                {statusLabel(tm.status)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[10px] text-tt-muted">
              <span>{t(`tournamentTier.${tm.tier}`)} · {tm.location}</span>
              <span className="font-mono">{t('panels.tournaments.disruption')} {tm.disruptionScore}</span>
            </div>
            <div className="mt-1 h-1 bg-tt-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${tm.disruptionScore}%`,
                  background: tm.disruptionScore >= 80 ? '#ff4d4d' : tm.disruptionScore >= 50 ? '#f5c542' : '#4d9fff',
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
