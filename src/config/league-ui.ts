/** 重点赛事体系面板配色与 i18n 键 */
export const LEAGUE_ACCENT: Record<string, { border: string; bg: string; label: string; badge: string; bar: string }> = {
  wtt: {
    border: 'border-tt-green/30',
    bg: 'bg-tt-green/5',
    label: 'text-tt-green',
    badge: 'bg-tt-green/20 text-tt-green border-tt-green/30',
    bar: 'bg-tt-green',
  },
  ittf: {
    border: 'border-tt-accent2/30',
    bg: 'bg-tt-accent2/5',
    label: 'text-tt-accent2',
    badge: 'bg-tt-accent2/20 text-tt-accent2 border-tt-accent2/30',
    bar: 'bg-tt-accent2',
  },
  ttbl: {
    border: 'border-tt-gold/30',
    bg: 'bg-tt-gold/5',
    label: 'text-tt-gold',
    badge: 'bg-tt-gold/20 text-tt-gold border-tt-gold/30',
    bar: 'bg-tt-gold',
  },
  pingchao: {
    border: 'border-tt-red/30',
    bg: 'bg-tt-red/5',
    label: 'text-tt-red',
    badge: 'bg-tt-red/20 text-tt-red border-tt-red/30',
    bar: 'bg-tt-red',
  },
  't-league': {
    border: 'border-tt-accent/30',
    bg: 'bg-tt-accent/5',
    label: 'text-tt-accent',
    badge: 'bg-tt-accent/20 text-tt-accent border-tt-accent/30',
    bar: 'bg-tt-accent',
  },
};

export const LEAGUE_SPOTLIGHT_LABEL_KEYS: Record<string, string> = {
  wtt: 'panels.leagues.wttSpotlight',
  ittf: 'panels.leagues.ittfSpotlight',
  ttbl: 'panels.leagues.ttblSpotlight',
  pingchao: 'panels.leagues.pingchaoSpotlight',
  't-league': 'panels.leagues.tleagueSpotlight',
};

export const LEAGUE_FIXTURE_LABEL_KEYS: Record<string, string> = {
  wtt: 'panels.leagues.wttFixtures',
  ittf: 'panels.leagues.ittfFixtures',
  ttbl: 'panels.leagues.ttblFixtures',
  pingchao: 'panels.leagues.pingchaoFixtures',
  't-league': 'panels.leagues.tleagueFixtures',
};

export const LEAGUE_CLUB_LABEL_KEYS: Record<string, string> = {
  wtt: 'panels.leagues.wttEvents',
  ittf: 'panels.leagues.ittfEvents',
  ttbl: 'panels.leagues.ttblClubs',
  pingchao: 'panels.leagues.pingchaoClubs',
  't-league': 'panels.leagues.tleagueClubs',
};

export const LEAGUE_STANDINGS_LABEL_KEYS: Record<string, string> = {
  wtt: 'panels.leagueData.wttRace',
  ittf: 'panels.leagueData.ittfNations',
  ttbl: 'panels.leagueData.standings',
  pingchao: 'panels.leagueData.standings',
  't-league': 'panels.leagueData.standings',
};
