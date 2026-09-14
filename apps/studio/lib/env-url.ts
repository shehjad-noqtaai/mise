/** Read a URL env var; treat blank strings as unset. */
export function readEnvUrl(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

/** Slug for `sanity deploy --url` — strips accidental scheme or `.sanity.studio` suffix. */
export function readStudioHostname(value: string | undefined, fallback: string): string {
  let hostname = readEnvUrl(value, fallback)
  hostname = hostname.replace(/^https?:\/\//, '')
  hostname = hostname.replace(/\/.*$/, '')
  hostname = hostname.replace(/\.sanity\.studio$/i, '')
  return hostname
}

/** Drop empty / invalid entries before passing URLs to Presentation allowOrigins. */
export function uniqueUrls(...urls: Array<string | undefined>): string[] {
  return [...new Set(urls.map((url) => url?.trim()).filter((url): url is string => Boolean(url)))]
}
