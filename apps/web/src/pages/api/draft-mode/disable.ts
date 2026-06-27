import type {APIRoute} from 'astro'
import {perspectiveCookieName} from '@sanity/preview-url-secret/constants'
import {DEFAULT_LOCALE, localePathSegment} from '../../../lib/i18n'

export const prerender = false

export const GET: APIRoute = async ({cookies, redirect}) => {
  cookies.delete(perspectiveCookieName, {path: '/'})
  return redirect(`/${localePathSegment(DEFAULT_LOCALE)}/`, 307)
}
