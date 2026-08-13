import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SiteFooter } from '@/components/SiteFooter';

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-tt-bg flex flex-col">
      <header className="h-11 border-b border-tt-border bg-tt-surface flex items-center px-4 gap-3 shrink-0">
        <Link to="/" className="text-sm text-tt-muted hover:text-tt-text">TTWorldMonitor</Link>
        <span className="font-semibold text-sm">{title}</span>
        <div className="flex-1" />
        <LanguageSwitcher />
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 prose-legal space-y-4 text-sm text-tt-muted leading-relaxed">
        {children}
      </main>
      <SiteFooter compact />
    </div>
  );
}

export function PrivacyPage() {
  const { t } = useI18n();
  const sections = ['collect', 'use', 'storage', 'third', 'rights', 'contact'] as const;
  return (
    <LegalLayout title={t('legal.privacyTitle')}>
      <p className="text-tt-text font-medium">{t('legal.privacyIntro')}</p>
      <p className="text-[10px] font-mono">{t('legal.lastUpdated')}</p>
      {sections.map((s) => (
        <section key={s}>
          <h2 className="text-tt-text font-semibold text-base mb-2">{t(`legal.privacy.${s}.title`)}</h2>
          <p>{t(`legal.privacy.${s}.body`)}</p>
        </section>
      ))}
    </LegalLayout>
  );
}

export function TermsPage() {
  const { t } = useI18n();
  const sections = ['service', 'data', 'ip', 'disclaimer', 'liability', 'changes'] as const;
  return (
    <LegalLayout title={t('legal.termsTitle')}>
      <p className="text-tt-text font-medium">{t('legal.termsIntro')}</p>
      <p className="text-[10px] font-mono">{t('legal.lastUpdated')}</p>
      {sections.map((s) => (
        <section key={s}>
          <h2 className="text-tt-text font-semibold text-base mb-2">{t(`legal.terms.${s}.title`)}</h2>
          <p>{t(`legal.terms.${s}.body`)}</p>
        </section>
      ))}
    </LegalLayout>
  );
}

export function AboutPage() {
  const { t } = useI18n();
  return (
    <LegalLayout title={t('legal.aboutTitle')}>
      <p className="text-tt-text font-medium">{t('legal.aboutIntro')}</p>
      <section>
        <h2 className="text-tt-text font-semibold text-base mb-2">{t('legal.aboutPage.publish.title')}</h2>
        <p>{t('legal.aboutPage.publish.body')}</p>
      </section>
      <section>
        <h2 className="text-tt-text font-semibold text-base mb-2">{t('legal.aboutPage.data.title')}</h2>
        <p>{t('legal.aboutPage.data.body')}</p>
      </section>
      <section>
        <h2 className="text-tt-text font-semibold text-base mb-2">{t('legal.aboutPage.contact.title')}</h2>
        <p>{t('legal.aboutPage.contact.body')}</p>
      </section>
      <div className="flex flex-wrap gap-2 pt-2">
        <Link to="/dashboard" className="btn-primary text-xs">{t('legal.aboutPage.openDashboard')}</Link>
        <Link to="/privacy" className="btn-ghost text-xs">{t('legal.privacyLink')}</Link>
      </div>
    </LegalLayout>
  );
}
