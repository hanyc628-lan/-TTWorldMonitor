import { useMemo } from 'react';
import { useAppStore } from '@/store/app';
import { useT } from '@/i18n';
import {
  PRIORITY_LEAGUE_IDS,
  PRIORITY_LEAGUE_SPOTLIGHTS,
  TTBL_SPOTLIGHT,
} from '@/data/ecosystem';
import { LEAGUE_ACCENT, LEAGUE_CLUB_LABEL_KEYS, LEAGUE_FIXTURE_LABEL_KEYS, LEAGUE_SPOTLIGHT_LABEL_KEYS } from '@/config/league-ui';
import { LeagueStatsViz } from './LeagueStatsViz';
import type { Club, ClubFixture, LeagueSpotlight } from '@/types';
import { Panel } from './Panel';

const SPOTLIGHT_LABEL_KEYS = LEAGUE_SPOTLIGHT_LABEL_KEYS;
const FIXTURE_LABEL_KEYS = LEAGUE_FIXTURE_LABEL_KEYS;
const CLUB_LABEL_KEYS = LEAGUE_CLUB_LABEL_KEYS;

function sortFixtures(fixtures: ClubFixture[], spotlight: LeagueSpotlight) {
  return [...fixtures].sort((a, b) => {
    const aSpot = a.spotlightPlayer || a.homeClub === spotlight.club || a.awayClub === spotlight.club;
    const bSpot = b.spotlightPlayer || b.homeClub === spotlight.club || b.awayClub === spotlight.club;
    if (aSpot !== bSpot) return aSpot ? -1 : 1;
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    return 0;
  });
}

function sortClubs(clubList: Club[], spotlight: LeagueSpotlight) {
  return [...clubList].sort((a, b) =>
    (a.id === spotlight.clubId ? -1 : b.id === spotlight.clubId ? 1 : 0),
  );
}

function spotlightPlayerLabel(spotlight: LeagueSpotlight, fx: ClubFixture) {
  if (!fx.spotlightPlayer) return spotlight.playerZh;
  if (fx.spotlightPlayer === 'WANG Chuqin') return '王楚钦';
  if (fx.spotlightPlayer === 'SUN Yingsha') return '孙颖莎';
  if (fx.spotlightPlayer === 'MOREGARD Truls') return '莫雷加德';
  if (fx.spotlightPlayer === 'FAN Zhendong') return TTBL_SPOTLIGHT.playerZh;
  if (fx.spotlightPlayer === 'HARIMOTO Tomokazu') return '张本智和';
  if (fx.spotlightPlayer === 'HARIMOTO Miwa') return '张本美和';
  return fx.spotlightPlayer;
}

