import { Link, useParams } from 'react-router-dom';
import { CLUBS, CLUB_FIXTURES, LEAGUES, PRIORITY_LEAGUE_SPOTLIGHTS } from '@/data/ecosystem';
import { TOP_MEN, TOP_WOMEN } from '@/data/seed';
import { useI18n } from '@/i18n';

export function CategoryDetailPage() {
  const { t } = useI18n();
  const { slug } = useParams();
  const key = (slug ?? 'wtt').toLowerCase();
  const CATEGORY_META: Record<string, {
    label: string;
    subtitle: string;
    summary: string;
    tags: string[];
    spotlightLeagueId?: string;
    region?: string;
  }> = {
    wtt: {
      label: 'WTT',
      subtitle: t('category.wtt.subtitle'),
      summary: t('category.wtt.summary'),
      tags: t('category.wtt.tags').split('|'),
      spotlightLeagueId: 'wtt',
    },
    ittf: {
      label: 'ITTF',
      subtitle: t('category.ittf.subtitle'),
      summary: t('category.ittf.summary'),
      tags: t('category.ittf.tags').split('|'),
      spotlightLeagueId: 'ittf',
    },
    china: {
      label: t('category.china.label'),
      subtitle: t('category.china.subtitle'),
      summary: t('category.china.summary'),
      tags: t('category.china.tags').split('|'),
      region: 'CHN',
    },
    japan: {
      label: t('category.japan.label'),
      subtitle: t('category.japan.subtitle'),
      summary: t('category.japan.summary'),
      tags: t('category.japan.tags').split('|'),
      region: 'JPN',
    },
    germany: {
      label: t('category.germany.label'),
      subtitle: t('category.germany.subtitle'),
      summary: t('category.germany.summary'),
      tags: t('category.germany.tags').split('|'),
      region: 'GER',
    },
    clubs: {
      label: t('category.clubs.label'),
      subtitle: t('category.clubs.subtitle'),
      summary: t('category.clubs.summary'),
      tags: t('category.clubs.tags').split('|'),
    },
  };

  const meta = CATEGORY_META[key] ?? CATEGORY_META.wtt;

  const league = LEAGUES.find((item) => item.id === meta.spotlightLeagueId) ?? LEAGUES[0];
  const regionCode = meta.region ?? league?.country ?? 'CHN';
  const relevantClubs = CLUBS.filter((club) => {
    if (key === 'china') return club.country === 'CHN';
    if (key === 'japan') return club.country === 'JPN';
    if (key === 'germany') return club.country === 'GER';
    if (key === 'wtt') return club.leagueId === 'wtt';
    if (key === 'ittf') return club.leagueId === 'ittf';
    return club.leagueId !== 'wtt' && club.leagueId !== 'ittf';
  }).slice(0, 6);

  const fixtures = CLUB_FIXTURES.filter((fixture) => {
    if (key === 'china') return fixture.leagueId === 'pingchao';
    if (key === 'japan') return fixture.leagueId === 't-league';
    if (key === 'germany') return fixture.leagueId === 'ttbl';
    if (key === 'wtt') return fixture.leagueId === 'wtt';
    if (key === 'ittf') return fixture.leagueId === 'ittf';
    return true;
  }).slice(0, 4);

  const players = [...TOP_MEN, ...TOP_WOMEN]
    .filter((player) => {
      if (key === 'china') return player.country === 'CHN';
      if (key === 'japan') return player.country === 'JPN';
      if (key === 'germany') return player.country === 'GER';
      if (key === 'wtt') return ['CHN', 'JPN', 'FRA', 'SWE', 'GER'].includes(player.country);
      if (key === 'ittf') return ['CHN', 'JPN', 'SWE', 'FRA', 'BRA', 'GER'].includes(player.country);
      return true;
    })
    .slice(0, 6);

  const spotlight = PRIORITY_LEAGUE_SPOTLIGHTS.find((item) => item.leagueId === meta.spotlightLeagueId) ?? PRIORITY_LEAGUE_SPOTLIGHTS[0];

  return (
    <div className="min-h-screen bg-tt-bg text-tt-text">
      {/* Header - mobile optimized */}
      <header className="border-b border-tt-border bg-tt-surface/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="text-xs sm:text-sm text-tt-muted hover:text-tt-text flex-shrink-0">
              ← {t('category.back')}
            </Link>
            <div className="h-3 sm:h-4 w-px bg-tt-border flex-shrink-0" />
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-tt-accent flex-shrink-0">
              {meta.label}
            </div>
          </div>
          {/* Tags - wrap on mobile */}
          <div className="flex items-center gap-1.5 flex-wrap justify-start sm:justify-end">
            {meta.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge bg-tt-surface text-tt-muted border-tt-border text-[9px] sm:text-[10px] px-1.5 py-0.5">
                {tag}
              </span>
            ))}
            {meta.tags.length > 3 && (
              <span className="text-[9px] text-tt-muted">+{meta.tags.length - 3}</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Headline section - stacked on mobile */}
        <section className="grid grid-cols-1 sm:grid-cols-[1.5fr_0.9fr] gap-4 sm:gap-6">
          <div className="panel p-4 sm:p-6">
            <div className="text-[10px] uppercase tracking-[0.25em] text-tt-accent">{meta.label}</div>
            <h1 className="mt-2 sm:mt-3 text-2xl sm:text-5xl font-bold tracking-tight leading-tight">
              {meta.subtitle}
            </h1>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-tt-muted leading-relaxed">
              {meta.summary}
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
              {['实时排名', '关键赛事', '俱乐部强度', '球员风格'].map((item) => (
                <span
                  key={item}
                  className="badge bg-tt-accent/10 text-tt-accent border-tt-accent/20 text-[9px] sm:text-[10px] px-2 py-1"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Focus card */}
          <div className="panel p-4 sm:p-5">
            <div className="text-[10px] uppercase tracking-[0.28em] text-tt-muted">{t('category.focus')}</div>
            <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between text-[11px] sm:text-sm gap-2">
                <span className="text-tt-muted flex-shrink-0">{t('category.topLeague')}</span>
                <span className="font-semibold text-tt-accent text-right">
                  {league?.name ?? meta.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-sm gap-2">
                <span className="text-tt-muted flex-shrink-0">{t('category.region')}</span>
                <span className="font-semibold">{regionCode}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-sm gap-2">
                <span className="text-tt-muted flex-shrink-0">{t('category.clubsLabel')}</span>
                <span className="font-semibold">{relevantClubs.length}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-sm gap-2">
                <span className="text-tt-muted flex-shrink-0">{t('category.fixtures')}</span>
                <span className="font-semibold">{fixtures.length}</span>
              </div>
            </div>
          </div>
        </section>

        {/* KPI cards - 1 col on mobile, 3 on desktop */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: t('category.kpis.rankingHeat'), value: 'Top 5', detail: t('category.kpis.rankingHeatDetail') },
            { label: t('category.kpis.scheduleDensity'), value: t('category.kpis.high'), detail: t('category.kpis.scheduleDensityDetail') },
            { label: t('category.kpis.clubStrength'), value: t('category.kpis.strong'), detail: t('category.kpis.clubStrengthDetail') },
          ].map((item) => (
            <div key={item.label} className="panel p-3 sm:p-4">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-tt-muted">
                {item.label}
              </div>
              <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold font-mono text-tt-accent">
                {item.value}
              </div>
              <div className="mt-1 text-[10px] sm:text-xs text-tt-muted">{item.detail}</div>
            </div>
          ))}
        </section>

        {/* Spotlight and players - stacked on mobile */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 sm:gap-6">
          <div className="panel p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold flex-shrink-0">{t('category.keyFocus')}</h2>
              <span className="badge bg-tt-green/10 text-tt-green border-tt-green/20 text-[9px] flex-shrink-0">
                {t('common.live')}
              </span>
            </div>
            <div className="mt-3 sm:mt-4 rounded-lg border border-tt-border bg-tt-bg/30 p-3 sm:p-4">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-tt-muted">
                Player
              </div>
              <div className="mt-2 text-lg sm:text-xl font-semibold truncate">
                {spotlight.playerZh || spotlight.player}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-tt-muted truncate">
                {spotlight.club} · {spotlight.role}
              </div>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-tt-muted leading-relaxed line-clamp-3">
                {spotlight.summary}
              </p>
              <div className="mt-2 sm:mt-3 text-[9px] font-mono text-tt-accent2 truncate">
                {spotlight.seasonStats}
              </div>
            </div>
          </div>

          {/* Players list */}
          <div className="panel p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('category.corePlayers')}</h2>
            <div className="space-y-2">
              {players.map((player) => (
                <div key={`${player.id}-${player.name}`} className="flex items-center justify-between text-[11px] sm:text-sm gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{player.name}</div>
                    <div className="text-[9px] text-tt-muted font-mono">
                      #{player.rank} · {player.country}
                    </div>
                  </div>
                  <span className="badge bg-tt-surface text-tt-muted border-tt-border text-[9px] px-1.5 py-0.5 flex-shrink-0">
                    {player.gender}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clubs and fixtures - stacked on mobile */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="panel p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('category.clubPerformance')}</h2>
            <div className="space-y-2">
              {relevantClubs.map((club) => {
                const locationText = [club.province, club.city, club.county, club.district]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <div
                    key={club.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-tt-border bg-tt-bg/30 p-2.5 sm:p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[11px] sm:text-sm truncate">{club.name}</div>
                      <div className="text-[9px] text-tt-muted truncate">
                        {locationText || `${club.city} · ${club.country}`}
                      </div>
                    </div>
                    <div className="text-[9px] text-tt-accent2 font-mono flex-shrink-0 text-right">
                      {club.notablePlayers?.slice(0, 1).join(' ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fixtures */}
          <div className="panel p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">近期赛程</h2>
            <div className="space-y-2">
              {fixtures.map((fixture) => (
                <div
                  key={fixture.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-tt-border bg-tt-bg/30 p-2.5 sm:p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[11px] sm:text-sm truncate">
                      {fixture.homeClub}
                    </div>
                    <div className="text-[9px] text-tt-muted">
                      {fixture.status.toUpperCase()} · {fixture.awayClub}
                    </div>
                  </div>
                  {fixture.score && (
                    <span className="badge bg-tt-accent/10 text-tt-accent border-tt-accent/20 text-[9px] px-1.5 py-0.5 flex-shrink-0">
                      {fixture.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
