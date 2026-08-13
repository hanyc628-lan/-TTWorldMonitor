import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/app';
import { searchCommands, LAYER_PRESETS, LAYER_KEY_MAP } from '@/config/commands';
import type { Command } from '@/types';
import type { MapLayerKey } from '@/types';
import type { SiteVariant } from '@/types';
import { useI18n, localizeCommandLabel } from '@/i18n';

const CATEGORY_KEYS: Record<string, string> = {
  navigate: 'search.cat.navigate',
  layers: 'search.cat.layers',
  panels: 'search.cat.panels',
  view: 'search.cat.view',
  actions: 'search.cat.actions',
  country: 'search.cat.country',
};

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useAppStore();
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = searchCommands(query);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  if (!searchOpen) return null;

  function executeCommand(cmd: Command) {
    const store = useAppStore.getState();

    if (cmd.id.startsWith('nav:')) {
      if (cmd.id === 'nav:live-hub') navigate('/live');
      else if (cmd.id === 'nav:motion-lab') navigate('/motion-lab');
      else if (cmd.id === 'nav:evolution') navigate('/evolution');
    } else if (cmd.id.startsWith('layers:')) {
      const preset = cmd.id.replace('layers:', '');
      if (preset === 'all') store.setAllLayers(true);
      else if (preset === 'none') store.setAllLayers(false);
      else if (LAYER_PRESETS[preset]) store.setLayerPreset(LAYER_PRESETS[preset] as MapLayerKey[]);
    } else if (cmd.id.startsWith('layer:')) {
      const raw = cmd.id.replace('layer:', '');
      const key = (LAYER_KEY_MAP[raw] ?? raw) as MapLayerKey;
      store.toggleLayer(key);
    } else if (cmd.id.startsWith('panel:')) {
      const panelId = cmd.id.replace('panel:', '');
      if (window.location.pathname !== '/dashboard') navigate('/dashboard');
      setTimeout(() => store.revealPanel(panelId), 100);
    } else if (cmd.id.startsWith('view:')) {
      const v = cmd.id.replace('view:', '') as SiteVariant;
      store.setVariant(v);
    } else if (cmd.id.startsWith('country:')) {
      const code = cmd.id.replace('country:', '');
      if (window.location.pathname !== '/dashboard') navigate('/dashboard');
      store.selectCountry(code);
    } else if (cmd.id === 'action:refresh') {
      void store.refreshData();
    } else if (cmd.id === 'action:toggle-sidebar') {
      store.toggleSidebar();
    }

    setSearchOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      executeCommand(results[selectedIdx]);
    }
  }

  const grouped = results.reduce<Record<string, Command[]>>((acc, cmd) => {
    (acc[cmd.category] ??= []).push(cmd);
    return acc;
  }, {});

  let flatIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="panel w-full max-w-xl mx-4 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-tt-border flex items-center gap-2">
          <span className="text-tt-muted">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-tt-muted"
          />
          <span className="text-[10px] font-mono text-tt-muted border border-tt-border px-1.5 py-0.5 rounded">ESC</span>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="text-sm text-tt-muted text-center py-6">{t('search.noResults')}</div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category} className="mb-2">
                <div className="text-[10px] text-tt-muted uppercase px-2 py-1 tracking-wider">
                  {t(CATEGORY_KEYS[category] ?? category)}
                </div>
                {cmds.map((cmd) => {
                  const idx = flatIdx++;
                  const isSelected = idx === selectedIdx;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors ${
                        isSelected ? 'bg-tt-accent/20 text-tt-accent' : 'hover:bg-tt-surface'
                      }`}
                    >
                      <span>{cmd.icon}</span>
                      <span className="flex-1">{localizeCommandLabel(cmd.id)}</span>
                      {cmd.id.startsWith('view:') && (
                        <span className="text-[10px] text-tt-muted">
                          {t(`variants.${cmd.id.replace('view:', '') as SiteVariant}`)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="px-3 py-2 border-t border-tt-border text-[10px] text-tt-muted font-mono flex gap-4">
          <span>{t('search.nav')}</span>
          <span>{t('search.execute')}</span>
          <span>{t('search.close')}</span>
        </div>
      </div>
    </div>
  );
}
