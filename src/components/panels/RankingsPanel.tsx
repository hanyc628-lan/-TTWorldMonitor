import { useAppStore } from '@/store/app';
import { useT } from '@/i18n';
import { Panel } from './Panel';

export function RankingsPanel() {
  const t = useT();
  const { rankingMovers, ittfRankings } = useAppStore();
  const men = ittfRankings?.men ?? [];
  const women = ittfRankings?.women ?? [];
  const isLive = ittfRankings?.source === 'ittf';

  return (
    <Panel
      id="rankings"
      title={t('panels.rankings.title')}
      badge={
        <span className={`badge text-[9px] ${
          isLive
            ? 'bg-tt-green/20 text-tt-green border-tt-green/30'
            : 'bg-tt-accent2/10 text-tt-accent2 border-tt-accent2/20'
        }`}>
          {isLive ? t('panels.rankings.live') : t('common.sample')}
        </span>
      }
    >
      {isLive && men.length > 0 && (
        <>
          <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.rankings.menTop10')}</div>
          {men.slice(0, 10).map((p) => (
            <div key={p.ittfId} className="flex items-center justify-between text-xs py-0.5 font-mono">
              <span>
                <span className="text-tt-muted">#{p.rank}</span> {p.name}
                {p.change !== 0 && (
                  <span className={p.change < 0 ? ' text-tt-green' : ' text-tt-red'}>
                    {p.change < 0 ? ` ↑${Math.abs(p.change)}` : ` ↓${p.change}`}
                  </span>
                )}
              </span>
              <span className="text-tt-muted">{p.points.toLocaleString()}</span>
            </div>
          ))}

          <div className="text-[10px] text-tt-muted uppercase mt-3 mb-1">{t('panels.rankings.womenTop10')}</div>
          {women.slice(0, 10).map((p) => (
            <div key={p.ittfId} className="flex items-center justify-between text-xs py-0.5 font-mono">
              <span>
                <span className="text-tt-muted">#{p.rank}</span> {p.name}
              </span>
              <span className="text-tt-muted">{p.points.toLocaleString()}</span>
            </div>
          ))}
        </>
      )}

      {!isLive && (
        <>
          <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.rankings.movers')}</div>
          {rankingMovers.map((m) => (
            <div key={m.player} className="flex items-center justify-between text-sm py-1 font-mono">
              <span className="truncate">{m.player}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="text-tt-muted">#{m.newRank}</span>
                <span className={m.change > 0 ? 'text-tt-green' : 'text-tt-red'}>
                  {m.change > 0 ? `+${m.change}` : m.change}
                </span>
              </span>
            </div>
          ))}
        </>
      )}
    </Panel>
  );
}
