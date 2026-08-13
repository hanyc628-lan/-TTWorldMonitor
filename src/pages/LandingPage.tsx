import { Link } from 'react-router-dom';
import { COUNTRY_TPI, SIGNALS, TOURNAMENTS, FEED_SOURCES, TOP_MEN, TOP_WOMEN } from '@/data/seed';
import { formatRelativeTime } from '@/services/analysis-core';
import { enrichTPIRecords } from '@/server/tpi-scoring';
import { useI18n } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function LandingPage() {
  const { t } = useI18n();
  const topTPI = enrichTPIRecords(COUNTRY_TPI).sort((a, b) => b.score - a.score).slice(0, 5);
  const liveTournaments = TOURNAMENTS.filter((tm) => tm.status === 'live');
  const topSignals = SIGNALS.slice(0, 4);

  const statusLabel = (status: string) => {
    if (status === 'live') return t('common.live');
    if (status === 'upcoming') return t('common.upcoming');
    return t('common.finished');
  };

  const stats = [
    { value: '7', label: t('landing.stats.layers') },
    { value: '120+', label: t('landing.stats.sources') },
    { value: '15', label: t('landing.stats.tpiNations') },
    { value: '5', label: t('landing.stats.alerts') },
  ];

  const correlationCards = [
    { title: t('landing.correlation.c1t'), desc: t('landing.correlation.c1d') },
    { title: t('landing.correlation.c2t'), desc: t('landing.correlation.c2d') },
    { title: t('landing.correlation.c3t'), desc: t('landing.correlation.c3d') },
  ];

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 inset-x-0 z-50 bg-tt-bg/80 backdrop-blur-md border-b border-tt-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-tt-accent/20 flex items-center justify-center">
              <span className="text-tt-accent text-sm font-bold">TT</span>
            </div>
            <span className="font-semibold tracking-tight">TTWorldMonitor</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-tt-muted">
            <a href="#signals" className="hover:text-tt-text transition-colors">{t('landing.nav.signals')}</a>
            <a href="#tpi" className="hover:text-tt-text transition-colors">{t('landing.nav.tpi')}</a>
            <a href="#correlation" className="hover:text-tt-text transition-colors">{t('landing.nav.correlation')}</a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link to="/dashboard" className="btn-primary text-sm">{t('landing.nav.dashboard')}</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-tt-accent text-sm font-mono mb-4 animate-fade-in">{t('landing.hero.tagline')}</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 animate-fade-in">
            {t('landing.hero.title1')}<br />
            <span className="text-tt-accent">{t('landing.hero.title2')}</span>
          </h1>
          <p className="text-lg text-tt-muted max-w-2xl mx-auto mb-8 animate-fade-in">{t('landing.hero.desc')}</p>
          <div className="flex items-center justify-center gap-4 animate-fade-in flex-wrap">
            <Link to="/dashboard" className="btn-primary text-base px-6 py-3">{t('landing.hero.launch')}</Link>
            <Link to="/live" className="text-sm text-tt-accent2 hover:underline">{t('landing.hero.liveHub')}</Link>
            <span className="text-sm text-tt-muted">{t('landing.hero.free')}</span>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="panel p-4 text-center">
              <div className="text-2xl font-bold font-mono text-tt-accent">{stat.value}</div>
              <div className="text-xs text-tt-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="signals" className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">{t('landing.preview.heading')}</h2>
          <p className="text-tt-muted mb-8">{t('landing.preview.sub')}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">{t('landing.preview.signals')}</span>
                <span className="badge bg-tt-accent/10 text-tt-accent border-tt-accent/20">{t('common.realtime')}</span>
              </div>
              <ul className="p-3 space-y-2">
                {topSignals.map((s) => (
                  <li key={s.id} className="text-sm leading-snug">
                    <span className="text-tt-muted text-xs">{s.source}</span>
                    <p className="mt-0.5">{s.title}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div id="tpi" className="panel">
              <div className="panel-header">
                <span className="panel-title">{t('landing.preview.tpi')}</span>
                <span className="badge bg-tt-gold/10 text-tt-gold border-tt-gold/20">{t('common.sample')}</span>
              </div>
              <ul className="p-3 space-y-1.5">
                {topTPI.map((row) => (
                  <li key={row.country} className="flex items-center justify-between text-sm font-mono">
                    <span>{row.country}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{row.score}</span>
                      <span className={row.trend === 'up' ? 'text-tt-green' : row.trend === 'down' ? 'text-tt-red' : 'text-tt-muted'}>
                        {row.trend === 'up' ? '▲' : row.trend === 'down' ? '▼' : '─'}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">{t('landing.preview.tournaments')}</span>
                <span className="text-xs text-tt-muted">{t('landing.preview.liveCount', { n: liveTournaments.length })}</span>
              </div>
              <ul className="p-3 space-y-2">
                {TOURNAMENTS.slice(0, 4).map((tm) => (
                  <li key={tm.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{tm.name}</span>
                      <span className={`badge text-[9px] ${
                        tm.status === 'live' ? 'bg-tt-red/20 text-tt-red border-tt-red/30' :
                        tm.status === 'upcoming' ? 'bg-tt-accent2/10 text-tt-accent2 border-tt-accent2/20' :
                        'bg-tt-muted/10 text-tt-muted border-tt-muted/20'
                      }`}>{statusLabel(tm.status)}</span>
                    </div>
                    <div className="text-xs text-tt-muted mt-0.5">{t('landing.preview.disruption')} {tm.disruptionScore}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">{t('landing.preview.rankings')}</span>
                <span className="badge bg-tt-accent2/10 text-tt-accent2 border-tt-accent2/20">Top 5</span>
              </div>
              <div className="p-3">
                <div className="text-[10px] text-tt-muted uppercase mb-1">{t('landing.preview.men')}</div>
                {TOP_MEN.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm py-0.5 font-mono">
                    <span><span className="text-tt-muted w-4 inline-block">#{p.rank}</span> {p.name}</span>
                    <span className="text-xs text-tt-muted">{p.country}</span>
                  </div>
                ))}
                <div className="text-[10px] text-tt-muted uppercase mt-3 mb-1">{t('landing.preview.women')}</div>
                {TOP_WOMEN.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm py-0.5 font-mono">
                    <span><span className="text-tt-muted w-4 inline-block">#{p.rank}</span> {p.name}</span>
                    <span className="text-xs text-tt-muted">{p.country}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="correlation" className="px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">{t('landing.correlation.heading')}</h2>
          <p className="text-tt-muted mb-10 max-w-2xl mx-auto">{t('landing.correlation.desc')}</p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {correlationCards.map((item) => (
              <div key={item.title} className="panel p-4">
                <h3 className="font-semibold text-sm mb-2 text-tt-accent2">{item.title}</h3>
                <p className="text-sm text-tt-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-center text-tt-muted">
            {t('landing.sources', { n: FEED_SOURCES.reduce((a, s) => a + s.count, 0) })}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {FEED_SOURCES.map((s) => (
              <span key={s.name} className="badge bg-tt-surface text-tt-muted border-tt-border px-3 py-1">
                {s.name} <span className="text-tt-accent ml-1">{s.count}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center panel p-10">
          <h2 className="text-2xl font-bold mb-3">{t('landing.cta.title')}</h2>
          <p className="text-tt-muted mb-6">{t('landing.cta.desc')}</p>
          <Link to="/dashboard" className="btn-primary text-base px-8 py-3 inline-block">{t('landing.cta.btn')}</Link>
        </div>
      </section>

      <footer className="border-t border-tt-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-tt-muted">
          <span>{t('landing.footer.inspired')} <a href="https://worldmonitor.app" className="text-tt-accent2 hover:underline" target="_blank" rel="noreferrer">World Monitor</a></span>
          <span>{t('landing.footer.meta', { time: formatRelativeTime(new Date().toISOString()) })}</span>
        </div>
      </footer>
    </div>
  );
}
