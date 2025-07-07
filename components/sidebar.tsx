"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useCharacter } from "@/contexts/character-context"
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/lib/supabase';
import { useNotification } from "@/contexts/notification-context";
import {
  Home,
  Package,
  Users,
  ScrollText,
  LogIn,
  LogOut,
  UserCircle,
  Gem,
  Hammer,
  Swords,
  Calendar,
  Sparkles,
  Clock,
  MessageSquare,
  Brain,
  Trophy,
  Shirt,
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const pathname = usePathname()
  const { activeCharacter } = useCharacter()
  const { user, loading } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotification();

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  const navItems = [
    { href: "/", icon: Home, label: "홈" },
    { href: "/characters", icon: Users, label: "캐릭터 관리" },
    { href: "/inventory", icon: Package, label: "인벤토리" },
    { href: "/equipment", icon: Shirt, label: "장비" },
    { href: "/gems", icon: Gem, label: "젬" },
    { href: "/crafting", icon: Hammer, label: "제작" },
    { href: "/quests", icon: ScrollText, label: "퀘스트" },
    { href: "/raid-board", icon: Swords, label: "레이드 매칭" },
    { href: "/schedule", icon: Calendar, label: "스케줄" },
    { href: "/skills", icon: Sparkles, label: "생활 스킬" },
    { href: "/timers", icon: Clock, label: "타이머" },
    { href: "/qa-board", icon: MessageSquare, label: "Q&A 게시판" },
    { href: "/assistant", icon: Brain, label: "AI 어시스턴트" },
    { href: "/leaderboard", icon: Trophy, label: "리더보드" },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full transform transition-all duration-300 ease-in-out bg-white border-r border-r-gray-200 shadow-md",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-0 overflow-hidden",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-b-gray-200 bg-white">
            <h1 className="text-gray-900 text-base font-medium leading-normal">Mabinogi Mobile</h1>
          </div>

          <div className="flex flex-col gap-1 py-2 flex-grow">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg mx-2 transition-colors duration-200",
                  pathname === item.href
                    ? "bg-violet-600 text-white font-semibold shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => setIsOpen(false)} // Close sidebar on navigation
              >
                <item.icon className="w-5 h-5" />
                <p className="text-base leading-normal">{item.label}</p>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-t-gray-200 bg-gray-50 mt-auto">
            {loading ? (
              <div className="text-center text-sm text-gray-500">로딩중...</div>
            ) : user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Link href={`/profile/${user.id}`} className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                    <UserCircle className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium truncate hover:underline">{user.user_metadata?.user_name || user.email}</span>
                  </Link>
                </div>
                <Button onClick={handleLogout} variant="ghost" className="w-full justify-center text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                  <LogOut className="w-4 h-4 mr-2" /> 로그아웃
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogin} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-md">
                <LogIn className="w-4 h-4 mr-2" /> Google로 로그인
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
