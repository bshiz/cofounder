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
  const collaboratorDescription = (formData.get('collaborator_description') as string | null)?.trim() || null
  const category = formData.get('category') as string
  const prototypeUrl = (formData.get('prototype_url') as string | null)?.trim() || null
  const htmlFile = formData.get('html_file') as File
  const thumbnailFile = formData.get('thumbnail_file') as File

  if (!title || !description || !category) {
    redirect('/concepts/new?error=All+fields+are+required')
  }
  if (!prototypeUrl && !htmlFile?.size) {
    redirect('/concepts/new?error=Please+provide+a+prototype+URL+or+upload+an+HTML+file')
  }

  let html_file_url: string | null = null

  if (htmlFile?.size) {
    const path = `${user.id}/${Date.now()}.html`

    const { data: upload, error: uploadError } = await supabase.storage
      .from('concepts')
      .upload(path, htmlFile, { contentType: 'text/html', upsert: false })

    if (uploadError) {
      redirect(`/concepts/new?error=${encodeURIComponent(uploadError.message)}`)
    }

    html_file_url = supabase.storage.from('concepts').getPublicUrl(upload.path).data.publicUrl
  }

  let thumbnail_url: string | null = null

  if (thumbnailFile?.size) {
    const ext = thumbnailFile.name.split('.').pop() || 'jpg'
    const thumbPath = `thumbnails/${user.id}/${Date.now()}.${ext}`

    const { data: thumbUpload, error: thumbError } = await supabase.storage
      .from('concepts')
      .upload(thumbPath, thumbnailFile, { contentType: thumbnailFile.type, upsert: false })

    if (thumbError) {
      redirect(`/concepts/new?error=${encodeURIComponent(thumbError.message)}`)
    }

    thumbnail_url = supabase.storage.from('concepts').getPublicUrl(thumbUpload.path).data.publicUrl
  }

  const { data: concept, error: insertError } = await supabase
    .from('concepts')
    .insert({ user_id: user.id, title, description, collaborator_description: collaboratorDescription, category, prototype_url: prototypeUrl, html_file_url, thumbnail_url })
    .select('id')
    .single()

  if (insertError) {
    redirect(`/concepts/new?error=${encodeURIComponent(insertError.message)}`)
  }

  redirect(`/concepts/${concept.id}`)
}

export async function expressInterest(
  _prevState: { success?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sign in to express interest' }
  }

  const conceptId = formData.get('concept_id') as string
  const reason = (formData.get('reason') as string).trim()

  if (!reason) {
    return { error: 'Please enter a reason' }
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
    return { error: insertError.message }
  }

  // Email the concept owner — requires SUPABASE_SERVICE_ROLE_KEY + RESEND_API_KEY + FROM_EMAIL
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

      if (ownerEmail && process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL,
            to: ownerEmail,
            subject: `${interestedName} wants to build "${concept.title}" with you`,
            html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Someone wants to build with you</title>
</head>
<body style="margin:0;padding:0;background-color:#faf7f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf7f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://findkindred.co/kindred-logo.png" alt="Kindred" width="40" height="40" style="display:block;margin:0 auto 8px;" />
              <span style="font-family:Arial,sans-serif;font-size:18px;font-weight:700;color:#D85050;letter-spacing:-0.5px;">Kindred</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:40px;border:1px solid #e8e0d8;">

              <!-- Headline -->
              <p style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#1a1a1a;line-height:1.3;font-family:Arial,sans-serif;">
                Someone wants to build with you 🔥
              </p>
              <p style="margin:0 0 28px 0;font-size:15px;color:#4a4a4a;line-height:1.5;font-family:Arial,sans-serif;">
                <strong style="color:#1a1a1a;">${interestedName}</strong> expressed interest in your concept <strong style="color:#1a1a1a;">"${concept.title}"</strong>
              </p>

              <!-- Reason block -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#faf7f4;border-left:3px solid #D85050;border-radius:0 8px 8px 0;padding:16px 20px;">
                    <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;color:#D85050;letter-spacing:0.8px;text-transform:uppercase;font-family:Arial,sans-serif;">Their reason</p>
                    <p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.6;font-style:italic;font-family:Arial,sans-serif;">"${reason}"</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#D85050;border-radius:8px;">
                    <a href="mailto:${user.email}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;">
                      Reply to ${interestedName} →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9a9a9a;line-height:1.6;font-family:Arial,sans-serif;">
                You received this because someone expressed interest in your concept on <a href="https://findkindred.co" style="color:#9a9a9a;text-decoration:none;">findkindred.co</a>.<br/>
                Questions? Reply to <a href="mailto:hello@findkindred.co" style="color:#9a9a9a;text-decoration:none;">hello@findkindred.co</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
            text: `${interestedName} wants to build "${concept.title}" with you\n\n${interestedName} expressed interest in your concept "${concept.title}".\n\nTheir reason:\n"${reason}"\n\nIf you want to connect, reach out directly at ${user.email}.\n\nView your concept: ${appUrl}/concepts/${conceptId}\n\n---\nYou received this because someone expressed interest in your concept on findkindred.co.\nQuestions? Reply to hello@findkindred.co`,
          }),
        })
      }
    }
  } catch {
    // Email is best-effort — don't fail the request if it errors
  }

  return { success: true }
}

