import { useState, useRef, useEffect } from 'react';
import { useI18n, LOCALES } from '@/i18n';
import { COUNTRY_MAP } from '@/data/countries';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost text-xs flex items-center gap-1"
        aria-label={t('lang.label')}
      >
        <span>🌐</span>
        <span className="hidden sm:inline">{t(`lang.${locale}`)}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 panel py-1 min-w-[8rem] shadow-xl">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                setLocale(loc);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-tt-surface ${
                loc === locale ? 'text-tt-accent' : 'text-tt-text'
              }`}
            >
              {t(`lang.${loc}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function useCountryName(code: string): string {
  const { locale } = useI18n();
  const c = COUNTRY_MAP[code];
  if (!c) return code;
  return locale === 'zh' ? c.nameZh : c.name;
}
