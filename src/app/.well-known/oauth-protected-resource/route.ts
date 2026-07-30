import { protectedResourceHandler, metadataCorsOptionsRequestHandler } from 'mcp-handler'

export function GET(req: Request) {
  const { origin } = new URL(req.url)
  const handler = protectedResourceHandler({
    authServerUrls: [origin],
    resourceUrl: `${origin}/api/mcp`,
  })
  return handler(req)
}

export const OPTIONS = metadataCorsOptionsRequestHandler()
