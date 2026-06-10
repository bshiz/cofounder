import { createClient, getUser } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ConceptBar from './ConceptBar'
import PrototypePreview from './PrototypePreview'

type Profile = { full_name: string | null; avatar_url: string | null } | null

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
  const [supabase, user] = await Promise.all([createClient(), getUser()])

  const { data: concept } = await supabase.from('concepts').select('*').eq('id', id).single()

  if (!concept) notFound()

  const isOwner = user?.id === concept.user_id

  const [posterResult, interestsResult] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', concept.user_id).single(),
    isOwner
      ? supabase
          .from('interests')
          .select('id, user_id, reason, created_at')
          .eq('concept_id', id)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: null }),
  ])

  const poster = posterResult.data
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
      {/* Top section: concept info above the fold */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Founder */}
        <div className="flex items-center gap-2.5 mb-5">
          <Avatar profile={poster} size={32} />
          <span className="text-sm text-gray-500">{poster?.full_name ?? 'Anonymous'}</span>
        </div>

        {/* Title + category */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">{concept.title}</h1>
          <span className="shrink-0 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-white mt-1">
            {concept.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">{concept.description}</p>

        {/* Looking for */}
        {concept.collaborator_description && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Looking for</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{concept.collaborator_description}</p>
          </div>
        )}
      </div>

      {/* Prototype iframe: full width, scrolls naturally with page */}
      <div className="border-t border-gray-100" style={{ height: '700px' }}>
        <PrototypePreview
          prototypeUrl={concept.prototype_url}
          htmlFileUrl={concept.html_file_url}
          title={concept.title}
        />
      </div>

      {/* Owner: interests list */}
      {isOwner && (
        <div className="max-w-2xl mx-auto px-6 py-8">
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
