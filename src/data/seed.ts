import type { Player, Signal, Tournament, LiveMatch, RankingMover } from '@/types';
import { NATION_HEAT_DATA, type RawNationHeat } from './nation-heat';
import { getAutoTournaments, getAutoLiveMatches } from './tournament-calendar';

export type RawCountryTPI = RawNationHeat;
export const COUNTRY_TPI = NATION_HEAT_DATA;

export const TOP_MEN: Player[] = [
  { id: 'm1', name: 'WANG Chuqin', country: 'CHN', gender: 'M', rank: 1, prevRank: 1, points: 10677, age: 25, style: '进攻型' },
  { id: 'm2', name: 'HARIMOTO Tomokazu', country: 'JPN', gender: 'M', rank: 2, prevRank: 3, points: 6333, age: 22, style: '快攻型' },
  { id: 'm3', name: 'MOREGARD Truls', country: 'SWE', gender: 'M', rank: 3, prevRank: 2, points: 6255, age: 23, style: '多变型' },
  { id: 'm4', name: 'LEBRUN Felix', country: 'FRA', gender: 'M', rank: 4, prevRank: 4, points: 5579, age: 21, style: '左手快攻' },
  { id: 'm5', name: 'LIN Shidong', country: 'CHN', gender: 'M', rank: 5, prevRank: 5, points: 5182, age: 20, style: '全面型' },
  { id: 'm6', name: 'MATSUSHIMA Sora', country: 'JPN', gender: 'M', rank: 6, prevRank: 8, points: 4598, age: 18, style: '新生代' },
  { id: 'm7', name: 'LIN Yun-Ju', country: 'TPE', gender: 'M', rank: 7, prevRank: 7, points: 4580, age: 23, style: '反手强势' },
  { id: 'm8', name: 'CALDERANO Hugo', country: 'BRA', gender: 'M', rank: 8, prevRank: 8, points: 4030, age: 28, style: '美洲一哥' },
];

export const TOP_WOMEN: Player[] = [
  { id: 'w1', name: 'SUN Yingsha', country: 'CHN', gender: 'W', rank: 1, prevRank: 1, points: 9875, age: 25, style: '正手暴力' },
  { id: 'w2', name: 'WANG Manyu', country: 'CHN', gender: 'W', rank: 2, prevRank: 2, points: 8865, age: 26, style: '全面型' },
  { id: 'w3', name: 'ZHU Yuling', country: 'CHN', gender: 'W', rank: 3, prevRank: 5, points: 5030, age: 29, style: '复出强势' },
  { id: 'w4', name: 'HARIMOTO Miwa', country: 'JPN', gender: 'W', rank: 4, prevRank: 3, points: 4889, age: 17, style: '青少年天才' },
  { id: 'w5', name: 'CHEN Xingtong', country: 'CHN', gender: 'W', rank: 5, prevRank: 5, points: 4395, age: 28, style: '稳定型' },
  { id: 'w6', name: 'HAYATA Hina', country: 'JPN', gender: 'W', rank: 10, prevRank: 12, points: 3665, age: 24, style: '上升期' },
  { id: 'w7', name: 'SHIN Yubin', country: 'KOR', gender: 'W', rank: 15, prevRank: 18, points: 2100, age: 20, style: '韩国新星' },
];

