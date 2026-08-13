import type { ReactNode } from 'react';
import clsx from 'clsx';
import { useT } from '@/i18n';
interface PanelProps {
  id: string;
  title: string;
  badge?: ReactNode;
  headerRight?: ReactNode;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
  children: ReactNode;
  className?: string;
}

/** Panel base — mirrors World Monitor Panel.ts contract */
export function Panel({
  id,
  title,
  badge,
  headerRight,
  loading,
  error,
  compact,
  children,
  className,
}: PanelProps) {
  const t = useT();
  return (    <div
      id={`panel-${id}`}
      className={clsx('panel transition-shadow duration-500', className)}
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span className="panel-title">{title}</span>
          {badge}
        </div>
        {headerRight}
      </div>

      {loading ? (
        <div className="p-4 text-sm text-tt-muted animate-pulse">{t('common.loading')}</div>      ) : error ? (
        <div className="p-4 text-sm text-tt-red">{error}</div>
      ) : (
        <div className={compact ? 'p-1.5' : 'p-2'}>{children}</div>
      )}
    </div>
  );
}
