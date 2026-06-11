import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import CopyLinkButton from '@/app/components/CopyLinkButton'

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
  const [supabase, user] = await Promise.all([createClient(), getUser()])

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
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name ?? 'Avatar'}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-base font-semibold text-gray-600">
                {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
              </span>
            )}
            <div>
              <p className="text-base font-semibold text-gray-900">{profile?.full_name ?? 'Anonymous'}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>

        {typedConcepts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-gray-400 text-lg mb-4">You haven&apos;t posted any concepts yet.</p>
            <Link
              href="/concepts/new"
              className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Post your first concept
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {typedConcepts.map((concept) => (
              <div
                key={concept.id}
                className="group rounded-2xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-md transition-all flex flex-col gap-3"
              >
                {/* Poster row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar profile={profile} size={22} />
                    <span className="text-xs text-gray-500 truncate">{profile?.full_name ?? 'You'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {concept.interests.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {concept.interests.length} interested
                      </span>
                    )}
                    <CopyLinkButton path={`/concepts/${concept.id}`} />
                  </div>
                </div>

                {/* Title + description — clickable */}
                <Link href={`/concepts/${concept.id}`} className="flex flex-col gap-1.5">
                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-gray-700">
                    {concept.title}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-3">{concept.description}</p>
                </Link>

                {/* Category */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
                    {concept.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
