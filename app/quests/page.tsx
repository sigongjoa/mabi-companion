"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckSquare, Clock, Calendar } from "lucide-react"

interface Task {
  id: string
  text: string
  completed: boolean
}

interface TaskCategory {
  [category: string]: Task[]
}

const dailyTasks: TaskCategory = {
  "캐시샵 관련": [
    { id: "d1", text: "추천픽 무료 상품 1개 구입", completed: false },
    { id: "d2", text: "아이템샵(데카)에서 일일 은동전 상자 1개 구입", completed: false },
    { id: "d3", text: "아이템샵(골드)에서 조각난 보석 보물상자 10개 구입", completed: false },
  ],
  "던전/사냥터": [
    { id: "d4", text: "검은 구멍 3회 돌기 (일반/심층 선택)", completed: false },
    { id: "d5", text: "소환의 결계 2~4회 참여 (최대 상자 4개 획득)", completed: false },
    { id: "d6", text: "망령의 탑 5회 클리어", completed: false },
    { id: "d7", text: "요일 던전 1회 클리어 (요일별 보상 상이)", completed: false },
  ],
  "미션/기타": [
    { id: "d8", text: "일일 미션 수행 및 보상 수령", completed: false },
    { id: "d9", text: "생활 콘텐츠: 요리, 채집 등 재료 수급", completed: false },
    { id: "d10", text: "출석 체크", completed: false },
  ],
}

const weeklyTasks: TaskCategory = {
  "필드/레이드/어비스": [
    { id: "w1", text: "필드보스: 페리, 크라브바흐, 크라마 처치", completed: false },
    { id: "w2", text: "어비스: 가라앉은 유적, 무너진 제단, 파멸의 전당 클리어", completed: false },
    { id: "w3", text: "레이드: 먼 바다의 회색 미로 클리어", completed: false },
  ],
  "미션/교환": [
    { id: "w4", text: "마물 퇴치 증표 교환", completed: false },
    { id: "w5", text: "모험가 길드 정기 의뢰 완료", completed: false },
    { id: "w6", text: "주간 미션 수행 및 보상 수령", completed: false },
  ],
}

export default function QuestsPage() {
  const [daily, setDaily] = useState(dailyTasks)
  const [weekly, setWeekly] = useState(weeklyTasks)
  const [timeLeft, setTimeLeft] = useState({ daily: "", weekly: "" })

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()

      // Daily reset at 6 AM
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      tomorrow.setHours(6, 0, 0, 0)
      if (now.getHours() < 6) {
        tomorrow.setDate(now.getDate())
      }

      // Weekly reset on Monday 6 AM
      const nextMonday = new Date(now)
      const daysUntilMonday = (1 + 7 - now.getDay()) % 7
      nextMonday.setDate(now.getDate() + daysUntilMonday)
      nextMonday.setHours(6, 0, 0, 0)

      const dailyDiff = tomorrow.getTime() - now.getTime()
      const weeklyDiff = nextMonday.getTime() - now.getTime()

      setTimeLeft({
        daily: formatTime(dailyDiff),
        weekly: formatTime(weeklyDiff),
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    const h = hours % 24
    const m = minutes % 60
    const s = seconds % 60

    if (days > 0) {
      return `${days}일 ${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    }
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const toggleTask = (taskId: string, type: "daily" | "weekly") => {
    const setter = type === "daily" ? setDaily : setWeekly
    setter((prev) => {
      const newTasks = { ...prev }
      Object.keys(newTasks).forEach((category) => {
        newTasks[category] = newTasks[category].map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        )
      })
      return newTasks
    })
  }

  const getProgress = (tasks: TaskCategory) => {
    const allTasks = Object.values(tasks).flat()
    const completed = allTasks.filter((task) => task.completed).length
    return { completed, total: allTasks.length, percentage: (completed / allTasks.length) * 100 }
  }

  const dailyProgress = getProgress(daily)
  const weeklyProgress = getProgress(weekly)

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="document-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">퀘스트 관리</h1>
            <p className="text-gray-600">일일/주간 숙제 체크리스트</p>
          </div>
          <CheckSquare className="w-8 h-8 text-purple-600" />
        </div>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <div className="document-card p-4">
          <TabsList className="bg-gray-100 border border-gray-200">
            <TabsTrigger value="daily" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              일일 숙제
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              주간 숙제
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="daily" className="space-y-6">
          <Card className="document-card">
            <CardHeader className="excel-header">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>일일 초기화까지</span>
                </CardTitle>
                <span className="text-green-600 font-mono text-lg">{timeLeft.daily}</span>
              </div>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${dailyProgress.percentage}%` }} />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {dailyProgress.completed}/{dailyProgress.total} 완료 ({dailyProgress.percentage.toFixed(0)}%)
              </p>
            </CardHeader>
          </Card>

          {Object.entries(daily).map(([category, tasks]) => (
            <Card key={category} className="document-card">
              <CardHeader className="excel-header">
                <CardTitle className="text-gray-900 text-lg border-l-4 border-purple-500 pl-3">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="excel-cell hover:excel-selected p-3 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id, "daily")}
                        className="mt-0.5"
                      />
                      <span
                        className={`flex-1 text-sm ${task.completed ? "line-through text-gray-500" : "text-gray-700"}`}
                      >
                        {task.text}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <Card className="document-card">
            <CardHeader className="excel-header">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>주간 초기화까지</span>
                </CardTitle>
                <span className="text-blue-600 font-mono text-lg">{timeLeft.weekly}</span>
              </div>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${weeklyProgress.percentage}%` }} />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {weeklyProgress.completed}/{weeklyProgress.total} 완료 ({weeklyProgress.percentage.toFixed(0)}%)
              </p>
            </CardHeader>
          </Card>

          {Object.entries(weekly).map(([category, tasks]) => (
            <Card key={category} className="document-card">
              <CardHeader className="excel-header">
                <CardTitle className="text-gray-900 text-lg border-l-4 border-blue-500 pl-3">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="excel-cell hover:excel-selected p-3 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id, "weekly")}
                        className="mt-0.5"
                      />
                      <span
                        className={`flex-1 text-sm ${task.completed ? "line-through text-gray-500" : "text-gray-700"}`}
                      >
                        {task.text}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
