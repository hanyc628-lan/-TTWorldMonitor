import { useAppStore } from '@/store/app';
import { useT } from '@/i18n';
import { Panel } from './Panel';

export function GrassrootsPanel() {
  const t = useT();
  const { grassrootsEvents, participationStats } = useAppStore();

  const youthEvents = grassrootsEvents.filter((e) => e.category === 'youth');
  const veteranEvents = grassrootsEvents.filter((e) => e.category === 'veteran');

  return (
    <Panel
      id="grassroots"
      title={t('panels.grassroots.title')}
      badge={<span className="badge bg-tt-accent2/10 text-tt-accent2 border-tt-accent2/20 text-[9px]">{t('panels.grassroots.badge')}</span>}
    >
      <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.grassroots.youth')}</div>
      <ul className="space-y-1.5 mb-3">
        {youthEvents.map((ev) => (
          <li key={ev.id} className="text-xs">
            <span className="font-medium">{ev.name}</span>
            <div className="text-[10px] text-tt-muted">{ev.location} · {ev.status === 'live' ? t('common.live') : t('common.upcoming')}</div>
          </li>
        ))}
      </ul>

      <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.grassroots.veteran')}</div>
      <ul className="space-y-1.5 mb-3">
        {veteranEvents.map((ev) => (
          <li key={ev.id} className="text-xs">
            <span className="font-medium">{ev.name}</span>
            <div className="text-[10px] text-tt-muted">{ev.location}</div>
          </li>
        ))}
      </ul>

      <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.grassroots.population')}</div>
      <ul className="space-y-1">
        {participationStats.slice(0, 6).map((p) => (
          <li key={p.country} className="text-[11px] font-mono flex justify-between gap-2">
            <span>{p.country}</span>
            <span className="text-tt-muted">
              {p.activePlayersMillions}M {t('panels.grassroots.players')}
              {p.growthPct > 0 && <span className="text-tt-green ml-1">+{p.growthPct}%</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[9px] text-tt-muted mt-2">{t('panels.grassroots.populationNote')}</p>
    </Panel>
  );
}
