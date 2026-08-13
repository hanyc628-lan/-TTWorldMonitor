import { useAppStore } from '@/store/app';
import { formatRelativeTime, getSeverityColor, getSignalTypeLabel } from '@/services/analysis-core';
import { useT } from '@/i18n';
import { Panel } from './Panel';

interface Props {
  compact?: boolean;
}

export function SignalsPanel({ compact }: Props) {
  const t = useT();
  const { signals } = useAppStore();
  const items = compact ? signals.slice(0, 3) : signals;

  return (
    <Panel
      id="signals"
      title={t('panels.signals.title')}
      badge={<span className="badge bg-tt-accent/10 text-tt-accent border-tt-accent/20">{t('common.realtime')}</span>}
      compact={compact}
    >
      <ul className="space-y-2">
        {items.map((s) => (
          <li key={s.id} className="text-sm leading-snug">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`badge ${getSeverityColor(s.severity)}`}>
                {getSignalTypeLabel(s.type)}
              </span>
              <span className="text-[10px] text-tt-muted">{formatRelativeTime(s.timestamp)}</span>
            </div>
            <p>{s.title}</p>
            <span className="text-[10px] text-tt-muted">{s.source}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
