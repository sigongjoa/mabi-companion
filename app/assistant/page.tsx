"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, User, Bot, Database, Zap, Image as ImageIcon, XCircle } from "lucide-react"

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

  // Simulate receiving real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // This would normally come from your app's state management
      setDashboardData((prev: DashboardData) => ({
        ...prev,
        // Simulate small changes
        characters: prev.characters.map((char: CharacterData) => ({
          ...char,
          silverCoins: Math.min(
            100,
            (char.silverCoins || 0) + (Math.random() > 0.9 ? 1 : 0)
          ),
        })),
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.debug('handleFileChange: Function entry.')
    const file = event.target.files?.[0]
    if (file) {
      console.debug(`handleFileChange: File selected: ${file.name}`)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImageBase64(reader.result as string)
        console.debug('handleFileChange: File read as Base64.')
      }
      reader.readAsDataURL(file)
    } else {
      console.debug('handleFileChange: No file selected.')
      setSelectedImageBase64(null)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    console.debug('handlePaste: Function entry.')
    const items = event.clipboardData?.items
    if (items) {
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          console.debug('handlePaste: Image found in clipboard.')
          const blob = item.getAsFile()
          if (blob) {
            const reader = new FileReader()
            reader.onloadend = () => {
              setSelectedImageBase64(reader.result as string)
              console.debug('handlePaste: Image pasted and read as Base64.')
            }
            reader.readAsDataURL(blob)
            event.preventDefault() // Prevent default paste behavior (e.g., pasting text if image is also text)
            return
          }
        }
      }
    }
    console.debug('handlePaste: No image found in clipboard.')
  }

  const handleClearImage = () => {
    console.debug('handleClearImage: Function entry.')
    setSelectedImageBase64(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Clear file input value
    }
    console.debug('handleClearImage: Selected image cleared.')
  }

  const generateContextualResponse = (userInput: string, context: DashboardData): string => {
    const input = userInput.toLowerCase()

    if (input.includes("은동전") || input.includes("silver")) {
      const totalSilver = context.characters.reduce((sum, char) => sum + (char.silverCoins || 0), 0)
      const avgSilver = Math.round(totalSilver / context.characters.length)
      return `현재 전체 캐릭터의 은동전 보유 현황을 분석했습니다:\n\n📊 **은동전 현황**\n- 총 보유량: ${totalSilver}개\n- 평균 보유량: ${avgSilver}개\n- 캐릭터별 현황:\n${context.characters.map((char) => `  • ${char.name}: ${char.silverCoins || 0}/100개`).join("\n")}\n\n💡 **추천사항:**\n${
  context.characters.filter((char) => (char.silverCoins || 0) < 50).length > 0
    ? "일부 캐릭터의 은동전이 부족합니다. 타이머를 설정하여 효율적으로 관리하세요."
    : "모든 캐릭터가 충분한 은동전을 보유하고 있습니다!"
}`
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

    // Default response with current data context
    return `현재 게임 상황을 분석해드렸습니다:\n\n📊 **실시간 현황**\n- 캐릭터 ${context.characters.length}명 관리 중\n- 일일 퀘스트 ${context.quests.percentage}% 완료\n- 제작 가능 아이템 ${context.items.craftable}개\n- 평균 전투력 ${context.combatPower.average.toLocaleString()}\n\n더 구체적인 조언이 필요하시면 "은동전", "퀘스트", "전투력", "추천" 등의 키워드로 질문해주세요!`
  }

  const sendMessage = async () => {
    console.debug('sendMessage: Function entry.')
    if (!input.trim() && !selectedImageBase64) {
      console.debug('sendMessage: Input and image are both empty. Returning.')
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
      fileInputRef.current.value = '' // Clear file input value as well
    }
    console.debug('sendMessage: User message added, input cleared, loading set to true, image cleared.')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          image: selectedImageBase64, // 이미지 데이터 추가
          context: messages.filter((msg: Message) => msg.role !== 'system').map((msg: Message) => ({ role: msg.role, content: msg.content }))
        }),
      })
      console.debug(`sendMessage: API call to /api/chat responded with status: ${response.status}`)

      const result = await response.json()
      if (response.ok) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.message,
          timestamp: new Date(),
        }
        setMessages((prev: Message[]) => [...prev, aiMessage])
        console.debug('sendMessage: AI message successfully added to state.')
      } else {
        console.error('sendMessage: API Error:', result.error)
        console.debug('sendMessage: API Error encountered. Setting AI response to error message.')
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `오류 발생: ${result.error?.message || JSON.stringify(result.error)}. 다시 시도해주세요.`, // 오류 메시지를 표시
          timestamp: new Date(),
        }
        setMessages((prev: Message[]) => [...prev, errorMessage])
      }

    } catch (err: any) {
      console.error('sendMessage: Fetch Error:', err)
      console.debug(`sendMessage: Fetch Error encountered: ${err.message}. Setting AI response to generic error message.`)      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `네트워크 오류가 발생했습니다: ${err.message}. 잠시 후 다시 시도해주세요.`, // 네트워크 오류 메시지
        timestamp: new Date(),
      }
      setMessages((prev: Message[]) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      console.debug('sendMessage: Loading set to false. Function exit.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.debug('handleKeyPress: Function entry.')
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
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-[70%] ${ message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="p-2 bg-gray-300 rounded-full">
                      <User className="w-5 h-5 text-gray-800" />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t bg-white">
              {selectedImageBase64 && (
                <div className="relative mb-4 p-2 border rounded-lg bg-gray-100">
                  <img src={selectedImageBase64} alt="Selected" className="max-h-32 object-contain rounded" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 text-gray-500 hover:text-gray-700"
                    onClick={handleClearImage}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="relative flex space-x-2">
                <Textarea
                  placeholder="메시지를 입력하세요..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onPaste={handlePaste}
                  rows={1}
                  className="flex-1 resize-none pr-12"
                  disabled={isLoading}
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="absolute bottom-2 right-2"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Button onClick={sendMessage} disabled={isLoading || (!input.trim() && !selectedImageBase64)} className="px-4 py-2 flex-shrink-0">
                  {isLoading ? (
                    <span className="flex items-center">
                      <Zap className="w-4 h-4 mr-2 animate-pulse" /> 전송 중...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="w-4 h-4 mr-2" /> 전송
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Dashboard Data (Right Sidebar) */}
        <div className="lg:col-span-1">
          <Card className="document-card h-full">
            <CardHeader className="excel-header">
              <CardTitle className="text-gray-900">대시보드 실시간 데이터</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">캐릭터 현황</h3>
              {dashboardData.characters.map((char) => (
                <div key={char.id} className="text-sm">
                  <p><strong>{char.name}</strong> (Lv.{char.level})</p>
                  <p>진행도: {char.progress}%</p>
                  <p>은동전: {char.silverCoins || 0}개</p>
                  <p>마족공물: {char.demonArtifacts || 0}개</p>
                </div>
              ))}
              <h3 className="text-lg font-semibold">퀘스트 현황</h3>
              <p className="text-sm">완료: {dashboardData.quests.completed}/{dashboardData.quests.total} ({dashboardData.quests.percentage}%)</p>
              <h3 className="text-lg font-semibold">아이템 현황</h3>
              <p className="text-sm">제작 가능: {dashboardData.items.craftable}/{dashboardData.items.total}개</p>
              <h3 className="text-lg font-semibold">전투력</h3>
              <p className="text-sm">평균 전투력: {dashboardData.combatPower.average.toLocaleString()}</p>
              <p className="text-sm">최근 증가량: +{dashboardData.combatPower.increase.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
