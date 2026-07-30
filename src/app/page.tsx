import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProjectCard from '@/app/components/ProjectCard'

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
  searchParams: Promise<{ error?: string; code?: string }>
}) {
  const { error, code } = await searchParams

  // Safety net: Supabase sometimes sends ?code= to the site URL
  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}`)
  }

  const user = await getUser()

  // Signed-out landing
  if (!user) {
    return (
      <>
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}
        <main className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4 leading-tight">
            A permanent link for what you build.
          </h1>
          <p className="text-[#4a4a4a] mb-10 max-w-md">
            Upload something you made with AI and get a link that always shows the latest version.
          </p>
          <a
            href="/auth/sign-in"
            className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-[#4a4a4a] hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Sign in with Google
          </a>
        </main>
      </>
    )
  }

  const supabase = await createClient()
  const { data: concepts, error: conceptsError } = await supabase
    .from('concepts')
    .select('id, title, description, created_at, thumbnail_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (conceptsError) {
    console.error('[home] concepts query error:', conceptsError)
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-8 leading-tight">My Projects</h1>
        {concepts && concepts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {concepts.map((concept) => (
              <ProjectCard key={concept.id} concept={concept} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4">
            <p className="text-[#4a4a4a]">You haven&apos;t shared anything yet.</p>
            <Link
              href="/concepts/new"
              className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
            >
              Upload your first file
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
