import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ProjectCard from '@/app/components/ProjectCard'
import { signInWithGoogle } from '@/app/actions'
import FaqAccordion from '@/app/components/FaqAccordion'

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4 shrink-0">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

function GoogleCTA() {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className="flex items-center gap-2.5 rounded-full bg-gray-100 px-7 py-3 text-sm font-semibold text-[#1a1a1a] hover:bg-gray-200 transition-colors"
      >
        <GoogleIcon />
        Sign in with Google
      </button>
    </form>
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
        <main>

          {/* ── HERO ── */}
          <section className="relative overflow-hidden" style={{ background: '#0d1456' }}>
            {/* Blurred gradient blobs */}
            <div aria-hidden className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-[700px] h-[700px] rounded-full" style={{ background: '#2550FF', filter: 'blur(140px)', opacity: 0.75 }} />
              <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full" style={{ background: '#3a5cff', filter: 'blur(120px)', opacity: 0.5 }} />
              <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full" style={{ background: '#060c2e', filter: 'blur(100px)', opacity: 0.9 }} />
            </div>

            <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left: headline + CTA */}
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                  Give your code projects a home you can share.
                </h1>
                <p className="text-lg text-blue-100 leading-relaxed mb-8 max-w-md">
                  Upload an HTML file, get a permanent link, easily update with MCP.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <GoogleCTA />
                  <span className="text-sm text-blue-200">Free to get started</span>
                </div>
              </div>

              {/* Right: browser chrome card */}
              <div>
                <p className="text-xs text-blue-300 uppercase tracking-widest mb-3">Example project</p>
                {/* Card */}
                <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
                  {/* Chrome bar */}
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="flex-1 rounded-md bg-gray-100 px-3 py-1.5">
                      <span
                        className="text-xs text-[#9a9a9a]"
                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                      >
                        kindred.app/health-tracker
                      </span>
                    </div>
                  </div>

                  {/* Content: project screenshot */}
                  <div className="relative h-52 md:h-64 overflow-hidden">
                    <Image
                      src="/ticket-alert-preview.png"
                      alt="Example project"
                      fill
                      className="object-cover object-top"
                    />
                  </div>

                  {/* Live status */}
                  <div className="border-t border-dashed border-gray-200 px-4 py-3 flex items-center gap-2 bg-white">
                    <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <span className="text-sm text-[#4a4a4a]">Live — updated from Claude just now</span>
                  </div>
                </div>
              </div>

            </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a]">Three steps. One link, forever.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="w-10 h-10 rounded-lg bg-[#eff2ff] flex items-center justify-center mb-5 text-brand">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-brand mb-2">01</p>
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Build it</h3>
                <p className="text-base text-[#4a4a4a] leading-relaxed">Make something with Claude, a prototype, a tool, a presentation.</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="w-10 h-10 rounded-lg bg-[#eff2ff] flex items-center justify-center mb-5 text-brand">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-brand mb-2">02</p>
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Upload it once</h3>
                <p className="text-base text-[#4a4a4a] leading-relaxed">Get a permanent link you can share anywhere.</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="w-10 h-10 rounded-lg bg-[#eff2ff] flex items-center justify-center mb-5 text-brand">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-brand mb-2">03</p>
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Update it from Claude</h3>
                <p className="text-base text-[#4a4a4a] leading-relaxed">Connect Kindred, update with Claude, the link stays the same.</p>
              </div>

            </div>
          </div>
          </section>

          {/* ── WHY IT'S DIFFERENT ── gray bg section */}
          <section className="bg-gray-50 py-20">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a]">Nothing to set up. Nothing to remember.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#eff2ff] flex items-center justify-center mb-5 text-brand">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">No hosting, no accounts</h3>
                  <p className="text-base text-[#4a4a4a] leading-relaxed">There&apos;s no server to configure and nothing new to sign up for.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#eff2ff] flex items-center justify-center mb-5 text-brand">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 17 10 11 4 5" />
                      <line x1="12" y1="19" x2="20" y2="19" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Work in Claude Code and Chat</h3>
                  <p className="text-base text-[#4a4a4a] leading-relaxed">Build wherever you already work. The same link updates either way.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#eff2ff] flex items-center justify-center mb-5 text-brand">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">One link, always current</h3>
                  <p className="text-base text-[#4a4a4a] leading-relaxed">Share it once. Every update from Claude shows up there automatically.</p>
                </div>

              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="max-w-6xl mx-auto px-6 py-20">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold text-[#1a1a1a]">Good to know</h2>
            </div>
            <FaqAccordion />
          </section>

          {/* ── CLOSING CTA ── dark section */}
          <section className="bg-[#111111] py-24 px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Build it once. Share it forever.</h2>
            <p className="text-[#9a9a9a] mb-10 text-lg">Free to start, one link is all it takes.</p>
            <div className="flex justify-center">
              <GoogleCTA />
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="px-6 py-5 flex items-center justify-between border-t border-gray-100 bg-white">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image src="/kindred-logo.png" alt="Kindred" width={28} height={28} className="shrink-0" />
              <span className="text-base font-bold text-[#1a1a1a] tracking-tight">Kindred</span>
            </Link>
            <span className="text-sm text-[#9a9a9a]">© 2026 Kindred</span>
          </footer>

        </main>
      </>
    )
  }

  // ── SIGNED-IN: My Projects ──
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
