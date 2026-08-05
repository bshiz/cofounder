import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { createClient, getUser } from '@/lib/supabase/server'
import HeaderClient from './components/HeaderClient'
import AppShell from './components/AppShell'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})


export const metadata: Metadata = {
  title: 'Kindred: A permanent link for what you build',
  description: 'Upload something you made with AI and get a link that always shows the latest version.',
  metadataBase: new URL('https://findkindred.co'),
  openGraph: {
    title: 'Kindred: A permanent link for what you build',
    description: 'Upload something you made with AI and get a link that always shows the latest version.',
    url: 'https://findkindred.co',
    siteName: 'Kindred',
    images: [
      {
        url: '/kindred_og.png',
        width: 1200,
        height: 630,
        alt: 'Kindred: A permanent link for what you build',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kindred: A permanent link for what you build',
    description: 'Upload something you made with AI and get a link that always shows the latest version.',
    images: ['/kindred_og.png'],
  },
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
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <HeaderClient user={serializedUser} userProfile={userProfile} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
