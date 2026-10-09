import type { Locale } from './types';
import { getUi } from './content';

export function formatDate(dateStr: string | undefined | null, locale: Locale): string {
  if (!dateStr) return '';
  if (dateStr.toLowerCase() === 'present') {
    return getUi('present', locale, 'present');
  }

  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  if (Number.isNaN(year)) return dateStr;

  if (parts.length === 1) {
    return `${year}`;
  }

  const month = parseInt(parts[1], 10);
  if (Number.isNaN(month)) return `${year}`;

  const date = new Date(Date.UTC(year, month - 1, 1));
  const intlLocale = locale === 'pt' ? 'pt-BR' : 'en-US';

  const formatter = new Intl.DateTimeFormat(intlLocale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return formatter.format(date);
}

export function formatDateRange(
  start: string | undefined,
  end: string | undefined,
  locale: Locale,
  endExpected?: string
): string {
  if (!start && !end && !endExpected) return '';
  if (start && !end && !endExpected) return formatDate(start, locale);

  const startFormatted = start ? formatDate(start, locale) : '';
  let endFormatted = '';

  if (end) {
    endFormatted = formatDate(end, locale);
  } else if (endExpected) {
    const expectedLabel = getUi('expected', locale, 'expected');
    endFormatted = `${formatDate(endExpected, locale)} (${expectedLabel})`;
  }

  if (startFormatted && endFormatted) {
    return `${startFormatted} – ${endFormatted}`;
  }
  return startFormatted || endFormatted;
}

export { parseYearMonthToDecimal } from './timeline-math';
