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
          <div className="h-48 relative overflow-hidden">
            <Image
              src={concept.thumbnail_url}
              alt={concept.title}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h2 className="text-white text-lg font-bold leading-snug line-clamp-2 drop-shadow-sm">
                {concept.title}
              </h2>
            </div>
          </div>
        ) : (
          <div
            className="h-48 flex items-end p-5"
            style={{ background: 'linear-gradient(135deg, #2550FF 0%, #0f1120 100%)' }}
          >
            <h2 className="text-white text-lg font-bold leading-snug line-clamp-2">
              {concept.title}
            </h2>
          </div>
        )}

        <div className="px-5 py-4">
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
