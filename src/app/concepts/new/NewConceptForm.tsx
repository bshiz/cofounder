'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createConcept } from '@/app/actions'
import PrototypeInput from './PrototypeInput'

export default function NewConceptForm({ error }: { error?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <>
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      <form
        action={createConcept}
        onSubmit={() => setIsSubmitting(true)}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-[#4a4a4a]">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            disabled={isSubmitting}
            placeholder="What's it called?"
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#4a4a4a] focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium text-[#4a4a4a]">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            disabled={isSubmitting}
            placeholder="What does it do?"
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#4a4a4a] focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none disabled:opacity-50"
          />
        </div>

        <PrototypeInput />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="thumbnail_file" className="text-sm font-medium text-[#4a4a4a]">
            Thumbnail image
          </label>
          <p className="text-xs text-[#4a4a4a] -mt-0.5">
            Upload a screenshot or image that represents your concept — this is what people will see in the feed
          </p>
          <input
            id="thumbnail_file"
            name="thumbnail_file"
            type="file"
            accept="image/*"
            disabled={isSubmitting}
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-[#4a4a4a] hover:file:bg-gray-200 focus:outline-none disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-2">
          <Link
            href="/"
            className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-[#4a4a4a] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Posting…
              </>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      </form>
    </>
  )
}
