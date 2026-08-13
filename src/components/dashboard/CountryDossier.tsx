import { useAppStore } from '@/store/app';
import { COUNTRY_MAP } from '@/data/countries';
import { getTrendColor, getTrendIcon } from '@/server/tpi-scoring';
import { useI18n } from '@/i18n';
import { useCountryName } from '@/components/LanguageSwitcher';

const COMPONENT_KEYS: Record<string, string> = {
  eliteOutput: 'heatmap.pillar.eliteOutput',
  pipelineDepth: 'heatmap.pillar.pipelineDepth',
  eventGravity: 'heatmap.pillar.eventGravity',
  massBase: 'heatmap.pillar.massBase',
  systemMomentum: 'heatmap.pillar.systemMomentum',
};

export function CountryDossier() {
  const { t, locale } = useI18n();
  const { selectedCountry, selectCountry, tpiData } = useAppStore();
  const displayName = useCountryName(selectedCountry ?? '');

  if (!selectedCountry) return null;

  const country = COUNTRY_MAP[selectedCountry];
  const tpi = tpiData.find((row) => row.country === selectedCountry);
  if (!country || !tpi) return null;

  const dateLocale = locale === 'zh' ? 'zh-CN' : locale;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => selectCountry(null)}
    >
      <div
        className="panel w-full max-w-lg mx-4 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <span className="text-lg font-bold">{displayName}</span>
            <span className="text-tt-muted text-sm ml-2">{country.name}</span>
          </div>
          <button onClick={() => selectCountry(null)} className="btn-ghost text-lg">×</button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-tt-accent">{tpi.score}</div>
              <div className="text-[10px] text-tt-muted uppercase">{t('dossier.tpi', { v: tpi.methodologyVersion })}</div>
            </div>
            <div className={`text-lg font-mono ${getTrendColor(tpi.trend)}`}>
              {getTrendIcon(tpi.trend)} {tpi.change24h !== 0 && `${tpi.change24h > 0 ? '+' : ''}${tpi.change24h}`}
            </div>
            <div className="flex-1 grid grid-cols-5 gap-1 text-center">
              {Object.entries(tpi.components).map(([key, val]) => (
                <div key={key}>
                  <div className="text-sm font-mono font-semibold">{val}</div>
                  <div className="text-[8px] text-tt-muted leading-tight">
                    {t(COMPONENT_KEYS[key] ?? key)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="panel-title mb-1">{t('dossier.aiBrief')}</div>
            <p className="text-sm text-tt-muted leading-relaxed">{tpi.brief}</p>
          </div>

          <div>
            <div className="panel-title mb-2">{t('dossier.topPlayers')}</div>
            <div className="space-y-1">
              {tpi.topPlayers.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm font-mono">
                  <span>{p.name}</span>
                  <span className="text-tt-muted">
                    #{p.rank} {p.gender === 'M' ? t('dossier.male') : t('dossier.female')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-tt-muted">{t('dossier.federation')}</span>
            <span className="font-mono">{country.federation}</span>
          </div>

          <div className="text-[10px] text-tt-muted font-mono">
            {t('dossier.updated', { time: new Date(tpi.lastUpdated).toLocaleString(dateLocale) })}
          </div>
        </div>
      </div>
    </div>
  );
}
