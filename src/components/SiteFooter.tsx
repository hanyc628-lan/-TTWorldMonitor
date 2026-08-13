import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';

export interface PublicVisitStats {
  totalPageViews: number;
  totalSessions: number;
  todayPageViews: number;
  todaySessions: number;
  publishedAt: string;
  lastVisitAt: string | null;
}

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [stats, setStats] = useState<PublicVisitStats | null>(null);

  useEffect(() => {
    void fetch('/api/analytics/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => { /* ignore */ });
  }, []);

  return (
    <footer className={`border-t border-tt-border ${compact ? 'px-3 py-4' : 'px-6 py-8'}`}>
      <div className={`${compact ? '' : 'max-w-6xl mx-auto'} flex flex-col gap-3 text-sm text-tt-muted`}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <Link to="/about" className="hover:text-tt-text">{t('legal.about')}</Link>
          <Link to="/privacy" className="hover:text-tt-text">{t('legal.privacyLink')}</Link>
          <Link to="/terms" className="hover:text-tt-text">{t('legal.termsLink')}</Link>
          <a href="/robots.txt" className="hover:text-tt-text" target="_blank" rel="noreferrer">robots.txt</a>
          <a href="/sitemap.xml" className="hover:text-tt-text" target="_blank" rel="noreferrer">sitemap.xml</a>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <span className="text-xs">{t('legal.copyright')}</span>
          {stats && (
            <span className="text-[10px] font-mono text-tt-accent2">
              {t('legal.visitStats', {
                total: stats.totalPageViews.toLocaleString(),
                today: stats.todayPageViews.toLocaleString(),
                sessions: stats.totalSessions.toLocaleString(),
              })}
            </span>
          )}
        </div>

        {!compact && (
          <p className="text-[10px] leading-relaxed max-w-3xl">{t('legal.footerNotice')}</p>
        )}
      </div>
    </footer>
  );
}
