import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: concept } = await supabase
    .from('concepts')
    .select('*')
    .eq('id', id)
    .single()

  if (!concept) notFound()

  // Supabase Storage serves HTML with Content-Disposition: attachment, which
  // causes browsers to display raw source. Fetch the content server-side and
  // inject it via srcdoc so the iframe always renders it as HTML.
  const htmlRes = await fetch(concept.html_file_url)
  const htmlContent = htmlRes.ok ? await htmlRes.text() : '<p>Could not load preview.</p>'

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back
        </Link>
        <span className="text-gray-300">|</span>
        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {concept.category}
        </span>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{concept.title}</h1>
          <p className="text-gray-600 text-base leading-relaxed max-w-2xl">{concept.description}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50">
          <div className="border-b border-gray-200 px-4 py-2 flex items-center gap-1.5 bg-gray-100">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-gray-400 font-mono truncate flex-1">
              {concept.title} — Live Preview
            </span>
          </div>
          <iframe
            srcdoc={htmlContent}
            sandbox="allow-scripts"
            className="w-full"
            style={{ height: '600px', border: 'none' }}
            title={`${concept.title} preview`}
          />
        </div>
      </main>
    </div>
  )
}
