import type { Country } from '@/types';

export const COUNTRIES: Country[] = [
  { code: 'CHN', name: 'China', nameZh: '中国', lat: 35.86, lng: 104.19, federation: 'CTTA' },
  { code: 'JPN', name: 'Japan', nameZh: '日本', lat: 36.2, lng: 138.25, federation: 'JTTA' },
  { code: 'KOR', name: 'South Korea', nameZh: '韩国', lat: 35.9, lng: 127.77, federation: 'KTA' },
  { code: 'TPE', name: 'Chinese Taipei', nameZh: '中华台北', lat: 23.7, lng: 121.0, federation: 'CTTA-TPE' },
  { code: 'HKG', name: 'Hong Kong', nameZh: '中国香港', lat: 22.32, lng: 114.17, federation: 'HKTTFA' },
  { code: 'SGP', name: 'Singapore', nameZh: '新加坡', lat: 1.35, lng: 103.82, federation: 'STTA' },
  { code: 'GER', name: 'Germany', nameZh: '德国', lat: 51.16, lng: 10.45, federation: 'DTTB' },
  { code: 'FRA', name: 'France', nameZh: '法国', lat: 46.22, lng: 2.21, federation: 'FFTT' },
  { code: 'SWE', name: 'Sweden', nameZh: '瑞典', lat: 60.12, lng: 18.64, federation: 'SUTF' },
  { code: 'POR', name: 'Portugal', nameZh: '葡萄牙', lat: 39.39, lng: -8.22, federation: 'FPTM' },
  { code: 'ESP', name: 'Spain', nameZh: '西班牙', lat: 40.46, lng: -3.75, federation: 'RFETM' },
  { code: 'GBR', name: 'United Kingdom', nameZh: '英国', lat: 54.0, lng: -2.5, federation: 'TTE' },
  { code: 'AUT', name: 'Austria', nameZh: '奥地利', lat: 47.51, lng: 14.55, federation: 'ÖTTV' },
  { code: 'POL', name: 'Poland', nameZh: '波兰', lat: 51.92, lng: 19.15, federation: 'PZTS' },
  { code: 'CZE', name: 'Czechia', nameZh: '捷克', lat: 49.82, lng: 15.47, federation: 'ČSTT' },
  { code: 'ROU', name: 'Romania', nameZh: '罗马尼亚', lat: 45.94, lng: 24.97, federation: 'FRMT' },
  { code: 'HUN', name: 'Hungary', nameZh: '匈牙利', lat: 47.16, lng: 19.5, federation: 'MOATSZ' },
  { code: 'ITA', name: 'Italy', nameZh: '意大利', lat: 41.87, lng: 12.57, federation: 'FITET' },
  { code: 'NED', name: 'Netherlands', nameZh: '荷兰', lat: 52.13, lng: 5.29, federation: 'NTTB' },
  { code: 'BEL', name: 'Belgium', nameZh: '比利时', lat: 50.5, lng: 4.47, federation: 'VTTL' },
  { code: 'DEN', name: 'Denmark', nameZh: '丹麦', lat: 56.26, lng: 9.5, federation: 'DTTU' },
  { code: 'UKR', name: 'Ukraine', nameZh: '乌克兰', lat: 48.38, lng: 31.17, federation: 'UTFNT' },
  { code: 'CRO', name: 'Croatia', nameZh: '克罗地亚', lat: 45.1, lng: 15.2, federation: 'HSTS' },
  { code: 'SVK', name: 'Slovakia', nameZh: '斯洛伐克', lat: 48.67, lng: 19.7, federation: 'STTS' },
  { code: 'USA', name: 'United States', nameZh: '美国', lat: 37.09, lng: -95.71, federation: 'USATT' },
  { code: 'CAN', name: 'Canada', nameZh: '加拿大', lat: 56.13, lng: -106.35, federation: 'CTTA-CAN' },
  { code: 'BRA', name: 'Brazil', nameZh: '巴西', lat: -14.23, lng: -51.92, federation: 'CBTM' },
  { code: 'ARG', name: 'Argentina', nameZh: '阿根廷', lat: -38.42, lng: -63.62, federation: 'TTA' },
  { code: 'MEX', name: 'Mexico', nameZh: '墨西哥', lat: 23.63, lng: -102.55, federation: 'FMTM' },
  { code: 'IND', name: 'India', nameZh: '印度', lat: 20.59, lng: 78.96, federation: 'TTFI' },
  { code: 'AUS', name: 'Australia', nameZh: '澳大利亚', lat: -25.27, lng: 133.78, federation: 'TTA-AUS' },
  { code: 'NZL', name: 'New Zealand', nameZh: '新西兰', lat: -40.9, lng: 174.89, federation: 'TTNZ' },
  { code: 'EGY', name: 'Egypt', nameZh: '埃及', lat: 26.82, lng: 30.8, federation: 'ETTF' },
  { code: 'NGR', name: 'Nigeria', nameZh: '尼日利亚', lat: 9.08, lng: 8.68, federation: 'NTTF' },
  { code: 'ZAF', name: 'South Africa', nameZh: '南非', lat: -30.56, lng: 22.94, federation: 'SATTTA' },
  { code: 'IRN', name: 'Iran', nameZh: '伊朗', lat: 32.43, lng: 53.69, federation: 'IRTTU' },
  { code: 'THA', name: 'Thailand', nameZh: '泰国', lat: 15.87, lng: 100.99, federation: 'TTAT' },
  { code: 'VNM', name: 'Vietnam', nameZh: '越南', lat: 14.06, lng: 108.28, federation: 'VTF' },
  { code: 'MYS', name: 'Malaysia', nameZh: '马来西亚', lat: 4.21, lng: 101.98, federation: 'MTTF' },
  { code: 'TUR', name: 'Turkey', nameZh: '土耳其', lat: 38.96, lng: 35.24, federation: 'TTF' },
];

