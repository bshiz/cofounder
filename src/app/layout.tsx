import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'
import { createClient, getUser } from '@/lib/supabase/server'
import HeaderClient from './components/HeaderClient'
import SidebarNav from './components/SidebarNav'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Kindred',
  description: 'Where makers find each other',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [user, supabase] = await Promise.all([getUser(), createClient()])

  let userProfile: { full_name: string | null; avatar_url: string | null } | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()
    userProfile = data
  }

  const serializedUser = user ? { id: user.id, email: user.email ?? null } : null

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <HeaderClient user={serializedUser} userProfile={userProfile} />
        <div className="flex pt-12">
          <aside className="fixed left-0 top-12 h-[calc(100vh-3rem)] w-56 border-r border-gray-200 bg-white overflow-y-auto z-10">
            <Suspense fallback={null}>
              <SidebarNav />
            </Suspense>
          </aside>
          <div className="ml-56 flex-1 min-h-[calc(100vh-3rem)]">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
