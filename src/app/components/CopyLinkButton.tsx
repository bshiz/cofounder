'use client'

import { useState } from 'react'
import { Link2 } from 'lucide-react'

export default function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(window.location.origin + path)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy link"
      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-[#4a4a4a] hover:text-[#4a4a4a] hover:bg-gray-100 transition-colors shrink-0"
    >
      {copied ? (
        <span className="text-xs font-medium text-[#4a4a4a]">Copied!</span>
      ) : (
        <Link2 size={14} />
      )}
    </button>
  )
}
