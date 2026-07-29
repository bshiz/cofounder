'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home as HomeIcon, Info } from 'lucide-react'

export default function SidebarNav() {
  const pathname = usePathname()
  return (
    <nav className="px-3 py-4 flex flex-col h-full">
      <ul className="flex flex-col gap-0.5 mb-4">
        <li>
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'bg-brand/10 text-brand font-semibold'
                : 'text-[#4a4a4a] hover:bg-[#eef1ff] hover:text-brand'
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
                : 'text-[#4a4a4a] hover:bg-[#eef1ff] hover:text-brand'
            }`}
          >
            <Info size={14} className="shrink-0" />
            About
          </Link>
        </li>
      </ul>

      <div className="border-t border-gray-200 my-3" />

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
