"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, User, Bot, Database, Zap } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  context?: any
}

interface DashboardData {
  characters: Array<{
    id: string
    name: string
    level: number
    progress: number
    silverCoins?: number
    demonArtifacts?: number
  }>
  quests: {
    completed: number
    total: number
    percentage: number
  }
  items: {
    craftable: number
    total: number
  }
  combatPower: {
    average: number
    increase: number
  }
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "안녕하세요! 마비노기 모바일 AI 어시스턴트입니다. 현재 대시보드 데이터를 실시간으로 분석하여 최적의 조언을 제공합니다. 무엇을 도와드릴까요?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    characters: [
      { id: "1", name: "기사단장 테오", level: 120, progress: 85, silverCoins: 75, demonArtifacts: 3 },
      { id: "2", name: "마법사 에리나", level: 95, progress: 65, silverCoins: 45, demonArtifacts: 7 },
      { id: "3", name: "음유시인 리안", level: 88, progress: 58, silverCoins: 92, demonArtifacts: 2 },
    ],
    quests: { completed: 8, total: 12, percentage: 67 },
    items: { craftable: 24, total: 127 },
    combatPower: { average: 45230, increase: 2150 },
  })

  // Simulate receiving real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // This would normally come from your app's state management
      setDashboardData((prev) => ({
        ...prev,
        // Simulate small changes
        characters: prev.characters.map((char) => ({
          ...char,
          silverCoins: Math.min(100, (char.silverCoins || 0) + Math.random() > 0.9 ? 1 : 0),
        })),
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const generateContextualResponse = (userInput: string, context: DashboardData): string => {
    const input = userInput.toLowerCase()

    if (input.includes("은동전") || input.includes("silver")) {
      const totalSilver = context.characters.reduce((sum, char) => sum + (char.silverCoins || 0), 0)
      const avgSilver = Math.round(totalSilver / context.characters.length)
      return `현재 전체 캐릭터의 은동전 보유 현황을 분석했습니다:

📊 **은동전 현황**
- 총 보유량: ${totalSilver}개
- 평균 보유량: ${avgSilver}개
- 캐릭터별 현황:
${context.characters.map((char) => `  • ${char.name}: ${char.silverCoins || 0}/100개`).join("\n")}

💡 **추천사항:**
${
  context.characters.filter((char) => (char.silverCoins || 0) < 50).length > 0
    ? "일부 캐릭터의 은동전이 부족합니다. 타이머를 설정하여 효율적으로 관리하세요."
    : "모든 캐릭터가 충분한 은동전을 보유하고 있습니다!"
}`
    }

    if (input.includes("마족공물") || input.includes("demon")) {
      const totalDemons = context.characters.reduce((sum, char) => sum + (char.demonArtifacts || 0), 0)
      return `마족공물 현황을 분석했습니다:

🔥 **마족공물 현황**
- 총 보유량: ${totalDemons}개
- 캐릭터별 현황:
${context.characters.map((char) => `  • ${char.name}: ${char.demonArtifacts || 0}/10개`).join("\n")}

⚡ **활용 팁:**
마족공물은 12시간마다 1개씩 충전됩니다. 고급 던전 입장권으로 활용하여 더 좋은 보상을 획득하세요.`
    }

    if (input.includes("퀘스트") || input.includes("quest")) {
      return `일일 퀘스트 진행 상황을 확인했습니다:

✅ **퀘스트 현황**
- 완료: ${context.quests.completed}/${context.quests.total}개 (${context.quests.percentage}%)
- 남은 퀘스트: ${context.quests.total - context.quests.completed}개

🎯 **추천 우선순위:**
1. 경험치 보상이 높은 메인 퀘스트 우선
2. 재료 수급이 가능한 채집 퀘스트
3. 전투력 향상 아이템 보상 퀘스트

${context.quests.percentage < 70 ? "⚠️ 일일 보상을 놓치지 않도록 남은 퀘스트를 완료하세요!" : "🎉 오늘 목표를 거의 달성했습니다!"}`
    }

    if (input.includes("전투력") || input.includes("combat") || input.includes("power")) {
      return `전투력 분석 결과입니다:

⚔️ **전투력 현황**
- 평균 전투력: ${context.combatPower.average.toLocaleString()}
- 최근 증가량: +${context.combatPower.increase.toLocaleString()}

📈 **캐릭터별 성장률**
${context.characters.map((char) => `  • ${char.name} (Lv.${char.level}): ${char.progress}% 진행`).join("\n")}

🚀 **성장 전략:**
1. 무기 강화를 최우선으로 투자
2. 전설 룬 장착으로 즉시 500+ 상승 가능
3. 보석 소켓 최대 활용
4. 일일/주간 던전으로 꾸준한 재료 파밍`
    }

    if (input.includes("추천") || input.includes("recommend")) {
      const lowProgressChars = context.characters.filter((char) => char.progress < 70)
      const lowSilverChars = context.characters.filter((char) => (char.silverCoins || 0) < 30)

      return `현재 상황을 종합 분석한 맞춤 추천사항입니다:

🎯 **우선 처리 사항**
${lowProgressChars.length > 0 ? `• ${lowProgressChars.map((c) => c.name).join(", ")} 캐릭터 집중 육성 필요` : ""}
${lowSilverChars.length > 0 ? `• ${lowSilverChars.map((c) => c.name).join(", ")} 은동전 충전 타이머 설정` : ""}
${context.quests.percentage < 80 ? `• 일일 퀘스트 ${context.quests.total - context.quests.completed}개 남음` : ""}

📋 **오늘의 할 일**
1. 일일 퀘스트 완료 (현재 ${context.quests.percentage}%)
2. 제작 가능한 ${context.items.craftable}개 아이템 확인
3. 전투력 낮은 캐릭터 우선 육성
4. 재화 타이머 최적화

💡 **효율성 팁:**
가장 성장 가능성이 높은 캐릭터에 집중 투자하여 빠른 성과를 얻으세요!`
    }

    // Default response with current data context
    return `현재 게임 상황을 분석해드렸습니다:

📊 **실시간 현황**
- 캐릭터 ${context.characters.length}명 관리 중
- 일일 퀘스트 ${context.quests.percentage}% 완료
- 제작 가능 아이템 ${context.items.craftable}개
- 평균 전투력 ${context.combatPower.average.toLocaleString()}

더 구체적인 조언이 필요하시면 "은동전", "퀘스트", "전투력", "추천" 등의 키워드로 질문해주세요!`
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI processing with real dashboard data
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateContextualResponse(input, dashboardData),
        timestamp: new Date(),
        context: dashboardData,
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="p-6 h-[calc(100vh-8rem)] flex flex-col bg-gray-50">
      <div className="document-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI 어시스턴트</h1>
              <p className="text-gray-600">실시간 데이터 기반 맞춤형 게임 조언</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="status-complete flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span>실시간 연동</span>
            </Badge>
            <Badge className="status-medium flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>AI 분석 중</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="document-card flex-1 flex flex-col h-full">
            <CardHeader className="excel-header">
              <CardTitle className="text-gray-900">대화형 AI 어시스턴트</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-6">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded p-4 ${
                        message.role === "user" ? "bg-blue-600 text-white" : "document-card excel-cell"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === "assistant" && <Bot className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />}
                        {message.role === "user" && <User className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <div className="text-sm whitespace-pre-line">{message.content}</div>
                          <div className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</div>
                          {message.context && <Badge className="mt-2 status-low">실시간 데이터 기반 응답</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="document-card excel-cell max-w-[80%] p-4">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-blue-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="예: 은동전 현황을 알려주세요 / 전투력 높이는 방법 추천해주세요"
                  className="form-input resize-none"
                  rows={2}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="form-button-primary px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Data Panel */}
        <div className="space-y-4">
          <Card className="document-card">
            <CardHeader className="excel-header">
              <CardTitle className="text-sm">실시간 데이터</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-gray-700">캐릭터 현황</div>
                  <div className="text-gray-600">{dashboardData.characters.length}명 관리 중</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">퀘스트 진행률</div>
                  <div className="text-gray-600">{dashboardData.quests.percentage}% 완료</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">제작 가능</div>
                  <div className="text-gray-600">{dashboardData.items.craftable}개 아이템</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">평균 전투력</div>
                  <div className="text-gray-600">{dashboardData.combatPower.average.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="document-card">
            <CardHeader className="excel-header">
              <CardTitle className="text-sm">빠른 질문</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {["은동전 현황 알려줘", "퀘스트 추천해줘", "전투력 높이는 방법", "오늘 할 일 추천"].map(
                  (question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="w-full text-left p-2 text-xs excel-cell hover:excel-selected rounded"
                    >
                      {question}
                    </button>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
