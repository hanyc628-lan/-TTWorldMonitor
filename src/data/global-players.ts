import type { Player } from '@/types';

/**
 * 全球球员数据库 - 涵盖所有国家、多个年龄段、不同竞技水平
 * 结构：每个国家包含一个"国家代表"球员，并按地区分类
 */

// ============ 亚洲 ============

/** 中国：王楚钦 - 进攻型顶级高手，WTT新秀领军人物 */
export const CHINA_PLAYERS: Player[] = [
  // 职业顶级
  { id: 'cn-wpp', name: 'WANG Chuqin', nameZh: '王楚钦', country: 'CHN', gender: 'M', rank: 1, prevRank: 1, points: 10677, age: 25, style: '进攻型', ageGroup: 'senior' },
  { id: 'cn-sys', name: 'SUN Yingsha', nameZh: '孙颖莎', country: 'CHN', gender: 'W', rank: 1, prevRank: 1, points: 9875, age: 25, style: '正手暴力', ageGroup: 'senior' },
  { id: 'cn-lsd', name: 'LIN Shidong', nameZh: '林诗栋', country: 'CHN', gender: 'M', rank: 5, prevRank: 5, points: 5182, age: 20, style: '全面型', ageGroup: 'u23' },
  { id: 'cn-cm', name: 'CHEN Meng', nameZh: '陈梦', country: 'CHN', gender: 'W', rank: 6, prevRank: 8, points: 3998, age: 30, style: '稳健型', ageGroup: 'senior' },
  { id: 'cn-wmy', name: 'WANG Manyu', nameZh: '王曼昱', country: 'CHN', gender: 'W', rank: 2, prevRank: 2, points: 8865, age: 26, style: '全面型', ageGroup: 'senior' },
  // 青少年新星
  { id: 'cn-hsz', name: 'HE Shuang', nameZh: '何爽', country: 'CHN', gender: 'M', rank: 35, prevRank: 42, points: 2188, age: 15, style: '快攻型', ageGroup: 'u18' },
  { id: 'cn-wqy', name: 'WANG Qiyu', nameZh: '王琪钰', country: 'CHN', gender: 'W', rank: 28, prevRank: 34, points: 2456, age: 16, style: '多变型', ageGroup: 'u18' },
  // 退役传奇
  { id: 'cn-zyx', name: 'ZHANG Yining', nameZh: '张怡宁', country: 'CHN', gender: 'W', rank: -1, prevRank: 1, points: 0, age: 42, style: '乒坛皇后', ageGroup: 'veteran' },
];

/** 日本：张本智和 - 快攻新生代，亚洲第二强国领袖 */
export const JAPAN_PLAYERS: Player[] = [
  { id: 'jp-ht', name: 'HARIMOTO Tomokazu', nameZh: '张本智和', country: 'JPN', gender: 'M', rank: 2, prevRank: 3, points: 6333, age: 22, style: '快攻型', ageGroup: 'senior' },
  { id: 'jp-hm', name: 'HARIMOTO Miwa', nameZh: '张本美和', country: 'JPN', gender: 'W', rank: 4, prevRank: 3, points: 4889, age: 17, style: '青少年天才', ageGroup: 'u18' },
  { id: 'jp-hh', name: 'HAYATA Hina', nameZh: '早田希娜', country: 'JPN', gender: 'W', rank: 10, prevRank: 12, points: 3665, age: 24, style: '上升期', ageGroup: 'senior' },
  { id: 'jp-ms', name: 'MATSUSHIMA Sora', nameZh: '松岛颂太', country: 'JPN', gender: 'M', rank: 6, prevRank: 8, points: 4598, age: 18, style: '新生代', ageGroup: 'u18' },
  { id: 'jp-my', name: 'MIZUTANI Jun', nameZh: '水谷隼', country: 'JPN', gender: 'M', rank: 32, prevRank: 28, points: 2345, age: 36, style: '全能型', ageGroup: 'veteran' },
];

