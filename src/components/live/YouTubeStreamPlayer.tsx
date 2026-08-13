import { useEffect, useState } from 'react';
import { resolveYoutubeLiveVideoId, youtubeEmbedUrls } from '@/services/youtube-resolve';
import { useT } from '@/i18n';

interface Props {
  channelId: string;
  livePageUrl: string;
  openUrl: string;
  platformLabel: string;
  onFallback?: () => void;
}

export function YouTubeStreamPlayer({
  channelId,
  livePageUrl,
  openUrl,
  platformLabel,
  onFallback,
}: Props) {
  const t = useT();
  const [embedIndex, setEmbedIndex] = useState(0);
  const [embedUrls, setEmbedUrls] = useState<string[]>(() => youtubeEmbedUrls(channelId));

  useEffect(() => {
    let cancelled = false;
    void resolveYoutubeLiveVideoId(livePageUrl).then((videoId) => {
      if (cancelled) return;
      setEmbedUrls(youtubeEmbedUrls(channelId, videoId));
      setEmbedIndex(0);
    });
    return () => {
      cancelled = true;
    };
  }, [channelId, livePageUrl]);

  useEffect(() => {
    if (embedIndex >= embedUrls.length - 1) return;
    const timer = window.setTimeout(() => setEmbedIndex((i) => i + 1), 12_000);
    return () => window.clearTimeout(timer);
  }, [embedIndex, embedUrls.length]);

  const currentSrc = embedUrls[embedIndex];

  return (
    <div className="relative w-full h-full bg-black">
      {currentSrc ? (
        <iframe
          key={currentSrc}
          src={currentSrc}
          title="YouTube Live"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onError={() => {
            if (embedIndex < embedUrls.length - 1) {
              setEmbedIndex((i) => i + 1);
            } else {
              onFallback?.();
            }
          }}
        />
      ) : null}
      <a
        href={openUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 z-10 badge bg-black/70 text-white border-white/20 text-[9px] hover:bg-black/90"
      >
        {t('playback.openIn', { platform: platformLabel })}
      </a>
    </div>
  );
}
