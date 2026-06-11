'use client'

import { useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteConcept } from '@/app/actions'

export default function DeleteButton({ conceptId }: { conceptId: string }) {
  const formRef = useRef<HTMLFormElement>(null)

  function handleClick() {
    if (window.confirm('Delete this concept? This will permanently remove it and all associated data.')) {
      formRef.current?.requestSubmit()
    }
  }

  return (
    <form ref={formRef} action={deleteConcept}>
      <input type="hidden" name="concept_id" value={conceptId} />
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </form>
  )
}