/** 韩国：申瑜彬 - 新星崛起，朝鲜半岛乒乓未来 */
export const KOREA_PLAYERS: Player[] = [
  { id: 'kr-syb', name: 'SHIN Yubin', nameZh: '申瑜彬', country: 'KOR', gender: 'W', rank: 15, prevRank: 18, points: 2100, age: 20, style: '韩国新星', ageGroup: 'u23' },
  { id: 'kr-jsk', name: 'JOO Se-kyung', nameZh: '朱世景', country: 'KOR', gender: 'W', rank: 42, prevRank: 38, points: 1876, age: 23, style: '攻防平衡', ageGroup: 'senior' },
  { id: 'kr-om', name: 'OH Sang-uk', nameZh: '卓相郁', country: 'KOR', gender: 'M', rank: 48, prevRank: 51, points: 1654, age: 25, style: '左手弧圈', ageGroup: 'senior' },
];

/** 中华台北：林昀儒 - 正手强势，台湾乒乓新世代 */
export const TAIPEI_PLAYERS: Player[] = [
  { id: 'tp-lyj', name: 'LIN Yun-Ju', nameZh: '林昀儒', country: 'TPE', gender: 'M', rank: 7, prevRank: 7, points: 4580, age: 23, style: '反手强势', ageGroup: 'senior' },
  { id: 'tp-cwh', name: 'CHANG Chia-Hung', nameZh: '郑怡静', country: 'TPE', gender: 'W', rank: 21, prevRank: 19, points: 2876, age: 29, style: '稳定进攻', ageGroup: 'senior' },
];

/** 香港：黄镇廷 - 多面手，粤港澳乒乓枢纽 */
export const HONG_KONG_PLAYERS: Player[] = [
  { id: 'hk-hzt', name: 'WONG Chun Ting', nameZh: '黄镇廷', country: 'HKG', gender: 'M', rank: 24, prevRank: 26, points: 2567, age: 28, style: '多变型', ageGroup: 'senior' },
  { id: 'hk-dlj', name: 'DOU Yingjiao', nameZh: '杜英杰', country: 'HKG', gender: 'W', rank: 38, prevRank: 41, points: 1923, age: 22, style: '速度型', ageGroup: 'u23' },
];

/** 新加坡：冯天薇 - 东南亚乒乓领袖，WTT赛事中心 */
export const SINGAPORE_PLAYERS: Player[] = [
  { id: 'sg-ftw', name: 'FENG Tianwei', nameZh: '冯天薇', country: 'SGP', gender: 'W', rank: 27, prevRank: 25, points: 2643, age: 35, style: '全能型', ageGroup: 'veteran' },
  { id: 'sg-yy', name: 'YU Mengyu', nameZh: '于梦雨', country: 'SGP', gender: 'W', rank: 44, prevRank: 46, points: 1798, age: 24, style: '新生代', ageGroup: 'senior' },
];

/** 泰国：苏帕克·萨维卡斯 - 东南亚之光 */
export const THAILAND_PLAYERS: Player[] = [
  { id: 'th-sp', name: 'SUPAK Sawikaset', nameZh: '苏帕克', country: 'THA', gender: 'M', rank: 89, prevRank: 94, points: 945, age: 24, style: '快攻型', ageGroup: 'senior' },
];

/** 越南：范廷钰 - 新兴力量 */
export const VIETNAM_PLAYERS: Player[] = [
  { id: 'vn-fty', name: 'PHAM Tien Yu', nameZh: '范廷钰', country: 'VNM', gender: 'M', rank: 112, prevRank: 118, points: 654, age: 20, style: '全面型', ageGroup: 'u23' },
];

/** 马来西亚：周一涵 - 东南亚老将 */
export const MALAYSIA_PLAYERS: Player[] = [
  { id: 'my-zyh', name: 'CHOU Tien-Chen', nameZh: '周一涵', country: 'MYS', gender: 'M', rank: 68, prevRank: 72, points: 1432, age: 31, style: '全能型', ageGroup: 'veteran' },
];

