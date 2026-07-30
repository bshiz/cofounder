'use client'

import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteConcept } from '@/app/actions'

export default function DeleteButton({ conceptId }: { conceptId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <form ref={formRef} action={deleteConcept}>
        <input type="hidden" name="concept_id" value={conceptId} />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </form>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false)
          }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-base font-semibold text-[#1a1a1a] mb-1">Delete this project?</h2>
            <p className="text-sm text-[#4a4a4a] mb-6">
              This will permanently remove it and all associated data.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-[#4a4a4a] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => formRef.current?.requestSubmit()}
                className="flex items-center gap-1.5 rounded-full border border-red-200 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
