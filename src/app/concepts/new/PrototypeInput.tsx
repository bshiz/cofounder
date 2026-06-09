'use client'

import { useState } from 'react'

export default function PrototypeInput() {
  const [mode, setMode] = useState<'url' | 'html'>('url')

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Your prototype</p>
        <p className="text-xs text-gray-400">
          Share your Loveable, Vercel, or any live URL — or upload a self-contained HTML file.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'url'
              ? 'bg-gray-900 text-white'
              : 'border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'
          }`}
        >
          Paste a URL
        </button>
        <button
          type="button"
          onClick={() => setMode('html')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'html'
              ? 'bg-gray-900 text-white'
              : 'border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'
          }`}
        >
          Upload an HTML file
        </button>
      </div>

      {mode === 'url' ? (
        <input
          name="prototype_url"
          type="url"
          placeholder="https://your-prototype.com"
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      ) : (
        <input
          name="html_file"
          type="file"
          accept=".html,text/html"
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200 focus:outline-none"
        />
      )}
    </div>
  )
}
