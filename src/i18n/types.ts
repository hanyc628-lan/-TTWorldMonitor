export const LOCALES = ['zh', 'en', 'ja', 'ko', 'de', 'fr', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export type MessageParams = Record<string, string | number>;
