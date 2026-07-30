'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Project = {
  id: string
  title: string
  description: string | null
  created_at: string
  thumbnail_url: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}


export default function ProjectCard({ concept }: { concept: Project }) {
  const router = useRouter()

  return (
    <div
        onClick={() => router.push(`/concepts/${concept.id}`)}
        className="rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:border-gray-300 hover:shadow-md transition-all"
      >
        {concept.thumbnail_url ? (
          <div className="h-52 relative overflow-hidden">
            <Image
              src={concept.thumbnail_url}
              alt={concept.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-52 bg-gray-100" />
        )}

        <div className="px-5 py-5">
          <h2 className="text-base font-semibold text-[#1a1a1a] leading-snug mb-2 line-clamp-2">
            {concept.title}
          </h2>
          {concept.description && (
            <p className="text-sm text-[#4a4a4a] mb-3 line-clamp-2 leading-relaxed">
              {concept.description}
            </p>
          )}
          <p className="text-xs text-[#9a9a9a]">{formatDate(concept.created_at)}</p>
        </div>
    </div>
  )
}
