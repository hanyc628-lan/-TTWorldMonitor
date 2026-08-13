import { useAppStore } from '@/store/app';
import type { SiteVariant } from '@/types';
import { useT } from '@/i18n';
import clsx from 'clsx';

const VARIANTS: SiteVariant[] = ['world', 'pro', 'youth', 'equipment', 'asia', 'europe'];

export function LensSelector() {
  const { variant, setVariant } = useAppStore();
  const t = useT();

  return (
    <div className="flex items-center gap-0.5">
      {VARIANTS.map((v) => (
        <button
          key={v}
          onClick={() => setVariant(v)}
          className={clsx(
            'text-[11px] px-2 py-1 rounded transition-colors',
            variant === v
              ? 'bg-tt-accent/20 text-tt-accent font-medium'
              : 'text-tt-muted hover:text-tt-text hover:bg-tt-panel',
          )}
        >
          {t(`variants.${v}`)}
        </button>
      ))}
    </div>
  );
}
