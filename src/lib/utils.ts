import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const dateLocaleMap: Record<string, string> = {
  en: 'en-US',
  de: 'de-DE',
};

export function formatDate(dateStr: string, language: string): string {
  const locale = dateLocaleMap[language] || 'en-US';
  return new Date(dateStr).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string, language: string): string {
  const locale = dateLocaleMap[language] || 'en-US';
  return new Date(dateStr).toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
