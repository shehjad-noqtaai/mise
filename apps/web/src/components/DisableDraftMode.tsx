import {useIsPresentationTool} from '@sanity/visual-editing/react'

export default function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool()

  if (isPresentationTool !== false) return null

  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 z-50 rounded-full bg-primary px-4 py-2 font-label-md text-on-primary no-underline shadow-lg"
    >
      Disable draft mode
    </a>
  )
}
