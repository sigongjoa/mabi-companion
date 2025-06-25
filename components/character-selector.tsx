"use client"

import { useState } from "react"
import { useCharacter } from "@/contexts/character-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Users, User, Star, Clock } from "lucide-react"

export function CharacterSelector() {
  const { characters, activeCharacter, viewMode, setActiveCharacter, setViewMode, toggleCharacterFavorite } =
    useCharacter()

  const [isExpanded, setIsExpanded] = useState(false)

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return "방금 전"
    if (hours < 24) return `${hours}시간 전`
    return `${Math.floor(hours / 24)}일 전`
  }

  return (
    <div className="card">
      <div className="card-content">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">캐릭터 선택</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? "접기" : "펼치기"}
          </Button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <Switch
            id="view-mode"
            checked={viewMode === "all"}
            onCheckedChange={(checked) => setViewMode(checked ? "all" : "single")}
          />
          <Label htmlFor="view-mode" className="text-sm font-medium">
            {viewMode === "all" ? "전체 캐릭터 보기" : "단일 캐릭터 보기"}
          </Label>
          {viewMode === "all" ? (
            <Users className="w-4 h-4 text-blue-600" />
          ) : (
            <User className="w-4 h-4 text-green-600" />
          )}
        </div>

        {/* Character Selection */}
        {viewMode === "single" && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">활성 캐릭터</Label>
            <Select
              value={activeCharacter?.id || ""}
              onValueChange={(value) => {
                const character = characters.find((c) => c.id === value)
                setActiveCharacter(character || null)
              }}
            >
              <SelectTrigger className="form-input">
                <SelectValue placeholder="캐릭터를 선택하세요">
                  {activeCharacter && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-blue-600 text-white">
                          {activeCharacter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{activeCharacter.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Lv.{activeCharacter.level}
                      </Badge>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {characters.map((character) => (
                  <SelectItem key={character.id} value={character.id}>
                    <div className="flex items-center space-x-2 w-full">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-blue-600 text-white">
                          {character.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{character.name}</span>
                          {character.favorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                        </div>
                        <div className="text-xs text-gray-500">
                          {character.server} • Lv.{character.level} • {character.profession}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Expanded Character List */}
        {isExpanded && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium text-gray-700">모든 캐릭터</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    activeCharacter?.id === character.id && viewMode === "single"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    if (viewMode === "single") {
                      setActiveCharacter(character)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-sm bg-blue-600 text-white">
                          {character.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{character.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleCharacterFavorite(character.id)
                            }}
                            className="p-0 h-auto"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                character.favorite ? "text-yellow-500 fill-current" : "text-gray-400"
                              }`}
                            />
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500">
                          {character.server} • Lv.{character.level} • {character.profession}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatLastActive(character.lastActive)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{character.combatPower.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">전투력</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Selection Summary */}
        {viewMode === "single" && activeCharacter && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">현재 활성 캐릭터</span>
            </div>
            <div className="text-sm text-blue-800">
              <strong>{activeCharacter.name}</strong> (Lv.{activeCharacter.level})
            </div>
            <div className="text-xs text-blue-600">
              전투력: {activeCharacter.combatPower.toLocaleString()} • 일일 퀘스트:{" "}
              {activeCharacter.questProgress.daily.completed}/{activeCharacter.questProgress.daily.total}
            </div>
          </div>
        )}

        {viewMode === "all" && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">전체 캐릭터 모드</span>
            </div>
            <div className="text-sm text-green-800">{characters.length}명의 캐릭터 데이터를 통합하여 표시합니다.</div>
          </div>
        )}
      </div>
    </div>
  )
}
