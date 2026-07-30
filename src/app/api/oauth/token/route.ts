import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

function verifyCodeChallenge(verifier: string, challenge: string, method: string): boolean {
  if (method === 'S256') {
    const hash = crypto.createHash('sha256').update(verifier).digest('base64url')
    return hash === challenge
  }
  return verifier === challenge
}

export async function POST(request: NextRequest) {
  let body: Record<string, string> = {}

  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text()
    const params = new URLSearchParams(text)
    body = Object.fromEntries(params.entries())
  } else {
    body = await request.json().catch(() => ({}))
  }

  const { grant_type, code, redirect_uri, client_id, code_verifier } = body

  if (grant_type !== 'authorization_code') {
    return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 })
  }

  if (!code || !redirect_uri || !client_id || !code_verifier) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Missing required parameters' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  const { data: authCode, error: codeError } = await admin
    .from('mcp_oauth_codes')
    .select('*')
    .eq('code', code)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (codeError || !authCode) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Invalid or expired authorization code' },
      { status: 400 }
    )
  }

  if (authCode.redirect_uri !== redirect_uri) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'redirect_uri mismatch' },
      { status: 400 }
    )
  }

  if (authCode.client_id !== client_id) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'client_id mismatch' },
      { status: 400 }
    )
  }

  if (!verifyCodeChallenge(code_verifier, authCode.code_challenge, authCode.code_challenge_method)) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'code_verifier does not match code_challenge' },
      { status: 400 }
    )
  }

  // Mark the code as used (single-use)
  await admin
    .from('mcp_oauth_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', authCode.id)

  // Issue an access token
  const { data: tokenRecord, error: tokenError } = await admin
    .from('mcp_oauth_tokens')
    .insert({
      user_id: authCode.user_id,
      client_id: authCode.client_id,
      scope: authCode.scope,
    })
    .select('token, expires_at')
    .single()

  if (tokenError || !tokenRecord) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  const expiresIn = Math.floor(
    (new Date(tokenRecord.expires_at).getTime() - Date.now()) / 1000
  )

  return NextResponse.json(
    {
      access_token: tokenRecord.token,
      token_type: 'Bearer',
      expires_in: expiresIn,
      scope: authCode.scope ?? 'mcp',
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}

export function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
