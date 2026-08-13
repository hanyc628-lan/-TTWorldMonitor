import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/app';
import { refreshScheduler } from '@/services/refresh-scheduler';
import { getVariantConfig } from '@/config/variants';
import { onTTEvent, TT_EVENTS } from '@/utils/event-bus';
import type { BreakingAlert } from '@/types';
import { startCloudEvolutionSync, stopCloudEvolutionSync } from '@/services/cloud-evolution';

/** Boot sequence — mirrors World Monitor App.init() */
export function useAppBootstrap() {
  const booted = useAppStore((s) => s.booted);
  const boot = useAppStore((s) => s.boot);
  const refreshData = useAppStore((s) => s.refreshData);
  const runCorrelation = useAppStore((s) => s.runCorrelationEngine);
  const addBreakingAlert = useAppStore((s) => s.addBreakingAlert);
  const variant = useAppStore((s) => s.variant);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    void boot();
  }, [boot]);

  useEffect(() => {
    if (!booted) return;

    const config = getVariantConfig(variant);
    for (const panel of Object.values(config.panels)) {
      if (!panel.refreshIntervalMs) continue;
      refreshScheduler.register(
        panel.id,
        panel.refreshIntervalMs,
        async () => {
          if (panel.id === 'liveMatches' || panel.id === 'signals') {
            await refreshData();
          }
          if (panel.id === 'liveStreams') {
            await useAppStore.getState().refreshStreams();
          }
          if (panel.id === 'correlation') {
            await runCorrelation();
          }
          if (panel.id === 'evolution') {
            useAppStore.getState().runEvolution();
          }
        },
        () => document.visibilityState === 'visible',
      );
    }

    return () => {
      for (const panel of Object.values(config.panels)) {
        refreshScheduler.unregister(panel.id);
      }
    };
  }, [booted, variant, refreshData, runCorrelation]);

  useEffect(() => {
    if (!booted) return;
    startCloudEvolutionSync((state) => {
      useAppStore.setState({ evolutionState: state });
    });
    return () => stopCloudEvolutionSync();
  }, [booted]);

  useEffect(() => {
    return onTTEvent<BreakingAlert>(TT_EVENTS.BREAKING_NEWS, (alert) => {
      addBreakingAlert(alert);
    });
  }, [addBreakingAlert]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useAppStore.getState().setSearchOpen(!useAppStore.getState().searchOpen);
      }
      if (e.key === 'Escape') {
        useAppStore.getState().setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
