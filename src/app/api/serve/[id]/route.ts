import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const RESIZE_SCRIPT = `<script>
window.addEventListener('load', function() {
  window.parent.postMessage({ iframeHeight: document.body.scrollHeight }, '*');
});
window.addEventListener('resize', function() {
  window.parent.postMessage({ iframeHeight: document.body.scrollHeight }, '*');
});
</script>`

function injectResizeScript(html: string): string {
  if (html.includes('</body>')) {
    return html.replace('</body>', RESIZE_SCRIPT + '</body>')
  }
  return html + RESIZE_SCRIPT
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: concept } = await supabase
    .from('concepts')
    .select('html_file_url')
    .eq('id', id)
    .single()

  if (!concept?.html_file_url) {
    return new NextResponse('Not found', { status: 404 })
  }

  const res = await fetch(concept.html_file_url)
  if (!res.ok) {
    return new NextResponse('Failed to fetch file', { status: 502 })
  }

  const html = await res.text()

  return new NextResponse(injectResizeScript(html), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
    },
  })
}
