'use client'

import { useState } from 'react'
import { expressInterest } from '@/app/actions'

const MAX = 200

export default function InterestForm({ conceptId }: { conceptId: string }) {
  const [chars, setChars] = useState(0)

  return (
    <form action={expressInterest} className="flex flex-col gap-4">
      <input type="hidden" name="concept_id" value={conceptId} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reason" className="text-sm font-medium text-gray-700">
          I&apos;m interested because…
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          maxLength={MAX}
          rows={3}
          placeholder="Tell the founder why you're excited about this and what you'd bring to the table."
          onChange={(e) => setChars(e.target.value.length)}
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
        />
        <span className={`text-xs self-end ${chars >= MAX ? 'text-red-500' : 'text-gray-400'}`}>
          {chars}/{MAX}
        </span>
      </div>
      <button
        type="submit"
        className="rounded-full bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
      >
        Express interest
      </button>
    </form>
  )
}
