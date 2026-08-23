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

/** 分区布局：按信息优先级分组，避免扁平网格留白与逻辑混乱 */

export function DashboardPage() {
  useAppBootstrap();
  const { t } = useI18n();

  const { variant, selectedCountry, sidebarCollapsed, toggleSidebar, booted, bootError } = useAppStore();
  const config = getVariantConfig(variant);
  const enabledIds = new Set(Object.keys(config.panels));

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

  const has = (id: string) => enabledIds.has(id) && panelComponents[id];

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
      {/* Header */}
      <header className="h-11 sm:h-12 border-b border-tt-border bg-tt-surface flex items-center px-2 sm:px-3 gap-2 sm:gap-3 shrink-0 overflow-x-auto">
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 rounded bg-tt-accent/20 flex items-center justify-center">
            <span className="text-tt-accent text-[10px] font-bold">TT</span>
          </div>
          <span className="font-semibold text-sm hidden sm:inline">TTWorldMonitor</span>
        </Link>

        <div className="h-4 w-px bg-tt-border hidden sm:block" />
        <div className="hidden sm:block">
          <LensSelector />
        </div>
        <div className="flex-1 hidden sm:block" />

        {bootError && t('dashboard.seedMode') ? (
          <span className="text-[10px] text-tt-gold font-mono">{t('dashboard.seedMode')}</span>
        ) : null}

        <span className="text-[10px] font-mono text-tt-muted hidden lg:inline">
          {t(`variants.name.${variant}`)} · {t(`variants.${variant}`)}
        </span>

        <Link
          to="/live"
          className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-tt-red border border-tt-red/40 bg-tt-red/10 hover:bg-tt-red/20 rounded-full"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-tt-red animate-pulse" />
          <span>{t('dashboard.liveXiaohan')}</span>
        </Link>

        <Link to="/analysis" className="btn-ghost text-xs text-tt-accent2 px-2 py-1.5 whitespace-nowrap hidden sm:inline">
          🔬 {t('dashboard.analysis')}
        </Link>

        <Link to="/match-lab" className="btn-ghost text-xs text-tt-accent2 px-2 py-1.5 whitespace-nowrap hidden sm:inline">
          🏓 对战模拟
        </Link>

        <Link to="/motion-lab" className="btn-ghost text-xs text-tt-accent2 px-2 py-1.5 whitespace-nowrap hidden xs:inline">
          🎬
        </Link>

        <Link to="/evolution" className="btn-ghost text-xs text-tt-accent2 px-2 py-1.5 whitespace-nowrap hidden md:inline">
          🧬
        </Link>

        <LanguageSwitcher />

        <button onClick={toggleSidebar} className="btn-ghost text-xs px-2 py-1.5">
          {sidebarCollapsed ? '◧' : '◨'}
        </button>

        <button
          onClick={() => useAppStore.getState().setSearchOpen(true)}
          className="btn-ghost text-xs font-mono px-2 py-1.5 hidden sm:flex items-center gap-1"
        >
          <span>⌘K</span>
        </button>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-tt-green animate-pulse-slow" />
          <span className="text-[10px] text-tt-green font-mono hidden xs:inline">{t('common.live')}</span>
        </div>
      </header>

      <BreakingNewsBanner />

      <div className="block sm:hidden border-b border-tt-border bg-tt-surface px-2 py-1.5">
        <LensSelector />
      </div>

      {/* Main — 地图 + 瀑布流面板（无行高拉伸空白） */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-2 sm:p-3 space-y-3 max-w-[1600px] mx-auto">
          {/* 全球地图 */}
          <div className="relative rounded-xl overflow-hidden border border-tt-border bg-[#0d1117] h-[200px] sm:h-[240px] lg:h-[280px]">
            <WorldMap />
            {!sidebarCollapsed && <LayerControls />}
          </div>

          {/*
            瀑布流：CSS multi-column，面板按内容高度紧密堆叠，
            不会出现 grid 行对齐造成的大块空白。
            顺序：信号 → 关联+直播 → TPI → 比分 → 赛事 → 排名 → 联赛 → 数据 → 进化 → 基层 → 器材
          */}
          <div className="panel-masonry">
            {has('liveStreams') && (
              <div className="panel-masonry-item">{panelComponents.liveStreams}</div>
            )}
            {has('signals') && <div className="panel-masonry-item">{panelComponents.signals}</div>}
            {has('correlation') && (
              <div className="panel-masonry-item">{panelComponents.correlation}</div>
            )}
            {has('tpi') && <div className="panel-masonry-item">{panelComponents.tpi}</div>}
            {has('liveMatches') && <div className="panel-masonry-item">{panelComponents.liveMatches}</div>}
            {has('tournaments') && <div className="panel-masonry-item">{panelComponents.tournaments}</div>}
            {has('rankings') && <div className="panel-masonry-item">{panelComponents.rankings}</div>}
            {has('leagues') && <div className="panel-masonry-item">{panelComponents.leagues}</div>}
            {has('leagueData') && <div className="panel-masonry-item">{panelComponents.leagueData}</div>}
            {has('evolution') && <div className="panel-masonry-item">{panelComponents.evolution}</div>}
            {has('grassroots') && <div className="panel-masonry-item">{panelComponents.grassroots}</div>}
            {has('gear') && <div className="panel-masonry-item">{panelComponents.gear}</div>}
          </div>
        </div>
      </div>

      {selectedCountry && <CountryDossier />}
      <SearchModal />
    </div>
  );
}
