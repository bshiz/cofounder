import { createClient } from '@/lib/supabase/server'
import { signInWithGoogle } from './actions'
import Link from 'next/link'
import Image from 'next/image'

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

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; error?: string }>
}) {
  const { category, error } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from('concepts')
    .select('id, title, description, category, created_at, user_id')
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data: concepts } = await query

  const posterIds = [...new Set((concepts ?? []).map((c) => c.user_id))]

  const [profilesResult, userProfileResult] = await Promise.all([
    posterIds.length > 0
      ? supabase.from('profiles').select('id, full_name, avatar_url').in('id', posterIds)
      : Promise.resolve({ data: null }),
    user
      ? supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  type ProfileRow = { id: string; full_name: string | null; avatar_url: string | null }
  const profileMap: Record<string, ProfileRow> = Object.fromEntries(
    (profilesResult.data ?? []).map((p) => [p.id, p])
  )
  const userProfile = userProfileResult.data

  return (
    <div className="min-h-screen bg-white">

      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 z-20 h-12 border-b border-gray-200 bg-white flex items-center justify-between px-5">
        <Link href="/" className="text-base font-bold text-gray-900 tracking-tight">
          Cofounder
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/concepts/new"
                className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
              >
                Post a Concept
              </Link>
              <Link href="/dashboard">
                <Avatar profile={userProfile} size={28} />
              </Link>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <GoogleIcon />
                Sign in
              </button>
            </form>
          )}
        </div>
      </header>

      <div className="flex pt-12">
        {/* Left sidebar */}
        <aside className="fixed left-0 top-12 h-[calc(100vh-3rem)] w-56 border-r border-gray-200 bg-white overflow-y-auto z-10">
          <nav className="px-3 py-4">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Browse
            </p>
            <ul className="flex flex-col gap-0.5">
              <li>
                <Link
                  href="/"
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    !category
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  All
                </Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/?category=${encodeURIComponent(cat)}`}
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      category === cat
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main feed */}
        <div className="ml-56 flex-1">
          {error && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-sm text-red-700">
              {decodeURIComponent(error)}
            </div>
          )}

          <main className="max-w-2xl mx-auto px-6 py-8">
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
                    {/* Gradient preview */}
                    <div
                      className="h-48 relative overflow-hidden"
                      style={getGradientStyle(concept.category)}
                    >
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
                        <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
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
                  className="rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  Post the first one
                </Link>
              ) : (
                <p className="text-sm text-gray-400">Sign in to post the first concept.</p>
              )}
            </div>
          )}
          </main>
        </div>
      </div>
    </div>
  )
}
