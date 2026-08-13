import { useAppStore } from '@/store/app';
import { LAYER_REGISTRY, getLayersForVariant } from '@/config/map-layer-definitions';
import { useT } from '@/i18n';
import clsx from 'clsx';

export function LayerControls() {
  const t = useT();
  const { mapLayers, toggleLayer, variant } = useAppStore();
  const allowedLayers = getLayersForVariant(variant);

  return (
    <div className="absolute top-3 left-3 panel p-2 max-w-[220px]">
      <div className="panel-title mb-2 px-1">{t('layers.title')}</div>
      <div className="flex flex-wrap gap-1">
        {allowedLayers.map((layer) => {
          const def = LAYER_REGISTRY[layer];
          const active = mapLayers[layer];
          return (
            <button
              key={layer}
              onClick={() => toggleLayer(layer)}
              title={def.explanation}
              className={clsx(
                'text-[10px] px-2 py-1 rounded border transition-colors font-mono',
                active
                  ? 'bg-tt-accent/20 text-tt-accent border-tt-accent/30'
                  : 'bg-tt-surface text-tt-muted border-tt-border hover:text-tt-text',
              )}
            >
              {def.icon} {t(`layers.${layer}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
