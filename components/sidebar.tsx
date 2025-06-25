"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Package, Sword, CheckSquare, Users, Hammer, Sparkles, Brain, Map, Menu, X, BarChart3 } from "lucide-react"

const navigation = [
  { name: "대시보드", href: "/", icon: BarChart3 },
  { name: "아이템 관리", href: "/inventory", icon: Package },
  { name: "재료 관리", href: "/materials", icon: Package },
  { name: "캐릭터 장비", href: "/equipment", icon: Sword },
  { name: "퀘스트 관리", href: "/quests", icon: CheckSquare },
  { name: "캐릭터 관리", href: "/characters", icon: Users },
  { name: "가공 시설", href: "/crafting", icon: Hammer },
  { name: "생활 스킬", href: "/skills", icon: Sparkles },
  { name: "AI 어시스턴트", href: "/assistant", icon: Brain },
  { name: "가이드", href: "/guides", icon: Map },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 office-sidebar transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-sm flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">마비노기</h2>
                <p className="text-xs text-gray-500">통합 관리 시스템</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 bg-gray-50">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <p className="text-xs text-gray-400 text-center">v2.0.0 - Office Edition</p>
          </div>
        </div>
      </div>
    </>
  )
}
