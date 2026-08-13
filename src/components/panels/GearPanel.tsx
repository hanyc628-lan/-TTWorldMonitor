import { useAppStore } from '@/store/app';
import { useT } from '@/i18n';
import { Panel } from './Panel';

const CATEGORY_KEYS: Record<string, string> = {
  blade: 'panels.gear.catBlade',
  rubber: 'panels.gear.catRubber',
  ball: 'panels.gear.catBall',
  tech: 'panels.gear.catTech',
};

const APPAREL_KEYS: Record<string, string> = {
  shirt: 'panels.gear.apparelShirt',
  shorts: 'panels.gear.apparelShorts',
  shoes: 'panels.gear.apparelShoes',
  bag: 'panels.gear.apparelBag',
};

export function GearPanel() {
  const t = useT();
  const { equipmentTrends, apparelItems, learningModules } = useAppStore();

  const beginners = learningModules.filter((m) => m.level === 'beginner');

  return (
    <Panel id="gear" title={t('panels.gear.title')}>
      <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.gear.trends')}</div>
      <ul className="space-y-2 mb-3">
        {equipmentTrends.slice(0, 4).map((item) => (
          <li key={item.id} className="text-xs">
            <div className="flex items-center justify-between gap-1">
              <span className="font-medium text-tt-accent2 truncate">{item.title}</span>
              <span className={`badge text-[8px] shrink-0 ${
                item.trend === 'rising' ? 'bg-tt-green/20 text-tt-green' :
                item.trend === 'emerging' ? 'bg-tt-gold/20 text-tt-gold' :
                'bg-tt-muted/10 text-tt-muted'
              }`}>
                {item.adoption}%
              </span>
            </div>
            <div className="text-[10px] text-tt-muted">{t(CATEGORY_KEYS[item.category])} · {item.region}</div>
            <p className="text-[10px] text-tt-muted leading-snug mt-0.5">{item.summary}</p>
          </li>
        ))}
      </ul>

      <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.gear.apparel')}</div>
      <ul className="space-y-1.5 mb-3">
        {apparelItems.slice(0, 4).map((a) => (
          <li key={a.id} className="text-[11px]">
            <span className="font-medium">{a.brand} {a.model}</span>
            <span className="text-tt-muted ml-1">({t(APPAREL_KEYS[a.type])})</span>
            <div className="text-[10px] text-tt-muted">{a.priceRange} · {a.summary}</div>
          </li>
        ))}
      </ul>

      <div className="text-[10px] text-tt-muted uppercase mb-1">{t('panels.gear.learn')}</div>
      <ul className="space-y-1">
        {beginners.map((mod) => (
          <li key={mod.id} className="text-xs">
            <span className="font-medium">{mod.title}</span>
            <div className="text-[10px] text-tt-muted">{mod.duration} · {mod.source}</div>
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {mod.topics.map((topic) => (
                <span key={topic} className="badge bg-tt-surface text-tt-muted border-tt-border text-[8px]">{topic}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
