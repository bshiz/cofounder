import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const responseType = searchParams.get('response_type')
  const codeChallenge = searchParams.get('code_challenge')
  const codeChallengeMethod = searchParams.get('code_challenge_method') ?? 'S256'
  const state = searchParams.get('state')
  const scope = searchParams.get('scope') ?? 'mcp'

  if (!clientId || !redirectUri || responseType !== 'code' || !codeChallenge || !state) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Missing required parameters' },
      { status: 400 }
    )
  }

  if (codeChallengeMethod !== 'S256') {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Only S256 code_challenge_method is supported' },
      { status: 400 }
    )
  }

  // Store pending OAuth request in DB
  const admin = createAdminClient()
  const { data: pending, error: dbError } = await admin
    .from('mcp_oauth_pending')
    .insert({ client_id: clientId, redirect_uri: redirectUri, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod, scope, state })
    .select('id')
    .single()

  if (dbError || !pending) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  // Initiate Supabase Google OAuth, redirecting back to our MCP callback
  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = []
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) { pendingCookies.push(...cookiesToSet) },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/api/oauth/callback` },
  })

  if (error || !data.url) {
    return NextResponse.json({ error: 'server_error', error_description: 'Failed to initiate Google OAuth' }, { status: 500 })
  }

  const response = NextResponse.redirect(data.url)

  // Attach Supabase PKCE cookies
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })

  // Store the pending MCP state in a cookie so the callback can retrieve it
  response.cookies.set('mcp_pending_id', pending.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}
