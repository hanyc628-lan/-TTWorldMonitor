import { useState } from 'react';
import type { StrokeId } from '@/data/motion-lab';
import type { EliteDemonstration } from '@/data/elite-demonstrations';
import { getDemosForStroke } from '@/data/elite-demonstrations';
import { getStrokePreset } from '@/data/motion-lab';
import { useI18n } from '@/i18n';

const FLAG: Record<string, string> = {
  CHN: '🇨🇳', JPN: '🇯🇵', GER: '🇩🇪', KOR: '🇰🇷', TPE: '🇹🇼',
};

interface Props {
  strokeId: StrokeId;
}

export function EliteDemoPanel({ strokeId }: Props) {
  const { t, locale } = useI18n();
  const demos = getDemosForStroke(strokeId);
  const model = getStrokePreset(strokeId);
  const [selectedId, setSelectedId] = useState<string | null>(demos[0]?.id ?? null);

  const selected = demos.find((d) => d.id === selectedId) ?? demos[0];

  if (demos.length === 0) return null;

  return (
    <div className="panel p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs text-tt-gold uppercase font-semibold">{t('motionLab.eliteDemos')}</h3>
        <span className="text-[10px] text-tt-muted font-mono">{demos.length} {t('motionLab.athletes')}</span>
      </div>

      {/* 运动员卡片 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {demos.map((demo) => (
          <AthleteCard
            key={demo.id}
            demo={demo}
            locale={locale}
            active={selected?.id === demo.id}
            onClick={() => setSelectedId(demo.id)}
          />
        ))}
      </div>

      {/* 选中运动员详情 */}
      {selected && (
        <div className="grid md:grid-cols-[1fr_200px] gap-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">
                  {FLAG[selected.countryCode]}{' '}
                  {locale === 'zh' ? selected.athleteZh : selected.athleteEn}
                </p>
                <p className="text-[10px] text-tt-muted">
                  {locale === 'zh' ? selected.rankLabelZh : selected.rankLabelEn}
                </p>
              </div>
              <a
                href={selected.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-[10px] text-tt-accent shrink-0"
              >
                {t('motionLab.watchDemo')} ↗
              </a>
            </div>

            <p className="text-xs text-tt-muted leading-relaxed">
              {locale === 'zh' ? selected.highlightZh : selected.highlightEn}
            </p>

            <div className="flex flex-wrap gap-1">
              {(locale === 'zh' ? selected.tagsZh : selected.tagsEn).map((tag) => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-tt-accent/10 text-tt-accent border border-tt-accent/20">
                  {tag}
                </span>
              ))}
            </div>

            <ul className="space-y-1">
              {(locale === 'zh' ? selected.keysZh : selected.keysEn).map((key, i) => (
                <li key={i} className="text-[11px] text-tt-muted flex gap-1.5">
                  <span className="text-tt-gold shrink-0">▸</span>
                  {key}
                </li>
              ))}
            </ul>
          </div>

          {/* 与模型对照 */}
          <div className="panel p-2 bg-tt-bg/50 space-y-1.5">
            <p className="text-[10px] text-tt-accent2 uppercase">{t('motionLab.modelCompare')}</p>
            <CompareRow
              label={t('motionLab.spin')}
              model={`${model.spinRpm} rpm`}
              athlete={selected.refSpinRpm != null ? `${selected.refSpinRpm} rpm` : '—'}
            />
            <CompareRow
              label={t('motionLab.speed')}
              model={`${model.contactSpeed} m/s`}
              athlete={selected.refSpeedMs != null ? `${selected.refSpeedMs} m/s` : '—'}
            />
            {model.jointAngles.slice(0, 2).map((ja) => (
              <CompareRow
                key={ja.joint}
                label={locale === 'zh' ? ja.jointZh : ja.joint}
                model={`${ja.angle}°`}
                athlete={ja.optimal}
                athleteIsRange
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AthleteCard({
  demo,
  locale,
  active,
  onClick,
}: {
  demo: EliteDemonstration;
  locale: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 w-28 p-2 rounded border text-left transition-colors ${
        active
          ? 'border-tt-gold/60 bg-tt-gold/10'
          : 'border-tt-border hover:border-tt-muted bg-tt-surface'
      }`}
    >
      <div className="text-lg leading-none mb-1">{FLAG[demo.countryCode] ?? '🏓'}</div>
      <p className="text-xs font-semibold truncate">
        {locale === 'zh' ? demo.athleteZh : demo.athleteEn}
      </p>
      <p className="text-[9px] text-tt-muted truncate mt-0.5">
        {locale === 'zh' ? demo.rankLabelZh : demo.rankLabelEn}
      </p>
      {demo.featured && (
        <span className="text-[8px] text-tt-gold mt-1 block">★ {locale === 'zh' ? '标杆' : 'Benchmark'}</span>
      )}
    </button>
  );
}

function CompareRow({
  label,
  model,
  athlete,
  athleteIsRange,
}: {
  label: string;
  model: string;
  athlete: string;
  athleteIsRange?: boolean;
}) {
  return (
    <div className="text-[10px]">
      <span className="text-tt-muted">{label}</span>
      <div className="flex justify-between font-mono mt-0.5">
        <span className="text-tt-accent2">{model}</span>
        <span className="text-tt-gold">{athleteIsRange ? `± ${athlete}` : athlete}</span>
      </div>
    </div>
  );
}