export async function updateConcept(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/?error=Not+authenticated')

  const conceptId = formData.get('concept_id') as string
  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const collaboratorDescription = (formData.get('collaborator_description') as string | null)?.trim() || null
  const category = formData.get('category') as string
  const prototypeUrl = (formData.get('prototype_url') as string | null)?.trim() || null
  const htmlFile = formData.get('html_file') as File
  const thumbnailFile = formData.get('thumbnail_file') as File

  if (!title || !description || !category) {
    redirect(`/concepts/${conceptId}/edit?error=All+fields+are+required`)
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('concepts')
    .select('user_id, html_file_url, prototype_url, thumbnail_url')
    .eq('id', conceptId)
    .single()

  if (!existing || existing.user_id !== user.id) {
    redirect('/?error=Not+authorized')
  }

  let html_file_url = existing.html_file_url

  if (!prototypeUrl && !html_file_url && !htmlFile?.size) {
    redirect(`/concepts/${conceptId}/edit?error=Please+provide+a+prototype+URL+or+upload+an+HTML+file`)
  }

  // Replace the HTML file only if a new one was uploaded
  if (htmlFile?.size > 0) {
    const newPath = `${user.id}/${Date.now()}.html`

    const { data: upload, error: uploadError } = await supabase.storage
      .from('concepts')
      .upload(newPath, htmlFile, { contentType: 'text/html', upsert: false })

    if (uploadError) {
      redirect(`/concepts/${conceptId}/edit?error=${encodeURIComponent(uploadError.message)}`)
    }

    // Delete the old file (best-effort)
    if (existing.html_file_url) {
      try {
        const oldPath = new URL(existing.html_file_url).pathname.replace(
          '/storage/v1/object/public/concepts/',
          ''
        )
        await supabase.storage.from('concepts').remove([oldPath])
      } catch {
        // Non-fatal if old file cleanup fails
      }
    }

    html_file_url = supabase.storage.from('concepts').getPublicUrl(upload.path).data.publicUrl
  }

  // Replace thumbnail only if a new one was uploaded
  let thumbnail_url = existing.thumbnail_url
  if (thumbnailFile?.size > 0) {
    const ext = thumbnailFile.name.split('.').pop() || 'jpg'
    const thumbPath = `thumbnails/${user.id}/${Date.now()}.${ext}`

    const { data: thumbUpload, error: thumbError } = await supabase.storage
      .from('concepts')
      .upload(thumbPath, thumbnailFile, { contentType: thumbnailFile.type, upsert: false })

    if (thumbError) {
      redirect(`/concepts/${conceptId}/edit?error=${encodeURIComponent(thumbError.message)}`)
    }

    // Delete old thumbnail (best-effort)
    if (existing.thumbnail_url) {
      try {
        const oldThumbPath = new URL(existing.thumbnail_url).pathname.replace(
          '/storage/v1/object/public/concepts/',
          ''
        )
        await supabase.storage.from('concepts').remove([oldThumbPath])
      } catch {
        // Non-fatal
      }
    }

    thumbnail_url = supabase.storage.from('concepts').getPublicUrl(thumbUpload.path).data.publicUrl
  }

  const { error: updateError } = await supabase
    .from('concepts')
    .update({ title, description, collaborator_description: collaboratorDescription, category, prototype_url: prototypeUrl, html_file_url, thumbnail_url })
    .eq('id', conceptId)
    .eq('user_id', user.id)

  if (updateError) {
    redirect(`/concepts/${conceptId}/edit?error=${encodeURIComponent(updateError.message)}`)
  }

  redirect(`/concepts/${conceptId}`)
}

export async function deleteConcept(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/?error=Not+authenticated')

  const conceptId = formData.get('concept_id') as string

  // Verify ownership and get file URL before deleting
  const { data: concept } = await supabase
    .from('concepts')
    .select('user_id, html_file_url')
    .eq('id', conceptId)
    .single()

  if (!concept || concept.user_id !== user.id) {
    redirect('/dashboard?error=Not+authorized')
  }

  // Delete HTML file from storage (best-effort)
  if (concept.html_file_url) {
    try {
      const storagePath = new URL(concept.html_file_url).pathname.replace(
        '/storage/v1/object/public/concepts/',
        ''
      )
      await supabase.storage.from('concepts').remove([storagePath])
    } catch {
      // Non-fatal
    }
  }

  await supabase.from('concepts').delete().eq('id', conceptId).eq('user_id', user.id)

  redirect('/dashboard')
}
