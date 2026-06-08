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

  // Batch-fetch poster profiles
  const posterIds = [...new Set((concepts ?? []).map((c) => c.user_id))]
  type Profile = { id: string; full_name: string | null; avatar_url: string | null }
  let profileMap: Record<string, Profile> = {}
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
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
          Cofounder
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <Link
                href="/concepts/new"
                className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                Post a Concept
              </Link>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <GoogleIcon />
                Sign in
              </button>
            </form>
          )}
        </div>
      </nav>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Category filter */}
      <div className="border-b border-gray-200 px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        <FilterPill href="/" active={!category} label="All" />
        {CATEGORIES.map((cat) => (
          <FilterPill
            key={cat}
            href={`/?category=${encodeURIComponent(cat)}`}
            active={category === cat}
            label={cat}
          />
        ))}
      </div>

      {/* Concepts grid */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {concepts && concepts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {concepts.map((concept) => (
              <Link
                key={concept.id}
                href={`/concepts/${concept.id}`}
                className="group rounded-2xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-md transition-all flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {concept.category}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1.5 group-hover:text-gray-700">
                    {concept.title}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-3">{concept.description}</p>
                </div>
                <PosterRow profile={profileMap[concept.user_id]} />
              </Link>
            ))}
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
  )
}

type Profile = { id?: string; full_name: string | null; avatar_url: string | null } | undefined

function PosterRow({ profile }: { profile: Profile }) {
  const name = profile?.full_name ?? 'Anonymous'
  return (
    <div className="flex items-center gap-2 mt-auto pt-1 border-t border-gray-100">
      <Avatar profile={profile} size={22} />
      <span className="text-xs text-gray-500 truncate">{name}</span>
    </div>
  )
}

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

function FilterPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-900 text-white'
          : 'border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'
      }`}
    >
      {label}
    </Link>
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
