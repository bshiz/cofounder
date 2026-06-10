'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { expressInterest } from '@/app/actions'
import DeleteButton from './DeleteButton'

type Profile = { full_name: string | null; avatar_url: string | null } | null

function Avatar({ profile, size = 28 }: { profile: Profile; size?: number }) {
  if (profile?.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt={profile.full_name ?? 'Avatar'}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  const initial = profile?.full_name?.charAt(0).toUpperCase() ?? '?'
  return (
    <span
      className="rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0"
      style={{ width: size, height: size }}
    >
      {initial}
    </span>
  )
}

export default function ConceptBar({
  poster,
  conceptId,
  conceptTitle,
  isOwner,
  isLoggedIn,
  existingInterest,
  success,
  error,
}: {
  poster: Profile
  conceptId: string
  conceptTitle: string
  isOwner: boolean
  isLoggedIn: boolean
  existingInterest: { reason: string } | null
  success?: boolean
  error?: string
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [reason, setReason] = useState('')

  return (
    <>
      <div className="fixed bottom-0 left-56 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-center px-6 z-10">
        {error && (
          <span className="text-xs text-red-500 absolute left-6 hidden sm:block">
            {decodeURIComponent(error)}
          </span>
        )}
        {isOwner ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/concepts/${conceptId}/edit`}
              className="rounded-full border border-gray-300 px-5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit
            </Link>
            <DeleteButton conceptId={conceptId} />
          </div>
        ) : success || existingInterest ? (
          <span className="text-sm text-gray-400">Interest sent</span>
        ) : isLoggedIn ? (
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            Let&apos;s build this
          </button>
        ) : (
          <Link
            href="/?error=Sign+in+to+express+interest"
            className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            Sign in to express interest
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
            <h2 className="text-base font-semibold text-gray-900 mb-1">Let&apos;s build this</h2>
            <p className="text-sm text-gray-500 mb-4">
              Tell the founder why you&apos;re interested in building this together.
            </p>
            <form action={expressInterest}>
              <input type="hidden" name="concept_id" value={conceptId} />
              <textarea
                name="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, 200))}
                maxLength={200}
                rows={4}
                placeholder="What draws you to this concept? What would you bring to the team?"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
                required
              />
              <p className="text-xs text-gray-400 text-right mt-1">{reason.length}/200</p>
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="submit"
                  className="rounded-full bg-[#1a1a1a] px-5 py-2 text-sm font-medium text-white hover:bg-[#333] transition-colors"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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
