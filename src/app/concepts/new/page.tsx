import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewConceptForm from './NewConceptForm'

export default async function NewConceptPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const user = await getUser()

  if (!user) {
    redirect('/?error=Sign+in+to+post+a+concept')
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-8">Upload a project</h1>
        <NewConceptForm error={error} />
      </main>
    </div>
  )
}
