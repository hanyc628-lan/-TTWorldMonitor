import { useEffect, useState, useCallback } from 'react';
import type { LiveStreamSource } from '@/types';
import { getStreamById, XIAOHAN_BRAND, FEATURED_STREAM_ID } from '@/config/stream-sources';
import { getStreamPlayback, openStreamWindow } from '@/config/stream-playback';
import { resolveStreamPlayback } from '@/services/stream-resolve';
import { HlsVideoPlayer } from '@/components/live/HlsVideoPlayer';
import { YouTubeStreamPlayer } from '@/components/live/YouTubeStreamPlayer';
import { useT } from '@/i18n';

interface Props {
  streamId: string;
  compact?: boolean;
  hero?: boolean;
}

type PlayState = 'loading' | 'hls' | 'youtube' | 'fallback';

export function LiveStreamPlayer({ streamId, compact, hero }: Props) {
  const t = useT();
  const stream = getStreamById(streamId);
  const [state, setState] = useState<PlayState>('loading');
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);
  const [youtubeChannelId, setYoutubeChannelId] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState('loading');
    setManifestUrl(null);
    setYoutubeChannelId(null);
  }, []);

  useEffect(() => {
    reset();
    if (!stream) return;

    let cancelled = false;
    void resolveStreamPlayback(streamId).then((resolved) => {
      if (cancelled || !resolved) {
        setState('fallback');
        return;
      }
      if (resolved.mode === 'hls' && resolved.manifestUrl) {
        setManifestUrl(resolved.manifestUrl);
        setState('hls');
      } else if (resolved.mode === 'youtube' && resolved.youtubeChannelId) {
        setYoutubeChannelId(resolved.youtubeChannelId);
        setState('youtube');
      } else {
        setState('fallback');
      }
    }).catch(() => {
      if (!cancelled) setState('fallback');
    });

    return () => {
      cancelled = true;
    };
  }, [streamId, stream, reset]);

  if (!stream) return null;

  const playback = getStreamPlayback(stream);
  const isDouyin = stream.platform === 'douyin';
  const aspectClass = hero && isDouyin
    ? 'aspect-[9/16] max-h-[min(72vh,640px)]'
    : compact
      ? 'aspect-video max-h-[140px]'
      : 'aspect-video';

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden w-full ${aspectClass}`}>
      {state === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-tt-muted animate-pulse z-10">
          {t('common.loading')}
        </div>
      )}

      {state === 'hls' && manifestUrl && (
        <HlsVideoPlayer
          manifestUrl={manifestUrl}
          poster={isDouyin && stream.id === FEATURED_STREAM_ID ? XIAOHAN_BRAND.logoUrl : undefined}
          onError={() => setState('fallback')}
        />
      )}

      {state === 'youtube' && youtubeChannelId && (
        <YouTubeStreamPlayer
          channelId={youtubeChannelId}
          livePageUrl={stream.url}
          openUrl={stream.url}
          platformLabel={playback.platformLabel}
          onFallback={() => setState('fallback')}
        />
      )}

      {state === 'fallback' && (
        <StreamFallback stream={stream} playback={playback} hero={hero} />
      )}

      <div className="absolute top-2 right-2 pointer-events-none z-20">
        <span className="badge bg-black/60 text-white border-white/20 text-[9px]">
          {playback.platformLabel}
        </span>
      </div>
    </div>
  );
}

function StreamFallback({
  stream,
  playback,
  hero,
}: {
  stream: LiveStreamSource;
  playback: ReturnType<typeof getStreamPlayback>;
  hero?: boolean;
}) {
  const isDouyin = stream.platform === 'douyin';
  const showXiaohanBrand = isDouyin && stream.id === FEATURED_STREAM_ID;
  const isCctv = stream.platform === 'cctv';

  const open = () => openStreamWindow(playback.openUrl, stream.platform, stream.id);

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center p-4 text-center relative ${
        isCctv
          ? 'bg-gradient-to-br from-[#8b0000] via-[#1a2744] to-black'
          : 'bg-gradient-to-br from-[#1a2744] via-tt-bg to-black'
      }`}
    >
      {isDouyin && (
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_30%,#ff2d55_0%,transparent_55%)]" />
      )}
      {isCctv && (
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_50%_30%,#c41e3a_0%,transparent_60%)]" />
      )}
      {showXiaohanBrand && (
        <img
          src={XIAOHAN_BRAND.logoUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12] blur-[1px] scale-110 pointer-events-none"
        />
      )}

      <button
        type="button"
        onClick={open}
        className={`relative z-10 group ${hero ? 'mb-4' : 'mb-3'}`}
        aria-label={playback.openLabel}
      >
        {showXiaohanBrand ? (
          <span className="relative inline-block">
            <img
              src={XIAOHAN_BRAND.logoUrl}
              alt={XIAOHAN_BRAND.name}
              className={`rounded-full ring-4 ring-tt-accent/40 shadow-xl group-hover:scale-105 transition-transform ${
                hero ? 'w-24 h-24' : 'w-16 h-16'
              }`}
            />
            <span
              className={`absolute inset-0 m-auto flex items-center justify-center rounded-full bg-black/35 text-white ${
                hero ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-sm'
              }`}
            >
              ▶
            </span>
          </span>
        ) : (
          <span
            className={`inline-flex items-center justify-center rounded-full bg-tt-accent/90 text-white shadow-lg group-hover:bg-tt-accent group-hover:scale-105 transition-all ${
              hero ? 'w-16 h-16 text-2xl' : 'w-12 h-12 text-lg'
            }`}
          >
            ▶
          </span>
        )}
      </button>

      <h3 className={`relative z-10 font-semibold mb-1 ${hero ? 'text-base' : 'text-sm'}`}>
        {stream.name}
      </h3>
      <p className="relative z-10 text-[10px] text-tt-muted mb-2">{stream.host} · {stream.schedule}</p>
      <p className="relative z-10 text-[10px] text-tt-gold mb-3 max-w-xs">{playback.hint}</p>

      <a
        href={playback.openUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (stream.platform !== 'embed') {
            e.preventDefault();
            open();
          }
        }}
        className="relative z-10 btn-primary text-xs px-4 py-2"
      >
        {playback.openLabel}
      </a>

      {showXiaohanBrand && (
        <p className="relative z-10 text-[9px] text-tt-muted/70 mt-3">{XIAOHAN_BRAND.copyright}</p>
      )}
    </div>
  );
}
