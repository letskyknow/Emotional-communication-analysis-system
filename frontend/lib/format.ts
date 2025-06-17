import { format, formatDistance, formatRelative } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import type { Locale } from '@/i18n';

const dateLocales = {
  en: enUS,
  zh: zhCN,
};

export function formatDate(date: Date | string | number, locale: Locale = 'en') {
  const d = new Date(date);
  return format(d, 'PPP', { locale: dateLocales[locale] });
}

export function formatDateTime(date: Date | string | number, locale: Locale = 'en') {
  const d = new Date(date);
  return format(d, 'PPpp', { locale: dateLocales[locale] });
}

export function formatTime(date: Date | string | number, locale: Locale = 'en') {
  const d = new Date(date);
  return format(d, 'p', { locale: dateLocales[locale] });
}

export function formatRelativeTime(date: Date | string | number, locale: Locale = 'en') {
  const d = new Date(date);
  return formatDistance(d, new Date(), { 
    addSuffix: true,
    locale: dateLocales[locale] 
  });
}

export function formatRelativeDate(date: Date | string | number, baseDate: Date = new Date(), locale: Locale = 'en') {
  const d = new Date(date);
  return formatRelative(d, baseDate, { locale: dateLocales[locale] });
}

// Format numbers with locale-specific separators
export function formatNumber(value: number, locale: Locale = 'en') {
  const localeString = locale === 'zh' ? 'zh-CN' : 'en-US';
  return new Intl.NumberFormat(localeString).format(value);
}

// Format percentages
export function formatPercent(value: number, locale: Locale = 'en', decimals: number = 1) {
  const localeString = locale === 'zh' ? 'zh-CN' : 'en-US';
  return new Intl.NumberFormat(localeString, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// Format currency (if needed in the future)
export function formatCurrency(value: number, currency: string = 'USD', locale: Locale = 'en') {
  const localeString = locale === 'zh' ? 'zh-CN' : 'en-US';
  return new Intl.NumberFormat(localeString, {
    style: 'currency',
    currency,
  }).format(value);
}