export const COUNTRY_MAP = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));

/** ISO 3166-1 alpha-2 → 乒乓球国家代码 */
export const ISO_TO_TT: Record<string, string> = {
  CN: 'CHN', JP: 'JPN', KR: 'KOR', TW: 'TPE', HK: 'HKG', SG: 'SGP',
  DE: 'GER', FR: 'FRA', SE: 'SWE', PT: 'POR', ES: 'ESP', GB: 'GBR',
  AT: 'AUT', PL: 'POL', CZ: 'CZE', RO: 'ROU', HU: 'HUN', IT: 'ITA',
  NL: 'NED', BE: 'BEL', DK: 'DEN', UA: 'UKR', HR: 'CRO', SK: 'SVK',
  US: 'USA', CA: 'CAN', BR: 'BRA', AR: 'ARG', MX: 'MEX', IN: 'IND',
  AU: 'AUS', NZ: 'NZL', EG: 'EGY', NG: 'NGR', ZA: 'ZAF', IR: 'IRN',
  TH: 'THA', VN: 'VNM', MY: 'MYS', TR: 'TUR',
};

/** 从 TopoJSON geography 解析国家代码 */
export function resolveGeoCountryCode(geo: {
  id?: string;
  properties?: { ISO_A2?: string; iso_a2?: string; NAME?: string };
}): string | undefined {
  const raw = (geo.properties?.ISO_A2 ?? geo.properties?.iso_a2 ?? '').toUpperCase();
  if (raw && raw !== '-99' && ISO_TO_TT[raw]) return ISO_TO_TT[raw];
  const name = geo.properties?.NAME ?? '';
  if (name === 'Taiwan') return 'TPE';
  if (name === 'United Kingdom') return 'GBR';
  return undefined;
}

export const LENS_LABELS: Record<string, string> = {
  world: '世界',
  pro: '职业',
  youth: '青少年',
  equipment: '器材',
  asia: '亚洲',
  europe: '欧洲',
};

export const LAYER_LABELS: Record<string, string> = {
  rankings: '世界排名',
  tournaments: '赛事分布',
  'live-matches': '实时比分',
  clubs: '俱乐部',
  'youth-pipeline': '青训梯队',
  equipment: '器材趋势',
  federations: '协会总部',
};
