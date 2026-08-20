import type {
  League,
  Club,
  ClubFixture,
  EquipmentTrend,
  ApparelItem,
  LearningModule,
  ParticipationStat,
  LeagueSpotlight,
  LeagueStats,
} from '@/types';

/** WTT 职业巡回赛焦点 */
export const WTT_SPOTLIGHT: LeagueSpotlight = {
  leagueId: 'wtt',
  player: 'WANG Chuqin / SUN Yingsha',
  playerZh: '王楚钦 / 孙颖莎',
  club: 'WTT US Smash 2026',
  clubId: 'wtt-usa',
  role: '大满贯头号种子',
  summary: '2026 赛季 WTT 美国大满贯（安大略）已落幕：孙颖莎卫冕女单，松岛辉空爆冷夺男单；下一站关注横滨冠军赛与欧洲大满贯。',
  seasonStats: '男单 18 胜 2 负 · 女单 16 胜 1 负',
};

/** ITTF 国际乒联系列焦点 */
export const ITTF_SPOTLIGHT: LeagueSpotlight = {
  leagueId: 'ittf',
  player: 'WANG Chuqin / SUN Yingsha',
  playerZh: '王楚钦 / 孙颖莎',
  club: 'ITTF 世界排名',
  clubId: 'ittf-rankings',
  role: '男女单打世界第一',
  summary: 'ITTF 官方排名与世锦赛体系，中国男女单打包揽榜首。2026 休斯顿世乒赛备战窗口，日本、瑞典、法国紧追积分差距。',
  seasonStats: 'ITTF 男单 #1 · 女单 #1',
};

/** 德甲 TTBL 焦点：樊振东 @ 萨尔布吕肯 */
export const TTBL_SPOTLIGHT: LeagueSpotlight = {
  leagueId: 'ttbl',
  player: 'FAN Zhendong',
  playerZh: '樊振东',
  club: '1. FC Saarbrücken-TT',
  clubId: 'saarbrucken',
  role: '德甲一号单打',
  summary: '2025/26 赛季加盟萨尔布吕肯，德甲焦点战与欧俱杯双线作战，正手质量与关键分能力引领球队争冠。',
  seasonStats: '德甲 8 胜 1 负 · 单打胜率 89%',
};

/** 中国乒超焦点：王楚钦 / 孙颖莎 @ 山东魏桥 */
export const PINGCHAO_SPOTLIGHT: LeagueSpotlight = {
  leagueId: 'pingchao',
  player: 'WANG Chuqin / SUN Yingsha',
  playerZh: '王楚钦 / 孙颖莎',
  club: '山东魏桥',
  clubId: 'shandong',
  role: '乒超卫冕冠军',
  summary: '2025 赛季山东魏桥男女队双线领跑，王楚钦、孙颖莎领衔冲击联赛三连冠，与上海地产、深圳大学形成争冠集团。',
  seasonStats: '男队 7 胜 0 负 · 女队 6 胜 1 负',
};

/** 日本 T 联赛焦点：张本兄妹 @ Kinoshita Meister Tokyo */
export const T_LEAGUE_SPOTLIGHT: LeagueSpotlight = {
  leagueId: 't-league',
  player: 'HARIMOTO Tomokazu / HARIMOTO Miwa',
  playerZh: '张本智和 / 张本美和',
  club: 'Kinoshita Meister Tokyo',
  clubId: 'kinoshita',
  role: 'T 联赛王牌组合',
  summary: '2025/26 赛季 Kinoshita Meister Tokyo 男女队双线争冠，张本智和、张本美和领衔东京主场，与琉球 Asteeda、川崎 Frontale 形成三强格局。',
  seasonStats: '男队 6 胜 1 负 · 女队 5 胜 2 负',
};

/** 面板优先展示的联赛焦点（顺序即展示顺序） */
export const PRIORITY_LEAGUE_SPOTLIGHTS: LeagueSpotlight[] = [
  WTT_SPOTLIGHT,
  ITTF_SPOTLIGHT,
  TTBL_SPOTLIGHT,
  PINGCHAO_SPOTLIGHT,
  T_LEAGUE_SPOTLIGHT,
];

export const PRIORITY_LEAGUE_IDS = PRIORITY_LEAGUE_SPOTLIGHTS.map((s) => s.leagueId);

