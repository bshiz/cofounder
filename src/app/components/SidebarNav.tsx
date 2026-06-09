'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

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
  const isHome = pathname === '/'

  return (
    <nav className="px-3 py-4">
      <ul className="flex flex-col gap-0.5 mb-4">
        <li>
          <Link
            href="/"
            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isHome && !currentCategory
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/about'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            About
          </Link>
        </li>
      </ul>

      {isHome && (
        <>
          <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Browse
          </p>
          <ul className="flex flex-col gap-0.5">
            <li>
              <Link
                href="/"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  !currentCategory
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </nav>
  )
}
