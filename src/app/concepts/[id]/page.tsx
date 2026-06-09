import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ConceptBar from './ConceptBar'

type Profile = { full_name: string | null; avatar_url: string | null } | null

async function checkEmbeddable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
    const xfo = res.headers.get('x-frame-options')
    if (xfo) {
      const val = xfo.toUpperCase().trim()
      if (val === 'DENY' || val === 'SAMEORIGIN') return false
    }
    const csp = res.headers.get('content-security-policy')
    if (csp) {
      const match = csp.match(/frame-ancestors\s+([^;]+)/i)
      if (match && !match[1].includes('*')) return false
    }
    return true
  } catch {
    return false
  }
}

function Avatar({ profile, size = 26 }: { profile: Profile; size?: number }) {
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

  const isOwner = user?.id === concept.user_id

  const [posterResult, protoData, interestsResult] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', concept.user_id).single(),
    concept.prototype_url
      ? checkEmbeddable(concept.prototype_url)
      : concept.html_file_url
        ? fetch(concept.html_file_url).then(async (r) => (r.ok ? r.text() : '<p>Could not load preview.</p>'))
        : Promise.resolve(null),
    isOwner
      ? supabase
          .from('interests')
          .select('id, user_id, reason, created_at')
          .eq('concept_id', id)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: null }),
  ])

  const poster = posterResult.data
  const protoEmbeddable = concept.prototype_url ? (protoData as boolean) : false
  const htmlContent = !concept.prototype_url ? (protoData as string | null) : null
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
    <div className="pb-16">
      {/* Prototype iframe: fills viewport minus header (3rem) and sticky bar (4rem) */}
      <div style={{ height: 'calc(100vh - 3rem - 4rem)' }} className="relative bg-gray-50 flex flex-col">
        {/* Browser chrome bar */}
        <div className="border-b border-gray-200 px-4 py-2 flex items-center gap-1.5 bg-gray-100 shrink-0">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs text-gray-400 font-mono truncate flex-1">
            {concept.prototype_url ?? concept.title} — Live Preview
          </span>
        </div>

        {/* Iframe fills remaining height */}
        <div className="flex-1 overflow-hidden">
          {concept.prototype_url ? (
            protoEmbeddable ? (
              <iframe
                src={concept.prototype_url}
                className="w-full h-full"
                style={{ border: 'none' }}
                title={`${concept.title} preview`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-sm text-gray-400">This prototype can&apos;t be embedded.</p>
                <a
                  href={concept.prototype_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                >
                  View prototype ↗
                </a>
              </div>
            )
          ) : htmlContent ? (
            <iframe
              srcDoc={htmlContent}
              sandbox="allow-scripts"
              className="w-full h-full"
              style={{ border: 'none' }}
              title={`${concept.title} preview`}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400">No preview available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Concept info + owner interests list */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">{concept.title}</h1>
            <p className="text-sm text-gray-600 leading-relaxed">{concept.description}</p>
          </div>
          <span className="shrink-0 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 mt-1">
            {concept.category}
          </span>
        </div>

        {isOwner && (
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Interested{' '}
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
      </div>

      <ConceptBar
        poster={poster}
        conceptId={id}
        conceptTitle={concept.title}
        isOwner={isOwner}
        isLoggedIn={!!user}
        existingInterest={existingInterest}
        success={!!success}
        error={error}
      />
    </div>
  )
}
