"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface NotificationContextValue {
  notify: (message: string) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)

  const notify = (msg: string) => {
    setMessage(msg)
    // 3초 후 자동으로 사라지게
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* 배너를 앱 최상단에 렌더 */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotification must be inside NotificationProvider")
  return ctx.notify
} 