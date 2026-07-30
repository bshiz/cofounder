'use client'

import { useEffect, useState } from 'react'

type State =
  | { type: 'loading' }
  | { type: 'url-embeddable'; url: string }
  | { type: 'url-blocked'; url: string }
  | { type: 'html'; proxyUrl: string }
  | { type: 'none' }

export default function PrototypePreview({
  conceptId,
  prototypeUrl,
  htmlFileUrl,
  title,
}: {
  conceptId: string
  prototypeUrl?: string | null
  htmlFileUrl?: string | null
  title: string
}) {
  const [state, setState] = useState<State>({ type: 'loading' })
  const [iframeHeight, setIframeHeight] = useState(600)

  useEffect(() => {
    if (prototypeUrl) {
      fetch(`/api/check-embeddable?url=${encodeURIComponent(prototypeUrl)}`)
        .then((r) => r.json())
        .then(({ embeddable }: { embeddable: boolean }) => {
          setState(
            embeddable
              ? { type: 'url-embeddable', url: prototypeUrl }
              : { type: 'url-blocked', url: prototypeUrl }
          )
        })
        .catch(() => setState({ type: 'url-blocked', url: prototypeUrl }))
    } else if (htmlFileUrl) {
      setState({ type: 'html', proxyUrl: `/api/serve/${conceptId}` })
    } else {
      setState({ type: 'none' })
    }
  }, [conceptId, prototypeUrl, htmlFileUrl])

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.iframeHeight) {
        setIframeHeight(Math.max(600, Number(e.data.iframeHeight)))
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const chromeLabel = prototypeUrl ?? htmlFileUrl ?? title

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Browser chrome */}
      <div className="border-b border-gray-200 px-4 py-2 flex items-center gap-1.5 bg-gray-100 shrink-0">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-[#4a4a4a] font-mono truncate flex-1">
          {chromeLabel} — Live Preview
        </span>
      </div>

      {state.type === 'loading' && (
        <div className="flex items-center justify-center" style={{ minHeight: 600 }}>
          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        </div>
      )}

      {state.type === 'url-embeddable' && (
        <iframe
          src={state.url}
          className="w-full"
          style={{ border: 'none', height: 800 }}
          title={`${title} preview`}
        />
      )}

      {state.type === 'url-blocked' && (
        <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 600 }}>
          <p className="text-sm text-[#4a4a4a]">This prototype can&apos;t be embedded.</p>
          <a
            href={state.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            View prototype ↗
          </a>
        </div>
      )}

      {state.type === 'html' && (
        <iframe
          src={state.proxyUrl}
          sandbox="allow-scripts"
          className="w-full"
          style={{ border: 'none', height: iframeHeight }}
          title={`${title} preview`}
        />
      )}

      {state.type === 'none' && (
        <div className="flex items-center justify-center" style={{ minHeight: 600 }}>
          <p className="text-sm text-[#4a4a4a]">No preview available.</p>
        </div>
      )}
    </div>
  )
}
