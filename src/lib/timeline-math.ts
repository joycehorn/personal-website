import type { TimelineItem, Publication, Lane } from './types';

export const TIMELINE_START_YEAR = 2002.0;
export const TIMELINE_END_YEAR = 2028.0; // Extends through Dec 2027 so graduation / May 2027 is fully visible

export function parseYearMonthToDecimal(dateStr: string): number {
  if (dateStr.toLowerCase() === 'present') {
    const now = new Date();
    return now.getFullYear() + (now.getMonth() + 0.5) / 12;
  }
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  if (parts.length === 1) {
    return year + 0.5;
  }
  const month = parseInt(parts[1], 10);
  return year + (month - 0.5) / 12;
}

export interface NormalizedTimelineEntry {
  id: string;
  lane: string;
  isPublication: boolean;
  isRange: boolean;
  isOngoing?: boolean;
  start: number; // Decimal year
  end: number;   // Decimal year
  endExpected?: number; // Dotted segment end
  rawStart?: string;
  rawEnd?: string;
  rawEndExpected?: string;
  rawDate?: string;
  org?: string;
  role?: string;
  title?: string;
  venue?: string;
  advisor?: string;
  thesis?: string;
  summary?: string;
  doi?: string;
  url?: string;
  pdf?: string;
  tags: string[];
  subRow: number; // Stacking index within lane
  totalSubRows: number;
}

/**
 * Normalizes timeline entries and publications into a unified timeline dataset.
 */
export function buildTimelineDataset(
  timelineItems: TimelineItem[],
  publications: Publication[],
  locale: 'en' | 'pt' = 'en'
): NormalizedTimelineEntry[] {
  const entries: NormalizedTimelineEntry[] = [];

  // 1. Process timeline items
  for (const item of timelineItems) {
    if (item.hidden) continue;

    const isRange = Boolean(item.start);
    let start = 0;
    let end = 0;
    let endExpected: number | undefined;

    let isOngoing = false;

    if (isRange && item.start) {
      start = parseYearMonthToDecimal(item.start);
      isOngoing = item.end === 'present' || (!item.end && Boolean(item.start));
      if (item.end) {
        end = parseYearMonthToDecimal(item.end);
      } else if (item.end_expected) {
        end = parseYearMonthToDecimal('present');
        endExpected = parseYearMonthToDecimal(item.end_expected);
      } else {
        end = parseYearMonthToDecimal('present');
      }
    } else if (item.date) {
      start = parseYearMonthToDecimal(item.date);
      end = start;
    }

    const orgStr = typeof item.org === 'object' && item.org !== null
      ? item.org[locale] ?? item.org.en
      : item.org;

    const roleStr = typeof item.role === 'object' && item.role !== null
      ? item.role[locale] ?? item.role.en
      : item.role;

    const thesisStr = item.thesis ? item.thesis[locale] ?? item.thesis.en : undefined;
    const summaryStr = item.summary ? item.summary[locale] ?? item.summary.en : undefined;

    entries.push({
      id: item.id,
      lane: item.lane,
      isPublication: false,
      isRange,
      isOngoing,
      start,
      end,
      endExpected,
      rawStart: item.start,
      rawEnd: item.end,
      rawEndExpected: item.end_expected,
      rawDate: item.date,
      org: orgStr,
      role: roleStr,
      advisor: item.advisor,
      thesis: thesisStr,
      summary: summaryStr,
      tags: item.tags || [],
      subRow: 0,
      totalSubRows: 1,
    });
  }

  // 2. Process publications as points in the 'publications' lane
  for (const pub of publications) {
    const pubYear = pub.year;
    // Map publication date to mid-year or publication year
    const start = pubYear + 0.5;
    entries.push({
      id: pub.id,
      lane: 'publications',
      isPublication: true,
      isRange: false,
      start,
      end: start,
      rawDate: `${pubYear}`,
      title: pub.title,
      venue: pub.venue,
      role: pub.authors,
      org: pub.venue,
      doi: pub.doi,
      url: pub.url,
      pdf: pub.pdf,
      tags: pub.tags || [],
      subRow: 0,
      totalSubRows: 1,
    });
  }

  // 3. Compute overlap stacking sub-rows within each lane
  const laneGroups = new Map<string, NormalizedTimelineEntry[]>();
  for (const entry of entries) {
    if (!laneGroups.has(entry.lane)) {
      laneGroups.set(entry.lane, []);
    }
    laneGroups.get(entry.lane)!.push(entry);
  }

  for (const [_, laneEntries] of laneGroups) {
    // Sort primarily by start date, then by duration descending
    laneEntries.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

    const subRowEnds: number[] = [];

    for (const entry of laneEntries) {
      if (!entry.isRange) {
        // Point items (dots) don't occupy a continuous interval in swimlanes,
        // but can stack vertically if in same time frame
        entry.subRow = 0;
        continue;
      }

      // Check the first subRow where this entry doesn't collide
      let assignedRow = -1;
      const minPadding = 0.15; // Small buffer in decimal years (~2 months)
      for (let r = 0; r < subRowEnds.length; r++) {
        if (entry.start >= subRowEnds[r] - minPadding) {
          assignedRow = r;
          subRowEnds[r] = Math.max(entry.end, entry.endExpected || entry.end);
          break;
        }
      }

      if (assignedRow === -1) {
        assignedRow = subRowEnds.length;
        subRowEnds.push(Math.max(entry.end, entry.endExpected || entry.end));
      }

      entry.subRow = assignedRow;
    }

    const totalSubRows = Math.max(1, subRowEnds.length);
    for (const entry of laneEntries) {
      entry.totalSubRows = totalSubRows;
    }
  }

  return entries;
}

