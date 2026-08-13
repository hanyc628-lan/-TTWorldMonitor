import { STREAM_SOURCES } from '../src/config/stream-sources.js';

export function simulateStreamStatuses() {
  const hour = new Date().getHours();
  const day = new Date().getDay();

  return STREAM_SOURCES.map((src) => {
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
      live = Math.random() > 0.5;
    }

    return { id: src.id, live, title, viewers, checkedAt: new Date().toISOString() };
  });
}
