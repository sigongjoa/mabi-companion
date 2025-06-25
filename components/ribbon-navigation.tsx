"use client"

import React, { useState, memo, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
import { Button } from "@/components/ui/button"

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
          { icon: Package, label: "재료", href: "/materials", size: "large" },
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

export const RibbonNavigation = memo(function RibbonNavigation() {
  const [activeTab, setActiveTab] = useState("home")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev: boolean) => !prev)
  }, [])

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-2 right-2 z-50 md:hidden bg-white shadow-md"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Ribbon */}
      <div
        className={cn(
          "ribbon transition-transform duration-300 ease-in-out",
          "md:relative md:translate-y-0",
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full md:translate-y-0",
          "fixed top-0 left-0 right-0 z-40",
        )}
      >
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {ribbonTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn("ribbon-tab whitespace-nowrap flex-shrink-0", activeTab === tab.id && "active")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-2 overflow-x-auto">
          {ribbonTabs.map((tab) => (
            <div key={tab.id} className={cn("flex space-x-1 items-center min-w-max", activeTab !== tab.id && "hidden")}>
              {tab.groups.map((group, groupIndex) => (
                <div key={groupIndex} className="ribbon-group flex-shrink-0">
                  <div className="flex space-x-1 mb-1">
                    {group.items.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        {item.href ? (
                          <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                            <div
                              className={cn(
                                item.size === "large" ? "ribbon-button-large" : "ribbon-button",
                                pathname === item.href && "bg-blue-100 text-blue-600",
                                "transition-colors duration-200",
                              )}
                            >
                              <item.icon className={cn("mb-1", item.size === "large" ? "w-6 h-6" : "w-4 h-4")} />
                              <span className="text-xs">{item.label}</span>
                            </div>
                          </Link>
                        ) : (
                          <div
                            className={cn(
                              item.size === "large" ? "ribbon-button-large" : "ribbon-button",
                              "transition-colors duration-200",
                            )}
                            onClick={() => item.action && handleAction(item.action)}
                          >
                            <item.icon className={cn("mb-1", item.size === "large" ? "w-6 h-6" : "w-4 h-4")} />
                            <span className="text-xs">{item.label}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 text-center px-1">{group.title}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
})
