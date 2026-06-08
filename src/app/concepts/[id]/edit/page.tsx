import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { updateConcept } from '@/app/actions'

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

export default async function EditConceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const [{ data: concept }, { data: { user } }] = await Promise.all([
    supabase.from('concepts').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!concept) notFound()
  if (!user || user.id !== concept.user_id) redirect('/?error=Not+authorized')

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href={`/concepts/${id}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Back
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-900">Edit concept</span>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit concept</h1>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={updateConcept} className="flex flex-col gap-6">
          <input type="hidden" name="concept_id" value={id} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={concept.title}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
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
              defaultValue={concept.description}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
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
              defaultValue={concept.category}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="html_file" className="text-sm font-medium text-gray-700">
              HTML file
              <span className="ml-1.5 text-gray-400 font-normal">(optional — leave blank to keep existing)</span>
            </label>
            <input
              id="html_file"
              name="html_file"
              type="file"
              accept=".html,text/html"
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="submit"
              className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Save changes
            </button>
            <Link
              href={`/concepts/${id}`}
              className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
