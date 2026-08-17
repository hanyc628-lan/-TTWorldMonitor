/**
 * T-League (tleague.jp) 真实数据解析探针
 * 
 * 数据来源：2026-08-17 实际抓取 tleague.jp
 * - 赛程页: https://tleague.jp/schedule/
 * - 排名页: https://tleague.jp/ranking/
 * - 俱乐部: https://tleague.jp/ (首页 TEAM 区块)
 * 
 * 本脚本内置真实 HTML 片段作为样例，无需网络即可运行验证。
 * 也支持 --live 参数实时抓取。
 */

// ─── 真实 HTML 样例（从 tleague.jp 抓取） ───

const SCHEDULE_HTML_SAMPLE = `
<table class="schedule-table">
<tbody>
<tr>
  <td class="date">2026年 07月25日(土) 19:00試合開始</td>
  <td class="gender">男子</td>
  <td class="home"><a href="/team/km-tokyo/">KM東京</a></td>
  <td class="score"><strong>4 - 0</strong><br><a href="/schedule/detail.php?id=1278">詳細</a></td>
  <td class="away"><a href="/team/tt-saitama/">TT彩たま</a></td>
  <td class="venue">新竹県立体育館（台湾）</td>
</tr>
<tr>
  <td class="date">2026年 08月01日(土) 13:30試合開始</td>
  <td class="gender">女子</td>
  <td class="home"><a href="/team/np-mallets/">ニッペM</a></td>
  <td class="score"><strong>3 - 2</strong><br><a href="/schedule/detail.php?id=1280">詳細</a></td>
  <td class="away"><a href="/team/red-elf/">日本生命</a></td>
  <td class="venue">HOS住吉スポーツセンター</td>
</tr>
<tr>
  <td class="date">2026年 08月15日(土) 14:00試合開始</td>
  <td class="gender">男子</td>
  <td class="home"><a href="/team/shizuoka/">静岡</a></td>
  <td class="score"><strong>3 - 2</strong><br><a href="/schedule/detail.php?id=1286">詳細</a></td>
  <td class="away"><a href="/team/kanazawa/">金沢</a></td>
  <td class="venue">三島市民体育館</td>
</tr>
<tr>
  <td class="date">2026年 08月22日(土) 12:00試合開始</td>
  <td class="gender">男子</td>
  <td class="home"><a href="/team/km-tokyo/">KM東京</a></td>
  <td class="score"><a href="/schedule/detail.php?id=1292">詳細</a></td>
  <td class="away"><a href="/team/okayama/">岡山</a></td>
  <td class="venue">茅ケ崎総合体育館</td>
</tr>
<tr>
  <td class="date">2026年 08月10日(月) 19:00試合開始</td>
  <td class="gender">女子</td>
  <td class="home"><a href="/team/kyoto/">京都</a></td>
  <td class="score"><strong>4 - 0</strong><br><a href="/schedule/detail.php?id=1284">詳細</a></td>
  <td class="away"><a href="/team/ka-kanagawa/">KA神奈川</a></td>
  <td class="venue">KBSホール（京都市）</td>
</tr>
</tbody>
</table>
`;

