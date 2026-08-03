import { createMcpHandler, withMcpAuth } from 'mcp-handler'
import type { AuthInfo, McpServer } from '@modelcontextprotocol/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const mcpHandler = createMcpHandler(
  (server: McpServer) => {
    server.registerTool(
      'ping',
      {
        title: 'Ping',
        description: 'Test the MCP connection. Returns "pong".',
        inputSchema: z.object({}),
      },
      async () => ({
        content: [{ type: 'text' as const, text: 'pong' }],
      })
    )

    server.registerTool(
      'push_project',
      {
        title: 'Push Project',
        description: 'Upload an HTML prototype and create or update a project on Kindred.',
        inputSchema: z.object({
          title: z.string().describe('The project title'),
          description: z.string().optional().describe('A short description of the project'),
          html_content: z.string().describe('The full HTML content of the prototype'),
          project_id: z.string().optional().describe('Existing project ID to update. If omitted, falls back to title matching then creates a new project.'),
        }),
      },
      async (args, context) => {
        const admin = createAdminClient()

        const { data: tokenData } = await admin
          .from('mcp_oauth_tokens')
          .select('user_id')
          .eq('token', context.http?.authInfo?.token ?? '')
          .single()

        if (!tokenData?.user_id) {
          return { content: [{ type: 'text' as const, text: 'Error: could not resolve user from token' }] }
        }

        // Upload new HTML to storage
        const path = `${tokenData.user_id}/${Date.now()}.html`
        const htmlBlob = new Blob([args.html_content], { type: 'text/html' })

        const { data: upload, error: uploadError } = await admin.storage
          .from('concepts')
          .upload(path, htmlBlob, { contentType: 'text/html', upsert: false })

        if (uploadError) {
          return { content: [{ type: 'text' as const, text: `Error uploading HTML: ${uploadError.message}` }] }
        }

        const html_file_url = admin.storage.from('concepts').getPublicUrl(upload.path).data.publicUrl

        // Resolve existing concept to update
        let existingId: string | null = null

        if (args.project_id) {
          const { data } = await admin
            .from('concepts')
            .select('id')
            .eq('id', args.project_id)
            .eq('user_id', tokenData.user_id)
            .maybeSingle()
          if (data) existingId = data.id
        }

        if (!existingId) {
          const { data } = await admin
            .from('concepts')
            .select('id')
            .eq('user_id', tokenData.user_id)
            .ilike('title', args.title)
            .limit(1)
            .maybeSingle()
          if (data) existingId = data.id
        }

        if (existingId) {
          const { error: updateError } = await admin
            .from('concepts')
            .update({ title: args.title, description: args.description ?? null, html_file_url })
            .eq('id', existingId)

          if (updateError) {
            return { content: [{ type: 'text' as const, text: `Error updating project: ${updateError.message}` }] }
          }

          const url = `https://findkindred.co/concepts/${existingId}`
          return { content: [{ type: 'text' as const, text: JSON.stringify({ created: false, project_id: existingId, url }) }] }
        }

        const { data: concept, error: insertError } = await admin
          .from('concepts')
          .insert({
            user_id: tokenData.user_id,
            title: args.title,
            description: args.description ?? null,
            html_file_url,
          })
          .select('id')
          .single()

        if (insertError) {
          return { content: [{ type: 'text' as const, text: `Error creating project: ${insertError.message}` }] }
        }

        const url = `https://findkindred.co/concepts/${concept.id}`
        return { content: [{ type: 'text' as const, text: JSON.stringify({ created: true, project_id: concept.id, url }) }] }
      }
    )
  },
  {
    serverInfo: { name: 'kindred', version: '1.0.0' },
  }
)

async function verifyToken(
  _req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined

  const admin = createAdminClient()
  const { data: token } = await admin
    .from('mcp_oauth_tokens')
    .select('token, client_id, scope, expires_at')
    .eq('token', bearerToken)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!token) return undefined

  return {
    token: bearerToken,
    clientId: token.client_id,
    scopes: (token.scope ?? 'mcp').split(' '),
    expiresAt: Math.floor(new Date(token.expires_at).getTime() / 1000),
  }
}

const handler = withMcpAuth(mcpHandler, verifyToken, { required: true })

export { handler as GET, handler as POST }
