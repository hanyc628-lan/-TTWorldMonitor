import type { SiteVariant } from '@/types';

export const SITE_VARIANTS: SiteVariant[] = [
  'world',
  'pro',
  'youth',
  'equipment',
  'asia',
  'europe',
];

const HOST_VARIANT_MAP: Record<string, SiteVariant> = {
  'pro.ttworldmonitor.local': 'pro',
  'youth.ttworldmonitor.local': 'youth',
  'equipment.ttworldmonitor.local': 'equipment',
  'asia.ttworldmonitor.local': 'asia',
  'europe.ttworldmonitor.local': 'europe',
};

const STORAGE_KEY = 'ttworldmonitor-variant';

export function detectVariant(): SiteVariant {
  const envVariant = import.meta.env.VITE_VARIANT as SiteVariant | undefined;
  if (envVariant && SITE_VARIANTS.includes(envVariant)) return envVariant;

  const hostVariant = HOST_VARIANT_MAP[window.location.hostname];
  if (hostVariant) return hostVariant;

  const stored = localStorage.getItem(STORAGE_KEY) as SiteVariant | null;
  if (stored && SITE_VARIANTS.includes(stored)) return stored;

  return 'world';
}

export function setVariant(variant: SiteVariant): void {
  localStorage.setItem(STORAGE_KEY, variant);
}

export const VARIANT_LABELS: Record<SiteVariant, string> = {
  world: '世界',
  pro: '职业',
  youth: '青少年',
  equipment: '器材',
  asia: '亚洲',
  europe: '欧洲',
};
