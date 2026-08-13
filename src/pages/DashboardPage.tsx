import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/app';
import { WorldMap } from '@/components/map/WorldMap';
import { LayerControls } from '@/components/dashboard/LayerControls';
import { LensSelector } from '@/components/dashboard/LensSelector';
import { SignalsPanel } from '@/components/panels/SignalsPanel';
import { TPIPanel } from '@/components/panels/TPIPanel';
import { TournamentsPanel } from '@/components/panels/TournamentsPanel';
import { LiveMatchesPanel } from '@/components/panels/LiveMatchesPanel';
import { CorrelationPanel } from '@/components/panels/CorrelationPanel';
import { LiveStreamsPanel } from '@/components/panels/LiveStreamsPanel';
import { EvolutionPanel } from '@/components/panels/EvolutionPanel';
import { RankingsPanel } from '@/components/panels/RankingsPanel';
import { LeaguesPanel } from '@/components/panels/LeaguesPanel';
import { LeagueDataPanel } from '@/components/panels/LeagueDataPanel';
import { GrassrootsPanel } from '@/components/panels/GrassrootsPanel';
import { GearPanel } from '@/components/panels/GearPanel';
import { CountryDossier } from '@/components/dashboard/CountryDossier';
import { SearchModal } from '@/components/SearchModal';
import { BreakingNewsBanner } from '@/components/BreakingNewsBanner';
import { useAppBootstrap } from '@/app/useAppBootstrap';
import { getVariantConfig } from '@/config/variants';
import { useI18n } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function DashboardPage() {
  useAppBootstrap();
  const { t } = useI18n();

  const { variant, selectedCountry, sidebarCollapsed, toggleSidebar, booted, bootError } = useAppStore();
  const config = getVariantConfig(variant);
  const leftPanels = Object.values(config.panels).filter((p) => p.side === 'left');
  const rightPanels = Object.values(config.panels).filter((p) => p.side === 'right');

  const panelComponents: Record<string, ReactNode> = {
    tpi: <TPIPanel />,
    signals: <SignalsPanel />,
    correlation: <CorrelationPanel />,
    liveMatches: <LiveMatchesPanel />,
    tournaments: <TournamentsPanel />,
    rankings: <RankingsPanel />,
    liveStreams: <LiveStreamsPanel />,
    evolution: <EvolutionPanel />,
    leagues: <LeaguesPanel />,
    leagueData: <LeagueDataPanel />,
    grassroots: <GrassrootsPanel />,
    gear: <GearPanel />,
  };

  if (!booted) {
    return (
      <div className="h-screen flex items-center justify-center bg-tt-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-tt-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-tt-muted">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="h-11 border-b border-tt-border bg-tt-surface flex items-center px-3 gap-3 shrink-0">
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 rounded bg-tt-accent/20 flex items-center justify-center">
            <span className="text-tt-accent text-[10px] font-bold">TT</span>
          </div>
          <span className="font-semibold text-sm hidden sm:inline">TTWorldMonitor</span>
        </Link>

        <div className="h-4 w-px bg-tt-border" />
        <LensSelector />
        <div className="flex-1" />

        {bootError && (
          <span className="text-[10px] text-tt-gold font-mono">{t('dashboard.seedMode')}</span>
        )}

        <span className="text-[10px] font-mono text-tt-muted hidden md:inline">
          {t(`variants.name.${variant}`)} · {t(`variants.${variant}`)}
        </span>

        <Link to="/live" className="btn-ghost text-xs text-tt-accent hidden sm:inline">
          {t('dashboard.liveHub')}
        </Link>

        <Link to="/motion-lab" className="btn-ghost text-xs text-tt-accent2 hidden sm:inline">
          {t('dashboard.motionLab')}
        </Link>

        <Link to="/evolution" className="btn-ghost text-xs text-tt-accent2 hidden md:inline">
          {t('dashboard.evolution')}
        </Link>

        <LanguageSwitcher />

        <button onClick={toggleSidebar} className="btn-ghost text-xs">
          {sidebarCollapsed ? '◧' : '◨'}
        </button>

        <button
          onClick={() => useAppStore.getState().setSearchOpen(true)}
          className="btn-ghost text-xs font-mono hidden sm:flex items-center gap-1"
        >
          <span>⌘K</span>
          <span className="text-tt-muted">{t('dashboard.command')}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-tt-green animate-pulse-slow" />
          <span className="text-[10px] text-tt-green font-mono">{t('common.live')}</span>
        </div>
      </header>

      <BreakingNewsBanner />

      <div className="flex-1 flex overflow-hidden">
        {!sidebarCollapsed && (
          <aside className="w-72 border-r border-tt-border overflow-y-auto shrink-0 hidden lg:block">
            <div className="p-2 space-y-2">
              {leftPanels.map((p) => (
                <div key={p.id}>{panelComponents[p.id]}</div>
              ))}
            </div>
          </aside>
        )}

        <main className="flex-1 relative">
          <WorldMap />
          <LayerControls />
        </main>

        {!sidebarCollapsed && (
          <aside className="w-72 border-l border-tt-border overflow-y-auto shrink-0 hidden md:block">
            <div className="p-2 space-y-2">
              {rightPanels.map((p) => (
                <div key={p.id}>{panelComponents[p.id]}</div>
              ))}
            </div>
          </aside>
        )}
      </div>

      <div className="lg:hidden border-t border-tt-border max-h-48 overflow-y-auto">
        <div className="p-2 grid grid-cols-2 gap-2">
          <TPIPanel compact />
          <SignalsPanel compact />
        </div>
      </div>

      {selectedCountry && <CountryDossier />}
      <SearchModal />
    </div>
  );
}
