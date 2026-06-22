'use client'

import { useState, useEffect, useActionState } from 'react'
import Link from 'next/link'
import { Link2, Pencil, CheckCircle } from 'lucide-react'
import { expressInterest } from '@/app/actions'
import DeleteButton from './DeleteButton'

type Profile = { full_name: string | null; avatar_url: string | null } | null

export default function ConceptBar({
  poster,
  conceptId,
  isOwner,
  isLoggedIn,
  existingInterest,
  interestCount,
}: {
  poster: Profile
  conceptId: string
  isOwner: boolean
  isLoggedIn: boolean
  existingInterest: boolean
  interestCount: number
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [copied, setCopied] = useState(false)
  const [state, formAction, pending] = useActionState(expressInterest, null)

  useEffect(() => {
    if (state?.success) {
      setModalOpen(false)
      setReason('')
    }
  }, [state?.success])

  const alreadySent = existingInterest || !!state?.success
  const founderName = poster?.full_name ?? 'the founder'

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.origin + `/concepts/${conceptId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="fixed bottom-0 left-56 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-end px-6 z-10">
        {!isOwner && !alreadySent && interestCount > 0 && (
          <span className="absolute left-6 text-sm text-[#4a4a4a]">
            {interestCount} {interestCount === 1 ? 'person wants' : 'people want'} to build this
          </span>
        )}
        {isOwner ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-[#4a4a4a] hover:bg-gray-50 transition-colors"
            >
              <Link2 size={14} />
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <Link
              href={`/concepts/${conceptId}/edit`}
              className="flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-[#4a4a4a] hover:bg-gray-50 transition-colors"
            >
              <Pencil size={14} />
              Edit
            </Link>
            <DeleteButton conceptId={conceptId} />
          </div>
        ) : alreadySent ? (
          <div className="flex items-center gap-2 text-sm text-[#4a4a4a]">
            <CheckCircle size={15} className="text-[#2D6A4F] shrink-0" />
            <span>
              Interest sent — if {founderName} wants to connect, they&apos;ll reach out to you directly
            </span>
          </div>
        ) : isLoggedIn ? (
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            Let&apos;s build this
          </button>
        ) : (
          <Link
            href="/sign-in"
            className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            Let&apos;s build this
          </Link>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false)
          }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-base font-semibold text-[#1a1a1a] mb-1">Let&apos;s build this</h2>
            <p className="text-sm text-[#4a4a4a] mb-4">
              Tell the founder why you&apos;re interested in building this together.
            </p>
            <form action={formAction}>
              <input type="hidden" name="concept_id" value={conceptId} />
              <textarea
                name="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, 200))}
                maxLength={200}
                rows={4}
                placeholder="What draws you to this concept? What would you bring to the team?"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm placeholder-[#4a4a4a] focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
                required
              />
              <p className="text-xs text-[#4a4a4a] text-right mt-1">{reason.length}/200</p>
              {state?.error && (
                <p className="text-xs text-red-500 mt-2">{state.error}</p>
              )}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-[#1a1a1a] px-5 py-2 text-sm font-medium text-white hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                  {pending ? 'Sending…' : 'Send'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-[#4a4a4a] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
