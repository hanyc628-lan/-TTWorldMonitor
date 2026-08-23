import type { StreamStatus, LiveStreamSource } from '@/types';
import { STREAM_SOURCES } from '@/config/stream-sources';

/** 直播信号监测 — 优先打服务端探测接口 */
export async function fetchStreamStatuses(): Promise<StreamStatus[]> {
  try {
    const resp = await fetch('/api/streams/status', { cache: 'no-store' });
    if (resp.ok) return resp.json() as Promise<StreamStatus[]>;
  } catch { /* fallback below */ }

  return simulateStreamStatuses(STREAM_SOURCES);
}

/** 北京时间分钟数 */
function beijingMinutes(d = new Date()): number {
  const utc = d.getTime() + d.getTimezoneOffset() * 60_000;
  const bj = new Date(utc + 8 * 3600_000);
  return bj.getHours() * 60 + bj.getMinutes();
}

/** 小韩老师三场直播（北京时间）：9:00 / 10:40 / 12:20 */
export function isXiaohanScheduleLive(now = new Date()): boolean {
  const m = beijingMinutes(now);
  const sessions = [9 * 60, 10 * 60 + 40, 12 * 60 + 20];
  return sessions.some((start) => m >= start - 5 && m < start + 45);
}

function simulateStreamStatuses(sources: LiveStreamSource[]): StreamStatus[] {
  const now = new Date();
  return sources.map((src) => {
    let live = false;
    let title: string | undefined;
    let viewers: number | undefined;

    if (src.id === 'douyin-xiaohan') {
      live = isXiaohanScheduleLive(now);
      title = live ? '小韩老师 · 乒乓球教学（日程窗口）' : undefined;
      viewers = live ? 900 + Math.floor(Math.random() * 600) : undefined;
    } else if (src.platform === 'cctv') {
      live = true;
      title = '体育频道';
    } else if (src.platform === 'youtube') {
      const m = beijingMinutes(now);
      live = m >= 10 * 60 && m <= 22 * 60;
      title = live ? 'WTT / ITTF Live' : undefined;
    }

    return {
      id: src.id,
      live,
      title,
      viewers,
      checkedAt: now.toISOString(),
    };
  });
}

export function getLiveStreamCount(statuses: StreamStatus[]): number {
  return statuses.filter((s) => s.live).length;
}
