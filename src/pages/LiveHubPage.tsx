import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/app';
import { LiveStreamPlayer } from '@/components/live/LiveStreamPlayer';
import { FEATURED_STREAM_ID, STREAM_SOURCES } from '@/config/stream-sources';
import { formatRelativeTime } from '@/services/analysis-core';
import { useI18n } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function LiveHubPage() {
  const { t } = useI18n();
  const { streamStatuses, activeStreamId, setActiveStream, evolutionState } = useAppStore();
  const activeId = activeStreamId ?? FEATURED_STREAM_ID;
  const activeStatus = streamStatuses.find((s) => s.id === activeId);
  const liveCount = streamStatuses.filter((s) => s.live).length;

  return (
    <div className="min-h-screen bg-tt-bg">
      <header className="h-11 border-b border-tt-border bg-tt-surface flex items-center px-4 gap-3">
        <Link to="/dashboard" className="text-sm text-tt-muted hover:text-tt-text">{t('liveHub.back')}</Link>
        <span className="font-semibold text-sm">{t('liveHub.title')}</span>
        <div className="flex-1" />
        <span className="text-[10px] font-mono text-tt-red">{t('liveHub.signalsOnline', { n: liveCount })}</span>
        <LanguageSwitcher />
      </header>

      <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <LiveStreamPlayer streamId={activeId} />
          {activeStatus?.live && (
            <div className="panel p-3">
              <h2 className="font-semibold">{STREAM_SOURCES.find((s) => s.id === activeId)?.name}</h2>
              {activeStatus.title && <p className="text-sm text-tt-muted mt-1">{activeStatus.title}</p>}
              {activeStatus.viewers && (
                <p className="text-xs text-tt-accent mt-1">{t('liveHub.viewers', { n: activeStatus.viewers.toLocaleString() })}</p>
              )}
            </div>
          )}

          {evolutionState && evolutionState.insights.length > 0 && (
            <div className="panel p-3">
              <h3 className="text-xs text-tt-accent2 uppercase mb-2">{t('liveHub.aiInsights')}</h3>
              {evolutionState.insights.map((insight, i) => (
                <p key={i} className="text-sm text-tt-muted py-1">{insight}</p>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xs text-tt-muted uppercase px-1">{t('liveHub.allStreams')}</h3>
          {STREAM_SOURCES.map((src) => {
            const status = streamStatuses.find((s) => s.id === src.id);
            return (
              <button
                key={src.id}
                onClick={() => setActiveStream(src.id)}
                className={`panel w-full p-3 text-left transition-colors ${
                  activeId === src.id ? 'border-tt-accent/50' : 'hover:border-tt-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{src.name}</span>
                  <span className={`badge text-[8px] ${
                    status?.live ? 'bg-tt-red/20 text-tt-red' : 'bg-tt-muted/10 text-tt-muted'
                  }`}>
                    {status?.live ? t('common.live') : t('common.offline')}
                  </span>
                </div>
                <p className="text-[10px] text-tt-muted mt-1">{src.host} · {src.schedule}</p>
                {src.id === 'douyin-xiaohan' && (
                  <p className="text-[10px] text-tt-gold mt-1">{t('liveHub.recommended')}</p>
                )}
              </button>
            );
          })}

          <p className="text-[10px] text-tt-muted px-1 pt-2">
            {t('liveHub.lastChecked', {
              time: streamStatuses[0] ? formatRelativeTime(streamStatuses[0].checkedAt) : '—',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