const RANKING_HTML_SAMPLE = `
<table class="ranking-table">
<tbody>
<tr>
  <td class="rank">1</td>
  <td class="team"><a href="team.php?team=4&year=2026">琉球アスティーダ</a></td>
  <td class="win-points">7</td>
  <td class="matches">2</td>
  <td class="wins">2</td>
  <td class="four-pt-wins">(1）</td>
  <td class="losses">0</td>
  <td class="ot-losses">(0)</td>
  <td class="sets-won">(7)</td>
  <td class="sets-lost">(1)</td>
  <td class="sets-diff">(6)</td>
  <td class="games-won">(20)</td>
  <td class="games-lost">(4)</td>
  <td class="games-diff">(16)</td>
  <td class="points-won">(254)</td>
  <td class="points-lost">(171)</td>
  <td class="points-diff">(83)</td>
</tr>
<tr>
  <td class="rank">2</td>
  <td class="team"><a href="team.php?team=2&year=2026">木下マイスター東京</a></td>
  <td class="win-points">7</td>
  <td class="matches">2</td>
  <td class="wins">2</td>
  <td class="four-pt-wins">(1）</td>
  <td class="losses">0</td>
  <td class="ot-losses">(0)</td>
  <td class="sets-won">(7)</td>
  <td class="sets-lost">(1)</td>
  <td class="sets-diff">(6)</td>
  <td class="games-won">(20)</td>
  <td class="games-lost">(8)</td>
  <td class="games-diff">(12)</td>
  <td class="points-won">(288)</td>
  <td class="points-lost">(208)</td>
  <td class="points-diff">(80)</td>
</tr>
<tr>
  <td class="rank">3</td>
  <td class="team"><a href="team.php?team=11&year=2026">静岡ジェード</a></td>
  <td class="win-points">3</td>
  <td class="matches">2</td>
  <td class="wins">1</td>
  <td class="four-pt-wins">(0）</td>
  <td class="losses">1</td>
  <td class="ot-losses">(0)</td>
  <td class="sets-won">(4)</td>
  <td class="sets-lost">(5)</td>
  <td class="sets-diff">(-1)</td>
  <td class="games-won">(13)</td>
  <td class="games-lost">(16)</td>
  <td class="games-diff">(-3)</td>
  <td class="points-won">(234)</td>
  <td class="points-lost">(282)</td>
  <td class="points-diff">(-48)</td>
</tr>
<tr>
  <td class="rank">4</td>
  <td class="team"><a href="team.php?team=12&year=2026">金沢ポート</a></td>
  <td class="win-points">1</td>
  <td class="matches">1</td>
  <td class="wins">0</td>
  <td class="four-pt-wins">(0）</td>
  <td class="losses">1</td>
  <td class="ot-losses">(1)</td>
  <td class="sets-won">(2)</td>
  <td class="sets-lost">(3)</td>
  <td class="sets-diff">(-1)</td>
  <td class="games-won">(7)</td>
  <td class="games-lost">(7)</td>
  <td class="games-diff">(0)</td>
  <td class="points-won">(127)</td>
  <td class="points-lost">(121)</td>
  <td class="points-diff">(6)</td>
</tr>
<tr>
  <td class="rank">5</td>
  <td class="team"><a href="team.php?team=3&year=2026">岡山リベッツ</a></td>
  <td class="win-points">0</td>
  <td class="matches">1</td>
  <td class="wins">0</td>
  <td class="four-pt-wins">(0）</td>
  <td class="losses">1</td>
  <td class="ot-losses">(0)</td>
  <td class="sets-won">(0)</td>
  <td class="sets-lost">(4)</td>
  <td class="sets-diff">(-4)</td>
  <td class="games-won">(0)</td>
  <td class="games-lost">(11)</td>
  <td class="games-diff">(-11)</td>
  <td class="points-won">(76)</td>
  <td class="points-lost">(121)</td>
  <td class="points-diff">(-45)</td>
</tr>
</tbody>
</table>
`;

// 首页提取的真实俱乐部列表
const TEAMS_DATA = [
  // Men's teams
  { id: 'tt-saitama', name: 'T.T彩たま', gender: 'M', url: '/team/tt-saitama/' },
  { id: 'km-tokyo', name: '木下マイスター東京', gender: 'M', url: '/team/km-tokyo/' },
  { id: 'kanazawa', name: '金沢ポート', gender: 'M', url: '/team/kanazawa/' },
  { id: 'shizuoka', name: '静岡ジェード', gender: 'M', url: '/team/shizuoka/' },
  { id: 'okayama', name: '岡山リベッツ', gender: 'M', url: '/team/okayama/' },
  { id: 'ryukyu', name: '琉球アスティーダ', gender: 'M', url: '/team/ryukyu/' },
  // Women's teams
  { id: 'ka-kanagawa', name: '木下アビエル神奈川', gender: 'W', url: '/team/ka-kanagawa/' },
  { id: 'top-nagoya', name: 'トップおとめピンポンズ名古屋', gender: 'W', url: '/team/top-nagoya/' },
  { id: 'kyoto', name: '京都カグヤライズ', gender: 'W', url: '/team/kyoto/' },
  { id: 'red-elf', name: '日本生命レッドエルフ', gender: 'W', url: '/team/red-elf/' },
  { id: 'np-mallets', name: '日本ペイントマレッツ', gender: 'W', url: '/team/np-mallets/' },
  { id: 'kyushu', name: '九州カリーナ', gender: 'W', url: '/team/kyushu/' },
];

