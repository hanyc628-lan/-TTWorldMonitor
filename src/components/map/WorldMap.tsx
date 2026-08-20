import { useAppStore } from '@/store/app';
import { STREAM_SOURCES } from '@/config/stream-sources';
import { COUNTRY_MAP, resolveGeoCountryCode } from '@/data/countries';
import { getTPIColor, getHeatmapValue } from '@/server/tpi-scoring';
import { TPI_PILLARS } from '@/config/tpi-axioms';
import type { HeatmapMetric } from '@/config/tpi-axioms';
import { useT } from '@/i18n';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import clsx from 'clsx';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/** 亚洲视角仅显示亚太相关国家图标 */
const ASIA_COUNTRY_CODES = new Set([
  'CHN', 'JPN', 'KOR', 'TPE', 'HKG', 'SGP', 'IND', 'THA', 'VNM', 'MYS', 'IRN', 'AUS', 'NZL',
]);
/** 欧洲视角仅显示欧洲相关国家图标 */
const EUROPE_COUNTRY_CODES = new Set([
  'GER', 'FRA', 'SWE', 'POR', 'ESP', 'GBR', 'AUT', 'POL', 'CZE', 'ROU', 'HUN', 'ITA',
  'NED', 'BEL', 'DEN', 'UKR', 'CRO', 'SVK', 'TUR',
]);

function isInVariantRegion(countryCode: string | undefined, variant: string): boolean {
  if (!countryCode || variant === 'world' || variant === 'pro' || variant === 'youth' || variant === 'equipment') {
    return true;
  }
  if (variant === 'asia') return ASIA_COUNTRY_CODES.has(countryCode);
  if (variant === 'europe') return EUROPE_COUNTRY_CODES.has(countryCode);
  return true;
}

const LEGEND_STOPS = [
  { color: '#ff4d4d', label: '80+' },
  { color: '#f5c542', label: '65+' },
  { color: '#4d9fff', label: '50+' },
  { color: '#5a6a82', label: '30+' },
  { color: '#3a4254', label: '<30' },
];

function metricLabelKey(metric: HeatmapMetric): string {
  if (metric === 'composite') return 'heatmap.metricComposite';
  return `heatmap.pillar.${metric}`;
}

