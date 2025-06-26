"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Brain,
  Send,
  User,
  Bot,
  Database,
  Zap,
  ImageIcon,
  XCircle,
  BarChart3,
  Users,
  CheckSquare,
  Package,
  Sword,
  Clock,
} from "lucide-react"
import { FavoriteToggle } from "@/components/favorite-toggle"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  context?: any
}

interface CharacterData {
  id: string
  name: string
  level: number
  progress: number
  silverCoins?: number
  demonArtifacts?: number
}

interface DashboardData {
  characters: Array<CharacterData>
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

// Mock data for crafting facilities and items
const allCraftingFacilitiesData = [
  { id: "facility1", name: "대장간" },
  { id: "facility2", name: "연금술 연구소" },
  { id: "facility3", name: "마법 부여대" },
]

const allItems = {
  1: { id: 1, name: "낡은 검" },
  2: { id: 2, name: "가죽 갑옷" },
  3: { id: 3, name: "나무 지팡이" },
  4: { id: 4, name: "체력 포션" },
  5: { id: 5, name: "마나 포션" },
  6: { id: 6, name: "강철 검" },
  7: { id: 7, name: "강철 갑옷" },
  8: { id: 8, name: "수정 지팡이" },
  9: { id: 9, name: "고급 체력 포션" },
  10: { id: 10, name: "고급 마나 포션" },
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
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
  const [activeCharacter, setActiveCharacter] = useState({
    id: "1",
    name: "기사단장 테오",
    level: 120,
    progress: 85,
    silverCoins: 75,
    demonArtifacts: 3,
    inventory: {
      1: 5, // 낡은 검
      2: 3, // 가죽 갑옷
      6: 2, // 강철 검
      9: 1, // 고급 체력 포션
    },
    craftingQueues: {
      facility1: [
        { itemName: "강철 검", timeLeft: 120, isProcessing: true },
        { itemName: "강철 갑옷", timeLeft: 0, isProcessing: true },
        { itemName: "수정 지팡이", timeLeft: 240, isProcessing: false },
        { itemName: "고급 체력 포션", timeLeft: 300, isProcessing: false },
      ],
      facility2: [
        { itemName: "고급 마나 포션", timeLeft: 60, isProcessing: true },
        { itemName: "체력 포션", timeLeft: 180, isProcessing: false },
        { itemName: "마나 포션", timeLeft: 0, isProcessing: true },
        { itemName: "강철 검", timeLeft: 120, isProcessing: false },
      ],
      facility3: [],
    },
  })
  const [searchQuery, setSearchQuery] = useState("")

  // Simulate receiving real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // This would normally come from your app's state management
      setDashboardData((prev: DashboardData) => ({
        ...prev,
        // Simulate small changes
        characters: prev.characters.map((char: CharacterData) => ({
          ...char,
          silverCoins: Math.min(100, (char.silverCoins || 0) + (Math.random() > 0.9 ? 1 : 0)),
        })),
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredMessages = messages.filter((message) =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImageBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedImageBase64(null)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items
    if (items) {
      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile()
          if (blob) {
            const reader = new FileReader()
            reader.onloadend = () => {
              setSelectedImageBase64(reader.result as string)
            }
            reader.readAsDataURL(blob)
            event.preventDefault() // Prevent default paste behavior (e.g., pasting text if image is also text)
            return
          }
        }
      }
    }
  }

  const handleClearImage = () => {
    setSelectedImageBase64(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Clear file input value
    }
  }

  const generateContextualResponse = (userInput: string, context: DashboardData): string => {
    const input = userInput.toLowerCase()

    // Enhanced crafting facility responses
    if (input.includes("가공") || input.includes("제작") || input.includes("crafting")) {
      const facilities = allCraftingFacilitiesData
      const activeFacilities = facilities.filter((f) =>
        activeCharacter?.craftingQueues[f.id]?.some((q) => q.isProcessing),
      )

      return `🔧 **가공 시설 현황 분석**\n\n📊 **전체 시설 현황:**\n${facilities
        .map((f) => {
          const queues = activeCharacter?.craftingQueues[f.id] || []
          const activeQueues = queues.filter((q) => q.isProcessing).length
          const completedQueues = queues.filter((q) => q.isProcessing && q.timeLeft === 0).length
          return `• ${f.name}: ${activeQueues}/4 가동 중${completedQueues > 0 ? ` (${completedQueues}개 완료)` : ""}`
        })
        .join("\n")}\n\n${
        activeFacilities.length > 0
          ? `⚡ **진행 중인 작업:**\n${activeFacilities
              .map((f) => {
                const activeQueues =
                  activeCharacter?.craftingQueues[f.id]?.filter((q) => q.isProcessing && q.timeLeft > 0) || []
                return activeQueues
                  .map((q) => `• ${f.name}: ${q.itemName} (${Math.floor(q.timeLeft / 60)}분 ${q.timeLeft % 60}초 남음)`)
                  .join("\n")
              })
              .join("\n")}\n\n`
          : ""
      }💡 **최적화 제안:**\n- 완료된 아이템을 즉시 수령하여 새로운 제작 시작\n- 재료가 충분한 고급 아이템 우선 제작\n- 시간이 긴 아이템은 잠들기 전에 시작`
    }

    // Enhanced inventory responses
    if (input.includes("인벤토리") || input.includes("아이템") || input.includes("재료")) {
      const inventory = activeCharacter?.inventory || {}
      const totalItems = Object.values(inventory).reduce((sum, qty) => sum + qty, 0)
      const uniqueItems = Object.values(inventory).filter((qty) => qty > 0).length

      return `🎒 **인벤토리 분석**\n\n📦 **보유 현황:**\n- 총 아이템 수: ${totalItems.toLocaleString()}개\n- 종류: ${uniqueItems}가지\n\n🔝 **주요 보유 아이템:**\n${Object.entries(
        inventory,
      )
        .filter(([_, qty]) => qty > 0)
        .sort(([_, a], [__, b]) => b - a)
        .slice(0, 10)
        .map(([itemId, qty]) => {
          const item = Object.values(allItems).find((i: any) => i.id === Number(itemId))
          return `• ${item?.name || `아이템 ${itemId}`}: ${qty}개`
        })
        .join(
          "\n",
        )}\n\n💡 **활용 제안:**\n- 제작 가능한 상위 아이템 확인\n- 부족한 재료는 채집이나 구매로 보충\n- 과다 보유 아이템은 판매 고려`
    }

    // Keep existing responses but enhance them
    if (input.includes("은동전") || input.includes("silver")) {
      const totalSilver = context.characters.reduce((sum, char) => sum + (char.silverCoins || 0), 0)
      const avgSilver = Math.round(totalSilver / context.characters.length)
      return `💰 **은동전 통합 분석**\n\n📊 **전체 현황:**\n- 총 보유량: ${totalSilver}개\n- 평균 보유량: ${avgSilver}개\n- 캐릭터별 현황:\n${context.characters.map((char) => `  • ${char.name}: ${char.silverCoins || 0}/100개 ${(char.silverCoins || 0) >= 80 ? "✅" : (char.silverCoins || 0) >= 50 ? "⚠️" : "❌"}`).join("\n")}\n\n⏰ **타이머 최적화:**\n${
        context.characters.filter((char) => (char.silverCoins || 0) < 50).length > 0
          ? "• 부족한 캐릭터들의 은동전 충전 타이머 설정 필요\n• 12시간마다 자동 충전되므로 놓치지 않도록 알림 설정"
          : "• 모든 캐릭터가 충분한 은동전 보유 중 ✨\n• 현재 상태 유지하며 정기적 확인"
      }\n\n🎯 **효율적 사용법:**\n- 고급 던전 입장권 우선 사용\n- 희귀 아이템 구매 기회 놓치지 말기\n- 이벤트 기간 중 특별 상품 확인`
    }

    if (input.includes("마족공물") || input.includes("demon")) {
      const totalDemons = context.characters.reduce((sum, char) => sum + (char.demonArtifacts || 0), 0)
      return `마족공물 현황을 분석했습니다:\n\n🔥 **마족공물 현황**\n- 총 보유량: ${totalDemons}개\n- 캐릭터별 현황:\n${context.characters.map((char) => `  • ${char.name}: ${char.demonArtifacts || 0}/10개`).join("\n")}\n\n⚡ **활용 팁:**\n마족공물은 12시간마다 1개씩 충전됩니다. 고급 던전 입장권으로 활용하여 더 좋은 보상을 획득하세요.`
    }

    if (input.includes("퀘스트") || input.includes("quest")) {
      return `일일 퀘스트 진행 상황을 확인했습니다:\n\n✅ **퀘스트 현황**\n- 완료: ${context.quests.completed}/${context.quests.total}개 (${context.quests.percentage}%)\n- 남은 퀘스트: ${context.quests.total - context.quests.completed}개\n\n🎯 **추천 우선순위:**\n1. 경험치 보상이 높은 메인 퀘스트 우선\n2. 재료 수급이 가능한 채집 퀘스트\n3. 전투력 향상 아이템 보상 퀘스트\n\n${context.quests.percentage < 70 ? "⚠️ 일일 보상을 놓치지 않도록 남은 퀘스트를 완료하세요!" : "🎉 오늘 목표를 거의 달성했습니다!"}`
    }

    if (input.includes("전투력") || input.includes("combat") || input.includes("power")) {
      return `전투력 분석 결과입니다:\n\n⚔️ **전투력 현황**\n- 평균 전투력: ${context.combatPower.average.toLocaleString()}\n- 최근 증가량: +${context.combatPower.increase.toLocaleString()}\n\n📈 **캐릭터별 성장률**\n${context.characters.map((char: CharacterData) => `  • ${char.name} (Lv.${char.level}): ${char.progress}% 진행`).join("\n")}\n\n🚀 **성장 전략:**\n1. 무기 강화를 최우선으로 투자\n2. 전설 룬 장착으로 즉시 500+ 상승 가능\n3. 보석 소켓 최대 활용\n4. 일일/주간 던전으로 꾸준한 재료 파밍`
    }

    if (input.includes("추천") || input.includes("recommend")) {
      const lowProgressChars = context.characters.filter((char: CharacterData) => char.progress < 70)
      const lowSilverChars = context.characters.filter((char: CharacterData) => (char.silverCoins || 0) < 30)

      return `현재 상황을 종합 분석한 맞춤 추천사항입니다:\n\n🎯 **우선 처리 사항**\n${lowProgressChars.length > 0 ? `• ${lowProgressChars.map((c: CharacterData) => c.name).join(", ")} 캐릭터 집중 육성 필요` : ""}\n${lowSilverChars.length > 0 ? `• ${lowSilverChars.map((c: CharacterData) => c.name).join(", ")} 은동전 충전 타이머 설정` : ""}\n${context.quests.percentage < 80 ? `• 일일 퀘스트 ${context.quests.total - context.quests.completed}개 남음` : ""}\n\n📋 **오늘의 할 일**\n1. 일일 퀘스트 완료 (현재 ${context.quests.percentage}%)\n2. 제작 가능한 ${context.items.craftable}개 아이템 확인\n3. 전투력 낮은 캐릭터 우성\n4. 재화 타이머 최적화\n\n💡 **효율성 팁:**\n가장 성장 가능성이 높은 캐릭터에 집중 투자하여 빠른 성과를 얻으세요!`
    }

    // Add more comprehensive responses for other queries...
    return `🤖 **종합 게임 상황 분석**\n\n📊 **현재 상태:**\n- 관리 캐릭터: ${context.characters.length}명\n- 일일 퀘스트: ${context.quests.percentage}% 완료\n- 제작 가능: ${context.items.craftable}개 아이템\n- 평균 전투력: ${context.combatPower.average.toLocaleString()}\n\n🎮 **추천 활동:**\n1. 미완료 퀘스트 우선 처리\n2. 제작 시설 가동률 최적화\n3. 캐릭터별 성장 우선순위 설정\n\n💬 **더 자세한 도움이 필요하시면:**\n"가공", "인벤토리", "퀘스트", "전투력", "추천" 등의 키워드로 구체적으로 질문해주세요!`
  }

  const sendMessage = async () => {
    if (!input.trim() && !selectedImageBase64) {
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev: Message[]) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setSelectedImageBase64(null) // Clear selected image after sending
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Clear file input value as well
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          image: selectedImageBase64, // 이미지 데이터 추가
          context: messages
            .filter((msg: Message) => msg.role !== "system")
            .map((msg: Message) => ({ role: msg.role, content: msg.content })),
        }),
      })

      const result = await response.json()
      if (response.ok) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.message,
          timestamp: new Date(),
        }
        setMessages((prev: Message[]) => [...prev, aiMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `오류 발생: ${result.error?.message || JSON.stringify(result.error)}. 다시 시도해주세요.`, // 오류 메시지를 표시
          timestamp: new Date(),
        }
        setMessages((prev: Message[]) => [...prev, errorMessage])
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `네트워크 오류가 발생했습니다: ${err.message}. 잠시 후 다시 시도해주세요.`, // 네트워크 오류 메시지
        timestamp: new Date(),
      }
      setMessages((prev: Message[]) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
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
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-4xl font-bold text-gray-900">AI 어시스턴트</h1>
                  <p className="text-lg text-gray-600 mt-1">실시간 데이터 기반 조언</p>
                  <p className="text-sm text-gray-500 mt-1">모험에 필요한 모든 정보를 여기서</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FavoriteToggle id="assistant-header" name="AI 어시스턴트 헤더" type="header" />
                <Input
                  type="text"
                  placeholder="메시지 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" /> {/* Clock icon needs to be imported */}
                  <span>마지막 업데이트: 방금 전</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 section-spacing">
          {/* Enhanced Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="modern-card flex-1 flex flex-col h-full">
              <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Bot className="w-6 h-6 mr-3 text-purple-600" />
                  대화형 AI 어시스턴트
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                {filteredMessages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-4 fade-in ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {message.role === "assistant" && (
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-4 max-w-[75%] shadow-lg ${
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-400"}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>

              {/* Enhanced Input Section */}
              <div className="p-6 border-t bg-white rounded-b-xl">
                {selectedImageBase64 && (
                  <div className="relative mb-4 p-4 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedImageBase64 || "/placeholder.svg"}
                        alt="업로드된 이미지"
                        className="max-h-32 max-w-32 object-contain rounded-xl border-2 border-white shadow-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800">이미지가 업로드되었습니다</p>
                        <p className="text-xs text-blue-600 mt-1">AI가 이미지를 분석하여 더 정확한 답변을 제공합니다</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-xl"
                        onClick={handleClearImage}
                      >
                        <XCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Textarea
                    placeholder="메시지를 입력하세요... (이미지는 Ctrl+V로 붙여넣기 또는 📎 버튼으로 업로드)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    rows={3}
                    className="flex-1 resize-none pr-24 min-h-[80px] rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3 flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="w-10 h-10 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                      title="이미지 업로드"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || (!input.trim() && !selectedImageBase64)}
                      className="w-10 h-10 btn-primary-modern p-0"
                    >
                      {isLoading ? <Zap className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span className="flex items-center space-x-2">
                    <span>💡</span>
                    <span>팁: Ctrl+V로 이미지 붙여넣기, Enter로 전송</span>
                  </span>
                  <span className={input.length > 800 ? "text-red-500 font-medium" : ""}>{input.length}/1000</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Enhanced Dashboard Data Sidebar */}
          <div className="lg:col-span-1">
            <Card className="modern-card h-full">
              <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  실시간 데이터
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6 text-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    캐릭터 현황
                  </h3>
                  <div className="space-y-4">
                    {dashboardData.characters.map((char, index) => (
                      <div key={char.id} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{char.name}</p>
                          <Badge className="status-info text-xs">Lv.{char.level}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>진행도:</span>
                            <span className="font-medium">{char.progress}%</span>
                          </div>
                          <div className="progress-modern h-2">
                            <div className="progress-fill-modern" style={{ width: `${char.progress}%` }} />
                          </div>
                          <div className="flex justify-between">
                            <span>은동전:</span>
                            <span className="font-medium">{char.silverCoins || 0}개</span>
                          </div>
                          <div className="flex justify-between">
                            <span>마족공물:</span>
                            <span className="font-medium">{char.demonArtifacts || 0}개</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckSquare className="w-5 h-5 mr-2 text-green-600" />
                    퀘스트 현황
                  </h3>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">완료율</span>
                      <span className="text-lg font-bold text-green-600">{dashboardData.quests.percentage}%</span>
                    </div>
                    <div className="progress-modern">
                      <div
                        className="progress-fill-modern bg-green-500"
                        style={{ width: `${dashboardData.quests.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {dashboardData.quests.completed}/{dashboardData.quests.total} 완료
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-orange-600" />
                    아이템 현황
                  </h3>
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <p className="text-sm">
                      제작 가능: <span className="font-bold text-orange-600">{dashboardData.items.craftable}</span>/
                      {dashboardData.items.total}개
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Sword className="w-5 h-5 mr-2 text-red-600" />
                    전투력
                  </h3>
                  <div className="p-3 bg-red-50 rounded-xl space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">평균 전투력:</span>
                      <span className="font-bold text-red-600">
                        {dashboardData.combatPower.average.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">최근 증가:</span>
                      <span className="font-bold text-green-600">
                        +{dashboardData.combatPower.increase.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
    </div>
  )
}
