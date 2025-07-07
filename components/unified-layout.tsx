"use client"

import type React from "react"
import Sidebar from "@/components/sidebar"

export interface UnifiedLayoutProps {
  children: React.ReactNode
  /** Controls sidebar visibility on small screens (optional). */
  isOpen?: boolean
  /** Setter from parent to toggle sidebar (optional). */
  setIsOpen?: (open: boolean) => void
}

/**
 * App-wide shell with a persistent left sidebar and a main content area.
 *
 * Example:
 * ```tsx
 * export default function CharactersPage() {
 *   return (
 *     <UnifiedLayout>
 *       <PageHeader title="Characters" icon={<Users />} />
 *       ...
 *     </UnifiedLayout>
 *   )
 * }
 * ```
 */
export function UnifiedLayout({ children, isOpen = true, setIsOpen }: UnifiedLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 bg-gray-50 p-4 md:p-8">{children}</main>
    </div>
  )
}

export default UnifiedLayout