/** 印度：莎米尔·法鲁基 - 南亚新苗 */
export const INDIA_PLAYERS: Player[] = [
  { id: 'in-sf', name: 'SHAMIR Farooqi', nameZh: '莎米尔', country: 'IND', gender: 'M', rank: 134, prevRank: 142, points: 487, age: 19, style: '快攻型', ageGroup: 'u23' },
  { id: 'in-mm', name: 'MANIKA Medha', nameZh: '玛妮卡', country: 'IND', gender: 'W', rank: 58, prevRank: 61, points: 1654, age: 23, style: '进攻型', ageGroup: 'senior' },
];

// ============ 欧洲 ============

/** 瑞典：莫雷高德 - 北欧悍将，多变风格大师 */
export const SWEDEN_PLAYERS: Player[] = [
  { id: 'se-mt', name: 'MOREGARD Truls', nameZh: '莫雷高德', country: 'SWE', gender: 'M', rank: 3, prevRank: 2, points: 6255, age: 23, style: '多变型', ageGroup: 'senior' },
  { id: 'se-ct', name: 'CHRISTOFFERSSON Torsten', nameZh: '克里斯托弗松', country: 'SWE', gender: 'M', rank: 55, prevRank: 59, points: 1567, age: 34, style: '防守型', ageGroup: 'veteran' },
];

/** 法国：费利克斯·勒布伦 - 欧洲新生代领袖 */
export const FRANCE_PLAYERS: Player[] = [
  { id: 'fr-fl', name: 'LEBRUN Felix', nameZh: '勒布伦', country: 'FRA', gender: 'M', rank: 4, prevRank: 4, points: 5579, age: 21, style: '左手快攻', ageGroup: 'u23' },
  { id: 'fr-al', name: 'LEBRUN Alexis', nameZh: '勒布伦（兄）', country: 'FRA', gender: 'M', rank: 18, prevRank: 16, points: 3234, age: 23, style: '左手多变', ageGroup: 'senior' },
  { id: 'fr-al-w', name: 'LEBRUN Alice', nameZh: '勒布伦（妹）', country: 'FRA', gender: 'W', rank: 33, prevRank: 37, points: 2145, age: 20, style: '全能型', ageGroup: 'u23' },
];

/** 德国：樊振东客座 + 帕特里克·弗朗茨斯卡 - 欧洲乒乓中心 */
export const GERMANY_PLAYERS: Player[] = [
  { id: 'de-pf', name: 'Patrick FRANZISKA', nameZh: '弗朗茨斯卡', country: 'GER', gender: 'M', rank: 11, prevRank: 13, points: 3876, age: 28, style: '削攻型', ageGroup: 'senior' },
  { id: 'de-bd', name: 'Benedikt DUDA', nameZh: '杜达', country: 'GER', gender: 'M', rank: 37, prevRank: 39, points: 2087, age: 26, style: '快攻型', ageGroup: 'senior' },
  { id: 'de-djlw', name: 'Dolya JORGIC', nameZh: '约尔基奇', country: 'GER', gender: 'M', rank: 52, prevRank: 54, points: 1743, age: 31, style: '削攻型', ageGroup: 'veteran' },
];

/** 英国：杰克·皮彻福德 - 英伦乒乓新力量 */
export const UK_PLAYERS: Player[] = [
  { id: 'gb-jp', name: 'Jack PICKERALL', nameZh: '皮彻福德', country: 'GBR', gender: 'M', rank: 96, prevRank: 101, points: 823, age: 21, style: '全面型', ageGroup: 'u23' },
  { id: 'gb-em', name: 'Erin MOORE', nameZh: '埃琳·摩尔', country: 'GBR', gender: 'W', rank: 84, prevRank: 89, points: 967, age: 26, style: '进攻型', ageGroup: 'senior' },
];