export const GLOBAL_LEAGUE_SYSTEMS = [
  {
    region: 'Europe',
    style: '中远台相持、重视旋转变化、技术兼容性强',
    leaders: ['Germany', 'France', 'Sweden', 'Slovenia', 'Portugal'],
    leagues: ['ETTU Europe Champions League', 'TTBL Germany', 'French Pro A', 'Polish Superliga'],
  },
  {
    region: 'Asia',
    style: '近台速度、连贯前三板、强烈节奏压迫',
    leaders: ['China', 'Japan', 'South Korea', 'Chinese Taipei', 'Singapore'],
    leagues: ['Chinese CTTSL', 'Japanese T-League', 'Korean KPTL'],
  },
  {
    region: 'Americas',
    style: '力量型进攻、搏杀风格、少数明星承担核心输出',
    leaders: ['Brazil', 'United States', 'Canada', 'Argentina'],
    leagues: ['MLTT USA', 'Pan American Championships'],
  },
  {
    region: 'Africa',
    style: '积极上手、近台进攻、依赖欧洲联赛磨练',
    leaders: ['Egypt', 'Nigeria', 'South Africa'],
    leagues: ['African Championships', 'African Cup'],
  },
  {
    region: 'Oceania',
    style: '融合亚洲技术框架、依赖洲际赛事和国内公开赛',
    leaders: ['Australia', 'New Zealand'],
    leagues: ['Oceania Championships', 'Oceania Cup'],
  },
] as const;

export const LEAGUES: League[] = [
  { id: 'wtt', name: 'WTT 世界乒乓球职业大联盟', country: 'SGP', region: '全球', level: 'pro', season: '2026', teams: 128, lat: 1.35, lng: 103.82 },
  { id: 'ittf', name: 'ITTF 国际乒联赛事体系', country: 'CHN', region: '全球', level: 'pro', season: '2026', teams: 200, lat: 39.9, lng: 116.4 },
  { id: 'ttbl', name: '德国乒乓球联赛 TTBL（德甲）', country: 'GER', region: '欧洲', level: 'pro', season: '2025/26', teams: 12, lat: 51.5, lng: 7.5 },
  { id: 'pingchao', name: '中国乒超联赛', country: 'CHN', region: '亚洲', level: 'pro', season: '2026', teams: 18, lat: 39.9, lng: 116.4 },
  { id: 't-league', name: '日本 T 联赛（T-League）', country: 'JPN', region: '亚洲', level: 'pro', season: '2025/26', teams: 10, lat: 35.7, lng: 139.7 },
  { id: 'kptl', name: '韩国 KPTL 联赛', country: 'KOR', region: '亚洲', level: 'semi-pro', season: '2025', teams: 8, lat: 37.5, lng: 127.0 },
  { id: 'pro-a', name: '法国 Pro A', country: 'FRA', region: '欧洲', level: 'pro', season: '2025/26', teams: 14, lat: 48.9, lng: 2.3 },
  { id: 'ettu-cl', name: '欧洲俱乐部冠军联赛', country: 'GER', region: '欧洲', level: 'pro', season: '2025/26', teams: 24, lat: 50.1, lng: 8.7 },
  { id: 'liga-nacional', name: '西班牙 Liga Nacional', country: 'ESP', region: '欧洲', level: 'semi-pro', season: '2025/26', teams: 16, lat: 40.4, lng: -3.7 },
  { id: 'k-league', name: '韩国职业联赛', country: 'KOR', region: '亚洲', level: 'semi-pro', season: '2025', teams: 8, lat: 37.5, lng: 127.0 },
  { id: 'mltt', name: '美国 MLTT', country: 'USA', region: '美洲', level: 'pro', season: '2026', teams: 8, lat: 40.7, lng: -74.0 },
  { id: 'oceania-cup', name: '大洋洲杯 / 大洋洲锦标赛', country: 'AUS', region: '大洋洲', level: 'national', season: '2026', teams: 12, lat: -25.27, lng: 133.78 },
  { id: 'africa-cup', name: '非洲乒乓球锦标赛', country: 'EGY', region: '非洲', level: 'national', season: '2026', teams: 16, lat: 30.04, lng: 31.24 },
];

