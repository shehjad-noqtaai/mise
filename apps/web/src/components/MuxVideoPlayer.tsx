import MuxPlayer from '@mux/mux-player-react'

interface MuxVideoPlayerProps {
  playbackId: string
  aspectRatio?: number | null
  title?: string
}

export default function MuxVideoPlayer({playbackId, aspectRatio, title}: MuxVideoPlayerProps) {
  const posterUrl = `https://image.m.sanity-cdn.com/${playbackId}/thumbnail.webp?width=1280`

  return (
    <MuxPlayer
      customDomain="m.sanity-cdn.com"
      playbackId={playbackId}
      poster={posterUrl}
      preload="metadata"
      maxResolution="1080p"
      metadata={{video_title: title}}
      style={{width: '100%', aspectRatio: aspectRatio ?? 16 / 9}}
    />
  )
}
