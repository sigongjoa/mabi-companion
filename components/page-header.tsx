"use client"

import type React from "react"

export interface PageHeaderProps {
  title: string
  description?: string
  /** Pass *an element*, e.g. `<Users />`, **not** the component itself */
  icon?: React.ReactNode
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-center gap-4">
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-600">{icon}</div>
      )}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500 leading-tight">{description}</p>}
      </div>
    </header>
  )
}

export default PageHeader
