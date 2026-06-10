import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ embeddable: false })
  }

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    })

    const xfo = res.headers.get('x-frame-options')
    if (xfo) {
      const val = xfo.toUpperCase().trim()
      if (val === 'DENY' || val === 'SAMEORIGIN') {
        return NextResponse.json({ embeddable: false })
      }
    }

    const csp = res.headers.get('content-security-policy')
    if (csp) {
      const match = csp.match(/frame-ancestors\s+([^;]+)/i)
      if (match && !match[1].includes('*')) {
        return NextResponse.json({ embeddable: false })
      }
    }

    return NextResponse.json({ embeddable: true })
  } catch {
    return NextResponse.json({ embeddable: false })
  }
}
