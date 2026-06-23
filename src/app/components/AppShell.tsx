'use client'

import { usePathname } from 'next/navigation'
import { Suspense, type ReactNode } from 'react'
import SidebarNav from './SidebarNav'

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isFullWidth = /^\/concepts\/[^/]+$/.test(pathname)

  if (isFullWidth) {
    return (
      <div className="pt-16 min-h-[calc(100vh-4rem)]">
        {children}
      </div>
    )
  }

  return (
    <div className="flex pt-16">
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-56 border-r border-gray-200 bg-white overflow-y-auto z-10">
        <Suspense fallback={null}>
          <SidebarNav />
        </Suspense>
      </aside>
      <div className="ml-56 flex-1 min-h-[calc(100vh-4rem)]">
        {children}
      </div>
    </div>
  )
}