export function WorldMap() {
  const t = useT();
  const {
    tpiData, mapLayers, selectCountry, selectedCountry, tournaments, streamStatuses,
    clubs, equipmentTrends, grassrootsEvents, participationStats, heatmapMetric, setHeatmapMetric,
    variant,
  } = useAppStore();

  const tpiMap = Object.fromEntries(tpiData.map((row) => [row.country, row]));
  const showChoropleth = mapLayers.tpiChoropleth || mapLayers.rankings;
  const showTournaments = mapLayers.tournaments;
  const showFederations = mapLayers.federations;

  function getCountryFill(ttCode: string | undefined): string {
    if (!ttCode || !showChoropleth) return '#1a1f2e';
    const tpi = tpiMap[ttCode];
    if (!tpi) return '#141820';
    const val = getHeatmapValue(tpi, heatmapMetric);
    return getTPIColor(val) + '88';
  }

  function handleCountryClick(ttCode: string | undefined) {
    if (ttCode) selectCountry(ttCode === selectedCountry ? null : ttCode);
  }

  const activeTournaments = showTournaments
    ? tournaments.filter((ev) => (ev.status === 'live' || ev.status === 'upcoming') && isInVariantRegion(ev.country, variant))
    : [];

  const metrics: HeatmapMetric[] = ['composite', ...TPI_PILLARS.map((p) => p.key)];

  return (
    <div className="w-full h-full bg-[#0d1117] relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140, center: [20, 30] }}
        className="w-full h-full"
      >
        <ZoomableGroup center={[20, 30]} zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const ttCode = resolveGeoCountryCode(geo);
                const isSelected = ttCode === selectedCountry;
                const hasData = ttCode && tpiMap[ttCode];
                const fill = isSelected ? '#ff4d4d44' : getCountryFill(ttCode);
                const hoverFill = hasData
                  ? getTPIColor(getHeatmapValue(tpiMap[ttCode!], heatmapMetric)) + 'cc'
                  : '#2a3040';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(ttCode)}
                    style={{
                      default: {
                        fill,
                        stroke: isSelected ? '#ff4d4d' : '#2a3040',
                        strokeWidth: isSelected ? 1.5 : 0.3,
                        outline: 'none',
                        cursor: hasData ? 'pointer' : 'default',
                      },
                      hover: {
                        fill: hoverFill,
                        stroke: hasData ? '#ff4d4d' : '#2a3040',
                        strokeWidth: 0.8,
                        outline: 'none',
                        cursor: hasData ? 'pointer' : 'default',
                      },
                      pressed: { fill: '#ff4d4d55', outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {showFederations &&
            tpiData.map((row) => {
              const country = COUNTRY_MAP[row.country];
              if (!country || !isInVariantRegion(row.country, variant)) return null;
              return (
                <Marker key={row.country} coordinates={[country.lng, country.lat]}>
                  <circle r={3} fill={getTPIColor(row.score)} stroke="#0a0c10" strokeWidth={1} />
                  <text textAnchor="middle" y={-6} style={{ fontFamily: 'monospace', fontSize: '7px', fill: '#8b95a8' }}>
                    {row.country}
                  </text>
                </Marker>
              );
            })}

          {mapLayers.liveStreams &&
            streamStatuses
              .filter((st) => st.live)
              .map((st) => {
                const src = STREAM_SOURCES.find((s) => s.id === st.id);
                if (!src) return null;
                return (
                  <Marker key={st.id} coordinates={[src.lng, src.lat]}>
                    <circle r={6} fill="#ff4d4d" stroke="#fff" strokeWidth={1} className="animate-pulse" />
                    <text textAnchor="middle" y={-10} style={{ fontFamily: 'monospace', fontSize: '6px', fill: '#ff4d4d' }}>
                      LIVE
                    </text>
                  </Marker>
                );
              })}

          {mapLayers.liveMatches &&
            activeTournaments.map((ev) => (
              <Marker key={ev.id} coordinates={[ev.lng, ev.lat]}>
                <circle
                  r={ev.status === 'live' ? 5 : 3}
                  fill={ev.status === 'live' ? '#ff4d4d' : '#4d9fff'}
                  stroke="#0a0c10"
                  strokeWidth={1}
                  className={ev.status === 'live' ? 'animate-pulse' : ''}
                />
              </Marker>
            ))}

          {mapLayers.clubs &&
            clubs
              .filter((c) => isInVariantRegion(c.country, variant))
              .map((c) => (
              <Marker key={c.id} coordinates={[c.lng, c.lat]}>
                <circle r={4} fill="#f5c542" stroke="#0a0c10" strokeWidth={1} />
              </Marker>
            ))}

          {mapLayers.equipment &&
            equipmentTrends.map((e) => (
              <Marker key={e.id} coordinates={[e.lng, e.lat]}>
                <circle r={4} fill="#9b59b6" stroke="#0a0c10" strokeWidth={1} />
              </Marker>
            ))}

          {mapLayers.youthPipeline &&
            grassrootsEvents.map((ev) => (
              <Marker key={ev.id} coordinates={[ev.lng, ev.lat]}>
                <circle
                  r={ev.status === 'live' ? 5 : 3}
                  fill={ev.category === 'youth' ? '#4d9fff' : '#c9a227'}
                  stroke="#0a0c10"
                  strokeWidth={1}
                />
              </Marker>
            ))}

          {mapLayers.youthPipeline &&
            participationStats.map((p) => {
              const meta = COUNTRY_MAP[p.country];
              if (!meta || !isInVariantRegion(p.country, variant)) return null;
              return (
                <Marker key={`pop-${p.country}`} coordinates={[meta.lng, meta.lat]}>
                  <text textAnchor="middle" y={12} style={{ fontFamily: 'monospace', fontSize: '6px', fill: '#4d9fff' }}>
                    {p.activePlayersMillions}M
                  </text>
                </Marker>
              );
            })}
        </ZoomableGroup>
      </ComposableMap>

      {showChoropleth && (
        <div className="absolute bottom-3 left-3 panel px-3 py-2 max-w-[280px]">
          <div className="text-[10px] text-tt-muted mb-1 font-mono">
            {t('heatmap.title')} · {tpiData[0]?.methodologyVersion ?? 'v2-fp'}
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {metrics.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setHeatmapMetric(m)}
                className={clsx(
                  'text-[9px] px-1.5 py-0.5 rounded border font-mono transition-colors',
                  heatmapMetric === m
                    ? 'bg-tt-accent/20 text-tt-accent border-tt-accent/30'
                    : 'bg-tt-surface text-tt-muted border-tt-border hover:text-tt-text',
                )}
              >
                {t(metricLabelKey(m))}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono text-tt-muted">
            {LEGEND_STOPS.map((item) => (
              <span key={item.label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
          <div className="text-[8px] text-tt-muted mt-1">{t('heatmap.coverage', { n: tpiData.length })}</div>
        </div>
      )}
    </div>
  );
}
