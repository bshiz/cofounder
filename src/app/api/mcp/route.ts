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