/** 葡萄牙：科斯塔斯·帕帕克里斯托斯 - 欧洲削球大师 */
export const PORTUGAL_PLAYERS: Player[] = [
  { id: 'pt-kp', name: 'Konstantinos PAPAKRISTOS', nameZh: '帕帕克里斯托斯', country: 'POR', gender: 'M', rank: 74, prevRank: 78, points: 1298, age: 34, style: '削球型', ageGroup: 'veteran' },
];

/** 西班牙：日韦罗 - 伊比利亚乒乓传奇 */
export const SPAIN_PLAYERS: Player[] = [
  { id: 'es-rg', name: 'Alvaro ROBLES', nameZh: '罗沃尔', country: 'ESP', gender: 'M', rank: 41, prevRank: 43, points: 1987, age: 27, style: '进攻型', ageGroup: 'senior' },
  { id: 'es-jl', name: 'GALVIS Juan', nameZh: '加尔维斯', country: 'ESP', gender: 'M', rank: 120, prevRank: 125, points: 561, age: 22, style: '快攻型', ageGroup: 'u23' },
];

/** 奥地利：克劳迪娅·菲尔 - 中欧女将 */
export const AUSTRIA_PLAYERS: Player[] = [
  { id: 'at-cf', name: 'Claudia FIEL', nameZh: '菲尔', country: 'AUT', gender: 'W', rank: 95, prevRank: 98, points: 876, age: 24, style: '全面型', ageGroup: 'senior' },
];

/** 波兰：多米尼克·库赫尔斯基 - 中欧快攻手 */
export const POLAND_PLAYERS: Player[] = [
  { id: 'pl-dk', name: 'Dominik KUCHARSKI', nameZh: '库赫尔斯基', country: 'POL', gender: 'M', rank: 87, prevRank: 92, points: 954, age: 23, style: '快攻型', ageGroup: 'u23' },
];

/** 捷克：帕维尔·斯莱帕克 - 中欧老将 */
export const CZECHIA_PLAYERS: Player[] = [
  { id: 'cz-ps', name: 'Pavel SLEPACEK', nameZh: '斯莱帕克', country: 'CZE', gender: 'M', rank: 109, prevRank: 113, points: 698, age: 38, style: '全能型', ageGroup: 'veteran' },
];

/** 罗马尼亚：基里娅·茨威 - 欧洲女将 */
export const ROMANIA_PLAYERS: Player[] = [
  { id: 'ro-kt', name: 'Kiria TSUBAKI', nameZh: '茨威', country: 'ROU', gender: 'W', rank: 76, prevRank: 81, points: 1154, age: 25, style: '进攻型', ageGroup: 'senior' },
];

/** 匈牙利：帕蒂亚基斯 - 东欧传统强国 */
export const HUNGARY_PLAYERS: Player[] = [
  { id: 'hu-pt', name: 'PATTIAKIS', nameZh: '帕蒂亚基斯', country: 'HUN', gender: 'M', rank: 82, prevRank: 86, points: 1032, age: 29, style: '多变型', ageGroup: 'senior' },
];

/** 意大利：德尼索瓦 - 地中海风格 */
export const ITALY_PLAYERS: Player[] = [
  { id: 'it-ad', name: 'Andriy DENYSENKO', nameZh: '德尼索瓦', country: 'ITA', gender: 'M', rank: 71, prevRank: 75, points: 1376, age: 32, style: '削攻型', ageGroup: 'veteran' },
];

/** 荷兰：蒂姆·贝尔特尔斯 - 低地国家新星 */
export const NETHERLANDS_PLAYERS: Player[] = [
  { id: 'nl-tb', name: 'Tim BELTRAN', nameZh: '贝尔特尔斯', country: 'NED', gender: 'M', rank: 103, prevRank: 108, points: 745, age: 20, style: '快攻型', ageGroup: 'u23' },
];

/** 比利时：西蒙·加迪亚诺 - 低地女将 */
export const BELGIUM_PLAYERS: Player[] = [
  { id: 'be-sg', name: 'Sylvain GARDIA', nameZh: '加迪亚诺', country: 'BEL', gender: 'M', rank: 98, prevRank: 102, points: 812, age: 27, style: '进攻型', ageGroup: 'senior' },
];

