import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(searchParams.get('error_description') ?? error)}`
    )
  }

  const mcpPendingId = request.cookies.get('mcp_pending_id')?.value

  if (!code || !mcpPendingId) {
    return NextResponse.redirect(`${origin}/?error=Missing+OAuth+parameters`)
  }

  // Look up the pending MCP OAuth request
  const admin = createAdminClient()
  const { data: pending, error: pendingError } = await admin
    .from('mcp_oauth_pending')
    .select('*')
    .eq('id', mcpPendingId)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (pendingError || !pending) {
    return NextResponse.redirect(`${origin}/?error=MCP+OAuth+session+expired`)
  }

  // Exchange the Supabase code for a session to get the user ID
  const cookieBuffer: { name: string; value: string; options: Record<string, unknown> }[] = []
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) { cookieBuffer.push(...cookiesToSet) },
      },
    }
  )

  const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError || !sessionData.user) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(exchangeError?.message ?? 'Auth failed')}`
    )
  }

  // Issue a Kindred auth code
  const { data: authCode, error: codeError } = await admin
    .from('mcp_oauth_codes')
    .insert({
      user_id: sessionData.user.id,
      client_id: pending.client_id,
      redirect_uri: pending.redirect_uri,
      code_challenge: pending.code_challenge,
      code_challenge_method: pending.code_challenge_method,
      scope: pending.scope,
    })
    .select('code')
    .single()

  if (codeError || !authCode) {
    return NextResponse.redirect(`${origin}/?error=Failed+to+issue+auth+code`)
  }

  // Clean up the pending record
  await admin.from('mcp_oauth_pending').delete().eq('id', mcpPendingId)

  // Redirect browser to the MCP client's redirect_uri with the auth code
  const redirectUrl = new URL(pending.redirect_uri)
  redirectUrl.searchParams.set('code', authCode.code)
  redirectUrl.searchParams.set('state', pending.state)

  const response = NextResponse.redirect(redirectUrl.toString())

  // Clear the MCP pending cookie
  response.cookies.delete('mcp_pending_id')

  // Attach Supabase session cookies so the user is also logged into the browser
  cookieBuffer.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })

  return response
}
