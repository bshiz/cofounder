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
        description: 'Upload an HTML prototype and create a new project on Kindred.',
        inputSchema: z.object({
          title: z.string().describe('The project title'),
          description: z.string().optional().describe('A short description of the project'),
          html_content: z.string().describe('The full HTML content of the prototype'),
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

        const path = `${tokenData.user_id}/${Date.now()}.html`
        const htmlBlob = new Blob([args.html_content], { type: 'text/html' })

        const { data: upload, error: uploadError } = await admin.storage
          .from('concepts')
          .upload(path, htmlBlob, { contentType: 'text/html', upsert: false })

        if (uploadError) {
          return { content: [{ type: 'text' as const, text: `Error uploading HTML: ${uploadError.message}` }] }
        }

        const html_file_url = admin.storage.from('concepts').getPublicUrl(upload.path).data.publicUrl

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
        return { content: [{ type: 'text' as const, text: `Project created: ${url}` }] }
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
