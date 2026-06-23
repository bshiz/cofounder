import { createClient, getUser } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ConceptBar from './ConceptBar'
import PrototypePreview from './PrototypePreview'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: concept } = await supabase
    .from('concepts')
    .select('title, description')
    .eq('id', id)
    .single()

  if (!concept) {
    return {
      title: 'Kindred',
      description: 'Where makers find each other.',
    }
  }

  return {
    title: `${concept.title} — Kindred`,
    description: concept.description,
    openGraph: {
      title: `${concept.title} — Kindred`,
      description: concept.description,
      url: `https://findkindred.co/concepts/${id}`,
      siteName: 'Kindred',
      images: [
        {
          url: '/kindred_og.png',
          width: 1200,
          height: 630,
          alt: concept.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${concept.title} — Kindred`,
      description: concept.description,
      images: ['/kindred_og.png'],
    },
  }
}

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
      className="rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-[#4a4a4a] shrink-0"
      style={{ width: size, height: size }}
    >
      {initial}
    </span>
  )
}

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [supabase, user] = await Promise.all([createClient(), getUser()])

  const { data: concept } = await supabase.from('concepts').select('*').eq('id', id).single()

  if (!concept) notFound()

  const isOwner = user?.id === concept.user_id

  const [{ data: poster }, { count: interestCount }] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', concept.user_id).single(),
    supabase.from('interests').select('*', { count: 'exact', head: true }).eq('concept_id', id),
  ])

  let existingInterest = false
  if (user && !isOwner) {
    const { data } = await supabase
      .from('interests')
      .select('id')
      .eq('concept_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    existingInterest = !!data
  }

  return (
    <div className="pb-16 overflow-x-hidden">
      {/* Top section: concept info above the fold */}
      <div className="max-w-[1200px] mx-auto px-8 py-6">
        {/* Founder + category row */}
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar profile={poster} size={28} />
          <span className="text-sm text-[#4a4a4a]">{poster?.full_name ?? 'Anonymous'}</span>
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
            {concept.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#1a1a1a] leading-snug mb-4">{concept.title}</h1>

        {/* Description */}
        <p className="text-sm text-[#4a4a4a] leading-relaxed max-w-2xl mb-4">{concept.description}</p>

        {/* Looking for */}
        {concept.collaborator_description && (
          <div>
            <h2 className="text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider mb-1.5">Looking for</h2>
            <p className="text-sm text-[#4a4a4a] leading-relaxed max-w-2xl">{concept.collaborator_description}</p>
          </div>
        )}
      </div>

      {/* Prototype iframe */}
      <div className="border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto">
        <PrototypePreview
          prototypeUrl={concept.prototype_url}
          htmlFileUrl={concept.html_file_url}
          title={concept.title}
        />
        </div>
      </div>

      <ConceptBar
        poster={poster}
        conceptId={id}
        isOwner={isOwner}
        isLoggedIn={!!user}
        existingInterest={existingInterest}
        interestCount={interestCount ?? 0}
      />
    </div>
  )
}