/** 丹麦：劳恩达尔·桑德 - 北欧多面手 */
export const DENMARK_PLAYERS: Player[] = [
  { id: 'dk-ls', name: 'Ligaholm SANDER', nameZh: '桑德', country: 'DEN', gender: 'M', rank: 105, prevRank: 110, points: 701, age: 24, style: '全面型', ageGroup: 'senior' },
];

/** 乌克兰：格列巴诺夫 - 东欧强手 */
export const UKRAINE_PLAYERS: Player[] = [
  { id: 'uk-vg', name: 'Volodymyr GREBANKOV', nameZh: '格列巴诺夫', country: 'UKR', gender: 'M', rank: 51, prevRank: 49, points: 1876, age: 29, style: '削攻型', ageGroup: 'senior' },
];

/** 克罗地亚：维利齐 - 巴尔干乒乓 */
export const CROATIA_PLAYERS: Player[] = [
  { id: 'hr-mv', name: 'Marko VELICKOVIC', nameZh: '维利齐', country: 'CRO', gender: 'M', rank: 94, prevRank: 99, points: 891, age: 26, style: '全能型', ageGroup: 'senior' },
];

/** 斯洛伐克：比西亚克 - 中欧青年 */
export const SLOVAKIA_PLAYERS: Player[] = [
  { id: 'sk-ab', name: 'Alexander BISIAK', nameZh: '比西亚克', country: 'SVK', gender: 'M', rank: 111, prevRank: 116, points: 619, age: 19, style: '快攻型', ageGroup: 'u18' },
];

// ============ 美洲 ============

/** 美国：卡纳克·贾 - 美洲新希望 */
export const USA_PLAYERS: Player[] = [
  { id: 'us-kj', name: 'KANAK Jha', nameZh: '卡纳克·贾', country: 'USA', gender: 'M', rank: 64, prevRank: 67, points: 1598, age: 22, style: '全面型', ageGroup: 'u23' },
  { id: 'us-aj', name: 'ARNOLD JOHNSON', nameZh: '约翰逊', country: 'USA', gender: 'M', rank: 122, prevRank: 128, points: 502, age: 20, style: '快攻型', ageGroup: 'u23' },
  { id: 'us-mp', name: 'Mchel PICHARDO', nameZh: '皮查多', country: 'USA', gender: 'W', rank: 115, prevRank: 121, points: 598, age: 21, style: '进攻型', ageGroup: 'u23' },
];

/** 加拿大：张默涵 - 北美华裔新星 */
export const CANADA_PLAYERS: Player[] = [
  { id: 'ca-zmh', name: 'Mohe ZHANG', nameZh: '张默涵', country: 'CAN', gender: 'M', rank: 79, prevRank: 83, points: 1123, age: 23, style: '全面型', ageGroup: 'senior' },
  { id: 'ca-am', name: 'Adriana DIAZ', nameZh: '迪亚兹', country: 'CAN', gender: 'W', rank: 101, prevRank: 106, points: 764, age: 24, style: '进攻型', ageGroup: 'senior' },
];

/** 巴西：卡尔德拉诺 - 美洲乒乓旗手 */
export const BRAZIL_PLAYERS: Player[] = [
  { id: 'br-hc', name: 'CALDERANO Hugo', nameZh: '卡尔德拉诺', country: 'BRA', gender: 'M', rank: 8, prevRank: 8, points: 4030, age: 28, style: '美洲一哥', ageGroup: 'senior' },
  { id: 'br-gr', name: 'GUSMAN Raiza', nameZh: '古斯曼', country: 'BRA', gender: 'W', rank: 69, prevRank: 73, points: 1287, age: 25, style: '进攻型', ageGroup: 'senior' },
];

/** 阿根廷：拉维 - 南美古老传统 */
export const ARGENTINA_PLAYERS: Player[] = [
  { id: 'ar-sl', name: 'Sergio LEMOS', nameZh: '莱莫斯', country: 'ARG', gender: 'M', rank: 126, prevRank: 131, points: 445, age: 27, style: '全能型', ageGroup: 'senior' },
];

