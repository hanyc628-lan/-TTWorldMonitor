import type { Locale } from '../types';
import { zh, type Messages } from './zh';
import { en } from './en';
import { ja, ko, de, fr, es } from './others';

export type { Messages };

export const messages: Record<Locale, Messages> = {
  zh,
  en,
  ja,
  ko,
  de,
  fr,
  es,
};
