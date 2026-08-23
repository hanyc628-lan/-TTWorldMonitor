import { STREAM_SOURCES } from '../src/config/stream-sources.js';
import { fetchDouyinRoomMeta } from './streams/resolver.js';

/** 小韩老师三场直播窗口（北京时间）：9:00 / 10:40 / 12:20 */
export function isXiaohanScheduleLive(now = new Date()): boolean {
  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();
  const bjMinTotal = ((utcH + 8) % 24) * 60 + utcM;
  const sessions = [9 * 60, 10 * 60 + 40, 12 * 60 + 20];
  return sessions.some((start) => bjMinTotal >= start - 5 && bjMinTotal < start + 45);
}

/**
 * 探测直播源：状态 + 标题（不内嵌播放，前端点击跳转官方页）
 */
export async function probeStreamStatuses() {
  const now = new Date();
  const checkedAt = now.toISOString();

  return Promise.all(
    STREAM_SOURCES.map(async (src) => {
      let live = false;
      let title: string | undefined;
      let viewers: number | undefined;

      if (src.platform === 'douyin') {
        try {
          const meta = await fetchDouyinRoomMeta(src.url);
          live = meta.live;
          title = meta.title ?? (live ? src.name : undefined);
          if (!live && isXiaohanScheduleLive(now) && src.id === 'douyin-xiaohan') {
            title = title ?? '日程窗口内 · 点击进入直播间';
          }
        } catch {
          live = false;
        }
      } else if (src.platform === 'cctv') {
        // 央视频道页常年可访问；不伪造成赛事直播，仅标记可打开
        live = true;
        title = src.name;
      } else if (src.platform === 'youtube') {
        // 无法稳定无密钥探测是否在播，显示频道名，状态偏保守
        const hour = (now.getUTCHours() + 8) % 24;
        live = hour >= 10 && hour <= 23;
        title = src.name;
      }

      return { id: src.id, live, title, viewers, checkedAt };
    }),
  );
}

export function simulateStreamStatuses() {
  const now = new Date();
  return STREAM_SOURCES.map((src) => {
    let live = false;
    if (src.id === 'douyin-xiaohan') live = isXiaohanScheduleLive(now);
    else if (src.platform === 'cctv') live = true;
    else if (src.platform === 'youtube') live = false;
    return {
      id: src.id,
      live,
      title: src.name,
      checkedAt: now.toISOString(),
    };
  });
}
