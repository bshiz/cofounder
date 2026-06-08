import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import InterestForm from './InterestForm'

type Profile = { full_name: string | null; avatar_url: string | null } | null

function PosterAvatar({ profile, size = 28 }: { profile: Profile; size?: number }) {
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

export default async function ConceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const { id } = await params
  const { error, success } = await searchParams
  const supabase = await createClient()

  const [{ data: concept }, { data: { user } }] = await Promise.all([
    supabase.from('concepts').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!concept) notFound()

  const { data: poster } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', concept.user_id)
    .single()

  // Fetch the HTML to render via srcdoc (Supabase serves with Content-Disposition: attachment)
  const htmlRes = await fetch(concept.html_file_url)
  const htmlContent = htmlRes.ok ? await htmlRes.text() : '<p>Could not load preview.</p>'

  const isOwner = user?.id === concept.user_id

  // Check if the current user has already expressed interest
  let existingInterest: { reason: string } | null = null
  if (user && !isOwner) {
    const { data } = await supabase
      .from('interests')
      .select('reason')
      .eq('concept_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    existingInterest = data
  }

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
        {/* Title + poster + description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{concept.title}</h1>
          <div className="flex items-center gap-2.5 mb-4">
            <PosterAvatar profile={poster} size={28} />
            <span className="text-sm text-gray-500">{poster?.full_name ?? 'Anonymous'}</span>
          </div>
          <p className="text-gray-600 text-base leading-relaxed max-w-2xl">{concept.description}</p>
        </div>

        {/* Live preview iframe */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 mb-10">
          <div className="border-b border-gray-200 px-4 py-2 flex items-center gap-1.5 bg-gray-100">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-gray-400 font-mono truncate flex-1">
              {concept.title} — Live Preview
            </span>
          </div>
          <iframe
            srcDoc={htmlContent}
            sandbox="allow-scripts"
            className="w-full"
            style={{ height: '600px', border: 'none' }}
            title={`${concept.title} preview`}
          />
        </div>

        {/* Interest section */}
        {!isOwner && (
          <div className="max-w-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interested in building this?</h2>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {decodeURIComponent(error)}
              </div>
            )}

            {success ? (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                Your interest has been sent to the founder. Check your email for updates.
              </div>
            ) : existingInterest ? (
              <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                <p className="text-sm font-medium text-gray-700 mb-1">You&apos;ve already expressed interest</p>
                <p className="text-sm text-gray-500 italic">&ldquo;{existingInterest.reason}&rdquo;</p>
              </div>
            ) : user ? (
              <InterestForm conceptId={id} />
            ) : (
              <p className="text-sm text-gray-500">
                <Link href="/?error=Sign+in+to+express+interest" className="underline hover:text-gray-900">
                  Sign in
                </Link>{' '}
                to let the founder know you&apos;re interested.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
