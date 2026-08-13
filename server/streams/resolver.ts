import { STREAM_SOURCES } from '../../src/config/stream-sources.js';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/** 央视 HLS 直链（需 Referer: tv.cctv.com） */
const CCTV_HLS: Record<string, string> = {
  cctv5: 'https://ldcctvwbcdks.v.kcdnvip.com/ldcctvwbcd/cdrmldcctv5_1/index.m3u8',
  cctv5plus: 'https://ldcctvwbcdks.v.kcdnvip.com/ldcctvwbcd/cdrmldcctv5plus_1/index.m3u8',
};

export type PlaybackMode = 'hls' | 'youtube' | 'dock';

export interface ResolvedStream {
  streamId: string;
  mode: PlaybackMode;
  /** 原始 HLS 地址（仅服务端使用） */
  hlsUrl?: string;
  referer?: string;
  youtubeChannelId?: string;
  youtubeVideoId?: string;
  openUrl: string;
  expiresAt?: string;
}

const resolveCache = new Map<string, { data: ResolvedStream; expires: number }>();

function cacheGet(id: string): ResolvedStream | null {
  const hit = resolveCache.get(id);
  if (!hit || Date.now() > hit.expires) return null;
  return hit.data;
}

function cacheSet(id: string, data: ResolvedStream, ttlMs: number): void {
  resolveCache.set(id, { data, expires: Date.now() + ttlMs });
}

function unescapeDouyinUrl(raw: string): string {
  return raw
    .replace(/\\u0026/gi, '&')
    .replace(/\\\//g, '/')
    .replace(/\\$/g, '')
    .trim();
}

function pickDouyinHls(html: string): string | null {
  const urls = [...html.matchAll(/https?:\/\/pull-hls[^"']+/g)].map((m) => unescapeDouyinUrl(m[0]));
  if (!urls.length) return null;
  const preferred =
    urls.find((u) => /_or4\.m3u8/i.test(u)) ??
    urls.find((u) => /Stage0T000hd/i.test(u)) ??
    urls.find((u) => !/Stage0T000ld/i.test(u)) ??
    urls[0];
  return preferred;
}

export async function resolveDouyinHls(roomUrl: string): Promise<string | null> {
  const res = await fetch(roomUrl, {
    headers: { 'User-Agent': UA, Referer: 'https://live.douyin.com/' },
    redirect: 'follow',
  });
  if (!res.ok) return null;
  const html = await res.text();
  return pickDouyinHls(html);
}

export async function resolveStream(streamId: string): Promise<ResolvedStream | null> {
  const cached = cacheGet(streamId);
  if (cached) return cached;

  const src = STREAM_SOURCES.find((s) => s.id === streamId);
  if (!src) return null;

  if (src.platform === 'douyin') {
    const hlsUrl = await resolveDouyinHls(src.url);
    if (hlsUrl) {
      const data: ResolvedStream = {
        streamId,
        mode: 'hls',
        hlsUrl,
        referer: 'https://live.douyin.com/',
        openUrl: src.url,
        expiresAt: new Date(Date.now() + 90_000).toISOString(),
      };
      cacheSet(streamId, data, 90_000);
      return data;
    }
  }

  if (src.platform === 'cctv' && src.cctvChannel) {
    const hlsUrl = CCTV_HLS[src.cctvChannel];
    if (hlsUrl) {
      const data: ResolvedStream = {
        streamId,
        mode: 'hls',
        hlsUrl,
        referer: 'https://tv.cctv.com/',
        openUrl: src.url,
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
      };
      cacheSet(streamId, data, 300_000);
      return data;
    }
  }

  if (src.platform === 'youtube' && src.youtubeChannelId) {
    const data: ResolvedStream = {
      streamId,
      mode: 'youtube',
      youtubeChannelId: src.youtubeChannelId,
      openUrl: src.url,
    };
    cacheSet(streamId, data, 60_000);
    return data;
  }

  const data: ResolvedStream = { streamId, mode: 'dock', openUrl: src.url };
  cacheSet(streamId, data, 30_000);
  return data;
}

export function getStreamReferer(streamId: string): string {
  const src = STREAM_SOURCES.find((s) => s.id === streamId);
  if (!src) return '';
  if (src.platform === 'douyin') return 'https://live.douyin.com/';
  if (src.platform === 'cctv') return 'https://tv.cctv.com/';
  return src.url;
}

export async function getHlsUrlForStream(streamId: string): Promise<{ url: string; referer: string } | null> {
  const resolved = await resolveStream(streamId);
  if (!resolved?.hlsUrl) return null;
  return { url: resolved.hlsUrl, referer: resolved.referer ?? getStreamReferer(streamId) };
}
