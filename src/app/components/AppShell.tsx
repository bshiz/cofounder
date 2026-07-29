import type { ReactNode } from 'react'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="pt-16 min-h-screen">
      {children}
    </div>
  )
}
