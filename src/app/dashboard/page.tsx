import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Profile = { full_name: string | null; avatar_url: string | null } | null | undefined

type ConceptCard = {
  id: string
  title: string
  description: string
  category: string
  thumbnail_url: string | null
  user_id: string
  created_at: string
}

function Avatar({ profile, size = 20 }: { profile: Profile; size?: number }) {
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
      className="rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-[#4a4a4a] shrink-0"
      style={{ width: size, height: size }}
    >
      {initial}
    </span>
  )
}

function ConceptFeedCard({ concept, poster }: { concept: ConceptCard; poster: Profile }) {
  const name = poster?.full_name ?? 'Anonymous'
  return (
    <Link
      href={`/concepts/${concept.id}`}
      className="group rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
    >
      {concept.thumbnail_url ? (
        <div className="h-48 relative overflow-hidden">
          <Image
            src={concept.thumbnail_url}
            alt={concept.title}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-white text-lg font-bold leading-snug line-clamp-2 drop-shadow-sm">
              {concept.title}
            </h2>
          </div>
        </div>
      ) : (
        <div className="h-48" style={{ background: 'linear-gradient(135deg, #2550FF 0%, #0f1120 100%)' }} />
      )}
      <div className="px-5 py-4">
        <p className="text-sm text-[#4a4a4a] mb-3 line-clamp-2 leading-relaxed">
          {concept.description}
        </p>
        <div className="flex items-center gap-2">
          <Avatar profile={poster} size={20} />
          <span className="text-xs text-[#4a4a4a]">{name}</span>
          <span className="text-[#d0c8c0] select-none">·</span>
          <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-white">
            {concept.category}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const [supabase, user] = await Promise.all([createClient(), getUser()])

  if (!user) redirect('/?error=Sign+in+to+view+your+profile')

  const [{ data: profile }, { data: myConcepts }, { data: interests }] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
    supabase
      .from('concepts')
      .select('id, title, description, category, thumbnail_url, user_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('interests')
      .select('concept_id, concepts(id, title, description, category, thumbnail_url, user_id, created_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  // Extract concepts from interest rows and fetch their posters
  const interestedConcepts = ((interests ?? [])
    .map((i) => i.concepts)
    .flat()
    .filter(Boolean)) as unknown as ConceptCard[]

  const posterIds = [...new Set(interestedConcepts.map((c) => c.user_id))]
  type ProfileRow = { id: string; full_name: string | null; avatar_url: string | null }
  let profileMap: Record<string, ProfileRow> = {}
  if (posterIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', posterIds)
    if (profiles) {
      profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]))
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* Profile header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name ?? 'Avatar'}
                width={48}
                height={48}
                className="rounded-full object-cover shrink-0"
              />
            ) : (
              <span className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-base font-semibold text-[#4a4a4a]">
                {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
              </span>
            )}
            <div>
              <p className="text-base font-semibold text-[#1a1a1a]">{profile?.full_name ?? 'Anonymous'}</p>
              <p className="text-sm text-[#4a4a4a]">{user.email}</p>
            </div>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="rounded-full border border-[#e4e4e7] bg-white px-4 py-1.5 text-sm font-medium text-[#1a1a1a] hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Your concepts */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-5">Your concepts</h2>
          {myConcepts && myConcepts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {myConcepts.map((concept) => (
                <ConceptFeedCard key={concept.id} concept={concept} poster={profile} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[#4a4a4a] mb-4">You haven&apos;t posted any concepts yet.</p>
              <Link
                href="/concepts/new"
                className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
              >
                Post your first concept
              </Link>
            </div>
          )}
        </section>

        {/* Concepts you're interested in */}
        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-5">Concepts you&apos;re interested in</h2>
          {interestedConcepts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {interestedConcepts.map((concept) => (
                <ConceptFeedCard
                  key={concept.id}
                  concept={concept}
                  poster={profileMap[concept.user_id]}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#4a4a4a]">You haven&apos;t expressed interest in any concepts yet.</p>
          )}
        </section>

      </main>
    </div>
  )
}