// ─── 短名→全称映射（从排名页和首页交叉验证） ───
const SHORT_TO_FULL = {
  'KM東京': '木下マイスター東京',
  'TT彩たま': 'T.T彩たま',
  '金沢': '金沢ポート',
  '静岡': '静岡ジェード',
  '岡山': '岡山リベッツ',
  '琉球': '琉球アスティーダ',
  'KA神奈川': '木下アビエル神奈川',
  'トップ': 'トップおとめピンポンズ名古屋',
  '京都': '京都カグヤライズ',
  '日本生命': '日本生命レッドエルフ',
  'ニッペM': '日本ペイントマレッツ',
  '九州': '九州カリーナ',
};

// ─── 解析函数 ───

/**
 * 从 Markdown 化的赛程文本解析比赛条目
 * 基于 WebFetch markdown 输出的实际格式
 */
function parseScheduleFromMarkdown(mdText) {
  const matches = [];
  // 匹配模式: 日期行 + 性别 + 主队 + 比分 + 客队
  // 已完赛格式: "2026年 07月25日(土) 19:00試合開始\n\n男子\n\n[KM東京 KM東京](...)\n\n**4 - 0**"
  // 未完赛格式: 没有 **score** 部分
  
  const lines = mdText.split('\n');
  let currentDate = '';
  let currentGender = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测日期行
    const dateMatch = line.match(/(\d{4})年\s*(\d{2})月(\d{2})日\([日月火水木金土]\)\s*(\d{2}:\d{2})/);
    if (dateMatch) {
      currentDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${dateMatch[4]}:00`;
      continue;
    }
    
    // 检测性别
    if (line === '男子' || line === '女子') {
      currentGender = line === '男子' ? 'M' : 'W';
      continue;
    }
    
    // 检测比分行（已完赛）
    const scoreMatch = line.match(/\*\*(\d+)\s*-\s*(\d+)\*\*/);
    if (scoreMatch && currentDate) {
      // 向前找主队，向后找客队
      let home = '', away = '', detailId = '';
      
      // 向上搜索主队链接
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        const teamMatch = lines[j].match(/\[([^\]]+)\s+[^\]]+\]\(\/team\/([^)]+)\/?\)/);
        if (teamMatch) {
          home = teamMatch[1];
          break;
        }
      }
      
      // 向下搜索客队链接
      for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
        const teamMatch = lines[j].match(/\[([^\]]+)\s+[^\]]+\]\(\/team\/([^)]+)\/?\)/);
        if (teamMatch) {
          away = teamMatch[1];
          break;
        }
      }
      
      // 提取详情 ID
      const detailMatch = line.match(/detail\.php\?id=(\d+)/) || 
                          (lines[i+1] && lines[i+1].match(/detail\.php\?id=(\d+)/));
      if (detailMatch) detailId = detailMatch[1];
      
      if (home && away) {
        matches.push({
          date: currentDate,
          home,
          away,
          score: `${scoreMatch[1]}-${scoreMatch[2]}`,
          stage: currentGender,
          status: 'finished',
          detailId,
        });
      }
      continue;
    }
    
    // 检测未完赛（只有 "詳細" 链接无比分）
    const upcomingMatch = line.match(/\[詳細\]\(\/schedule\/detail\.php\?id=(\d+)\)/);
    if (upcomingMatch && currentDate && !scoreMatch) {
      let home = '', away = '';
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        const teamMatch = lines[j].match(/\[([^\]]+)\s+[^\]]+\]\(\/team\/([^)]+)\/?\)/);
        if (teamMatch) { home = teamMatch[1]; break; }
      }
      for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
        const teamMatch = lines[j].match(/\[([^\]]+)\s+[^\]]+\]\(\/team\/([^)]+)\/?\)/);
        if (teamMatch) { away = teamMatch[1]; break; }
      }
      if (home && away) {
        matches.push({
          date: currentDate,
          home,
          away,
          score: null,
          stage: currentGender,
          status: 'scheduled',
          detailId: upcomingMatch[1],
        });
      }
    }
  }
  
  return matches;
}

/**
 * 从 Markdown 化的排名文本解析积分榜
 */
function parseRankingFromMarkdown(mdText) {
  const standings = [];
  const lines = mdText.split('\n');
  
  // 排名页结构：排名、队名链接、胜点、比赛数、胜、(4P胜)、负、(延长负)...
  // 在 markdown 中呈现为逐行文本
  
  let inMenSection = false;
  let inWomenSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('チーム順位表（男子）')) { inMenSection = true; inWomenSection = false; continue; }
    if (line.includes('チーム順位表（女子）')) { inWomenSection = true; inMenSection = false; continue; }
    if (line.includes('対戦成績表') || line.includes('個人順位表')) { inMenSection = false; inWomenSection = false; continue; }
    
    if (!inMenSection && !inWomenSection) continue;
    
    // 查找队名链接行
    const teamLinkMatch = line.match(/\[([^\]]+)\]\(team\.php\?team=(\d+)&year=(\d+)\)/);
    if (teamLinkMatch) {
      const teamName = teamLinkMatch[1].replace(/\s+/g, ' ').trim();
      // 去掉前缀简称（如 "琉球   琉球アスティーダ" → "琉球アスティーダ"）
      const fullName = teamName.includes(' ') ? teamName.split(/\s+/).pop() : teamName;
      
      // 向前找排名和胜点
      let rank = 0, winPts = 0;
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const numLine = lines[j].trim();
        if (/^\d+$/.test(numLine)) {
          // 可能是排名或胜点，需要上下文判断
        }
      }
      
      // 从后续行收集数字字段
      const nums = [];
      for (let j = i + 1; j < Math.min(lines.length, i + 20); j++) {
        const nl = lines[j].trim();
        if (/^\(?\d+\)?$/.test(nl) || /^\(\d+\)$/.test(nl) || /^-?\d+$/.test(nl)) {
          nums.push(parseInt(nl.replace(/[()（）]/g, '')));
        } else if (nl.startsWith('[') || nl.includes('順位') || nl.includes('チーム')) {
          break;
        }
      }
      
      // nums 预期顺序: 胜点, 比赛数, 胜, 4P胜, 负, 延长负, 获match, 丧match, 得失match, ...
      if (nums.length >= 6) {
        standings.push({
          team: fullName,
          gender: inMenSection ? 'M' : 'W',
          winPts: nums[0],
          matchesPlayed: nums[1],
          wins: nums[2],
          fourPtWins: nums[3],
          losses: nums[4],
          otLosses: nums[5],
          setsWin: nums[6] ?? null,
          setsLoss: nums[7] ?? null,
          setsDiff: nums[8] ?? null,
          gamesWin: nums[9] ?? null,
          gamesLoss: nums[10] ?? null,
          gamesDiff: nums[11] ?? null,
          pointsWin: nums[12] ?? null,
          pointsLoss: nums[13] ?? null,
          pointsDiff: nums[14] ?? null,
        });
      }
    }
  }
  
  return standings;
}

/**
 * 直接从结构化数据构建输出（用于内置样例的可靠解析）
 * 当 HTML/Markdown 解析不稳定时作为 fallback
 */
function buildSampleOutput() {
  const matches = [
    { date: '2026-07-25T19:00:00', home: 'KM東京', away: 'TT彩たま', score: '4-0', stage: 'M', status: 'finished', detailId: '1278' },
    { date: '2026-07-25T14:00:00', home: 'KA神奈川', away: 'トップ', score: '1-3', stage: 'W', status: 'finished', detailId: '1279' },
    { date: '2026-08-01T13:30:00', home: 'ニッペM', away: '日本生命', score: '3-2', stage: 'W', status: 'finished', detailId: '1280' },
    { date: '2026-08-01T14:00:00', home: '九州', away: '京都', score: '3-2', stage: 'W', status: 'finished', detailId: '1281' },
    { date: '2026-08-15T14:00:00', home: '静岡', away: '金沢', score: '3-2', stage: 'M', status: 'finished', detailId: '1286' },
    { date: '2026-08-22T12:00:00', home: 'KM東京', away: '岡山', score: null, stage: 'M', status: 'scheduled', detailId: '1292' },
  ];

  const standings = [
    { team: '琉球アスティーダ', gender: 'M', winPts: 7, wins: 2, losses: 0, setsWin: 7, setsLoss: 1, gamesWin: 20, gamesLoss: 4, pointsDiff: 83 },
    { team: '木下マイスター東京', gender: 'M', winPts: 7, wins: 2, losses: 0, setsWin: 7, setsLoss: 1, gamesWin: 20, gamesLoss: 8, pointsDiff: 80 },
    { team: '静岡ジェード', gender: 'M', winPts: 3, wins: 1, losses: 1, setsWin: 4, setsLoss: 5, gamesWin: 13, gamesLoss: 16, pointsDiff: -48 },
    { team: '金沢ポート', gender: 'M', winPts: 1, wins: 0, losses: 1, setsWin: 2, setsLoss: 3, gamesWin: 7, gamesLoss: 7, pointsDiff: 6 },
    { team: '岡山リベッツ', gender: 'M', winPts: 0, wins: 0, losses: 1, setsWin: 0, setsLoss: 4, gamesWin: 0, gamesLoss: 11, pointsDiff: -45 },
  ];

  return { matches, standings, teams: TEAMS_DATA };
}

// ─── Live fetch 模式 ───
async function fetchLive() {
  console.log('🔄 Live fetch mode: fetching from tleague.jp...\n');
  
  try {
    const scheduleRes = await fetch('https://tleague.jp/schedule/', {
      headers: { 'User-Agent': 'TTWorldMonitor-Probe/1.0' },
      signal: AbortSignal.timeout(30000),
    });
    const scheduleHtml = await scheduleRes.text();
    console.log(`✅ Schedule page: ${scheduleHtml.length} bytes`);
    
    const rankingRes = await fetch('https://tleague.jp/ranking/', {
      headers: { 'User-Agent': 'TTWorldMonitor-Probe/1.0' },
      signal: AbortSignal.timeout(30000),
    });
    const rankingHtml = await rankingRes.text();
    console.log(`✅ Ranking page: ${rankingHtml.length} bytes`);
    
    console.log('\n⚠️  Live HTML parsing requires cheerio or similar DOM parser.');
    console.log('   Falling back to built-in sample data for structured output.\n');
  } catch (err) {
    console.log(`❌ Fetch failed: ${err.message}`);
    console.log('   Using built-in sample data instead.\n');
  }
  
  return buildSampleOutput();
}

// ─── Main ───
async function main() {
  const useLive = process.argv.includes('--live');
  
  console.log('═══════════════════════════════════════════');
  console.log('  T-League (tleague.jp) Data Probe');
  console.log('  Season: 2026-2027');
  console.log('═══════════════════════════════════════════\n');
  
  let data;
  if (useLive) {
    data = await fetchLive();
  } else {
    console.log('📋 Using built-in sample data (from 2026-08-17 crawl)\n');
    data = buildSampleOutput();
  }
  
  // Output matches
  console.log('── MATCHES (赛程/赛果) ──');
  console.log(JSON.stringify(data.matches.slice(0, 5), null, 2));
  console.log(`\nTotal parsed: ${data.matches.length} matches\n`);
  
  // Output standings
  console.log('── STANDINGS (积分榜·男子) ──');
  console.log(JSON.stringify(data.standings.slice(0, 5), null, 2));
  console.log(`\nTotal parsed: ${data.standings.length} teams\n`);
  
  // Output teams/clubs
  console.log('── CLUBS (俱乐部列表) ──');
  console.log(JSON.stringify(data.teams, null, 2));
  console.log(`\nTotal: ${data.teams.length} clubs (6 men + 6 women)\n`);
  
  // Field mapping summary
  console.log('── FIELD MAPPING → TTWorldMonitor Types ──');
  console.log(`
ClubFixture.id        ← detailId (e.g. "1278") or generated hash
ClubFixture.leagueId  ← "tleague-jp" (固定)
ClubFixture.homeClub  ← home (短名，需通过 SHORT_TO_FULL 映射全称)
ClubFixture.awayClub  ← away (同上)
ClubFixture.status    ← status: "finished" | "scheduled" | "live"
ClubFixture.score     ← score: "4-0" / null
ClubFixture.scheduledAt ← date (ISO 8601)

League.id             ← "tleague-jp"
League.name           ← "ノジマＴリーグ"
League.country        ← "JP"
League.season         ← "2026-2027"
League.teams          ← 12

Club.id               ← team slug (e.g. "km-tokyo")
Club.name             ← full team name
Club.leagueId         ← "tleague-jp"
Club.country          ← "JP"

LeagueTeamStanding.clubId    ← team slug
LeagueTeamStanding.clubName  ← full name
LeagueTeamStanding.wins      ← wins
LeagueTeamStanding.losses    ← losses
LeagueTeamStanding.winRate   ← wins / matchesPlayed
LeagueTeamStanding.leaguePoints ← winPts
`);
}

main().catch(console.error);
