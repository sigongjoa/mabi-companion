"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckSquare, Clock, Calendar } from "lucide-react"
import { useCharacter, Character } from "@/contexts/character-context"
import { FavoriteToggle } from "@/components/favorite-toggle"

import questsData from "/public/data/quests.json"

interface Task {
  id: string
  text: string
}

interface TaskCategory {
  [category: string]: Task[]
}

const allDailyQuests: TaskCategory = (questsData as any).daily;
const allWeeklyQuests: TaskCategory = (questsData as any).weekly;

export default function QuestsPage() {
  console.debug("QuestsPage rendered.");
  const { activeCharacter, updateCharacter } = useCharacter();
  const [timeLeft, setTimeLeft] = useState({ daily: "", weekly: "" });

  useEffect(() => {
    console.debug("QuestsPage useEffect: setting up countdown.");
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
      console.debug("Countdown updated - Daily:", formatTime(dailyDiff), "Weekly:", formatTime(weeklyDiff));
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => {
      clearInterval(interval);
      console.debug("Countdown interval cleared.");
    };
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
    console.debug(`toggleTask called - taskId: ${taskId}, type: ${type}`);
    if (!activeCharacter) {
      console.warn("No active character, cannot toggle task.");
      return;
    }

    const currentCompletedTasks = type === "daily" ? activeCharacter.completedDailyTasks : activeCharacter.completedWeeklyTasks;
    const newCompletedTasks = { ...currentCompletedTasks, [taskId]: !currentCompletedTasks[taskId] };

    if (type === "daily") {
      updateCharacter(activeCharacter.id, { completedDailyTasks: newCompletedTasks });
      console.debug(`Daily task ${taskId} toggled. New state: ${newCompletedTasks[taskId]}`);
    } else {
      updateCharacter(activeCharacter.id, { completedWeeklyTasks: newCompletedTasks });
      console.debug(`Weekly task ${taskId} toggled. New state: ${newCompletedTasks[taskId]}`);
    }
  };

  const getProgress = (tasks: TaskCategory, completedTasks: Record<string, boolean>) => {
    console.debug("Entering getProgress.", { tasks, completedTasks });
    const allTasks = Object.values(tasks).flat();
    const completed = allTasks.filter((task) => completedTasks[task.id]).length;
    const total = allTasks.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    console.debug("Exiting getProgress.", { completed, total, percentage });
    return { completed, total, percentage };
  };

  const dailyProgress = activeCharacter ? getProgress(allDailyQuests, activeCharacter.completedDailyTasks) : { completed: 0, total: 0, percentage: 0 };
  const weeklyProgress = activeCharacter ? getProgress(allWeeklyQuests, activeCharacter.completedWeeklyTasks) : { completed: 0, total: 0, percentage: 0 };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="modern-card fade-in">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-purple-100 rounded-2xl flex-shrink-0">
                <CheckSquare className="w-8 h-8 text-purple-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-4xl font-bold text-gray-900">퀘스트 관리</h1>
                <p className="text-lg text-gray-600 mt-1">일일/주간 숙제 체크리스트</p>
                <p className="text-sm text-gray-500 mt-1">캐릭터별 퀘스트 진행 상황 및 초기화 정보</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FavoriteToggle id="quests-header" name="퀘스트 헤더" type="header" />
            </div>
          </div>
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

          {Object.entries(allDailyQuests).map(([category, tasks]) => (
            <Card key={category} className="document-card">
              <CardHeader className="excel-header">
                <CardTitle className="text-gray-900 text-lg border-l-4 border-purple-500 pl-3">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="excel-cell hover:excel-selected p-3 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={activeCharacter?.completedDailyTasks[task.id] || false}
                        onCheckedChange={() => toggleTask(task.id, "daily")}
                        className="mt-0.5"
                      />
                      <span
                        className={`flex-1 text-sm ${activeCharacter?.completedDailyTasks[task.id] ? "line-through text-gray-500" : "text-gray-700"}`}
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

          {Object.entries(allWeeklyQuests).map(([category, tasks]) => (
            <Card key={category} className="document-card">
              <CardHeader className="excel-header">
                <CardTitle className="text-gray-900 text-lg border-l-4 border-blue-500 pl-3">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="excel-cell hover:excel-selected p-3 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={activeCharacter?.completedWeeklyTasks[task.id] || false}
                        onCheckedChange={() => toggleTask(task.id, "weekly")}
                        className="mt-0.5"
                      />
                      <span
                        className={`flex-1 text-sm ${activeCharacter?.completedWeeklyTasks[task.id] ? "line-through text-gray-500" : "text-gray-700"}`}
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