export const CLUBS: Club[] = [
  { id: 'wtt-usa', name: 'WTT US Smash', leagueId: 'wtt', city: 'Ontario', country: 'USA', lat: 34.06, lng: -117.65, notablePlayers: ['WANG Chuqin', 'SUN Yingsha', 'MATSUSHIMA Sora'] },
  { id: 'wtt-montpellier', name: 'WTT Champions Montpellier', leagueId: 'wtt', city: 'Montpellier', country: 'FRA', lat: 43.61, lng: 3.88, notablePlayers: ['LEBRUN Felix', 'HAYATA Hina'] },
  { id: 'wtt-halmstad', name: 'WTT Youth Contender', leagueId: 'wtt', city: 'Halmstad', country: 'SWE', lat: 56.67, lng: 12.86, notablePlayers: ['MATSUSHIMA Sora', 'WEN Ruibo'] },
  { id: 'ittf-houston', name: 'ITTF Worlds 2026', leagueId: 'ittf', city: 'Houston', country: 'USA', lat: 29.76, lng: -95.37, notablePlayers: ['WANG Chuqin', 'SUN Yingsha'] },
  { id: 'ittf-veterans', name: 'ITTF World Veterans', leagueId: 'ittf', city: 'Rimini', country: 'ITA', lat: 44.07, lng: 12.57, notablePlayers: ['XU Xin', 'MA Long'] },
  { id: 'saarbrucken', name: '1. FC Saarbrücken-TT', leagueId: 'ttbl', province: 'Saarland', city: 'Saarbrücken', county: 'Saarbrücken', country: 'GER', lat: 49.24, lng: 7.0, notablePlayers: ['FAN Zhendong', 'Darko JORGIC', 'Yuan Ruichen'], level: 'city' },
  { id: 'borussia', name: 'Borussia Düsseldorf', leagueId: 'ttbl', province: 'North Rhine-Westphalia', city: 'Düsseldorf', county: 'Düsseldorf', country: 'GER', lat: 51.23, lng: 6.78, notablePlayers: ['QIU Dang', 'YU Ziyang', 'Benedikt DUDA'], level: 'city' },
  { id: 'bremen', name: 'TTF Liebherr Ochsenhausen', leagueId: 'ttbl', province: 'Baden-Württemberg', city: 'Ochsenhausen', county: 'Biberach', country: 'GER', lat: 48.07, lng: 9.95, notablePlayers: ['Dang Qiu', 'Ruwen Filus'], level: 'county' },
  { id: 'grizzly', name: 'Grizzly Adams Mißbach', leagueId: 'ttbl', province: 'Bavaria', city: 'Mißbach', county: 'Bad Kissingen', country: 'GER', lat: 47.87, lng: 11.97, notablePlayers: ['Patrick Franziska'], level: 'county' },
  { id: 'berlin-ttc', name: 'TTC Berlin-Eastside', leagueId: 'ttbl', province: 'Berlin', city: 'Berlin', county: 'Berlin', country: 'GER', lat: 52.52, lng: 13.40, notablePlayers: ['Qiu Dang', 'Benedikt Duda'], level: 'city' },
  { id: 'shandong', name: '山东魏桥', leagueId: 'pingchao', province: '山东省', city: '威海市', county: '乳山市', country: 'CHN', lat: 37.5, lng: 122.1, notablePlayers: ['WANG Chuqin', 'SUN Yingsha'], level: 'county' },
  { id: 'shanghai', name: '上海地产', leagueId: 'pingchao', province: '上海市', city: '上海市', county: '浦东新区', country: 'CHN', lat: 31.2, lng: 121.5, notablePlayers: ['XU Xin', 'Zhou Kai'], level: 'district' },
  { id: 'shenzhen', name: '深圳大学', leagueId: 'pingchao', province: '广东省', city: '深圳市', county: '南山区', country: 'CHN', lat: 22.54, lng: 114.06, notablePlayers: ['CHEN Meng', 'WANG Manyu'], level: 'district' },
  { id: 'ningbo', name: '宁波海曙', leagueId: 'pingchao', province: '浙江省', city: '宁波市', county: '海曙区', country: 'CHN', lat: 29.87, lng: 121.55, notablePlayers: ['YUAN Licen', 'CHEN Yuanyu'], level: 'district' },
  { id: 'huangshi', name: '黄石基地', leagueId: 'pingchao', province: '湖北省', city: '黄石市', county: '西塞山区', country: 'CHN', lat: 30.2, lng: 115.03, notablePlayers: ['LIN Shidong', 'KUAI Man'], level: 'district' },
  { id: 'weifang-sports', name: '潍坊体校', leagueId: 'pingchao', province: '山东省', city: '潍坊市', county: '奎文区', country: 'CHN', lat: 36.7, lng: 119.15, notablePlayers: ['WANG Manyu', 'CHEN Xingtong'], level: 'district' },
  { id: 'kinoshita', name: 'Kinoshita Meister Tokyo', leagueId: 't-league', province: 'Tokyo', city: 'Tokyo', county: 'Shinjuku', country: 'JPN', lat: 35.68, lng: 139.77, notablePlayers: ['HARIMOTO Tomokazu', 'HARIMOTO Miwa'], level: 'district' },
  { id: 'ryukyu', name: '琉球 Asteeda', leagueId: 't-league', province: 'Okinawa', city: 'Naha', county: 'Okinawa', country: 'JPN', lat: 26.21, lng: 127.68, notablePlayers: ['UDA Yoshito', 'MORI Hayato'], level: 'city' },
  { id: 'kawasaki', name: '川崎 Frontale', leagueId: 't-league', province: 'Kanagawa', city: 'Kawasaki', county: 'Kawasaki', country: 'JPN', lat: 35.53, lng: 139.70, notablePlayers: ['MIZUTANI Jun', 'MATSUDAIRA Kenta'], level: 'city' },
  { id: 'shizuoka', name: '静岡 Glanz', leagueId: 't-league', province: 'Shizuoka', city: 'Shizuoka', county: 'Shizuoka', country: 'JPN', lat: 34.98, lng: 138.38, notablePlayers: ['YOSHIMURA Maharu', 'ISHIKAWA Kasumi'], level: 'city' },
  { id: 'sendai-tt', name: '仙台 TT Club', leagueId: 't-league', province: 'Miyagi', city: 'Sendai', county: 'Sendai', country: 'JPN', lat: 38.26, lng: 140.87, notablePlayers: ['MIZUTANI Jun', 'YOSHIMURA Maharu'], level: 'city' },
  { id: 'seoul-tt', name: 'Seoul City TT Club', leagueId: 'k-league', province: 'Seoul', city: 'Seoul', county: 'Gangnam', country: 'KOR', lat: 37.5, lng: 127.0, notablePlayers: ['SHIN Yubin', 'OH Sang-uk'], level: 'district' },
  { id: 'busan-tt', name: 'Busan Maritime TT Club', leagueId: 'k-league', province: 'Busan', city: 'Busan', county: 'Haeundae', country: 'KOR', lat: 35.18, lng: 129.08, notablePlayers: ['JOO Se-kyung'], level: 'district' },
  { id: 'incheon-tt', name: 'Incheon Elite TT', leagueId: 'k-league', province: 'Incheon', city: 'Incheon', county: 'Namdong', country: 'KOR', lat: 37.46, lng: 126.70, notablePlayers: ['OH Sang-uk'], level: 'district' },
  { id: 'jeonju-tt', name: 'Jeonju Youth TT Center', leagueId: 'k-league', province: 'Jeollabuk-do', city: 'Jeonju', county: 'Wansan', country: 'KOR', lat: 35.82, lng: 127.15, notablePlayers: ['SHIN Yubin'], level: 'district' },
  { id: 'levallois', name: 'Levallois Sporting', leagueId: 'pro-a', city: 'Paris', country: 'FRA', lat: 48.89, lng: 2.29, notablePlayers: ['LEBRUN Felix'] },
  { id: 'sweden-elite', name: 'Eslöv AI', leagueId: 'ettu-cl', city: 'Eslöv', country: 'SWE', lat: 55.84, lng: 13.3, notablePlayers: ['MOREGARD Truls'] },
  { id: 'atlanta', name: 'Atlanta Blazers', leagueId: 'mltt', city: 'Atlanta', country: 'USA', lat: 33.75, lng: -84.39, notablePlayers: ['KANAK Jha'] },
];

