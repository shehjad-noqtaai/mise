import type {AstroCookies} from 'astro'
import {perspectiveCookieName} from '@sanity/preview-url-secret/constants'

export function getDraftModeProps(cookies: AstroCookies | undefined) {
  return {
    perspectiveCookie: cookies?.get(perspectiveCookieName)?.value ?? undefined,
  }
}

export function isDraftMode(cookies: AstroCookies | undefined) {
  return cookies?.has(perspectiveCookieName) ?? false
}