export const SIGNALS: Signal[] = [
  {
    id: 's-wtt-ms',
    type: 'result',
    title: 'WTT 美国大满贯：王楚钦强势晋级，林诗栋同步过关',
    source: 'WTT',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    countries: ['CHN', 'FRA'],
    severity: 'high',
  },
  {
    id: 's-wtt-ws',
    type: 'result',
    title: 'WTT 美国大满贯：孙颖莎卫冕女单冠军，王曼昱/蒯曼夺女双',
    source: 'WTT',
    timestamp: new Date(Date.now() - 420000).toISOString(),
    countries: ['CHN', 'JPN'],
    severity: 'high',
  },
  {
    id: 's-ittf-rank',
    type: 'ranking',
    title: 'ITTF 最新排名：王楚钦、孙颖莎继续领跑男女单打世界第一',
    source: 'ITTF Ranking',
    timestamp: new Date(Date.now() - 540000).toISOString(),
    countries: ['CHN'],
    severity: 'medium',
  },
  {
    id: 's-tleague',
    type: 'result',
    title: 'T联赛焦点战：张本智和 3-2 宇田幸矢，Kinoshita Tokyo 7-5 领先琉球',
    source: 'T-League',
    timestamp: new Date(Date.now() - 480000).toISOString(),
    countries: ['JPN'],
    severity: 'high',
  },
  {
    id: 's-pingchao',
    type: 'result',
    title: '乒超焦点战：王楚钦 3-1 许昕，山东魏桥 5-4 险胜上海地产',
    source: '乒超',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    countries: ['CHN'],
    severity: 'high',
  },
  {
    id: 's10',
    type: 'result',
    title: '德甲焦点战：樊振东 3-1 击败邱党，萨尔布吕肯 6-5 领先杜塞多夫',
    source: 'TTBL',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    countries: ['GER', 'CHN'],
    severity: 'high',
  },
  {
    id: 's5',
    type: 'transfer',
    title: '樊振东加盟萨尔布吕肯征战德甲 TTBL，首秀即取单打两分',
    source: 'TTBL',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    countries: ['GER', 'CHN'],
    severity: 'high',
  },
  {
    id: 's1',
    type: 'upset',
    title: 'MOREGARD 3-2 逆转 HARIMOTO，WTT 大满贯男单半决赛',
    source: 'WTT',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    countries: ['SWE', 'JPN'],
    severity: 'high',
  },
  {
    id: 's2',
    type: 'ranking',
    title: 'HARIMOTO Tomokazu 升至世界第二，超越 MOREGARD',
    source: 'ITTF Ranking',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    countries: ['JPN'],
    severity: 'medium',
  },
  {
    id: 's3',
    type: 'news',
    title: 'ITTF 宣布 2027 世乒赛主办城市候选名单公布',
    source: 'ITTF',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    countries: ['CHN', 'GER'],
    severity: 'low',
  },
  {
    id: 's4',
    type: 'result',
    title: 'SUN Yingsha 4-0 横扫晋级 WTT 女单决赛',
    source: 'WTT',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    countries: ['CHN'],
    severity: 'medium',
  },
  {
    id: 's6',
    type: 'injury',
    title: 'KOR 主力选手因伤退出本周 WTT 系列赛',
    source: 'KTA',
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    countries: ['KOR'],
    severity: 'medium',
  },
  {
    id: 's7',
    type: 'grassroots',
    title: '全国 U15 锦标赛男单四强产生，青训梯队竞争白热化',
    source: '中国乒协',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    countries: ['CHN'],
    severity: 'medium',
  },
  {
    id: 's8',
    type: 'grassroots',
    title: '欧洲中老年公开赛 50+ 报名破纪录，业余参与率持续走高',
    source: 'ETTU Veterans',
    timestamp: new Date(Date.now() - 9000000).toISOString(),
    countries: ['GER', 'FRA'],
    severity: 'low',
  },
  {
    id: 's9',
    type: 'equipment',
    title: '蝴蝶 Lezoline Mach 15 成为本月业余鞋类销量冠军',
    source: '装备情报',
    timestamp: new Date(Date.now() - 12600000).toISOString(),
    countries: ['CHN', 'JPN'],
    severity: 'low',
  },
  {
    id: 's11',
    type: 'equipment',
    title: '外置芳碳底板在 U18 选手中使用率首超 60%',
    source: 'Tudor.org',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    countries: ['SWE', 'CHN'],
    severity: 'low',
  },
];

/** @deprecated 请优先使用 getAutoTournaments()；保留导出以兼容旧引用，内容按日期自动刷新 */
export const TOURNAMENTS: Tournament[] = getAutoTournaments();

/** 直播比分随当前焦点赛事自动切换（见 getAutoLiveMatches） */
export const LIVE_MATCHES: LiveMatch[] = getAutoLiveMatches();

export const RANKING_MOVERS: RankingMover[] = [
  { player: 'HARIMOTO Tomokazu', country: 'JPN', gender: 'M', change: 1, newRank: 2, reason: 'WTT 美国大满贯四强' },
  { player: 'MATSUSHIMA Sora', country: 'JPN', gender: 'M', change: 2, newRank: 6, reason: '青少年赛事积分' },
  { player: 'ZHU Yuling', country: 'CHN', gender: 'W', change: 2, newRank: 3, reason: '复出后连胜' },
  { player: 'HAYATA Hina', country: 'JPN', gender: 'W', change: 2, newRank: 10, reason: '半决赛表现' },
  { player: 'MOREGARD Truls', country: 'SWE', gender: 'M', change: -1, newRank: 3, reason: '被 HARIMOTO 超越' },
];

export const FEED_SOURCES = [
  { name: 'ITTF', count: 45, category: '官方' },
  { name: 'WTT', count: 38, category: '赛事' },
  { name: 'Table Tennis Daily', count: 22, category: '媒体' },
  { name: 'Tudor.org', count: 18, category: '数据' },
  { name: '新浪体育', count: 15, category: '中文' },
  { name: '腾讯体育', count: 12, category: '中文' },
  { name: '卓球王国', count: 10, category: '日文' },
  { name: 'TTBL', count: 8, category: '联赛' },
  { name: '乒超', count: 6, category: '联赛' },
  { name: 'T-League', count: 5, category: '联赛' },
  { name: '装备情报', count: 14, category: '器材' },
  { name: '青训观察', count: 9, category: '青少年' },
];
