import type { LeagueStats } from '@/types';
import { useT } from '@/i18n';
import { LEAGUE_ACCENT, LEAGUE_STANDINGS_LABEL_KEYS } from '@/config/league-ui';

interface Props {
  stats: LeagueStats;
  spotlightClubId?: string;
  compact?: boolean;
}

function MetricCell({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className={`rounded px-1.5 py-1 ${accent} border border-tt-border/30`}>
      <div className="text-[9px] text-tt-muted uppercase truncate">{label}</div>
      <div className="text-sm font-mono font-semibold text-tt-text">{value}</div>
      {sub && <div className="text-[9px] text-tt-muted font-mono">{sub}</div>}
    </div>
  );
}

function WinLossBar({ wins, losses, winBarClass }: { wins: number; losses: number; winBarClass: string }) {
  const total = wins + losses || 1;
  const winPct = Math.round((wins / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-[9px] text-tt-muted mb-0.5 font-mono">
        <span className="text-tt-green">{wins}W</span>
        <span>{winPct}%</span>
        <span className="text-tt-red">{losses}L</span>
      </div>
      <div className="h-1.5 bg-tt-surface rounded-full overflow-hidden flex">
        <div className={`h-full ${winBarClass} rounded-l-full`} style={{ width: `${winPct}%` }} />
        <div className="h-full bg-tt-red/40 flex-1 rounded-r-full" />
      </div>
    </div>
  );
}

function FormStrip({ form }: { form: ('W' | 'L')[] }) {
  return (
    <div className="flex gap-0.5">
      {form.map((r, i) => (
        <span
          key={i}
          className={`w-3.5 h-3.5 rounded-sm text-[8px] font-mono flex items-center justify-center ${
            r === 'W' ? 'bg-tt-green/20 text-tt-green' : 'bg-tt-red/20 text-tt-red'
          }`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

function TrendBars({ trend, barClass }: { trend: { round: string; winRate: number }[]; barClass: string }) {
  const max = Math.max(...trend.map((t) => t.winRate), 1);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {trend.map((t) => (
        <div key={t.round} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className={`w-full rounded-t-sm ${barClass} opacity-80`}
            style={{ height: `${Math.max(8, (t.winRate / max) * 32)}px` }}
            title={`${t.round}: ${t.winRate}%`}
          />
          <span className="text-[7px] text-tt-muted font-mono">{t.round.replace('R', '')}</span>
        </div>
      ))}
    </div>
  );
}

export function LeagueStatsViz({ stats, spotlightClubId, compact = false }: Props) {
  const t = useT();
  const accent = LEAGUE_ACCENT[stats.leagueId] ?? LEAGUE_ACCENT.ttbl;
  const { spotlight, standings, winRateTrend } = stats;
  const topStandings = compact ? standings.slice(0, 3) : standings;

  return (
    <div className={`rounded-lg border ${accent.border} ${accent.bg} p-2 mb-2`}>
      <div className="text-[10px] text-tt-muted uppercase mb-1.5">{t('panels.leagueData.dataView')}</div>

      <div className="grid grid-cols-2 gap-1 mb-2">
        <MetricCell
          label={t('panels.leagueData.singlesWinRate')}
          value={`${spotlight.singlesWinRate}%`}
          sub={`${spotlight.singlesWins}-${spotlight.singlesLosses}`}
          accent={accent.bg}
        />
        <MetricCell
          label={t('panels.leagueData.teamWinRate')}
          value={`${spotlight.teamWinRate}%`}
          sub={`${spotlight.teamWins}-${spotlight.teamLosses}`}
          accent={accent.bg}
        />
        {!compact && (
          <>
            <MetricCell
              label={t('panels.leagueData.matchesPlayed')}
              value={String(stats.matchesPlayed)}
              accent={accent.bg}
            />
            <MetricCell
              label={t('panels.leagueData.avgSets')}
              value={stats.avgSetsPerMatch.toFixed(1)}
              accent={accent.bg}
            />
          </>
        )}
      </div>

      <div className="mb-2">
        <div className="text-[9px] text-tt-muted uppercase mb-0.5">{t('panels.leagueData.singlesRecord')}</div>
        <WinLossBar wins={spotlight.singlesWins} losses={spotlight.singlesLosses} winBarClass={accent.bar} />
      </div>

      <div className="mb-2">
        <div className="text-[9px] text-tt-muted uppercase mb-0.5">{t('panels.leagueData.recentForm')}</div>
        <FormStrip form={spotlight.form} />
      </div>

      <div className="text-[9px] text-tt-muted uppercase mb-1">
        {t(LEAGUE_STANDINGS_LABEL_KEYS[stats.leagueId] ?? 'panels.leagueData.standings')}
      </div>
      <ul className="space-y-1 mb-2">
        {topStandings.map((row, idx) => (
          <li key={row.clubId}>
            <div className="flex items-center justify-between text-[10px] mb-0.5 gap-1">
              <span className={`truncate ${row.clubId === spotlightClubId ? 'text-tt-accent font-medium' : ''}`}>
                <span className="text-tt-muted font-mono mr-1">{idx + 1}</span>
                {row.clubName}
              </span>
              <span className="font-mono text-tt-muted shrink-0">{row.wins}-{row.losses}</span>
            </div>
            <div className="h-1 bg-tt-surface rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${row.clubId === spotlightClubId ? accent.bar : 'bg-tt-accent2/60'}`}
                style={{ width: `${row.winRate}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {!compact && (
        <div>
          <div className="text-[9px] text-tt-muted uppercase mb-0.5">{t('panels.leagueData.winRateTrend')}</div>
          <TrendBars trend={winRateTrend} barClass={accent.bar} />
        </div>
      )}
    </div>
  );
}
