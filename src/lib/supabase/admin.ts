import { createClient } from '@supabase/supabase-js'

// Admin client uses the service role key — only use in server-side code,
// never expose to the client. Required for reading auth.users email addresses.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
