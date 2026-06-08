import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Profile = { full_name: string | null; avatar_url: string | null } | null | undefined

function Avatar({ profile, size = 22 }: { profile: Profile; size?: number }) {
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

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/?error=Sign+in+to+view+your+concepts')

  const [{ data: concepts }, { data: profile }] = await Promise.all([
    supabase
      .from('concepts')
      .select('id, title, description, category, created_at, interests(id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
  ])

  type Concept = {
    id: string
    title: string
    description: string
    category: string
    created_at: string
    interests: { id: string }[]
  }

  const typedConcepts = (concepts ?? []) as Concept[]

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            ← Home
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-medium text-gray-900">My Concepts</span>
        </div>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Sign out
          </button>
        </form>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Concepts</h1>
          <Link
            href="/concepts/new"
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Post a concept
          </Link>
        </div>

        {typedConcepts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-gray-400 text-lg mb-4">You haven&apos;t posted any concepts yet.</p>
            <Link
              href="/concepts/new"
              className="rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Post your first concept
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {typedConcepts.map((concept) => (
              <Link
                key={concept.id}
                href={`/concepts/${concept.id}`}
                className="group rounded-2xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-md transition-all flex flex-col gap-3"
              >
                {/* Poster row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar profile={profile} size={22} />
                    <span className="text-xs text-gray-500 truncate">{profile?.full_name ?? 'You'}</span>
                  </div>
                  {concept.interests.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {concept.interests.length} interested
                    </span>
                  )}
                </div>

                {/* Title + description */}
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1.5 group-hover:text-gray-700">
                    {concept.title}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-3">{concept.description}</p>
                </div>

                {/* Category */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {concept.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