export function LeaguesPanel() {
  const t = useT();
  const { leagues, clubs, clubFixtures, leagueStats } = useAppStore();

  const leagueName = (id: string) => leagues.find((l) => l.id === id)?.name ?? id;

  const otherLeagues = useMemo(
    () => leagues.filter((lg) => !PRIORITY_LEAGUE_IDS.includes(lg.id)),
    [leagues],
  );

  const otherFixtures = useMemo(
    () => clubFixtures.filter((fx) => !PRIORITY_LEAGUE_IDS.includes(fx.leagueId)),
    [clubFixtures],
  );

  return (
    <Panel
      id="leagues"
      title={t('panels.leagues.title')}
      badge={
        <span className="badge bg-tt-green/20 text-tt-green border-tt-green/30 text-[9px]">
          WTT · ITTF · {t('panels.leagues.pingchaoBadge')}
        </span>
      }
    >
      {PRIORITY_LEAGUE_SPOTLIGHTS.map((spotlight) => {
        const accent = LEAGUE_ACCENT[spotlight.leagueId] ?? LEAGUE_ACCENT.ttbl;
        const stats = leagueStats.find((s) => s.leagueId === spotlight.leagueId);
        const leagueFixtures = sortFixtures(
          clubFixtures.filter((fx) => fx.leagueId === spotlight.leagueId),
          spotlight,
        );
        const leagueClubs = sortClubs(
          clubs.filter((c) => c.leagueId === spotlight.leagueId),
          spotlight,
        );
        const hasLive = leagueFixtures.some((fx) => fx.status === 'live');

        return (
          <section key={spotlight.leagueId} className="mb-4 last:mb-0">
            <div className={`mb-3 p-2.5 rounded-lg border ${accent.border} ${accent.bg}`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-[10px] uppercase font-mono ${accent.label}`}>
                  {t(SPOTLIGHT_LABEL_KEYS[spotlight.leagueId])}
                </span>
                {hasLive && (
                  <span className="badge bg-tt-red/20 text-tt-red border-tt-red/30 text-[8px]">
                    {t('common.live')}
                  </span>
                )}
              </div>
              <div className="font-semibold text-sm text-tt-accent">
                {spotlight.playerZh}
                <span className="text-tt-muted font-normal text-xs ml-1.5">{spotlight.player}</span>
              </div>
              <div className="text-[11px] text-tt-accent2 mt-0.5">
                {spotlight.club} · {spotlight.role}
              </div>
              {spotlight.seasonStats && (
                <div className={`text-[10px] font-mono mt-1 ${accent.label}`}>{spotlight.seasonStats}</div>
              )}
              <p className="text-[10px] text-tt-muted leading-relaxed mt-1.5">{spotlight.summary}</p>
            </div>

            {stats && (
              <LeagueStatsViz stats={stats} spotlightClubId={spotlight.clubId} compact />
            )}

            <div className="text-[10px] text-tt-muted uppercase mb-1">
              {t(FIXTURE_LABEL_KEYS[spotlight.leagueId])}
            </div>
            <ul className="space-y-2 mb-3">
              {leagueFixtures.map((fx) => (
                <li
                  key={fx.id}
                  className={`text-xs border-b border-tt-border/40 pb-1.5 last:border-0 rounded px-1.5 py-1 ${
                    fx.spotlightPlayer ? `${accent.bg} ${accent.border}` : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] text-tt-accent2">{leagueName(fx.leagueId)}</span>
                    {fx.spotlightPlayer && (
                      <span className={`badge text-[8px] ${accent.badge}`}>
                        {spotlightPlayerLabel(spotlight, fx)}
                      </span>
                    )}
                  </div>
                  <div className="font-mono">{fx.homeClub} vs {fx.awayClub}</div>
                  <div className="flex justify-between mt-0.5 text-[10px] text-tt-muted">
                    <span className={
                      fx.status === 'live' ? 'text-tt-red' : fx.status === 'finished' ? 'text-tt-muted' : 'text-tt-accent2'
                    }>
                      {fx.status === 'live' ? t('common.live') : fx.status === 'finished' ? t('common.finished') : t('common.upcoming')}
                    </span>
                    {fx.score && <span className="font-mono text-tt-text">{fx.score}</span>}
                  </div>
                </li>
              ))}
            </ul>

            <div className="text-[10px] text-tt-muted uppercase mb-1">
              {t(CLUB_LABEL_KEYS[spotlight.leagueId])}
            </div>
            <ul className="space-y-1 mb-3">
              {leagueClubs.map((c) => (
                <li
                  key={c.id}
                  className={`text-[11px] flex justify-between gap-2 rounded px-1 py-0.5 ${
                    c.id === spotlight.clubId ? 'bg-tt-accent/10' : ''
                  }`}
                >
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="text-tt-muted shrink-0 text-[10px]">
                    {c.notablePlayers?.slice(0, 2).join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.leagues.otherLeagues')}</div>
      <ul className="space-y-1 mb-3">
        {otherLeagues.map((lg) => (
          <li key={lg.id} className="text-sm flex items-center justify-between gap-2">
            <span className="truncate">{lg.name}</span>
            <span className="text-[10px] text-tt-muted shrink-0">{lg.season}</span>
          </li>
        ))}
      </ul>

      {otherFixtures.length > 0 && (
        <>
          <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.leagues.otherFixtures')}</div>
          <ul className="space-y-1.5">
            {otherFixtures.slice(0, 3).map((fx) => (
              <li key={fx.id} className="text-[11px] text-tt-muted font-mono truncate">
                {fx.homeClub} vs {fx.awayClub}
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}
