import { createClient, getUser } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

const CATEGORY_COLORS: Record<string, { from: string; to: string }> = {
  'Developer Tools':     { from: '#6d28d9', to: '#4338ca' },
  'Consumer Apps':       { from: '#f97316', to: '#e11d48' },
  'Productivity':        { from: '#2563eb', to: '#0891b2' },
  'Health & Wellness':   { from: '#059669', to: '#0d9488' },
  'Finance':             { from: '#0d9488', to: '#065f46' },
  'Education':           { from: '#d97706', to: '#ea580c' },
  'Creator Tools':       { from: '#9333ea', to: '#db2777' },
  'Hardware & Physical': { from: '#475569', to: '#1e293b' },
  'Social':              { from: '#ec4899', to: '#e11d48' },
  'Other':               { from: '#6b7280', to: '#374151' },
}

function getGradientStyle(category: string): React.CSSProperties {
  const colors = CATEGORY_COLORS[category] ?? { from: '#6b7280', to: '#374151' }
  return { background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }
}

type Profile = { id?: string; full_name: string | null; avatar_url: string | null } | null | undefined

function Avatar({ profile, size = 28 }: { profile: Profile; size?: number }) {
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


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; error?: string }>
}) {
  const { category, error } = await searchParams
  const [supabase, user] = await Promise.all([createClient(), getUser()])

  let query = supabase
    .from('concepts')
    .select('id, title, description, category, created_at, user_id, thumbnail_url')
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data: concepts } = await query

  const posterIds = [...new Set((concepts ?? []).map((c) => c.user_id))]

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
    <>
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">Where makers find each other</h1>
          <p className="text-gray-500">Share what you&apos;re building and find someone who can&apos;t wait to work on it with you.</p>
        </div>

        {concepts && concepts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {concepts.map((concept) => {
              const poster = profileMap[concept.user_id]
              const name = poster?.full_name ?? 'Anonymous'
              return (
                <Link
                  key={concept.id}
                  href={`/concepts/${concept.id}`}
                  className="group rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
                >
                  {/* Card preview */}
                  <div
                    className="h-48 relative overflow-hidden"
                    style={concept.thumbnail_url ? undefined : getGradientStyle(concept.category)}
                  >
                    {concept.thumbnail_url && (
                      <Image
                        src={concept.thumbnail_url}
                        alt={concept.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 672px"
                        className="object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h2 className="text-white text-lg font-bold leading-snug line-clamp-2 drop-shadow-sm">
                        {concept.title}
                      </h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-5 py-4">
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                      {concept.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Avatar profile={poster} size={20} />
                      <span className="text-xs text-gray-500">{name}</span>
                      <span className="text-gray-200 select-none">·</span>
                      <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-white">
                        {concept.category}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-gray-400 text-lg mb-4">
              {category ? `No concepts in "${category}" yet.` : 'No concepts posted yet.'}
            </p>
            {user ? (
              <Link
                href="/concepts/new"
                className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Post the first one
              </Link>
            ) : (
              <p className="text-sm text-gray-400">Sign in to post the first concept.</p>
            )}
          </div>
        )}
      </main>
    </>
  )
}
