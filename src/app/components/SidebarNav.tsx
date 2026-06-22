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
  'Music',
  'Hardware & Physical',
  'Social',
  'Other',
]

export default function SidebarNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') ?? undefined
  return (
    <nav className="px-3 py-4 flex flex-col h-full">
      <ul className="flex flex-col gap-0.5 mb-4">
        <li>
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/' && !currentCategory
                ? 'bg-brand/10 text-brand font-semibold'
                : 'text-[#4a4a4a] hover:bg-[#fdf0eb] hover:text-brand'
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
                : 'text-[#4a4a4a] hover:bg-[#fdf0eb] hover:text-brand'
            }`}
          >
            <Info size={14} className="shrink-0" />
            About
          </Link>
        </li>
      </ul>

      <div className="border-t border-gray-200 my-3" />

      <p className="px-3 mb-2 text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider">
        Categories
      </p>
      <ul className="flex flex-col gap-0.5">
        <li>
          <Link
            href="/"
            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/' && !currentCategory
                ? 'bg-brand/10 text-brand font-semibold'
                : 'text-[#4a4a4a] hover:bg-[#fdf0eb] hover:text-brand'
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
                  : 'text-[#4a4a4a] hover:bg-[#fdf0eb] hover:text-brand'
              }`}
            >
              {cat}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-3 border-t border-gray-200">
        <p style={{ fontSize: '12px', color: '#9a9a9a' }} className="px-3 pb-2">
          <Link href="/legal/privacy" className="hover:underline" style={{ color: '#9a9a9a' }}>Privacy</Link>
          {' · '}
          <Link href="/legal/terms" className="hover:underline" style={{ color: '#9a9a9a' }}>Terms</Link>
        </p>
      </div>
    </nav>
  )
}
