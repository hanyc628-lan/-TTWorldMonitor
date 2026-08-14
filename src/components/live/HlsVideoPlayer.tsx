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

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (video.requestFullscreen) {
        await video.requestFullscreen();
      }
    } catch {
      // Ignore browser fullscreen errors for embedded streams.
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
        return;
      }

      if ('pictureInPictureEnabled' in document && document.pictureInPictureEnabled && video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      }
    } catch {
      // Ignore unsupported or blocked PiP requests.
    }
  };

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
        autoPlay
        muted
        poster={poster}
        disablePictureInPicture={false}
      />

      <div className="absolute right-1 sm:right-2 bottom-1 sm:bottom-2 z-10 flex gap-1 sm:gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={togglePictureInPicture}
          className="rounded bg-black/65 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-medium text-white border border-white/15 hover:bg-black/80 transition-colors"
          title="画中画"
        >
          PiP
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded bg-black/65 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-medium text-white border border-white/15 hover:bg-black/80 transition-colors"
          title="全屏"
        >
          ⤢
        </button>
      </div>

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
