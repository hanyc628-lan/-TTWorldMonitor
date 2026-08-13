import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app';
import { useT } from '@/i18n';
import { Link } from 'react-router-dom';
import { Panel } from './Panel';
import { formatRelativeTime } from '@/services/analysis-core';
import { STROKE_PRESETS } from '@/data/motion-lab';
import { fetchCloudStatus, type CloudEvolutionStatus } from '@/services/cloud-evolution';

export function EvolutionPanel() {
  const t = useT();
  const { evolutionState, runEvolution } = useAppStore();
  const [cloudStatus, setCloudStatus] = useState<CloudEvolutionStatus | null>(null);

  useEffect(() => {
    void fetchCloudStatus().then(setCloudStatus);
    const id = setInterval(() => void fetchCloudStatus().then(setCloudStatus), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!evolutionState) return null;

  const topAxioms = [...evolutionState.axioms]
    .sort((a, b) => (evolutionState.adjustedWeights[b.id] ?? 0) - (evolutionState.adjustedWeights[a.id] ?? 0))
    .slice(0, 4);

  const strokeLabel = STROKE_PRESETS.find((s) => s.id === evolutionState.learnedPreferences.strokeFocus)?.nameZh;

  return (
    <Panel
      id="evolution"
      title={t('panels.evolution.title')}
      badge={
        <div className="flex gap-1">
          {cloudStatus?.running && (
            <span className="badge bg-tt-green/10 text-tt-green border-tt-green/20 text-[9px]">
              ☁ {t('panels.evolution.cloudLive')}
            </span>
          )}
          <span className="badge bg-tt-accent2/10 text-tt-accent2 border-tt-accent2/20 text-[9px]">
            {t('panels.evolution.cycle', { n: evolutionState.cycle })}
          </span>
        </div>
      }
    >
      {evolutionState.insights.length > 0 && (
        <div className="mb-3 p-2 rounded bg-tt-accent2/5 border border-tt-accent2/20">
          <div className="text-[10px] text-tt-accent2 uppercase mb-1">{t('panels.evolution.insights')}</div>
          {evolutionState.insights.slice(0, 2).map((insight, i) => (
            <p key={i} className="text-xs text-tt-muted leading-relaxed">{insight}</p>
          ))}
        </div>
      )}

      {evolutionState.motionInsights.length > 0 && (
        <div className="mb-3 p-2 rounded bg-tt-gold/5 border border-tt-gold/20">
          <div className="text-[10px] text-tt-gold uppercase mb-1">{t('panels.evolution.motionLearn')}</div>
          <p className="text-xs text-tt-muted">{evolutionState.motionInsights[0]}</p>
        </div>
      )}

      {strokeLabel && (
        <div className="text-[10px] text-tt-muted mb-2">
          {t('panels.evolution.learnedPref')}: <span className="text-tt-accent">{strokeLabel}</span>
        </div>
      )}

      <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.evolution.axioms')}</div>
      {topAxioms.map((axiom) => {
        const weight = evolutionState.adjustedWeights[axiom.id] ?? axiom.weight;
        const pct = Math.round(weight * 100);
        return (
          <div key={axiom.id} className="mb-2">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate">{axiom.principle}</span>
              <span className="font-mono text-tt-muted shrink-0 ml-1">{pct}%</span>
            </div>
            <div className="h-1 bg-tt-surface rounded-full mt-0.5 overflow-hidden">
              <div
                className="h-full bg-tt-accent2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="text-[10px] text-tt-muted uppercase mt-3 mb-1">{t('panels.evolution.observations')}</div>
      {evolutionState.observations.slice(0, 3).map((obs) => (
        <div key={obs.id} className="text-[10px] py-1 border-b border-tt-border/30 last:border-0">
          <span className={obs.supports ? 'text-tt-green' : 'text-tt-red'}>
            {obs.supports ? '✓' : '✗'}
          </span>
          <span className="text-tt-muted ml-1">{obs.evidence}</span>
          <span className="text-tt-muted float-right">{formatRelativeTime(obs.timestamp)}</span>
        </div>
      ))}

      <div className="mt-3 flex gap-2">
        <button onClick={() => runEvolution(true)} className="btn-ghost text-[10px] flex-1">
          {t('panels.evolution.evolveNow')}
        </button>
        <Link to="/evolution" className="btn-ghost text-[10px] flex-1 text-center">
          {t('panels.evolution.fullView')}
        </Link>
      </div>

      <div className="mt-2 text-[9px] text-tt-muted font-mono">
        {t('panels.evolution.lastEvolved', { time: formatRelativeTime(evolutionState.lastEvolvedAt) })}
      </div>
    </Panel>
  );
}
