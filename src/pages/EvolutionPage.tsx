import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app';
import { useT } from '@/i18n';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { formatRelativeTime } from '@/services/analysis-core';
import { STROKE_PRESETS } from '@/data/motion-lab';
import { useAppBootstrap } from '@/app/useAppBootstrap';
import { fetchCloudStatus, type CloudEvolutionStatus } from '@/services/cloud-evolution';

export function EvolutionPage() {
  useAppBootstrap();
  const t = useT();
  const { evolutionState, runEvolution } = useAppStore();
  const [cloudStatus, setCloudStatus] = useState<CloudEvolutionStatus | null>(null);

  useEffect(() => {
    void fetchCloudStatus().then(setCloudStatus);
  }, [evolutionState?.cycle]);

  if (!evolutionState) {
    return (
      <div className="h-screen flex items-center justify-center bg-tt-bg">
        <p className="text-tt-muted">{t('evolution.loading')}</p>
      </div>
    );
  }

  const sortedAxioms = [...evolutionState.axioms].sort(
    (a, b) => (evolutionState.adjustedWeights[b.id] ?? 0) - (evolutionState.adjustedWeights[a.id] ?? 0),
  );

  const strokeLabel = STROKE_PRESETS.find((s) => s.id === evolutionState.learnedPreferences.strokeFocus)?.nameZh;
  const domainLabels: Record<string, string> = {
    biomech: t('motionLab.domains.biomech'),
    mechanics: t('motionLab.domains.mechanics'),
    aesthetics: t('motionLab.domains.aesthetics'),
  };
  const domainLabel = evolutionState.learnedPreferences.domainFocus
    ? domainLabels[evolutionState.learnedPreferences.domainFocus]
    : null;

  return (
    <div className="min-h-screen bg-tt-bg flex flex-col">
      <header className="h-11 border-b border-tt-border bg-tt-surface flex items-center px-4 gap-3 shrink-0">
        <Link to="/dashboard" className="text-sm text-tt-muted hover:text-tt-text">
          {t('evolution.back')}
        </Link>
        <span className="font-semibold text-sm">{t('evolution.title')}</span>
        <span className="text-[10px] font-mono text-tt-accent2">
          {t('evolution.cycle', { n: evolutionState.cycle })}
        </span>
        {cloudStatus?.running && (
          <span className="text-[10px] font-mono text-tt-green">
            ☁ {t('evolution.cloudStatus')} · {t('evolution.cloudTicks', { n: cloudStatus.tickCount })}
          </span>
        )}
        <div className="flex-1" />
        <button onClick={() => runEvolution(true)} className="btn-ghost text-xs text-tt-accent2">
          {t('evolution.evolveNow')}
        </button>
        <LanguageSwitcher />
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 space-y-4">
        {/* 流程 */}
        <div className="panel p-4">
          <h2 className="text-xs text-tt-accent2 uppercase mb-3">{t('evolution.pipeline')}</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {(['observe', 'hypothesize', 'verify', 'adjust', 'insight', 'learn'] as const).map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-tt-accent2/20 text-tt-accent2 flex items-center justify-center text-[10px] font-mono">
                  {i + 1}
                </span>
                <span className="text-tt-muted">{t(`evolution.steps.${step}`)}</span>
                {i < 5 && <span className="text-tt-border">→</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* 洞察 */}
          <div className="panel p-4">
            <h2 className="text-xs text-tt-accent2 uppercase mb-2">{t('evolution.insights')}</h2>
            {evolutionState.insights.length === 0 ? (
              <p className="text-xs text-tt-muted">{t('evolution.noInsights')}</p>
            ) : (
              evolutionState.insights.map((insight, i) => (
                <p key={i} className="text-xs text-tt-muted py-1 border-b border-tt-border/30 last:border-0">
                  {insight}
                </p>
              ))
            )}
          </div>

          {/* 学习偏好 */}
          <div className="panel p-4">
            <h2 className="text-xs text-tt-gold uppercase mb-2">{t('evolution.learned')}</h2>
            <div className="space-y-2 text-xs">
              {strokeLabel && (
                <div className="flex justify-between">
                  <span className="text-tt-muted">{t('evolution.strokeFocus')}</span>
                  <Link to="/motion-lab" className="text-tt-accent">{strokeLabel}</Link>
                </div>
              )}
              {domainLabel && (
                <div className="flex justify-between">
                  <span className="text-tt-muted">{t('evolution.domainFocus')}</span>
                  <span className="text-tt-accent">{domainLabel}</span>
                </div>
              )}
              {evolutionState.learnedPreferences.heatmapMetric && (
                <div className="flex justify-between">
                  <span className="text-tt-muted">{t('evolution.heatmapFocus')}</span>
                  <span className="font-mono text-tt-accent">{evolutionState.learnedPreferences.heatmapMetric}</span>
                </div>
              )}
              {!strokeLabel && !domainLabel && (
                <p className="text-tt-muted">{t('evolution.noLearned')}</p>
              )}
            </div>
            {evolutionState.motionInsights.length > 0 && (
              <div className="mt-3 pt-3 border-t border-tt-border/50">
                {evolutionState.motionInsights.map((m, i) => (
                  <p key={i} className="text-[11px] text-tt-muted">{m}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 公理库 */}
        <div className="panel p-4">
          <h2 className="text-xs text-tt-accent2 uppercase mb-3">{t('evolution.axioms')}</h2>
          <div className="space-y-3">
            {sortedAxioms.map((axiom) => {
              const weight = evolutionState.adjustedWeights[axiom.id] ?? axiom.weight;
              const pct = Math.round(weight * 100);
              const basePct = Math.round(axiom.weight * 100);
              const delta = pct - basePct;
              return (
                <div key={axiom.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{axiom.principle}</p>
                      <p className="text-[11px] text-tt-muted mt-0.5">{axiom.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm text-tt-accent2">{pct}%</span>
                      {delta !== 0 && (
                        <span className={`block text-[10px] font-mono ${delta > 0 ? 'text-tt-green' : 'text-tt-red'}`}>
                          {delta > 0 ? '+' : ''}{delta}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-tt-surface rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-tt-accent2 rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 观察记录 */}
        <div className="panel p-4">
          <h2 className="text-xs text-tt-accent2 uppercase mb-2">{t('evolution.observations')}</h2>
          <div className="max-h-64 overflow-y-auto">
            {evolutionState.observations.length === 0 ? (
              <p className="text-xs text-tt-muted">{t('evolution.noObservations')}</p>
            ) : (
              evolutionState.observations.map((obs) => (
                <div key={obs.id} className="text-xs py-2 border-b border-tt-border/30 last:border-0 flex gap-2">
                  <span className={obs.supports ? 'text-tt-green shrink-0' : 'text-tt-red shrink-0'}>
                    {obs.supports ? '✓' : '✗'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-tt-muted">{obs.evidence}</p>
                    <p className="text-[10px] text-tt-muted/70 mt-0.5">
                      {obs.source} · {formatRelativeTime(obs.timestamp)} · {(obs.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <footer className="text-center text-[10px] text-tt-muted py-3 border-t border-tt-border">
        {t('evolution.footer', { time: formatRelativeTime(evolutionState.lastEvolvedAt) })}
      </footer>
    </div>
  );
}