export const CLUB_FIXTURES: ClubFixture[] = [
  {
    id: 'f-wtt-ms',
    leagueId: 'wtt',
    homeClub: 'WANG Chuqin',
    awayClub: 'LEBRUN Felix',
    status: 'live',
    score: '3-2',
    scheduledAt: new Date().toISOString(),
    spotlightPlayer: 'WANG Chuqin',
  },
  {
    id: 'f-wtt-ws',
    leagueId: 'wtt',
    homeClub: 'SUN Yingsha',
    awayClub: 'HAYATA Hina',
    status: 'live',
    score: '2-1',
    scheduledAt: new Date().toISOString(),
    spotlightPlayer: 'SUN Yingsha',
  },
  {
    id: 'f-ittf-ms',
    leagueId: 'ittf',
    homeClub: 'MOREGARD Truls',
    awayClub: 'HARIMOTO Tomokazu',
    status: 'finished',
    score: '4-3',
    scheduledAt: new Date(Date.now() - 3600000).toISOString(),
    spotlightPlayer: 'MOREGARD Truls',
  },
  {
    id: 'f-wtt-sched',
    leagueId: 'wtt',
    homeClub: 'WTT Champions Montpellier',
    awayClub: '男单 1/4 决赛',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 604800000).toISOString(),
    spotlightPlayer: 'WANG Chuqin',
  },
  {
    id: 'f-ittf-sched',
    leagueId: 'ittf',
    homeClub: 'ITTF Worlds 2026',
    awayClub: '休斯顿',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 2592000000).toISOString(),
  },
  {
    id: 'f-ttbl-fan',
    leagueId: 'ttbl',
    homeClub: '1. FC Saarbrücken-TT',
    awayClub: 'Borussia Düsseldorf',
    status: 'live',
    score: '6-5',
    scheduledAt: new Date().toISOString(),
    spotlightPlayer: 'FAN Zhendong',
  },
  {
    id: 'f-ttbl-2',
    leagueId: 'ttbl',
    homeClub: 'TTF Liebherr Ochsenhausen',
    awayClub: '1. FC Saarbrücken-TT',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 432000000).toISOString(),
    spotlightPlayer: 'FAN Zhendong',
  },
  { id: 'f1', leagueId: 'ttbl', homeClub: 'Grizzly Adams Mißbach', awayClub: 'Borussia Düsseldorf', status: 'finished', score: '8-4', scheduledAt: new Date(Date.now() - 86400000).toISOString() },
  {
    id: 'f-pingchao-live',
    leagueId: 'pingchao',
    homeClub: '山东魏桥',
    awayClub: '上海地产',
    status: 'live',
    score: '5-4',
    scheduledAt: new Date().toISOString(),
    spotlightPlayer: 'WANG Chuqin',
  },
  {
    id: 'f-pingchao-2',
    leagueId: 'pingchao',
    homeClub: '山东魏桥',
    awayClub: '深圳大学',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    spotlightPlayer: 'SUN Yingsha',
  },
  { id: 'f-pingchao-3', leagueId: 'pingchao', homeClub: '黄石基地', awayClub: '宁波海曙', status: 'finished', score: '6-3', scheduledAt: new Date(Date.now() - 172800000).toISOString() },
  {
    id: 'f-tleague-live',
    leagueId: 't-league',
    homeClub: 'Kinoshita Meister Tokyo',
    awayClub: '琉球 Asteeda',
    status: 'live',
    score: '7-5',
    scheduledAt: new Date().toISOString(),
    spotlightPlayer: 'HARIMOTO Tomokazu',
  },
  {
    id: 'f-tleague-2',
    leagueId: 't-league',
    homeClub: 'Kinoshita Meister Tokyo',
    awayClub: '川崎 Frontale',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 259200000).toISOString(),
    spotlightPlayer: 'HARIMOTO Miwa',
  },
  { id: 'f3', leagueId: 't-league', homeClub: '静岡 Glanz', awayClub: '川崎 Frontale', status: 'finished', score: '10-8', scheduledAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'f4', leagueId: 'pro-a', homeClub: 'Levallois Sporting', awayClub: 'Pontoise-Cergy TT', status: 'live', score: '3-2', scheduledAt: new Date().toISOString() },
  { id: 'f5', leagueId: 'mltt', homeClub: 'Atlanta Blazers', awayClub: 'Princeton Revolution', status: 'scheduled', scheduledAt: new Date(Date.now() + 172800000).toISOString() },
];

