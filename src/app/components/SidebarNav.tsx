'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Home as HomeIcon, Info } from 'lucide-react'

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

export default function SidebarNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') ?? undefined
  return (
    <nav className="px-3 py-4">
      <ul className="flex flex-col gap-0.5 mb-4">
        <li>
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/' && !currentCategory
                ? 'bg-brand/10 text-brand font-semibold'
                : 'text-gray-600 hover:bg-[#fdf0eb] hover:text-brand'
            }`}
          >
            <HomeIcon size={14} className="shrink-0" />
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/about'
                ? 'bg-brand/10 text-brand font-semibold'
                : 'text-gray-600 hover:bg-[#fdf0eb] hover:text-brand'
            }`}
          >
            <Info size={14} className="shrink-0" />
            About
          </Link>
        </li>
      </ul>

      <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Browse
      </p>
      <ul className="flex flex-col gap-0.5">
        <li>
          <Link
            href="/"
            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/' && !currentCategory
                ? 'bg-brand/10 text-brand font-semibold'
                : 'text-gray-600 hover:bg-[#fdf0eb] hover:text-brand'
            }`}
          >
            All
          </Link>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat}>
            <Link
              href={`/?category=${encodeURIComponent(cat)}`}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentCategory === cat
                  ? 'bg-brand/10 text-brand font-semibold'
                  : 'text-gray-600 hover:bg-[#fdf0eb] hover:text-brand'
              }`}
            >
              {cat}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
