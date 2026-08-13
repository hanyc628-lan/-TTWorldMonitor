import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MOTION_AXIOMS,
  STROKE_GROUPS,
  STROKE_PRESETS,
  getStrokePreset,
  type MotionDomain,
  type StrokeId,
  type ViewMode,
} from '@/data/motion-lab';
import { BiomechCanvas2D } from '@/components/motion/BiomechCanvas2D';
import { BiomechCanvas3D } from '@/components/motion/BiomechCanvas3D';
import { MechanicsCanvas2D } from '@/components/motion/MechanicsCanvas2D';
import { MechanicsCanvas3D } from '@/components/motion/MechanicsCanvas3D';
import { AestheticsCanvas } from '@/components/motion/AestheticsCanvas';
import { EliteDemoPanel } from '@/components/motion/EliteDemoPanel';
import { useI18n } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { recordMotionLabVisit } from '@/services/motion-lab-usage';

export function MotionLabPage() {
  const { t, locale } = useI18n();
  const [domain, setDomain] = useState<MotionDomain>('biomech');
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [strokeId, setStrokeId] = useState<StrokeId>('forehand-loop');
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showDemos, setShowDemos] = useState(true);

  const stroke = getStrokePreset(strokeId);
  const strokeName = locale === 'zh' ? stroke.nameZh : stroke.nameEn;

  useEffect(() => {
    recordMotionLabVisit(domain, strokeId);
  }, [domain, strokeId]);

  useEffect(() => {
    if (!playing) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      setPhase(((now - start) % 4000) / 4000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, strokeId, domain]);

  const renderCanvas = () => {
    if (domain === 'biomech') {
      return viewMode === '2d'
        ? <BiomechCanvas2D stroke={stroke} phase={phase} />
        : <BiomechCanvas3D stroke={stroke} phase={phase} />;
    }
    if (domain === 'mechanics') {
      return viewMode === '2d'
        ? <MechanicsCanvas2D stroke={stroke} phase={phase} />
        : <MechanicsCanvas3D stroke={stroke} phase={phase} />;
    }
    return <AestheticsCanvas stroke={stroke} phase={phase} mode={viewMode} />;
  };

  const domains: { id: MotionDomain; label: string }[] = [
    { id: 'biomech', label: t('motionLab.domains.biomech') },
    { id: 'mechanics', label: t('motionLab.domains.mechanics') },
    { id: 'aesthetics', label: t('motionLab.domains.aesthetics') },
  ];

  const strokeLabel = (id: StrokeId) => {
    const s = STROKE_PRESETS.find((p) => p.id === id);
    return s ? (locale === 'zh' ? s.nameZh : s.nameEn) : id;
  };

  return (
    <div className="min-h-screen bg-tt-bg flex flex-col">
      <header className="h-11 border-b border-tt-border bg-tt-surface flex items-center px-4 gap-3 shrink-0">
        <Link to="/dashboard" className="text-sm text-tt-muted hover:text-tt-text">
          {t('motionLab.back')}
        </Link>
        <span className="font-semibold text-sm">{t('motionLab.title')}</span>
        <span className="text-[10px] font-mono text-tt-accent hidden sm:inline">{t('motionLab.subtitle')}</span>
        <div className="flex-1" />
        <LanguageSwitcher />
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 grid lg:grid-cols-[1fr_280px] gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => setDomain(d.id)}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  domain === d.id
                    ? 'border-tt-accent bg-tt-accent/10 text-tt-accent'
                    : 'border-tt-border text-tt-muted hover:text-tt-text'
                }`}
              >
                {d.label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => setShowDemos((v) => !v)}
              className={`px-2 py-1.5 text-xs rounded border ${
                showDemos ? 'border-tt-gold text-tt-gold' : 'border-tt-border text-tt-muted'
              }`}
            >
              {t('motionLab.eliteDemos')}
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-2 py-1.5 text-xs rounded border ${
                viewMode === '2d' ? 'border-tt-accent text-tt-accent' : 'border-tt-border text-tt-muted'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2 py-1.5 text-xs rounded border ${
                viewMode === '3d' ? 'border-tt-accent text-tt-accent' : 'border-tt-border text-tt-muted'
              }`}
            >
              3D
            </button>
          </div>

          <div className="panel p-1 aspect-[16/10] relative overflow-hidden">
            {renderCanvas()}
            <div className="absolute top-2 left-2 text-[10px] font-mono text-tt-muted bg-tt-bg/80 px-2 py-0.5 rounded">
              {strokeName} · {viewMode.toUpperCase()}
            </div>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="absolute bottom-2 right-2 btn-ghost text-xs"
            >
              {playing ? t('motionLab.pause') : t('motionLab.play')}
            </button>
          </div>

          {/* 分组技术选择 */}
          {STROKE_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="text-[10px] text-tt-muted uppercase mb-1.5">
                {locale === 'zh' ? group.nameZh : group.nameEn}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.strokes.map((id) => (
                  <button
                    key={id}
                    onClick={() => setStrokeId(id)}
                    className={`px-2.5 py-1.5 text-xs rounded border transition-colors ${
                      strokeId === id
                        ? 'border-tt-accent/50 bg-tt-accent/10 text-tt-accent'
                        : 'border-tt-border text-tt-muted hover:border-tt-muted hover:text-tt-text'
                    }`}
                  >
                    {strokeLabel(id)}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {showDemos && <EliteDemoPanel strokeId={strokeId} />}
        </div>

        <aside className="space-y-3">
          <div className="panel p-3">
            <h3 className="text-xs text-tt-accent2 uppercase mb-2">{t('motionLab.axioms')}</h3>
            {MOTION_AXIOMS.map((ax) => (
              <div key={ax.id} className="mb-3 last:mb-0">
                <p className="text-xs font-semibold">{locale === 'zh' ? ax.titleZh : ax.titleEn}</p>
                <p className="text-[11px] text-tt-muted mt-0.5 leading-relaxed">
                  {locale === 'zh' ? ax.statementZh : ax.statementEn}
                </p>
              </div>
            ))}
          </div>

          {domain === 'biomech' && (
            <div className="panel p-3">
              <h3 className="text-xs text-tt-accent2 uppercase mb-2">{t('motionLab.jointAngles')}</h3>
              {stroke.jointAngles.map((ja) => (
                <div key={ja.joint} className="flex justify-between text-xs py-1 border-b border-tt-border/50 last:border-0">
                  <span className="text-tt-muted">{locale === 'zh' ? ja.jointZh : ja.joint}</span>
                  <span className="font-mono">
                    <span className="text-tt-accent">{ja.angle}°</span>
                    <span className="text-tt-muted ml-1">/ {ja.optimal}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {domain === 'mechanics' && (
            <div className="panel p-3">
              <h3 className="text-xs text-tt-accent2 uppercase mb-2">{t('motionLab.mechanics')}</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-tt-muted">{t('motionLab.spin')}</span>
                  <span className="font-mono text-tt-accent">{stroke.spinRpm} rpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tt-muted">{t('motionLab.speed')}</span>
                  <span className="font-mono text-tt-accent">{stroke.contactSpeed} m/s</span>
                </div>
              </div>
            </div>
          )}

          {domain === 'aesthetics' && (
            <div className="panel p-3">
              <h3 className="text-xs text-tt-accent2 uppercase mb-2">{t('motionLab.aesthetics')}</h3>
              {(['symmetry', 'rhythm', 'flow', 'golden'] as const).map((key) => (
                <div key={key} className="mb-2">
                  <div className="flex justify-between text-[10px] text-tt-muted mb-0.5">
                    <span>{t(`motionLab.scores.${key}`)}</span>
                    <span>{(stroke.aesthetic[key] * 100).toFixed(0)}</span>
                  </div>
                  <div className="h-1.5 bg-tt-border rounded overflow-hidden">
                    <div
                      className="h-full bg-tt-gold rounded"
                      style={{ width: `${stroke.aesthetic[key] * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      <footer className="text-center text-[10px] text-tt-muted py-3 border-t border-tt-border">
        {t('motionLab.footer')}
      </footer>
    </div>
  );
}
