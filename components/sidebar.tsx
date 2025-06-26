"use client"

import React, { useState, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  Package,
  Sword,
  CheckSquare,
  Users,
  Hammer,
  Sparkles,
  Brain,
  Map,
  Save,
  FileText,
  Settings,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  Calculator,
  Clock,
  Menu,
  X,
  Star,
} from "lucide-react"

const ribbonTabs = [
  {
    id: "home",
    label: "홈",
    groups: [
      {
        title: "탐색",
        items: [
          { icon: Home, label: "대시보드", href: "/", size: "large" },
          { icon: BarChart3, label: "통계", href: "/stats", size: "small" },
          { icon: RefreshCw, label: "새로고침", action: "refresh", size: "small" },
        ],
      },
      {
        title: "관리",
        items: [
          { icon: Package, label: "아이템", href: "/inventory", size: "large" },
          { icon: Users, label: "캐릭터", href: "/characters", size: "large" },
          { icon: CheckSquare, label: "퀘스트", href: "/quests", size: "large" },
        ],
      },
      {
        title: "장비 & 제작",
        items: [
          { icon: Sword, label: "장비", href: "/equipment", size: "large" },
          { icon: Hammer, label: "제작", href: "/crafting", size: "large" },
          { icon: Sparkles, label: "스킬", href: "/skills", size: "large" },
        ],
      },
      {
        title: "도구",
        items: [
          { icon: Calculator, label: "계산기", href: "/calculator", size: "small" },
          { icon: Clock, label: "타이머", href: "/timers", size: "small" },
          { icon: Brain, label: "AI 도움", href: "/assistant", size: "small" },
        ],
      },
    ],
  },
  {
    id: "data",
    label: "데이터",
    groups: [
      {
        title: "파일",
        items: [
          { icon: Save, label: "저장", action: "save", size: "large" },
          { icon: Download, label: "내보내기", action: "export", size: "small" },
          { icon: Upload, label: "가져오기", action: "import", size: "small" },
        ],
      },
    ],
  },
  {
    id: "help",
    label: "도움말",
    groups: [
      {
        title: "가이드",
        items: [
          { icon: Map, label: "가이드", href: "/guides", size: "large" },
          { icon: FileText, label: "문서", href: "/docs", size: "small" },
        ],
      },
      {
        title: "즐겨찾기",
        items: [
          { icon: Star, label: "즐겨찾기", href: "/favorites", size: "large" },
          { icon: Settings, label: "설정", href: "/settings", size: "small" },
        ],
      },
    ],
  },
]

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("home")
  const pathname = usePathname()

  const handleAction = useCallback((action: string) => {
    switch (action) {
      case "refresh":
        window.location.reload()
        break
      case "save":
        console.log("Saving data...")
        break
      case "export":
        console.log("Exporting data...")
        break
      case "import":
        console.log("Importing data...")
        break
    }
  }, [])

  return (
    <>
      {/* Mobile menu button (Removed as it's now in layout.tsx) */}
      {/* Overlay (Removed as it's now in layout.tsx) */}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full transform transition-all duration-300 ease-in-out shadow-sm",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-0 overflow-hidden"
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

          {/* Tab Headers (for wide screens) */}
          <div className="flex flex-col p-4 border-b border-gray-200 overflow-y-auto bg-gray-100">
            {ribbonTabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant="ghost"
                className={cn("justify-start mb-1", activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-700 hover:bg-white hover:text-gray-900")}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Navigation Content (based on activeTab) */}
          <nav className="flex-1 p-4 space-y-4 bg-gray-50 overflow-y-auto">
            {ribbonTabs.map((tab) => (
              <div key={tab.id} className={cn("space-y-2", activeTab !== tab.id && "hidden")}>
                {tab.groups.map((group, groupIndex) => (
                  <div key={groupIndex} className="flex flex-col space-y-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{group.title}</h3>
                    {group.items.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center space-x-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors",
                              pathname === item.href
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm",
                            )}
                            onClick={() => setIsOpen(false)} // Close sidebar on navigation
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Link>
                        ) : (
                          <Button
                            onClick={() => {
                              item.action && handleAction(item.action);
                              setIsOpen(false); // Close sidebar on action
                            }}
                            variant="ghost"
                            className={cn(
                              "flex items-center space-x-3 w-full justify-start px-3 py-2",
                              "text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm"
                            )}
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
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