/**
 * Maps a decimal year to an X coordinate in pixels for a given width.
 */
export function yearToX(
  year: number,
  viewWidth: number,
  startYear = TIMELINE_START_YEAR,
  endYear = TIMELINE_END_YEAR
): number {
  const clamped = Math.max(startYear, Math.min(endYear, year));
  return ((clamped - startYear) / (endYear - startYear)) * viewWidth;
}

/**
 * Maps an X pixel coordinate back to a decimal year.
 */
export function xToYear(
  x: number,
  viewWidth: number,
  startYear = TIMELINE_START_YEAR,
  endYear = TIMELINE_END_YEAR
): number {
  const ratio = Math.max(0, Math.min(1, x / viewWidth));
  return startYear + ratio * (endYear - startYear);
}

/**
 * Snaps a decimal year to the nearest month boundary (1/12).
 */
export function snapToMonth(year: number): number {
  const baseYear = Math.floor(year);
  const monthFraction = Math.max(0, Math.min(0.9999, year - baseYear));
  const monthIndex = Math.min(11, Math.floor(monthFraction * 12));
  return baseYear + (monthIndex + 0.5) / 12;
}

/**
 * Formats a decimal year into "Mon YYYY" per locale.
 */
export function formatDecimalYear(year: number, locale: 'en' | 'pt'): string {
  const baseYear = Math.floor(year);
  const monthFraction = Math.max(0, Math.min(0.999, year - baseYear));
  const monthIndex = Math.min(11, Math.floor(monthFraction * 12));

  const date = new Date(Date.UTC(baseYear, monthIndex, 1));
  const intlLocale = locale === 'pt' ? 'pt-BR' : 'en-US';
  return new Intl.DateTimeFormat(intlLocale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Returns all entries active at a given decimal year.
 */
export function getActiveEntriesAtYear(
  entries: NormalizedTimelineEntry[],
  date: number
): NormalizedTimelineEntry[] {
  return entries.filter((entry) => {
    if (entry.isRange) {
      if (entry.rawEnd === 'present' || entry.isOngoing) {
        if (entry.endExpected) {
          return entry.start <= date + 0.01 && date <= entry.endExpected + 0.05;
        }
        return entry.start <= date + 0.01;
      }
      return entry.start <= date + 0.01 && date <= entry.end + 0.05;
    }
    // Point or publication: active if within the same calendar year (or +/- 0.5 year)
    return Math.abs(entry.start - date) <= 0.5;
  });
}
