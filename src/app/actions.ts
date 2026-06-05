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

export async function createConcept(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/?error=Not+authenticated')
  }

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const category = formData.get('category') as string
  const htmlFile = formData.get('html_file') as File

  if (!title || !description || !category || !htmlFile?.size) {
    redirect('/concepts/new?error=All+fields+are+required')
  }

  const ext = htmlFile.name.endsWith('.html') ? '.html' : '.html'
  const path = `${user.id}/${Date.now()}${ext}`

  const { data: upload, error: uploadError } = await supabase.storage
    .from('concepts')
    .upload(path, htmlFile, { contentType: 'text/html', upsert: false })

  if (uploadError) {
    redirect(`/concepts/new?error=${encodeURIComponent(uploadError.message)}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('concepts').getPublicUrl(upload.path)

  const { data: concept, error: insertError } = await supabase
    .from('concepts')
    .insert({ user_id: user.id, title, description, category, html_file_url: publicUrl })
    .select('id')
    .single()

  if (insertError) {
    redirect(`/concepts/new?error=${encodeURIComponent(insertError.message)}`)
  }

  redirect(`/concepts/${concept.id}`)
}
