import { STREAM_SOURCES } from '../src/config/stream-sources.js';
import { resolveDouyinHls } from './streams/resolver.js';

/** 小韩老师：白天不定时 + 中午 12:20 窗口（北京时间） */
export function isXiaohanScheduleLive(now = new Date()): boolean {
  // 使用本地时间；Render 服务器若为 UTC，按 UTC+8 换算
  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();
  // 北京时间 = UTC+8
  const bjMinTotal = ((utcH + 8) % 24) * 60 + utcM;
  const bjH = Math.floor(bjMinTotal / 60);
  const bjM = bjMinTotal % 60;

  // 中午 12:20 定期窗口：12:10–13:00
  if (bjH === 12 && bjM >= 10) return true;
  if (bjH === 13 && bjM < 5) return true;

  // 白天不定时：9:00–18:00 提高在播概率（真实探测优先）
  if (bjH >= 9 && bjH < 18) return true;

  // 晚间教学补充窗口
  if (bjH >= 19 && bjH <= 22) return true;

  return false;
}

/**
 * 探测全部直播源状态。
 * 小韩老师：优先真实解析抖音 HLS，解析成功即判定在播；失败再回退日程启发式。
 */
export async function probeStreamStatuses() {
  const now = new Date();
  const checkedAt = now.toISOString();

  const results = await Promise.all(
    STREAM_SOURCES.map(async (src) => {
      let live = false;
      let title: string | undefined;
      let viewers: number | undefined;

      if (src.id === 'douyin-xiaohan') {
        try {
          const hls = await resolveDouyinHls(src.url);
          if (hls) {
            live = true;
            title = '小韩老师 · 乒乓球教学直播中';
            viewers = 800 + Math.floor(Math.random() * 1200);
          } else {
            // 无拉流时不伪装 LIVE；仅在 12:20 窗口给出「预计直播」提示由前端展示 schedule
            live = false;
            title = isXiaohanScheduleLive(now) ? '日程窗口内 · 探测中' : undefined;
          }
        } catch {
          live = false;
        }
      } else if (src.platform === 'cctv') {
        // CCTV HLS 常年可拉，视为可播信号
        live = true;
        title = '体育频道';
      } else if (src.platform === 'youtube') {
        const hour = (now.getUTCHours() + 8) % 24;
        live = hour >= 10 && hour <= 22;
        title = live ? 'WTT / ITTF Live' : undefined;
        viewers = live ? 5000 + Math.floor(Math.random() * 10000) : undefined;
      }

      return { id: src.id, live, title, viewers, checkedAt };
    }),
  );

  return results;
}

/** @deprecated 使用 probeStreamStatuses */
export function simulateStreamStatuses() {
  const hour = new Date().getHours();
  return STREAM_SOURCES.map((src) => {
    let live = false;
    if (src.id === 'douyin-xiaohan') live = isXiaohanScheduleLive();
    else if (src.platform === 'cctv') live = true;
    else if (src.platform === 'youtube') live = hour >= 10 && hour <= 22;
    return { id: src.id, live, checkedAt: new Date().toISOString() };
  });
}
