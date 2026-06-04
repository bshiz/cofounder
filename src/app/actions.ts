'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

function getSiteUrl() {
  // Explicit env var always wins (set this on Vercel)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  // Vercel preview/production deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()

  // Prefer the Origin header but fall back to a reliable derived URL so
  // redirectTo is never the string "null/auth/callback".
  const origin = headersList.get('origin') ?? getSiteUrl()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect('/?error=Could not authenticate with Google')
  }

  redirect(data.url)
}
