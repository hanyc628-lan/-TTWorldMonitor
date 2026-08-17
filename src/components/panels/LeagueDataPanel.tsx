import { useMemo } from 'react';
import { useAppStore } from '@/store/app';
import { useT } from '@/i18n';
import { PRIORITY_LEAGUE_IDS, PRIORITY_LEAGUE_SPOTLIGHTS } from '@/data/ecosystem';
import { LEAGUE_ACCENT, LEAGUE_SPOTLIGHT_LABEL_KEYS } from '@/config/league-ui';
import { LeagueStatsViz } from './LeagueStatsViz';
import { Panel } from './Panel';

export function LeagueDataPanel() {
  const t = useT();
  const { leagueStats } = useAppStore();

  const priorityStats = useMemo(
    () => PRIORITY_LEAGUE_IDS
      .map((id) => leagueStats.find((s) => s.leagueId === id))
      .filter(Boolean),
    [leagueStats],
  );

  const summary = useMemo(() => {
    if (priorityStats.length === 0) return null;
    const avgSingles = Math.round(
      priorityStats.reduce((sum, s) => sum + s!.spotlight.singlesWinRate, 0) / priorityStats.length,
    );
    const totalMatches = priorityStats.reduce((sum, s) => sum + s!.matchesPlayed, 0);
    const liveLeagues = priorityStats.length;
    return { avgSingles, totalMatches, liveLeagues };
  }, [priorityStats]);

  return (
    <Panel
      id="leagueData"
      title={t('panels.leagueData.title')}
      
      badge={
        <span className="badge bg-tt-accent2/10 text-tt-accent2 border-tt-accent2/20 text-[9px]">
          {t('panels.leagueData.badge')}
        </span>
      }
    >
      {summary && (
        <div className="grid grid-cols-3 gap-1 mb-3 p-2 rounded-lg bg-tt-surface/50 border border-tt-border/40">
          <div className="text-center">
            <div className="text-lg font-mono font-semibold text-tt-accent">{summary.liveLeagues}</div>
            <div className="text-[9px] text-tt-muted">{t('panels.leagueData.leagueCount')}</div>
          </div>
          <div className="text-center border-x border-tt-border/30">
            <div className="text-lg font-mono font-semibold text-tt-gold">{summary.avgSingles}%</div>
            <div className="text-[9px] text-tt-muted">{t('panels.leagueData.avgSpotlightWin')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-semibold text-tt-text">{summary.totalMatches}</div>
            <div className="text-[9px] text-tt-muted">{t('panels.leagueData.totalMatches')}</div>
          </div>
        </div>
      )}

      {/* 重点赛事焦点胜率对比 */}
      <div className="mb-3">
        <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.leagueData.compareWinRate')}</div>
        {priorityStats.map((s) => {
          const spotlight = PRIORITY_LEAGUE_SPOTLIGHTS.find((sp) => sp.leagueId === s!.leagueId);
          const accent = LEAGUE_ACCENT[s!.leagueId] ?? LEAGUE_ACCENT.ttbl;
          return (
            <div key={s!.leagueId} className="mb-1.5">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className={`truncate ${accent.label}`}>
                  {t(LEAGUE_SPOTLIGHT_LABEL_KEYS[s!.leagueId])}
                </span>
                <span className="font-mono text-tt-muted">{s!.spotlight.singlesWinRate}%</span>
              </div>
              <div className="h-2 bg-tt-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${accent.bar}`}
                  style={{ width: `${s!.spotlight.singlesWinRate}%` }}
                />
              </div>
              {spotlight && (
                <div className="text-[9px] text-tt-muted mt-0.5 truncate">
                  {spotlight.playerZh} · {spotlight.club}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 各联赛详细数据 */}
      {PRIORITY_LEAGUE_SPOTLIGHTS.map((spotlight) => {
        const stats = leagueStats.find((s) => s.leagueId === spotlight.leagueId);
        if (!stats) return null;
        return (
          <section key={spotlight.leagueId} className="mb-3 last:mb-0">
            <div className={`text-[10px] uppercase font-mono mb-1 ${LEAGUE_ACCENT[spotlight.leagueId]?.label ?? ''}`}>
              {t(LEAGUE_SPOTLIGHT_LABEL_KEYS[spotlight.leagueId])}
            </div>
            <LeagueStatsViz stats={stats} spotlightClubId={spotlight.clubId} />
          </section>
        );
      })}
    </Panel>
  );
}
