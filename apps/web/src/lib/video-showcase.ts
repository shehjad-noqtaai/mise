import {getSecret} from 'astro:env/server'
import {sanityClient} from 'sanity:client'
import type {VIDEO_SHOWCASE_QUERY_RESULT} from '@starter/sanity-types'
import {VIDEO_SHOWCASE_QUERY} from './sanity/queries'

// Typegen cannot see across the Media Library global reference — documents::get()
// comes back as `unknown` — so narrow the projection by hand.
export interface StreamingVideo {
  _id: string
  aspectRatio: number | null
  duration: number | null
  playbackId: string | null
}

export interface VideoShowcase {
  title: string | null
  datasetVideo: NonNullable<VIDEO_SHOWCASE_QUERY_RESULT>['datasetVideo']
  streamingVideo: StreamingVideo | null
}

// The Media Library lives outside the dataset behind a private ACL, so the
// documents::get() join only resolves with an authorized client. The token
// stays server-side (all video-demo pages set prerender = false).
export async function loadVideoShowcase(): Promise<VideoShowcase | null> {
  const token = getSecret('SANITY_API_READ_TOKEN')
  const client = sanityClient.withConfig({useCdn: false, token})
  const showcase = await client.fetch<VIDEO_SHOWCASE_QUERY_RESULT>(VIDEO_SHOWCASE_QUERY)
  if (!showcase) return null
  return {
    title: showcase.title,
    datasetVideo: showcase.datasetVideo,
    streamingVideo: (showcase.streamingVideo ?? null) as StreamingVideo | null,
  }
}

export interface HlsRendition {
  resolution: string
  kbps: number
  /** Estimated transfer for watching the clip start-to-finish at this rendition. */
  fullWatchMB: number | undefined
}

// Parse the public HLS multivariant playlist to surface the adaptive bitrate
// ladder Mux generated for the video.
export async function fetchHlsRenditions(
  playbackId: string,
  durationSeconds: number | null | undefined,
): Promise<HlsRendition[]> {
  try {
    const response = await fetch(`https://stream.m.sanity-cdn.com/${playbackId}.m3u8`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return []
    const manifest = await response.text()
    const renditions: HlsRendition[] = []
    for (const line of manifest.split('\n')) {
      if (!line.startsWith('#EXT-X-STREAM-INF:')) continue
      const resolution = line.match(/RESOLUTION=(\d+x\d+)/)?.[1]
      const bandwidth =
        line.match(/AVERAGE-BANDWIDTH=(\d+)/)?.[1] ?? line.match(/BANDWIDTH=(\d+)/)?.[1]
      if (!resolution || !bandwidth) continue
      const bitsPerSecond = Number(bandwidth)
      renditions.push({
        resolution,
        kbps: Math.round(bitsPerSecond / 1000),
        fullWatchMB: durationSeconds
          ? Number((((bitsPerSecond / 8) * durationSeconds) / 1024 / 1024).toFixed(2))
          : undefined,
      })
    }
    return renditions.sort((a, b) => b.kbps - a.kbps)
  } catch {
    return []
  }
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return undefined
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return undefined
  return `${seconds.toFixed(1)}s`
}
