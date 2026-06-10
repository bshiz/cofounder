import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createConcept } from '@/app/actions'
import PrototypeInput from './PrototypeInput'

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
  const user = await getUser()

  if (!user) {
    redirect('/?error=Sign+in+to+post+a+concept')
  }

  return (
    <div className="min-h-screen bg-white">
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
            <label htmlFor="collaborator_description" className="text-sm font-medium text-gray-700">
              What are you looking for in a collaborator?
            </label>
            <p className="text-xs text-gray-400 -mt-0.5">
              Describe the skills, perspective, or background that would complement yours — be specific about what you need to take this further.
            </p>
            <textarea
              id="collaborator_description"
              name="collaborator_description"
              rows={3}
              placeholder="e.g. Someone with sales or go-to-market experience, ideally in healthcare..."
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="thumbnail_file" className="text-sm font-medium text-gray-700">
              Thumbnail image
              <span className="ml-1.5 text-gray-400 font-normal">(optional)</span>
            </label>
            <p className="text-xs text-gray-400 -mt-0.5">
              Upload a screenshot or image that represents your concept — this is what people will see in the feed
            </p>
            <input
              id="thumbnail_file"
              name="thumbnail_file"
              type="file"
              accept="image/*"
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="submit"
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Share concept
            </button>
            <Link
              href="/"
              className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
