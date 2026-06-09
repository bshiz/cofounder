import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createConcept } from '@/app/actions'
import PrototypeInput from './PrototypeInput'
import Header from '@/app/components/Header'

const CATEGORIES = [
  'Developer Tools',
  'Consumer Apps',
  'Productivity',
  'Health & Wellness',
  'Finance',
  'Education',
  'Creator Tools',
  'Hardware & Physical',
  'Social',
  'Other',
]

export default async function NewConceptPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/?error=Sign+in+to+post+a+concept')
  }

  return (
    <div className="min-h-screen bg-white pt-12">
      <Header showPostButton={false} />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Share your concept</h1>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={createConcept} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="What's your concept called?"
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Describe the problem you're solving and your approach..."
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue=""
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <PrototypeInput />

          <button
            type="submit"
            className="mt-2 rounded-full bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            Post concept
          </button>
        </form>
      </main>
    </div>
  )
}