/** 重点赛事体系结构化战绩数据库（WTT / ITTF / 联赛） */
export const LEAGUE_STATS: LeagueStats[] = [
  {
    leagueId: 'wtt',
    season: '2026',
    matchesPlayed: 186,
    avgSetsPerMatch: 5.4,
    spotlight: {
      singlesWins: 18,
      singlesLosses: 2,
      singlesWinRate: 90,
      teamWins: 34,
      teamLosses: 3,
      teamWinRate: 92,
      form: ['W', 'W', 'W', 'W', 'L', 'W', 'W', 'W'],
    },
    standings: [
      { clubId: 'wtt-race-wcq', clubName: 'WANG Chuqin', wins: 18, losses: 2, winRate: 90, leaguePoints: 2850 },
      { clubId: 'wtt-race-har', clubName: 'HARIMOTO Tomokazu', wins: 15, losses: 4, winRate: 79, leaguePoints: 2340 },
      { clubId: 'wtt-race-mor', clubName: 'MOREGARD Truls', wins: 14, losses: 5, winRate: 74, leaguePoints: 2180 },
      { clubId: 'wtt-race-leb', clubName: 'LEBRUN Felix', wins: 13, losses: 6, winRate: 68, leaguePoints: 2050 },
      { clubId: 'wtt-race-sys', clubName: 'SUN Yingsha', wins: 16, losses: 1, winRate: 94, leaguePoints: 2720 },
    ],
    winRateTrend: [
      { round: 'R1', winRate: 85 },
      { round: 'R2', winRate: 88 },
      { round: 'R3', winRate: 91 },
      { round: 'R4', winRate: 89 },
      { round: 'R5', winRate: 92 },
      { round: 'R6', winRate: 90 },
      { round: 'R7', winRate: 90 },
    ],
  },
  {
    leagueId: 'ittf',
    season: '2026',
    matchesPlayed: 1240,
    avgSetsPerMatch: 5.1,
    spotlight: {
      singlesWins: 42,
      singlesLosses: 5,
      singlesWinRate: 89,
      teamWins: 28,
      teamLosses: 3,
      teamWinRate: 90,
      form: ['W', 'W', 'W', 'L', 'W', 'W', 'W', 'W'],
    },
    standings: [
      { clubId: 'ittf-chn', clubName: '中国 CHN', wins: 42, losses: 5, winRate: 89, leaguePoints: 98 },
      { clubId: 'ittf-jpn', clubName: '日本 JPN', wins: 31, losses: 12, winRate: 72, leaguePoints: 78 },
      { clubId: 'ittf-swe', clubName: '瑞典 SWE', wins: 28, losses: 14, winRate: 67, leaguePoints: 75 },
      { clubId: 'ittf-fra', clubName: '法国 FRA', wins: 26, losses: 16, winRate: 62, leaguePoints: 70 },
      { clubId: 'ittf-kor', clubName: '韩国 KOR', wins: 22, losses: 18, winRate: 55, leaguePoints: 58 },
    ],
    winRateTrend: [
      { round: 'Q1', winRate: 86 },
      { round: 'Q2', winRate: 88 },
      { round: 'Q3', winRate: 87 },
      { round: 'Q4', winRate: 90 },
      { round: 'Q5', winRate: 89 },
      { round: 'Q6', winRate: 91 },
      { round: 'Q7', winRate: 89 },
    ],
  },
  {
    leagueId: 'ttbl',
    season: '2025/26',
    matchesPlayed: 42,
    avgSetsPerMatch: 10.2,
    spotlight: {
      singlesWins: 8,
      singlesLosses: 1,
      singlesWinRate: 89,
      teamWins: 6,
      teamLosses: 1,
      teamWinRate: 86,
      form: ['W', 'W', 'W', 'L', 'W', 'W', 'W'],
    },
    standings: [
      { clubId: 'saarbrucken', clubName: '萨尔布吕肯', wins: 6, losses: 1, winRate: 86, leaguePoints: 12 },
      { clubId: 'borussia', clubName: '杜塞多夫', wins: 5, losses: 2, winRate: 71, leaguePoints: 10 },
      { clubId: 'bremen', clubName: '奥克森豪森', wins: 4, losses: 3, winRate: 57, leaguePoints: 8 },
      { clubId: 'grizzly', clubName: '米斯巴赫', wins: 3, losses: 4, winRate: 43, leaguePoints: 6 },
    ],
    winRateTrend: [
      { round: 'R1', winRate: 85 },
      { round: 'R2', winRate: 90 },
      { round: 'R3', winRate: 88 },
      { round: 'R4', winRate: 92 },
      { round: 'R5', winRate: 87 },
      { round: 'R6', winRate: 91 },
      { round: 'R7', winRate: 89 },
    ],
  },
  {
    leagueId: 'pingchao',
    season: '2026',
    matchesPlayed: 56,
    avgSetsPerMatch: 9.8,
    spotlight: {
      singlesWins: 14,
      singlesLosses: 2,
      singlesWinRate: 88,
      teamWins: 13,
      teamLosses: 1,
      teamWinRate: 93,
      form: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'L'],
    },
    standings: [
      { clubId: 'shandong', clubName: '山东魏桥', wins: 7, losses: 0, winRate: 100, leaguePoints: 14 },
      { clubId: 'shanghai', clubName: '上海地产', wins: 5, losses: 2, winRate: 71, leaguePoints: 10 },
      { clubId: 'shenzhen', clubName: '深圳大学', wins: 4, losses: 3, winRate: 57, leaguePoints: 8 },
      { clubId: 'huangshi', clubName: '黄石基地', wins: 3, losses: 4, winRate: 43, leaguePoints: 6 },
      { clubId: 'ningbo', clubName: '宁波海曙', wins: 2, losses: 5, winRate: 29, leaguePoints: 4 },
    ],
    winRateTrend: [
      { round: 'R1', winRate: 82 },
      { round: 'R2', winRate: 86 },
      { round: 'R3', winRate: 90 },
      { round: 'R4', winRate: 88 },
      { round: 'R5', winRate: 92 },
      { round: 'R6', winRate: 95 },
      { round: 'R7', winRate: 93 },
    ],
  },
  {
    leagueId: 't-league',
    season: '2025/26',
    matchesPlayed: 38,
    avgSetsPerMatch: 11.4,
    spotlight: {
      singlesWins: 11,
      singlesLosses: 3,
      singlesWinRate: 79,
      teamWins: 6,
      teamLosses: 1,
      teamWinRate: 86,
      form: ['W', 'W', 'L', 'W', 'W', 'W', 'W'],
    },
    standings: [
      { clubId: 'kinoshita', clubName: 'Kinoshita Tokyo', wins: 6, losses: 1, winRate: 86, leaguePoints: 12 },
      { clubId: 'ryukyu', clubName: '琉球 Asteeda', wins: 5, losses: 2, winRate: 71, leaguePoints: 10 },
      { clubId: 'kawasaki', clubName: '川崎 Frontale', wins: 4, losses: 3, winRate: 57, leaguePoints: 8 },
      { clubId: 'shizuoka', clubName: '静岡 Glanz', wins: 2, losses: 5, winRate: 29, leaguePoints: 4 },
    ],
    winRateTrend: [
      { round: 'R1', winRate: 72 },
      { round: 'R2', winRate: 75 },
      { round: 'R3', winRate: 78 },
      { round: 'R4', winRate: 74 },
      { round: 'R5', winRate: 80 },
      { round: 'R6', winRate: 82 },
      { round: 'R7', winRate: 79 },
    ],
  },
];

