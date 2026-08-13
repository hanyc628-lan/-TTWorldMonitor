/** Event bus — mirrors World Monitor's CustomEvent dispatch pattern */

export const TT_EVENTS = {
  BREAKING_NEWS: 'tt:breaking-news',
  CORRELATION_UPDATED: 'tt:correlation-updated',
  INTELLIGENCE_UPDATED: 'tt:intelligence-updated',
  REVEAL_PANEL: 'tt:reveal-panel',
  EVOLUTION_UPDATED: 'tt:evolution-updated',
  DATA_REFRESHED: 'tt:data-refreshed',
} as const;

export function dispatchTTEvent<T>(name: string, detail: T): void {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

export function onTTEvent<T>(
  name: string,
  handler: (detail: T) => void,
): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<T>).detail);
  document.addEventListener(name, listener);
  return () => document.removeEventListener(name, listener);
}
