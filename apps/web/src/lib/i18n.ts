export const LOCALES = ['en-US', 'hi-IN'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en-US'

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale)
}

export function localizedValue<T extends {language?: string; value?: unknown}>(
  entries: T[] | undefined,
  locale: string,
  fallback = DEFAULT_LOCALE,
) {
  if (!entries?.length) return undefined
  return (
    entries.find((entry) => entry.language === locale)?.value ??
    entries.find((entry) => entry.language === fallback)?.value ??
    entries[0]?.value
  )
}

export function formatMinutes(minutes?: number | null, locale = 'en-US') {
  if (!minutes) return undefined
  if (minutes < 60) return locale === 'hi-IN' ? `${minutes} मिनट` : `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (locale === 'hi-IN') {
    return mins ? `${hours} घंटे ${mins} मिनट` : `${hours} घंटे`
  }
  return mins ? `${hours}h ${mins}m` : `${hours}h`
}
