import { createClient, getUser } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ConceptBar from './ConceptBar'
import PrototypePreview from './PrototypePreview'
import CopyLinkButton from '@/app/components/CopyLinkButton'

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
      className="rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0"
      style={{ width: size, height: size }}
    >
      {initial}
    </span>
  )
}

export default async function ConceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const { id } = await params
  const { error, success } = await searchParams
  const [supabase, user] = await Promise.all([createClient(), getUser()])

  const { data: concept } = await supabase.from('concepts').select('*').eq('id', id).single()

  if (!concept) notFound()

  const isOwner = user?.id === concept.user_id

  const { data: poster } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', concept.user_id)
    .single()

  let existingInterest: { reason: string } | null = null
  if (user && !isOwner) {
    const { data } = await supabase
      .from('interests')
      .select('reason')
      .eq('concept_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    existingInterest = data
  }

  return (
    <div className="pb-16">
      {/* Top section: concept info above the fold */}
      <div className="px-8 py-6">
        {/* Founder + category row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Avatar profile={poster} size={28} />
            <span className="text-sm text-gray-500">{poster?.full_name ?? 'Anonymous'}</span>
          </div>
          <span className="shrink-0 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
            {concept.category}
          </span>
        </div>

        {/* Title + copy link */}
        <div className="flex items-start gap-2 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug flex-1">{concept.title}</h1>
          <CopyLinkButton path={`/concepts/${id}`} />
        </div>

        {/* Description + Looking for: two columns if both present, single column otherwise */}
        {concept.collaborator_description ? (
          <div className="grid grid-cols-2 gap-8">
            <p className="text-sm text-gray-600 leading-relaxed">{concept.description}</p>
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Looking for</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{concept.collaborator_description}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">{concept.description}</p>
        )}
      </div>

      {/* Prototype iframe: full width, scrolls naturally with page */}
      <div className="border-t border-gray-100" style={{ height: '700px' }}>
        <PrototypePreview
          prototypeUrl={concept.prototype_url}
          htmlFileUrl={concept.html_file_url}
          title={concept.title}
        />
      </div>

      <ConceptBar
        poster={poster}
        conceptId={id}
        conceptTitle={concept.title}
        isOwner={isOwner}
        isLoggedIn={!!user}
        existingInterest={existingInterest}
        success={!!success}
        error={error}
      />
    </div>
  )
}
