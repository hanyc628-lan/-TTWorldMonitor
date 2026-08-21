import { useAppStore } from '@/store/app';
import { useT } from '@/i18n';
import { Panel } from './Panel';
import { LiveStreamPlayer } from '@/components/live/LiveStreamPlayer';
import { FEATURED_STREAM_ID } from '@/config/stream-sources';
import { formatRelativeTime } from '@/services/analysis-core';

export function LiveStreamsPanel() {
  const t = useT();
  const { streamStatuses, activeStreamId, setActiveStream } = useAppStore();
  const liveCount = streamStatuses.filter((s) => s.live).length;
  const featured = streamStatuses.find((s) => s.id === FEATURED_STREAM_ID);

  const categoryLabel = (cat: string) => {
    const key = `panels.liveStreams.${cat}` as const;
    const label = t(key);
    return label === key ? cat : label;
  };

  return (
    <Panel
      id="liveStreams"
      title={t('panels.liveStreams.title')}
      badge={
        <span className="flex items-center gap-1">
          {liveCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-tt-red animate-pulse" />}
          <span className="text-[10px] font-mono text-tt-red">{t('panels.liveMatches.liveCount', { n: liveCount })}</span>
        </span>
      }
    >
      {/* 仅在有直播时展示播放器，避免离线时大块黑屏空白 */}
      {liveCount > 0 && (
        <div className="mb-2">
          <LiveStreamPlayer streamId={activeStreamId ?? FEATURED_STREAM_ID} compact />
          {featured?.live && featured.title && (
            <p className="text-[10px] text-tt-accent mt-1 truncate">{featured.title}</p>
          )}
        </div>
      )}

      <ul className="space-y-1.5">
        {streamStatuses
          .sort((a, b) => {
            const pa = a.id === FEATURED_STREAM_ID ? 0 : 1;
            const pb = b.id === FEATURED_STREAM_ID ? 0 : 1;
            return pa - pb || (b.live ? 1 : 0) - (a.live ? 1 : 0);
          })
          .map((status) => {
            const src = useAppStore.getState().streamSources.find((s) => s.id === status.id);
            if (!src) return null;
            const isActive = (activeStreamId ?? FEATURED_STREAM_ID) === status.id;

            return (
              <li
                key={status.id}
                className={`text-sm rounded px-2 py-1.5 cursor-pointer transition-colors ${
                  isActive ? 'bg-tt-accent/15 border border-tt-accent/30' : 'hover:bg-tt-surface'
                }`}
                onClick={() => setActiveStream(status.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate font-medium text-xs">{src.name}</span>
                  <span className={`badge text-[8px] ${
                    status.live
                      ? 'bg-tt-red/20 text-tt-red border-tt-red/30'
                      : 'bg-tt-muted/10 text-tt-muted border-tt-muted/20'
                  }`}>
                    {status.live ? t('common.live') : t('common.offline')}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5 text-[10px] text-tt-muted">
                  <span>{categoryLabel(src.category)} · {src.platform.toUpperCase()}</span>
                  {status.viewers && <span>{t('panels.liveStreams.viewers', { n: status.viewers.toLocaleString() })}</span>}
                </div>
                {status.title && status.live && (
                  <p className="text-[10px] text-tt-muted mt-0.5 truncate">{status.title}</p>
                )}
                <span className="text-[9px] text-tt-muted">
                  {t('panels.liveStreams.checked', { time: formatRelativeTime(status.checkedAt) })}
                </span>
              </li>
            );
          })}
      </ul>
    </Panel>
  );
}
