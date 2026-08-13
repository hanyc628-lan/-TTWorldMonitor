import type { LiveStreamSource } from '@/types';

/**
 * 直播信号源注册表
 * 每日轮询 CCTV / 免费大赛 / 抖音教学直播
 */
export const STREAM_SOURCES: LiveStreamSource[] = [
  {
    id: 'douyin-xiaohan',
    name: '小韩老师 · 乒乓球教学',
    host: '小韩老师',
    category: 'teaching',
    platform: 'douyin',
    url: 'https://live.douyin.com/57194239656',
    schedule: '每日晚间直播（教学/技术分析）',
    region: '中国',
    lat: 35.86,
    lng: 104.19,
    priority: 100,
    free: true,
    tags: ['教学', '技术', '抖音', '业余进阶'],
  },
  {
    id: 'cctv5-sports',
    name: 'CCTV-5 体育频道',
    host: '央视体育',
    category: 'official',
    platform: 'cctv',
    cctvChannel: 'cctv5',
    url: 'https://tv.cctv.com/live/cctv5/',
    schedule: '大赛期间全天转播',
    region: '中国',
    lat: 39.9,
    lng: 116.4,
    priority: 95,
    free: true,
    tags: ['央视', '全运会', '乒超', '国家队'],
  },
  {
    id: 'cctv5plus',
    name: 'CCTV-5+ 体育赛事',
    host: '央视体育',
    category: 'official',
    platform: 'cctv',
    cctvChannel: 'cctv5plus',
    url: 'https://tv.cctv.com/live/cctv5plus/',
    schedule: 'WTT / 世乒赛备用频道',
    region: '中国',
    lat: 39.9,
    lng: 116.41,
    priority: 90,
    free: true,
    tags: ['央视', 'WTT', '国际赛事'],
  },
  {
    id: 'wtt-youtube',
    name: 'WTT Official (YouTube)',
    host: 'World Table Tennis',
    category: 'match',
    platform: 'youtube',
    url: 'https://www.youtube.com/@WTTGlobal/live',
    youtubeChannelId: 'UC9ckyA_A3MfXUa0ttxMoIZw',
    schedule: 'WTT 系列赛期间',
    region: '国际',
    lat: 1.35,
    lng: 103.82,
    priority: 85,
    free: true,
    tags: ['WTT', '职业', '国际'],
  },
  {
    id: 'ittf-tv',
    name: 'ITTF TV',
    host: 'ITTF',
    category: 'match',
    platform: 'youtube',
    url: 'https://www.youtube.com/@ITTFWorld/live',
    youtubeChannelId: 'UC2ySPiV4DZp58qQ4KES2o1g',
    schedule: '世锦赛 / 世界杯期间',
    region: '国际',
    lat: 46.2,
    lng: 6.15,
    priority: 80,
    free: true,
    tags: ['ITTF', '世锦赛', '世界杯'],
  },
  {
    id: 'pingpong-daily',
    name: '乒超联赛信号聚合',
    host: '腾讯体育',
    category: 'league',
    platform: 'embed',
    url: 'https://sports.qq.com/pingpong/',
    schedule: '乒超赛季',
    region: '中国',
    lat: 23.1,
    lng: 113.3,
    priority: 75,
    free: true,
    tags: ['乒超', '联赛', '国内'],
  },
];

export const FEATURED_STREAM_ID = 'douyin-xiaohan';

export const XIAOHAN_BRAND = {
  logoUrl: '/images/xiaohan-logo.png',
  copyright: '版权归小韩乒乓',
  name: '小韩老师',
} as const;

export function getStreamById(id: string): LiveStreamSource | undefined {
  return STREAM_SOURCES.find((s) => s.id === id);
}

export function getStreamsByCategory(category: LiveStreamSource['category']): LiveStreamSource[] {
  return STREAM_SOURCES.filter((s) => s.category === category);
}
