import {readStudioHostname} from './env-url'

/** True for local `sanity dev` or hosted Studio slug ending in `-dev`. */
export function isDevStudio(): boolean {
  if (import.meta.env?.DEV) return true

  const hostname = readStudioHostname(
    import.meta.env?.SANITY_STUDIO_HOSTNAME ?? process.env.SANITY_STUDIO_HOSTNAME,
    '',
  )

  return hostname.endsWith('-dev')
}
