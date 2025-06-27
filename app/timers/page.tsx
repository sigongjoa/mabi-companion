"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyTimer } from "@/components/currency-timer"
import { Clock, Timer, Zap, Calendar } from "lucide-react"
import { FavoriteToggle } from "@/components/favorite-toggle"
import { Input } from "@/components/ui/input"

const characters = [
  { id: "1", name: "기사단장 테오", level: 120 },
  { id: "2", name: "마법사 에리나", level: 95 },
  { id: "3", name: "음유시인 리안", level: 88 },
]

const gameEvents = [
  {
    name: "일일 초기화",
    time: "06:00",
    nextReset: "4시간 23분",
    type: "daily",
    description: "일일 퀘스트 및 던전 초기화",
  },
  {
    name: "주간 초기화",
    time: "월요일 06:00",
    nextReset: "2일 4시간",
    type: "weekly",
    description: "주간 퀘스트 및 레이드 초기화",
  },
  {
    name: "필드보스 출현",
    time: "매 2시간",
    nextReset: "1시간 15분",
    type: "recurring",
    description: "페리, 크라브바흐, 크라마 출현",
  },
  {
    name: "이벤트 던전",
    time: "12:00, 20:00",
    nextReset: "7시간 37분",
    type: "event",
    description: "특별 이벤트 던전 오픈",
  },
]

export default function TimersPage() {
  console.debug("TimersPage rendered.")
  const [currencyData, setCurrencyData] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const handleCurrencyDataChange = (data: any) => {
    setCurrencyData((prev) => {
      const filtered = prev.filter((item) => !(item.characterId === data.characterId && item.type === data.type))
      return [...filtered, data]
    })
  }

  const filteredGameEvents = gameEvents.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header - Dashboard style */}
      <div className="modern-card fade-in mb-6">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                <Timer className="w-8 h-8 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-4xl font-bold text-gray-900">타이머 관리</h1>
                <p className="text-lg text-gray-600 mt-1">재화 충전 및 게임 이벤트 타이머</p>
                <p className="text-sm text-gray-500 mt-1">게임 내 중요한 시간들을 놓치지 않고 효율적으로 관리하세요.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
              <Input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currency Timers */}
        <div className="lg:col-span-2">
          <Card className="document-card">
            <CardHeader className="excel-header">
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>재화 충전 타이머</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                {characters.map((character) => (
                  <div key={character.id} className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {character.name.charAt(0)}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {character.name} (Lv.{character.level})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CurrencyTimer
                        characterId={character.id}
                        characterName={character.name}
                        type="silver"
                        onDataChange={handleCurrencyDataChange}
                      />
                      <CurrencyTimer
                        characterId={character.id}
                        characterName={character.name}
                        type="demon"
                        onDataChange={handleCurrencyDataChange}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Events */}
        <div>
          <Card className="document-card">
            <CardHeader className="excel-header">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>게임 이벤트</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {filteredGameEvents.length > 0 ? (
                  filteredGameEvents.map((event, index) => (
                    <div key={index} className="excel-cell hover:excel-selected p-3 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{event.name}</h4>
                          <p className="text-xs text-gray-600">{event.description}</p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            event.type === "daily"
                              ? "bg-blue-100 text-blue-700"
                              : event.type === "weekly"
                                ? "bg-purple-100 text-purple-700"
                                : event.type === "recurring"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {event.type === "daily"
                            ? "일일"
                            : event.type === "weekly"
                              ? "주간"
                              : event.type === "recurring"
                                ? "반복"
                                : "이벤트"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">시간:</span>
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">다음까지:</span>
                          <span className="font-medium text-blue-600">{event.nextReset}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">검색 결과가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Summary */}
          <Card className="document-card mt-6">
            <CardHeader className="excel-header">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>요약</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">활성 타이머</span>
                  <span className="font-medium">{currencyData.length}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">관리 캐릭터</span>
                  <span className="font-medium">{characters.length}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">게임 이벤트</span>
                  <span className="font-medium">{filteredGameEvents.length}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">다음 초기화</span>
                  <span className="font-medium text-red-600">06:00 (1일 후)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