export const EQUIPMENT_TRENDS: EquipmentTrend[] = [
  { id: 'e1', category: 'rubber', title: '粘涩套胶混合趋势', brand: 'DHS / Butterfly', adoption: 78, trend: 'rising', lat: 35.86, lng: 104.19, region: '中国', summary: '正手粘胶 + 反手涩胶成为业余与职业主流配置，40+ 球时代旋转与速度平衡。' },
  { id: 'e2', category: 'blade', title: '外置芳碳底板渗透率上升', brand: 'Stiga / Yinhe', adoption: 65, trend: 'rising', lat: 59.33, lng: 18.07, region: '北欧', summary: 'Viscaria 类结构在青少年与成年选手中持续走高，借力打法适配现代塑料球。' },
  { id: 'e3', category: 'tech', title: 'AI 动作分析 App 普及', adoption: 42, trend: 'emerging', lat: 37.39, lng: -122.08, region: '北美', summary: '手机慢动作 + 姿态识别辅助启蒙教学，俱乐部青训营开始采用。' },
  { id: 'e4', category: 'ball', title: '无缝球训练用球占比', brand: 'Xushaofa', adoption: 55, trend: 'stable', lat: 23.13, lng: 113.26, region: '华南', summary: '训练用无缝球因圆度与耐用性在体校与俱乐部训练中占比提升。' },
  { id: 'e5', category: 'tech', title: '发球旋转可视化训练', adoption: 38, trend: 'rising', lat: 48.86, lng: 2.35, region: '欧洲', summary: '高速摄像 + LED 轨迹演示进入职业队日常，业余教程同步跟进。' },
  { id: 'e6', category: 'rubber', title: '中硬度海绵 (47.5–50°) 回归', brand: 'Tibhar / Nittaku', adoption: 61, trend: 'rising', lat: 52.52, lng: 13.41, region: '中欧', summary: '介于传统粘胶与纯涩胶之间，欧洲联赛选手反馈控球与进攻兼顾。' },
];

