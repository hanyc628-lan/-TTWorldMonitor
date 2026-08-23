import { useAppStore } from '@/store/app';
import { useT } from '@/i18n';
import { Panel } from './Panel';
import { FEATURED_STREAM_ID } from '@/config/stream-sources';
import { formatRelativeTime } from '@/services/analysis-core';

export function LiveStreamsPanel() {
  const t = useT();
  const { streamStatuses, streamSources } = useAppStore();
  const liveCount = streamStatuses.filter((s) => s.live).length;

  const categoryLabel = (cat: string) => {
    const key = `panels.liveStreams.${cat}` as const;
    const label = t(key);
    return label === key ? cat : label;
  };

  const sorted = [...streamStatuses].sort((a, b) => {
    const pa = a.id === FEATURED_STREAM_ID ? 0 : 1;
    const pb = b.id === FEATURED_STREAM_ID ? 0 : 1;
    return pa - pb || (b.live ? 1 : 0) - (a.live ? 1 : 0);
  });

  return (
    <Panel
      id="liveStreams"
      title={t('panels.liveStreams.title')}
      badge={
        <span className="flex items-center gap-1">
          {liveCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-tt-red animate-pulse" />}
          <span className="text-[10px] font-mono text-tt-red">
            {t('panels.liveMatches.liveCount', { n: liveCount })}
          </span>
        </span>
      }
    >
      <p className="text-[10px] text-tt-muted mb-2 leading-relaxed">
        点击卡片跳转官方直播页 · 小韩老师（北京时间）9:00 / 10:40 / 12:20 · 仅显示在线状态与标题
      </p>

      <ul className="space-y-1.5">
        {sorted.map((status) => {
          const src = streamSources.find((s) => s.id === status.id);
          if (!src) return null;

          return (
            <li key={status.id}>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-sm rounded px-2 py-2 transition-colors border ${
                  status.live
                    ? 'bg-tt-red/5 border-tt-red/30 hover:bg-tt-red/10'
                    : 'border-tt-border/60 hover:bg-tt-surface'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-xs">{src.name}</span>
                  <span
                    className={`badge text-[8px] shrink-0 ${
                      status.live
                        ? 'bg-tt-red/20 text-tt-red border-tt-red/30'
                        : 'bg-tt-muted/10 text-tt-muted border-tt-muted/20'
                    }`}
                  >
                    {status.live ? t('common.live') : t('common.offline')}
                  </span>
                </div>
                {status.title && (
                  <p className="text-[11px] text-tt-accent mt-0.5 truncate" title={status.title}>
                    {status.title}
                  </p>
                )}
                <div className="flex items-center justify-between mt-0.5 text-[10px] text-tt-muted">
                  <span>
                    {categoryLabel(src.category)} · {src.platform.toUpperCase()}
                  </span>
                  <span className="text-tt-accent/80">打开 ↗</span>
                </div>
                <span className="text-[9px] text-tt-muted">
                  {t('panels.liveStreams.checked', { time: formatRelativeTime(status.checkedAt) })}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
