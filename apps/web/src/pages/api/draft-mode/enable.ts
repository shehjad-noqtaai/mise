import type {APIRoute} from 'astro'
import {getSecret} from 'astro:env/server'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {perspectiveCookieName} from '@sanity/preview-url-secret/constants'
import {sanityClient} from 'sanity:client'

export const prerender = false

export const GET: APIRoute = async ({request, cookies, redirect}) => {
  const token = getSecret('SANITY_API_READ_TOKEN')

  if (!token) {
    return new Response('Server misconfigured: missing read token', {status: 500})
  }

  try {
    const clientWithToken = sanityClient.withConfig({token})
    const {isValid, redirectTo = '/en-us/', studioPreviewPerspective} = await validatePreviewUrl(
      clientWithToken,
      request.url,
    )

    if (!isValid) {
      return new Response('Invalid secret', {status: 401})
    }

    cookies.set(perspectiveCookieName, studioPreviewPerspective ?? 'drafts', {
      httpOnly: false,
      sameSite: 'none',
      secure: true,
      path: '/',
    })

    return redirect(redirectTo, 307)
  } catch (error) {
    console.error('[draft-mode/enable]', error)
    return new Response('Failed to enable draft mode', {status: 500})
  }
}