export const APPAREL_ITEMS: ApparelItem[] = [
  { id: 'a1', type: 'shoes', brand: 'Butterfly', model: 'Lezoline Mach 15', priceRange: '¥800–1200', trend: 'rising', summary: '轻量防滑，职业赛场出镜率高，业余选手跟风明显。', tags: ['专业', '防滑'] },
  { id: 'a2', type: 'shirt', brand: '李宁', model: '国家队比赛服 AAYT', priceRange: '¥200–400', trend: 'stable', summary: '速干面料 + 国家队配色，国内业余联赛统一采购热门。', tags: ['速干', '国服'] },
  { id: 'a3', type: 'shoes', brand: '美津浓', model: 'Wave Drive 9', priceRange: '¥600–900', trend: 'stable', summary: '日系俱乐部传统选择，中老年选手舒适度高。', tags: ['舒适', '宽楦'] },
  { id: 'a4', type: 'shorts', brand: 'Donic', model: 'Caliber', priceRange: '¥150–280', trend: 'stable', summary: '欧洲联赛常见，弹性面料适合步法训练。', tags: ['联赛'] },
  { id: 'a5', type: 'bag', brand: '双鱼', model: 'R型球拍包', priceRange: '¥120–200', trend: 'rising', summary: '6 拍位 + 球鞋仓，业余俱乐部团购首选。', tags: ['入门', '大容量'] },
  { id: 'a6', type: 'shoes', brand: '亚瑟士', model: 'Attack EXCOUNTER 2', priceRange: '¥500–750', trend: 'rising', summary: '青少年培训营推荐款，减震与侧向支撑均衡。', tags: ['青训', '减震'] },
];

