"use client"

import { useCharacter } from "@/contexts/character-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CurrencyTimer } from "@/components/currency-timer"
import { CharacterSelector } from "@/components/character-selector"
import { FavoriteToggle } from "@/components/favorite-toggle"
import {
  Package,
  CheckSquare,
  Users,
  Hammer,
  Brain,
  TrendingUp,
  Clock,
  Star,
  Target,
  Calendar,
  Activity,
  Zap,
  FileSpreadsheet,
} from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

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
    icon: Hammer,
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
    <div className="card gpu-accelerated">
      <div className="card-content">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-green-600 font-medium">{stat.change}</p>
          </div>
          <div className={`p-3 rounded-lg ${stat.bgColor}`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <FavoriteToggle id={`stat-${index}`} name={stat.title} type="stat" />
        </div>
      </div>
    </div>
  )
}

function CurrencySection() {
  const { characters } = useCharacter()
  const handleCurrencyDataChange = (data: any) => {
    console.log("Currency data updated:", data)
  }

  return (
    <Card className="card">
      <CardHeader className="card-header">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>실시간 재화 타이머</span>
          </CardTitle>
          <FavoriteToggle id="currency-timers" name="재화 타이머" type="timer" />
        </div>
        <CardDescription>캐릭터별 은동전 및 마족공물 충전 상황</CardDescription>
      </CardHeader>
      <CardContent className="card-content">
        <div className="section-spacing">
          {characters.map((character) => (
            <div key={character.id} className="card-spacing">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {character.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {character.name} (Lv.{character.level})
                </h3>
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
  const { characters } = useCharacter()

  return (
    <div className="min-h-screen" style={{ paddingTop: "120px" }}>
      <div className="content-padding section-spacing">
        {/* Header */}
        <div className="card">
          <div className="card-content">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <FileSpreadsheet className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900">마비노기 모바일 - 통합 관리 시스템</h1>
                  <p className="text-sm md:text-base text-gray-600 mt-1">실시간 캐릭터 및 재화 관리 대시보드</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FavoriteToggle id="dashboard-header" name="대시보드 헤더" type="header" />
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>마지막 업데이트: 방금 전</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Character Selector */}
        <CharacterSelector />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {quickStats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Currency Timers */}
          <div className="lg:col-span-2 section-spacing">
            <Suspense fallback={<div className="loading-skeleton h-96 rounded-lg"></div>}>
              <CurrencySection />
            </Suspense>

            {/* Character Progress Table */}
            <Card className="card">
              <CardHeader className="card-header">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>캐릭터 진행 상황</span>
                  </CardTitle>
                  <FavoriteToggle id="character-progress" name="캐릭터 진행 상황" type="table" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>캐릭터명</th>
                        <th>레벨</th>
                        <th>진행률</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {characters.map((character) => {
                        const progress = Math.round((character.level / 150) * 100) // Calculate progress based on level
                        return (
                          <tr key={character.id}>
                            <td className="font-medium">{character.name}</td>
                            <td>Lv.{character.level}</td>
                            <td>
                              <div className="flex items-center space-x-2">
                                <div className="progress-bar flex-1">
                                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-xs whitespace-nowrap">{progress}%</span>
                              </div>
                            </td>
                            <td>
                              <Badge
                                className={
                                  progress >= 80 ? "status-complete" : progress >= 60 ? "status-medium" : "status-low"
                                }
                              >
                                {progress >= 80 ? "우수" : progress >= 60 ? "보통" : "개선필요"}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="section-spacing">
            {/* Recent Activities */}
            <Card className="card">
              <CardHeader className="card-header">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>최근 활동</span>
                  </CardTitle>
                  <FavoriteToggle id="recent-activities" name="최근 활동" type="activity" />
                </div>
              </CardHeader>
              <CardContent className="card-content">
                <div className="card-spacing">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 break-words">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="card">
              <CardHeader className="card-header">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>예정된 작업</span>
                  </CardTitle>
                  <FavoriteToggle id="upcoming-tasks" name="예정된 작업" type="task" />
                </div>
              </CardHeader>
              <CardContent className="card-content">
                <div className="card-spacing">
                  {upcomingTasks.map((task, index) => (
                    <div key={index} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 break-words">{task.task}</p>
                          <p className="text-xs text-gray-500">{task.time}</p>
                        </div>
                        <Badge
                          className={
                            task.priority === "high"
                              ? "status-high"
                              : task.priority === "medium"
                                ? "status-medium"
                                : "status-low"
                          }
                        >
                          {task.priority === "high" ? "높음" : task.priority === "medium" ? "보통" : "낮음"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card">
              <CardHeader className="card-header">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>빠른 작업</span>
                  </CardTitle>
                  <FavoriteToggle id="quick-actions" name="빠른 작업" type="action" />
                </div>
              </CardHeader>
              <CardContent className="card-content">
                <div className="card-spacing">
                  <Button className="w-full justify-start form-button-primary" asChild>
                    <Link href="/quests">
                      <CheckSquare className="w-4 h-4 mr-2" />
                      일일 퀘스트 확인
                    </Link>
                  </Button>
                  <Button className="w-full justify-start form-button-secondary" asChild>
                    <Link href="/inventory">
                      <Package className="w-4 h-4 mr-2" />
                      아이템 제작
                    </Link>
                  </Button>
                  <Button className="w-full justify-start form-button-secondary" asChild>
                    <Link href="/assistant">
                      <Brain className="w-4 h-4 mr-2" />
                      AI 어시스턴트
                    </Link>
                  </Button>
                  <Button className="w-full justify-start form-button-secondary" asChild>
                    <Link href="/favorites">
                      <Star className="w-4 h-4 mr-2" />
                      즐겨찾기 관리
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Today's Summary Table */}
        <Card className="card">
          <CardHeader className="card-header">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>오늘의 요약</span>
              </CardTitle>
              <FavoriteToggle id="daily-summary" name="오늘의 요약" type="summary" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>항목</th>
                    <th>현재 상태</th>
                    <th>목표</th>
                    <th>달성률</th>
                    <th>평가</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium">일일 퀘스트</td>
                    <td>8개 완료</td>
                    <td>12개</td>
                    <td>67%</td>
                    <td>
                      <Badge className="status-medium">진행중</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium">제작 가능 아이템</td>
                    <td>24개</td>
                    <td>20개</td>
                    <td>120%</td>
                    <td>
                      <Badge className="status-complete">목표 달성</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium">전투력 증가</td>
                    <td>+2,150</td>
                    <td>+2,000</td>
                    <td>108%</td>
                    <td>
                      <Badge className="status-complete">목표 달성</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