/** 墨西哥：门德斯 - 中美新苗 */
export const MEXICO_PLAYERS: Player[] = [
  { id: 'mx-jm', name: 'JEANNIE MARTINEZ', nameZh: '门德斯', country: 'MEX', gender: 'W', rank: 118, prevRank: 124, points: 573, age: 20, style: '快攻型', ageGroup: 'u23' },
];

// ============ 非洲 ============

/** 埃及：阿赫迈德·巴拉卡 - 非洲乒乓先驱 */
export const EGYPT_PLAYERS: Player[] = [
  { id: 'eg-ab', name: 'Ahmed BARAKA', nameZh: '巴拉卡', country: 'EGY', gender: 'M', rank: 91, prevRank: 95, points: 912, age: 28, style: '多变型', ageGroup: 'senior' },
];

/** 尼日利亚：阿德蒙坎 - 西非力量 */
export const NIGERIA_PLAYERS: Player[] = [
  { id: 'ng-ao', name: 'Akinwande OLUFUNWA', nameZh: '阿德蒙坎', country: 'NGR', gender: 'M', rank: 136, prevRank: 141, points: 408, age: 23, style: '全面型', ageGroup: 'senior' },
];

/** 南非：特隆普 - 南部非洲代表 */
export const SOUTH_AFRICA_PLAYERS: Player[] = [
  { id: 'za-ct', name: 'Charysse THORPE', nameZh: '特隆普', country: 'ZAF', gender: 'W', rank: 97, prevRank: 103, points: 843, age: 26, style: '进攻型', ageGroup: 'senior' },
];

// ============ 大洋洲 ============

/** 澳大利亚：宗玲雯 - 太平洋女将 */
export const AUSTRALIA_PLAYERS: Player[] = [
  { id: 'au-yw', name: 'Yangzi WANG', nameZh: '王昱茜', country: 'AUS', gender: 'W', rank: 114, prevRank: 119, points: 607, age: 22, style: '进攻型', ageGroup: 'u23' },
  { id: 'au-nc', name: 'Nicholas CONDE', nameZh: '康德', country: 'AUS', gender: 'M', rank: 128, prevRank: 134, points: 419, age: 24, style: '全面型', ageGroup: 'senior' },
];

/** 新西兰：帕蒂亚基斯 - 太平洋男将 */
export const NEW_ZEALAND_PLAYERS: Player[] = [
  { id: 'nz-ll', name: 'Liam LAKER', nameZh: '莱克', country: 'NZL', gender: 'M', rank: 140, prevRank: 145, points: 352, age: 20, style: '快攻型', ageGroup: 'u23' },
];

// ============ 中亚 ============

/** 伊朗：艾哈迈德·豪扎迪 - 西亚乒乓旗手 */
export const IRAN_PLAYERS: Player[] = [
  { id: 'ir-ah', name: 'Ahmad HEYDAR', nameZh: '海达尔', country: 'IRN', gender: 'M', rank: 86, prevRank: 90, points: 1001, age: 31, style: '削攻型', ageGroup: 'veteran' },
  { id: 'ir-nm', name: 'Noshadi MAROUKHIAN', nameZh: '玛鲁基安', country: 'IRN', gender: 'W', rank: 125, prevRank: 130, points: 472, age: 25, style: '进攻型', ageGroup: 'senior' },
];

/** 土耳其：吉哈内·阿伦 - 欧亚交界新星 */
export const TURKEY_PLAYERS: Player[] = [
  { id: 'tr-ga', name: 'Gihane AYTEKIN', nameZh: '阿伦', country: 'TUR', gender: 'W', rank: 119, prevRank: 124, points: 546, age: 23, style: '全面型', ageGroup: 'senior' },
];

/**
 * 全球球员年龄段分布
 * 用于构建"每个年龄段"的视角
 */
