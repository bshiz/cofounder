'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  const path = `${user.id}/${Date.now()}.html`

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

export async function expressInterest(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/?error=Sign+in+to+express+interest')
  }

  const conceptId = formData.get('concept_id') as string
  const reason = (formData.get('reason') as string).trim()

  if (!reason) {
    redirect(`/concepts/${conceptId}?error=Please+enter+a+reason`)
  }

  // Upsert the interested user's profile so the dashboard can display their name/avatar
  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name ?? null,
    email: user.email ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  })

  const { error: insertError } = await supabase
    .from('interests')
    .insert({ concept_id: conceptId, user_id: user.id, reason })

  if (insertError) {
    redirect(`/concepts/${conceptId}?error=${encodeURIComponent(insertError.message)}`)
  }

  // Email the concept owner — requires SUPABASE_SERVICE_ROLE_KEY + RESEND_API_KEY
  try {
    const admin = createAdminClient()

    const { data: concept } = await admin
      .from('concepts')
      .select('title, user_id')
      .eq('id', conceptId)
      .single()

    if (concept) {
      const { data: ownerData } = await admin.auth.admin.getUserById(concept.user_id)
      const ownerEmail = ownerData?.user?.email
      const interestedName = user.user_metadata?.full_name ?? user.email ?? 'Someone'
      const appUrl = 'https://cofounder-indol.vercel.app'

      if (ownerEmail && process.env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Cofounder <notifications@cofounder-indol.vercel.app>',
            to: ownerEmail,
            subject: `${interestedName} is interested in "${concept.title}"`,
            html: `
              <p>Hi,</p>
              <p><strong>${interestedName}</strong> expressed interest in your concept <strong>${concept.title}</strong>.</p>
              <p><em>"${reason}"</em></p>
              <p><a href="${appUrl}/dashboard">View your dashboard</a> to see everyone who's interested.</p>
            `,
          }),
        })
      }
    }
  } catch {
    // Email is best-effort — don't fail the request if it errors
  }

  redirect(`/concepts/${conceptId}?success=1`)
}
