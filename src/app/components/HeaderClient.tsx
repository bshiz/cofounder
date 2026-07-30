'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

type User = { id: string; email: string | null } | null
type Profile = { full_name: string | null; avatar_url: string | null } | null

function Avatar({ profile, size = 28 }: { profile: Profile; size?: number }) {
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

export default function HeaderClient({
  user,
  userProfile,
}: {
  user: User
  userProfile: Profile
}) {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const showPostButton = pathname !== '/concepts/new' && !pathname.endsWith('/edit')

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-20 h-16 flex items-center px-6 gap-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      {/* Left: logo + nav links */}
      <div className="flex items-center gap-5 flex-1 min-w-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/kindred-logo.png" alt="Kindred" width={48} height={48} className="shrink-0" />
          <span className="text-xl font-bold text-[#1a1a1a] tracking-tight">Kindred</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-0.5">
          <Link
            href="/"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'text-[#1a1a1a] bg-gray-100'
                : 'text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-gray-50'
            }`}
          >
            My Projects
          </Link>
          <Link
            href="/about"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === '/about'
                ? 'text-[#1a1a1a] bg-gray-100'
                : 'text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-gray-50'
            }`}
          >
            About
          </Link>
        </nav>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <>
            {showPostButton && (
              <Link
                href="/concepts/new"
                className="hidden sm:inline-flex rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
              >
                Upload a project
              </Link>
            )}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Account menu"
              >
                <Avatar profile={userProfile} size={28} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-30">
                  {showPostButton && (
                    <Link
                      href="/concepts/new"
                      onClick={() => setDropdownOpen(false)}
                      className="sm:hidden block w-full text-left px-4 py-2 text-sm text-[#4a4a4a] hover:bg-gray-50 transition-colors"
                    >
                      Upload a project
                    </Link>
                  )}
                  <form action="/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2 text-sm text-[#4a4a4a] hover:bg-gray-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/sign-in"
            className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-[#4a4a4a] hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
