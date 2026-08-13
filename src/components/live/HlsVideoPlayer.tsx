import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface Props {
  manifestUrl: string;
  className?: string;
  poster?: string;
  onError?: () => void;
}

export function HlsVideoPlayer({ manifestUrl, className = '', poster, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [needsClick, setNeedsClick] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    const start = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
        });
        hlsRef.current = hls;
        hls.loadSource(manifestUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            onError?.();
          }
        });
        void video.play().catch(() => setNeedsClick(true));
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = manifestUrl;
        void video.play().catch(() => setNeedsClick(true));
      } else {
        onError?.();
      }
    };

    start();

    return () => {
      hls?.destroy();
      hlsRef.current = null;
      video.removeAttribute('src');
      video.load();
    };
  }, [manifestUrl, onError]);

  const handlePlay = () => {
    void videoRef.current?.play();
    setNeedsClick(false);
  };

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
        poster={poster}
        muted
      />
      {needsClick && (
        <button
          type="button"
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm"
        >
          ▶
        </button>
      )}
    </div>
  );
}
