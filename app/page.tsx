"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Users,
  CheckSquare,
  TrendingUp,
  Clock,
  Star,
  Activity,
  BarChart3,
  Calendar,
  Target,
  Zap,
  Package,
  FileSpreadsheet,
  User,
} from "lucide-react"
import { useCharacter } from "@/contexts/character-context"
import { CharacterSelector } from "@/components/character-selector"
import { CurrencyTimer } from "@/components/currency-timer"
import { FavoriteToggle } from "@/components/favorite-toggle"
import { Input } from "@/components/ui/input"

const quickStats = [
  {
    title: "총 캐릭터",
    value: "4명",
    change: "+1",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "완료된 일일 퀘스트",
    value: "8/12",
    change: "67%",
    icon: CheckSquare,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "제작 가능 아이템",
    value: "24개",
    change: "+3",
    icon: Package,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "평균 전투력",
    value: "45,230",
    change: "+2,150",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
]

const recentActivities = [
  { action: "캐릭터 '쌀숭이' 레벨업", time: "1시간 전", type: "level" },
  { action: "캐릭터 '기사단장 테오' 레벨업", time: "2시간 전", type: "level" },
  { action: "일일 퀘스트 8개 완료", time: "4시간 전", type: "quest" },
  { action: "최고급 가죽 5개 제작 완료", time: "6시간 전", type: "craft" },
  { action: "석궁사수 스킬 강화", time: "1일 전", type: "skill" },
  { action: "주간 레이드 클리어", time: "2일 전", type: "raid" },
]

const upcomingTasks = [
  { task: "은동전 충전 완료", time: "1시간 30분", priority: "high" },
  { task: "일일 초기화", time: "4시간 15분", priority: "medium" },
  { task: "주간 초기화", time: "2일 8시간", priority: "low" },
  { task: "마족공물 충전 완료", time: "8시간 45분", priority: "medium" },
]

function StatCard({ stat, index }: { stat: (typeof quickStats)[0]; index: number }) {
  return (
    <div className="modern-card scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-green-600 font-medium mt-1">{stat.change}</p>
          </div>
          <div className={`p-3 rounded-xl ${stat.bgColor}`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <FavoriteToggle id={`stat-${index}`} name={stat.title} type="stat" />
        </div>
      </div>
    </div>
  )
}

function CurrencySection() {
  const { characters } = useCharacter()
  const handleCurrencyDataChange = (data: any) => {
    // Currency data updated is not critical for debug, but can be added if needed for specific debugging.
  }

  return (
    <Card className="modern-card">
      <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>실시간 재화 타이머</span>
          </CardTitle>
          <FavoriteToggle id="currency-timers" name="재화 타이머" type="timer" />
        </div>
        <p className="text-gray-600 mt-2">캐릭터별 은동전 및 마족공물 충전 상황</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="section-spacing">
          {characters.map((character) => (
            <div key={character.id} className="card-spacing">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {character.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{character.name}</h3>
                  <p className="text-sm text-gray-500">Lv.{character.level}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Suspense fallback={<div className="loading-skeleton h-32 rounded-lg"></div>}>
                  <CurrencyTimer
                    characterId={character.id}
                    characterName={character.name}
                    type="silver"
                    onDataChange={handleCurrencyDataChange}
                  />
                </Suspense>
                <Suspense fallback={<div className="loading-skeleton h-32 rounded-lg"></div>}>
                  <CurrencyTimer
                    characterId={character.id}
                    characterName={character.name}
                    type="demon"
                    onDataChange={handleCurrencyDataChange}
                  />
                </Suspense>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { characters, activeCharacter } = useCharacter()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredQuickStats = quickStats.filter((stat) => {
    return stat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           stat.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
           stat.change.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredRecentActivities = recentActivities.filter((activity) => {
    return activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
           activity.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
           activity.type.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredUpcomingTasks = upcomingTasks.filter((task) => {
    return task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
           task.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
           task.priority.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-6 space-y-6">
          <div className="loading-skeleton h-32 rounded-xl"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="loading-skeleton h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="content-padding section-spacing">
        {/* Enhanced Header */}
        <div className="modern-card fade-in">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-4xl font-bold text-gray-900">마비노기 모바일</h1>
                  <p className="text-lg text-gray-600 mt-1">통합 관리 시스템</p>
                  <p className="text-sm text-gray-500 mt-1">실시간 캐릭터 및 재화 관리 대시보드</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FavoriteToggle id="dashboard-header" name="대시보드 헤더" type="header" />
                <Input
                  type="text"
                  placeholder="대시보드 검색..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="max-w-xs"
                />
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>마지막 업데이트: 방금 전</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Character Selection and Active Character Display */}
        <div className="modern-card fade-in slide-up animation-delay-100">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">캐릭터 선택</h2>
              </div>
              <Button variant="outline" size="sm">
                펼치기
              </Button>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Switch id="view-single-character" />
                  <Label htmlFor="view-single-character">단일 캐릭터 보기</Label>
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              <CharacterSelector />
            </div>
            {activeCharacter && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg flex items-center space-x-4">
                <User className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">현재 활성 캐릭터</h3>
                  <p className="text-blue-700">
                    {activeCharacter.name} (Lv.{activeCharacter.level})
                  </p>
                  <p className="text-sm text-blue-600">
                    전투력: {activeCharacter.combatPower.toLocaleString()} • 일일 퀘스트:
                    {activeCharacter.completedDailyTasks}/10
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 section-spacing">
          {filteredQuickStats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* Real-time Currency Timers */}
        <CurrencySection />

        {/* Recent Activities and Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 section-spacing">
          <Card className="modern-card">
            <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span>최근 활동</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredRecentActivities.length > 0 ? (
                  filteredRecentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-gray-700">
                      <span className="font-medium">{activity.action}</span>
                      <span className="text-gray-500">{activity.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">최근 활동이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl">
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-red-600" />
                <span>예정된 작업</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredUpcomingTasks.length > 0 ? (
                  filteredUpcomingTasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-gray-700">
                      <span className="font-medium">{task.task}</span>
                      <span
                        className={`font-mono ${
                          task.priority === "high"
                            ? "text-red-600"
                            : task.priority === "medium"
                              ? "text-orange-600"
                              : "text-gray-600"
                        }`}
                      >
                        {task.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">예정된 작업이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
