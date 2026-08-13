import { create } from 'zustand';
import { messages } from './messages';
import type { Locale, MessageParams } from './types';
import { LOCALES } from './types';

const STORAGE_KEY = 'ttwm-locale';

const BROWSER_MAP: Record<string, Locale> = {
  zh: 'zh', en: 'en', ja: 'ja', ko: 'ko', de: 'de', fr: 'fr', es: 'es',
};

export function detectLocale(): Locale {
  if (typeof localStorage === 'undefined') return 'zh';
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && LOCALES.includes(stored)) return stored;
  const lang = navigator.language.toLowerCase();
  const primary = lang.split('-')[0];
  return BROWSER_MAP[primary] ?? 'zh';
}

function resolve(dict: object, key: string): string | undefined {
  let cur: unknown = dict;
  for (const part of key.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

function translate(locale: Locale, key: string, params?: MessageParams): string {
  const chain: Locale[] = [locale, 'en', 'zh'];
  let text: string | undefined;
  for (const loc of chain) {
    text = resolve(messages[loc], key);
    if (text) break;
  }
  let out = text ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      out = out.replaceAll(`{${k}}`, String(v));
    }
  }
  return out;
}

function applyHtmlLang(locale: Locale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale;
}

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: MessageParams) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  locale: detectLocale(),
  setLocale: (locale) => {
    localStorage.setItem(STORAGE_KEY, locale);
    applyHtmlLang(locale);
    set({ locale });
  },
  t: (key, params) => translate(get().locale, key, params),
}));

export function initI18n(): void {
  applyHtmlLang(useI18nStore.getState().locale);
}

export function useI18n() {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const t = useI18nStore((s) => s.t);
  return { locale, setLocale, t };
}

export function useT() {
  return useI18nStore((s) => s.t);
}

export function getT() {
  return useI18nStore.getState().t;
}

export function localizeCommandLabel(id: string): string {
  return getT()(`commands.${id}`);
}

export { LOCALES, type Locale };
