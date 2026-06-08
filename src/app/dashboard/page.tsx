import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/?error=Sign+in+to+view+your+dashboard')

  // Fetch all concepts by this user, with their interests
  const { data: concepts } = await supabase
    .from('concepts')
    .select('id, title, category, created_at, interests(id, user_id, reason, created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Collect unique user_ids from all interests so we can show names
  const interestUserIds = [
    ...new Set(
      (concepts ?? []).flatMap((c) =>
        ((c.interests as { user_id: string }[]) ?? []).map((i) => i.user_id)
      )
    ),
  ]

  type Profile = { id: string; full_name: string | null; email: string | null }
  let profileMap: Record<string, Profile> = {}

  if (interestUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', interestUserIds)

    if (profiles) {
      profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]))
    }
  }

  type Interest = { id: string; user_id: string; reason: string; created_at: string }
  type Concept = {
    id: string
    title: string
    category: string
    created_at: string
    interests: Interest[]
  }

  const typedConcepts = (concepts ?? []) as Concept[]

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            ← Home
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-medium text-gray-900">Dashboard</span>
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

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your concepts</h1>
          <Link
            href="/concepts/new"
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Post a concept
          </Link>
        </div>

        {typedConcepts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">You haven&apos;t posted any concepts yet.</p>
            <Link
              href="/concepts/new"
              className="rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Post your first concept
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {typedConcepts.map((concept) => {
              const interests = concept.interests ?? []
              return (
                <div key={concept.id} className="rounded-2xl border border-gray-200 overflow-hidden">
                  {/* Concept header */}
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 shrink-0">
                        {concept.category}
                      </span>
                      <Link
                        href={`/concepts/${concept.id}`}
                        className="text-base font-semibold text-gray-900 hover:underline truncate"
                      >
                        {concept.title}
                      </Link>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-4">
                      {interests.length} interested
                    </span>
                  </div>

                  {/* Interest list */}
                  {interests.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-gray-400">No one has expressed interest yet.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {interests.map((interest) => {
                        const profile = profileMap[interest.user_id]
                        const name = profile?.full_name ?? profile?.email ?? 'Anonymous'
                        return (
                          <li key={interest.id} className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0 mt-0.5">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900">{name}</p>
                                {profile?.email && (
                                  <p className="text-xs text-gray-400">{profile.email}</p>
                                )}
                                <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{interest.reason}&rdquo;</p>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
