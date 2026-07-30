/**
 * Fix content-type for HTML files in Supabase Storage.
 *
 * Run with:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key_here node scripts/fix-html-content-type.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qaihokcbnlgzzcedsmju.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY env var is required.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BUCKET = 'concepts'

async function listAllFiles(prefix = '') {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 })
  if (error) throw error

  const files = []
  for (const item of data ?? []) {
    if (item.metadata) {
      // It's a file
      files.push({ name: item.name, path: prefix ? `${prefix}/${item.name}` : item.name, metadata: item.metadata })
    } else {
      // It's a folder — recurse
      const nested = await listAllFiles(prefix ? `${prefix}/${item.name}` : item.name)
      files.push(...nested)
    }
  }
  return files
}

async function fixFile(path) {
  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

  // Download current content
  const res = await fetch(publicUrl)
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  const content = await res.arrayBuffer()

  // Re-upload in place with correct content-type
  const { error } = await supabase.storage
    .from(BUCKET)
    .update(path, content, { contentType: 'text/html', upsert: true })

  if (error) throw error
}

async function main() {
  console.log('Listing all files in concepts bucket...\n')
  const files = await listAllFiles()

  const htmlFiles = files.filter((f) => f.path.endsWith('.html'))
  const wrongType = htmlFiles.filter(
    (f) => f.metadata?.mimetype !== 'text/html'
  )

  console.log(`Total files found: ${files.length}`)
  console.log(`HTML files (.html extension): ${htmlFiles.length}`)
  console.log(`HTML files with wrong content-type: ${wrongType.length}\n`)

  if (wrongType.length === 0) {
    console.log('No files need fixing.')
    return
  }

  for (const file of wrongType) {
    console.log(`Fixing: ${file.path}  (was: ${file.metadata?.mimetype ?? 'unknown'})`)
    try {
      await fixFile(file.path)
      console.log(`  ✓ Fixed`)
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`)
    }
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