export const LEARNING_MODULES: LearningModule[] = [
  { id: 'l1', level: 'beginner', title: '从零开始：握拍与站位', topics: ['横拍深握', '准备姿势', '重心转移'], duration: '15 分钟', source: '小韩老师', locale: 'zh' },
  { id: 'l2', level: 'beginner', title: '正手攻球基础', topics: ['引拍', '击球点', '收小臂'], duration: '20 分钟', source: 'ITTF High Performance', locale: 'en' },
  { id: 'l3', level: 'beginner', title: '反手拨球与推挡', topics: ['板形', '借力', '落点控制'], duration: '18 分钟', source: '乒乒乓乓', locale: 'zh' },
  { id: 'l4', level: 'intermediate', title: '发球入门：下旋与侧旋', topics: ['抛球', '摩擦', '假动作'], duration: '25 分钟', source: 'WTT Academy', locale: 'en' },
  { id: 'l5', level: 'intermediate', title: '步法：并步与交叉步', topics: ['单球练习', '两点攻', '还原'], duration: '22 分钟', source: '国家队教学片', locale: 'zh' },
  { id: 'l6', level: 'advanced', title: '弧圈球质量提升', topics: ['蹬转收', '薄摩擦', '二跳'], duration: '30 分钟', source: 'Ma Long 技术解析', locale: 'zh' },
];

export const PARTICIPATION_STATS: ParticipationStat[] = [
  { country: 'CHN', populationMillions: 24, activePlayersMillions: 85, registeredClubs: 12000, growthPct: 3.2, youthPct: 28, seniorPct: 22 },
  { country: 'JPN', populationMillions: 2.1, activePlayersMillions: 9.5, registeredClubs: 4200, growthPct: 4.1, youthPct: 35, seniorPct: 18 },
  { country: 'GER', populationMillions: 0.7, activePlayersMillions: 2.8, registeredClubs: 8900, growthPct: 1.8, youthPct: 22, seniorPct: 31 },
  { country: 'FRA', populationMillions: 0.55, activePlayersMillions: 2.1, registeredClubs: 3100, growthPct: 5.6, youthPct: 30, seniorPct: 15 },
  { country: 'SWE', populationMillions: 0.12, activePlayersMillions: 0.45, registeredClubs: 680, growthPct: 2.4, youthPct: 26, seniorPct: 24 },
  { country: 'KOR', populationMillions: 0.38, activePlayersMillions: 1.6, registeredClubs: 1200, growthPct: 1.2, youthPct: 32, seniorPct: 20 },
  { country: 'USA', populationMillions: 0.25, activePlayersMillions: 1.1, registeredClubs: 950, growthPct: 8.5, youthPct: 38, seniorPct: 12 },
  { country: 'BRA', populationMillions: 0.18, activePlayersMillions: 0.72, registeredClubs: 420, growthPct: 6.2, youthPct: 40, seniorPct: 10 },
];

/** 青少年 / 中老年赛事样本（补充 seed tournaments） */
export const GRASSROOTS_EVENTS = [
  { id: 'g1', name: '全国 U15 锦标赛', category: 'youth' as const, location: '石家庄', country: 'CHN', lat: 38.04, lng: 114.48, status: 'live' as const },
  { id: 'g2', name: 'ITTF World Veterans', category: 'veteran' as const, location: 'Rimini', country: 'ITA', lat: 44.07, lng: 12.57, status: 'upcoming' as const },
  { id: 'g3', name: '日本全中学生選手権', category: 'youth' as const, location: '大阪', country: 'JPN', lat: 34.69, lng: 135.5, status: 'live' as const },
  { id: 'g4', name: '欧洲中老年公开赛 50+', category: 'veteran' as const, location: 'Prague', country: 'CZE', lat: 50.08, lng: 14.44, status: 'upcoming' as const },
  { id: 'g5', name: '全国业余联赛 40+', category: 'veteran' as const, location: '广州', country: 'CHN', lat: 23.13, lng: 113.26, status: 'live' as const },
];
