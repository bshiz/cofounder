'use client'

import { useState } from 'react'

export default function PrototypeInput() {
  const [mode, setMode] = useState<'url' | 'html'>('html')

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-[#4a4a4a] mb-1">File or link <span className="text-red-500">*</span></p>
        <p className="text-xs text-[#4a4a4a]">
          Share a live URL, or upload a self-contained HTML file.
        </p>
      </div>

      <div className="inline-flex rounded-lg bg-gray-100 p-1 gap-1">
        <button
          type="button"
          onClick={() => setMode('html')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
            mode === 'html'
              ? 'bg-white text-[#1a1a1a] shadow-sm'
              : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
          }`}
        >
          Upload an HTML file
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
            mode === 'url'
              ? 'bg-white text-[#1a1a1a] shadow-sm'
              : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
          }`}
        >
          Paste a URL
        </button>
      </div>

      {mode === 'url' ? (
        <input
          name="prototype_url"
          type="url"
          placeholder="https://your-prototype.com"
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#4a4a4a] focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      ) : (
        <input
          name="html_file"
          type="file"
          accept=".html,text/html"
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-[#4a4a4a] hover:file:bg-gray-200 focus:outline-none"
        />
      )}
    </div>
  )
}
