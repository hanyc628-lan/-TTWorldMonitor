import type { LiveStreamSource } from '@/types';
import { getT } from '@/i18n';

export type PlaybackMode = 'iframe' | 'external';

export interface StreamPlayback {
  mode: PlaybackMode;
  embedSrc?: string;
  openUrl: string;
  hint: string;
  openLabel: string;
  platformLabel: string;
}

const PLATFORM_LABELS: Record<LiveStreamSource['platform'], string> = {
  douyin: 'Douyin',
  cctv: 'CCTV',
  youtube: 'YouTube',
  wtt: 'WTT',
  hls: 'HLS',
  embed: 'Live',
};

function youtubeLiveEmbed(channelId: string): string {
  const params = new URLSearchParams({
    channel: channelId,
    autoplay: '1',
    mute: '1',
    rel: '0',
    modestbranding: '1',
  });
  return `https://www.youtube-nocookie.com/embed/live_stream?${params}`;
}

export function getStreamPlayback(stream: LiveStreamSource): StreamPlayback {
  const t = getT();
  const platformLabel = PLATFORM_LABELS[stream.platform] ?? 'Live';

  if (stream.platform === 'youtube' && stream.youtubeChannelId) {
    return {
      mode: 'iframe',
      embedSrc: youtubeLiveEmbed(stream.youtubeChannelId),
      openUrl: stream.url,
      hint: t('playback.youtubeHint'),
      openLabel: t('playback.openYoutube'),
      platformLabel,
    };
  }

  if (stream.platform === 'douyin') {
    return {
      mode: 'external',
      openUrl: stream.url,
      hint: t('playback.douyinHint'),
      openLabel: t('playback.openDouyin'),
      platformLabel,
    };
  }

  if (stream.platform === 'cctv') {
    return {
      mode: 'external',
      openUrl: stream.url,
      hint: t('playback.cctvHint'),
      openLabel: t('playback.openCctv'),
      platformLabel,
    };
  }

  return {
    mode: 'external',
    openUrl: stream.url,
    hint: t('playback.defaultHint'),
    openLabel: t('playback.openLive'),
    platformLabel,
  };
}

export function openStreamWindow(url: string, platform: LiveStreamSource['platform'], name?: string) {
  const tall = platform === 'douyin';
  const w = tall ? 420 : 960;
  const h = tall ? 760 : 540;
  const left = Math.max(0, window.screenX + (window.outerWidth - w) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - h) / 2);
  const popup = window.open(
    url,
    name ?? 'ttwm-stream',
    `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`,
  );
  if (!popup) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
