/**
 * TTBL Bundesliga Probe Script
 * 
 * Fetches real data from ttbl.de __NEXT_DATA__ JSON and outputs structured standings + matches.
 * 
 * Confirmed URLs (2026-08-17):
 *   Standings: https://www.ttbl.de/bundesliga/table  → redirects to /bundesliga/table/2026-2027/1
 *   Schedule:  https://www.ttbl.de/bundesliga/gameschedule/current/current/all → redirects to /de/bundesliga/gameschedule/2026-2027/1/all
 *   Both return HTTP 200, contain <script id="__NEXT_DATA__" type="application/json">
 * 
 * Extraction: regex /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/ then JSON.parse
 */

const STANDINGS_URL = 'https://www.ttbl.de/bundesliga/table';
const SCHEDULE_URL  = 'https://www.ttbl.de/bundesliga/gameschedule/current/current/all';

const NEXT_DATA_RE = /<script\s+id="__NEXT_DATA__"\s+type="application\/json">\s*([\s\S]*?)\s*<\/script>/;

async function fetchNextData(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'TTWorldMonitor-Probe/1.0', 'Accept-Language': 'de-DE,de;q=0.9' },
        redirect: 'follow',
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const m = html.match(NEXT_DATA_RE);
      if (!m) throw new Error(`No __NEXT_DATA__ found`);
      return JSON.parse(m[1]);
    } catch (e) {
      if (attempt < retries) {
        console.log(`  ⚠ Attempt ${attempt + 1} failed (${e.message}), retrying...`);
        await new Promise(r => setTimeout(r, 3000));
      } else {
        throw e;
      }
    }
  }
}

function parseStandings(data) {
  const teams = data.props?.pageProps?.teams ?? [];
  return teams.map(t => ({
    rank:         t.rank,
    team:         t.seasonTeam?.name ?? 'Unknown',
    shortname:    t.seasonTeam?.shortname ?? '',
    wins:         t.matchWins,
    losses:       t.matchLosses,
    played:       t.matchCount,
    gameWins:     t.gameWins,
    gameLosses:   t.gameLosses,
    gameDiff:     t.gameDifference,
    plusPoints:   t.plusPoints,
    minusPoints:  t.minusPoints,
    points:       `${t.plusPoints} : ${t.minusPoints}`,
    city:         t.seasonTeam?.place ?? '',
    logoUrl:      t.seasonTeam?.logoPngUrl ? `https://www.ttbl.de${t.seasonTeam.logoPngUrl}` : null,
  }));
}

function parseMatches(data) {
  // Schedule page __NEXT_DATA__ key is "matches" (not "games")
  // Each match has: timeStamp (unix epoch seconds), matchState, homeGames, awayGames,
  //   homeTeam.seasonTeam.name, awayTeam.seasonTeam.name, gameday.name, venue.place
  const matches = data.props?.pageProps?.matches ?? [];
  return matches.map(g => ({
    id:          g.id,
    date:        g.timeStamp ? new Date(g.timeStamp * 1000).toISOString().slice(0, 10) : null,
    time:        g.timeStamp ? new Date(g.timeStamp * 1000).toISOString().slice(11, 16) : null,
    home:        g.homeTeam?.seasonTeam?.name ?? 'Unknown',
    away:        g.awayTeam?.seasonTeam?.name ?? 'Unknown',
    homeShort:   g.homeTeam?.seasonTeam?.shortname ?? '',
    awayShort:   g.awayTeam?.seasonTeam?.shortname ?? '',
    homeScore:   g.homeGames ?? null,
    awayScore:   g.awayGames ?? null,
    score:       (g.homeGames != null && g.awayGames != null) ? `${g.homeGames}:${g.awayGames}` : null,
    state:       g.matchState ?? 'unknown',
    gameday:     g.gameday?.name ?? null,
    venue:       g.venue?.place ?? null,
    spectators:  g.spectators ?? null,
  }));
}

async function main() {
  console.log('=== TTBL Bundesliga Data Probe ===\n');

  // 1. Standings
  console.log('--- Fetching Standings ---');
  let standings = [];
  try {
    const sData = await fetchNextData(STANDINGS_URL);
    standings = parseStandings(sData);
    console.log(`✓ Standings: ${standings.length} teams parsed\n`);
  } catch (e) {
    console.error(`✗ Standings fetch failed: ${e.message}`);
  }

  // 2. Schedule / Matches
  console.log('--- Fetching Schedule ---');
  let matches = [];
  try {
    const mData = await fetchNextData(SCHEDULE_URL);
    matches = parseMatches(mData);
    console.log(`✓ Schedule: ${matches.length} matches parsed\n`);
  } catch (e) {
    console.error(`✗ Schedule fetch failed: ${e.message}\n`);
  }

  // 3. Output
  console.log('=== STANDINGS (first 5) ===');
  console.log(JSON.stringify(standings.slice(0, 5), null, 2));

  console.log('\n=== MATCHES (all) ===');
  console.log(JSON.stringify(matches, null, 2));

  // 4. Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Standings entries: ${standings.length}`);
  console.log(`Match entries:     ${matches.length}`);
  console.log(`Season:            2026-2027`);
  console.log(`League ID:         296fff8b-fbe0-4744-ba61-67f98389d684`);
}

main().catch(e => { console.error(e); process.exit(1); });
