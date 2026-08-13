import type { StreamStatus, LiveStreamSource } from '@/types';
import { STREAM_SOURCES } from '@/config/stream-sources';

/** 直播信号监测 — 轮询各源在线状态 */
export async function fetchStreamStatuses(): Promise<StreamStatus[]> {
  try {
    const resp = await fetch('/api/streams/status');
    if (resp.ok) return resp.json() as Promise<StreamStatus[]>;
  } catch { /* fallback below */ }

  return simulateStreamStatuses(STREAM_SOURCES);
}

/**
 * 本地启发式模拟（开发/离线模式）
 * 小韩老师：晚间 19:00-23:00 大概率直播
 * CCTV：大赛日全天
 */
function simulateStreamStatuses(sources: LiveStreamSource[]): StreamStatus[] {
  const hour = new Date().getHours();
  const day = new Date().getDay();

  return sources.map((src) => {
    let live = false;
    let title: string | undefined;
    let viewers: number | undefined;

    if (src.id === 'douyin-xiaohan') {
      live = hour >= 19 && hour <= 23;
      title = live ? '乒乓球技术教学 · 正手弧圈专题' : undefined;
      viewers = live ? 1200 + Math.floor(Math.random() * 800) : undefined;
    } else if (src.platform === 'cctv') {
      live = day === 0 || day === 6 || hour >= 14;
      title = live ? '体育频道赛事转播' : undefined;
    } else if (src.platform === 'youtube') {
      live = day % 2 === 0 && hour >= 10 && hour <= 22;
      title = live ? 'WTT / ITTF Live' : undefined;
      viewers = live ? 5000 + Math.floor(Math.random() * 10000) : undefined;
    } else {
      live = Math.random() > 0.6;
    }

    return {
      id: src.id,
      live,
      title,
      viewers,
      checkedAt: new Date().toISOString(),
    };
  });
}

export function getLiveStreamCount(statuses: StreamStatus[]): number {
  return statuses.filter((s) => s.live).length;
}