export const PLAYERS_BY_AGE_GROUP = {
  u18: [
    JAPAN_PLAYERS[1], // 张本美和
    JAPAN_PLAYERS[3], // 松岛颂太
    CHINA_PLAYERS[5], // 何爽
    CHINA_PLAYERS[6], // 王琪钰
    SLOVAKIA_PLAYERS[0], // 比西亚克
  ],
  u23: [
    CHINA_PLAYERS[2], // 林诗栋
    KOREA_PLAYERS[0], // 申瑜彬
    FRANCE_PLAYERS[0], // 勒布伦
    FRANCE_PLAYERS[2], // 勒布伦妹
    VIETNAM_PLAYERS[0], // 范廷钰
    USA_PLAYERS[1], // 约翰逊
    USA_PLAYERS[2], // 皮查多
    MEXICO_PLAYERS[0], // 门德斯
  ],
  senior: [
    CHINA_PLAYERS[0], // 王楚钦
    CHINA_PLAYERS[1], // 孙颖莎
    JAPAN_PLAYERS[0], // 张本智和
    KOREA_PLAYERS[1], // 朱世景
    KOREA_PLAYERS[2], // 卓相郁
    TAIPEI_PLAYERS[0], // 林昀儒
    TAIPEI_PLAYERS[1], // 郑怡静
    HONG_KONG_PLAYERS[0], // 黄镇廷
    HONG_KONG_PLAYERS[1], // 杜英杰
    SINGAPORE_PLAYERS[0], // 冯天薇
    SINGAPORE_PLAYERS[1], // 于梦雨
  ],
  veteran: [
    CHINA_PLAYERS[4], // 张怡宁
    JAPAN_PLAYERS[4], // 水谷隼
    SWEDEN_PLAYERS[1], // 克里斯托弗松
  ],
};

/**
 * 导出所有地区球员集合
 */
export const GLOBAL_PLAYERS_BY_COUNTRY = {
  CHN: CHINA_PLAYERS,
  JPN: JAPAN_PLAYERS,
  KOR: KOREA_PLAYERS,
  TPE: TAIPEI_PLAYERS,
  HKG: HONG_KONG_PLAYERS,
  SGP: SINGAPORE_PLAYERS,
  THA: THAILAND_PLAYERS,
  VNM: VIETNAM_PLAYERS,
  MYS: MALAYSIA_PLAYERS,
  IND: INDIA_PLAYERS,
  SWE: SWEDEN_PLAYERS,
  FRA: FRANCE_PLAYERS,
  GER: GERMANY_PLAYERS,
  GBR: UK_PLAYERS,
  POR: PORTUGAL_PLAYERS,
  ESP: SPAIN_PLAYERS,
  AUT: AUSTRIA_PLAYERS,
  POL: POLAND_PLAYERS,
  CZE: CZECHIA_PLAYERS,
  ROU: ROMANIA_PLAYERS,
  HUN: HUNGARY_PLAYERS,
  ITA: ITALY_PLAYERS,
  NED: NETHERLANDS_PLAYERS,
  BEL: BELGIUM_PLAYERS,
  DEN: DENMARK_PLAYERS,
  UKR: UKRAINE_PLAYERS,
  CRO: CROATIA_PLAYERS,
  SVK: SLOVAKIA_PLAYERS,
  USA: USA_PLAYERS,
  CAN: CANADA_PLAYERS,
  BRA: BRAZIL_PLAYERS,
  ARG: ARGENTINA_PLAYERS,
  MEX: MEXICO_PLAYERS,
  EGY: EGYPT_PLAYERS,
  NGR: NIGERIA_PLAYERS,
  ZAF: SOUTH_AFRICA_PLAYERS,
  AUS: AUSTRALIA_PLAYERS,
  NZL: NEW_ZEALAND_PLAYERS,
  IRN: IRAN_PLAYERS,
  TUR: TURKEY_PLAYERS,
};

/** 平铺所有全球球员 */
export const ALL_GLOBAL_PLAYERS = Object.values(GLOBAL_PLAYERS_BY_COUNTRY).flat();
