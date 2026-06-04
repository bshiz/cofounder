'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://cofounder-indol.vercel.app/auth/callback',
    },
  })

  if (error) {
    redirect('/?error=Could not authenticate with Google')
  }

  redirect(data.url)
}
