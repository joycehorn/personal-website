import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import type { ContentData, Locale, LocalizedString, StringOrLocalized } from './types';

let cachedContent: ContentData | null = null;

export function loadContent(): ContentData {
  if (cachedContent) {
    return cachedContent;
  }

  const filePath = path.resolve(process.cwd(), 'content.yaml');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const raw = load(fileContents) as ContentData;

  // Filter out any hidden items as per rule 4
  const filteredTimeline = (raw.timeline || []).filter((item) => !item.hidden);

  cachedContent = {
    ...raw,
    timeline: filteredTimeline,
  };

  return cachedContent;
}

export function isTodo(val?: string | null): boolean {
  if (!val) return true;
  const trimmed = val.trim();
  return trimmed === '' || trimmed === 'TODO';
}

export function t(value: StringOrLocalized | undefined | null, locale: Locale): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  return value[locale] ?? value.en ?? '';
}

export function getUi(key: string, locale: Locale, fallback = ''): string {
  const content = loadContent();
  const entry = content.ui[key];
  if (!entry) return fallback;
  return entry[locale] ?? entry.en ?? fallback;
}

export function getTagLabel(tagKey: string, locale: Locale): string {
  const content = loadContent();
  const entry = content.tags[tagKey];
  if (!entry) return tagKey;
  return entry[locale] ?? entry.en ?? tagKey;
}
