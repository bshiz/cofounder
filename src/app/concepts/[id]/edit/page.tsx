import { createClient, getUser } from '@/lib/supabase/server'
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
  'Music',
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
  const [supabase, user] = await Promise.all([createClient(), getUser()])

  const { data: concept } = await supabase.from('concepts').select('*').eq('id', id).single()

  if (!concept) notFound()
  if (!user || user.id !== concept.user_id) redirect('/?error=Not+authorized')

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-8">Edit concept</h1>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={updateConcept} className="flex flex-col gap-6">
          <input type="hidden" name="concept_id" value={id} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium text-[#4a4a4a]">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={concept.title}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-[#4a4a4a]">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={concept.description}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="collaborator_description" className="text-sm font-medium text-[#4a4a4a]">
              What are you looking for in a collaborator?
            </label>
            <p className="text-xs text-[#4a4a4a] -mt-0.5">
              Describe the skills, perspective, or background that would complement yours — be specific about what you need to take this further.
            </p>
            <textarea
              id="collaborator_description"
              name="collaborator_description"
              rows={3}
              defaultValue={concept.collaborator_description ?? ''}
              placeholder="e.g. Someone with sales or go-to-market experience, ideally in healthcare..."
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#4a4a4a] focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium text-[#4a4a4a]">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={concept.category}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="prototype_url" className="text-sm font-medium text-[#4a4a4a]">
              Prototype URL
              <span className="ml-1.5 text-[#4a4a4a] font-normal">(optional)</span>
            </label>
            <input
              id="prototype_url"
              name="prototype_url"
              type="url"
              defaultValue={concept.prototype_url ?? ''}
              placeholder="https://your-prototype.com"
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#4a4a4a] focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="html_file" className="text-sm font-medium text-[#4a4a4a]">
              HTML file
              <span className="ml-1.5 text-[#4a4a4a] font-normal">(optional — leave blank to keep existing)</span>
            </label>
            <input
              id="html_file"
              name="html_file"
              type="file"
              accept=".html,text/html"
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-[#4a4a4a] hover:file:bg-gray-200 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="thumbnail_file" className="text-sm font-medium text-[#4a4a4a]">
              Thumbnail image
              <span className="ml-1.5 text-[#4a4a4a] font-normal">(optional — leave blank to keep existing)</span>
            </label>
            <p className="text-xs text-[#4a4a4a] -mt-0.5">
              Upload a screenshot or image that represents your concept — this is what people will see in the feed
            </p>
            <input
              id="thumbnail_file"
              name="thumbnail_file"
              type="file"
              accept="image/*"
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-[#4a4a4a] hover:file:bg-gray-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <Link
              href={`/concepts/${id}`}
              className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-[#4a4a4a] hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
            >
              Save changes
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
