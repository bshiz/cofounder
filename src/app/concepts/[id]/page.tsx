import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import InterestForm from './InterestForm'
import DeleteButton from './DeleteButton'

type Profile = { full_name: string | null; avatar_url: string | null } | null

function Avatar({ profile, size = 32 }: { profile: Profile; size?: number }) {
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
      className="rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0"
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

  const isOwner = user?.id === concept.user_id

  const [posterResult, htmlRes, interestsResult] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', concept.user_id).single(),
    fetch(concept.html_file_url),
    isOwner
      ? supabase
          .from('interests')
          .select('id, user_id, reason, created_at')
          .eq('concept_id', id)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: null }),
  ])

  const poster = posterResult.data
  const htmlContent = htmlRes.ok ? await htmlRes.text() : '<p>Could not load preview.</p>'
  const interests = interestsResult.data ?? []

  type InterestProfile = { id: string; full_name: string | null; email: string | null; avatar_url: string | null }
  let interestProfileMap: Record<string, InterestProfile> = {}
  if (isOwner && interests.length > 0) {
    const userIds = interests.map((i: { user_id: string }) => i.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds)
    if (profiles) {
      interestProfileMap = Object.fromEntries(profiles.map((p) => [p.id, p]))
    }
  }

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
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* Left column: iframe */}
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
              srcDoc={htmlContent}
              sandbox="allow-scripts"
              className="w-full"
              style={{ height: '700px', border: 'none' }}
              title={`${concept.title} preview`}
            />
          </div>

          {/* Right column: sticky sidebar */}
          <div className="sticky top-8 flex flex-col gap-5">

            {/* Founder */}
            <div className="flex items-center gap-2.5">
              <Avatar profile={poster} size={32} />
              <span className="text-sm text-gray-500">{poster?.full_name ?? 'Anonymous'}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{concept.title}</h1>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">{concept.description}</p>

            {/* Category */}
            <span className="self-start inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {concept.category}
            </span>

            <div className="border-t border-gray-100" />

            {/* Owner actions */}
            {isOwner && (
              <div className="flex flex-col gap-3">
                <Link
                  href={`/concepts/${id}/edit`}
                  className="rounded-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
                >
                  Edit concept
                </Link>
                <DeleteButton conceptId={id} />
              </div>
            )}

            {/* Non-owner: interest form */}
            {!isOwner && (
              <div>
                {error && (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {decodeURIComponent(error)}
                  </div>
                )}

                {success ? (
                  <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                    Your interest has been sent to the founder.
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
          </div>
        </div>

        {/* Owner: interests list below the two-column layout */}
        {isOwner && (
          <div className="mt-12 max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Interest{' '}
              {interests.length > 0 && (
                <span className="text-gray-400 font-normal">({interests.length})</span>
              )}
            </h2>
            {interests.length === 0 ? (
              <p className="text-sm text-gray-400">No one has expressed interest yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {interests.map((interest: { id: string; user_id: string; reason: string }) => {
                  const p = interestProfileMap[interest.user_id]
                  const name = p?.full_name ?? p?.email ?? 'Anonymous'
                  return (
                    <li key={interest.id} className="rounded-xl border border-gray-200 px-4 py-4">
                      <div className="flex items-center gap-2.5 mb-2">
                        <Avatar profile={p ?? null} size={26} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{name}</p>
                          {p?.email && <p className="text-xs text-gray-400">{p.email}</p>}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">&ldquo;{interest.reason}&rdquo;</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
