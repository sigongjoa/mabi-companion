"use client"

import { useState } from "react"
import { useFavorites } from "@/contexts/favorites-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CharacterScopedHeader } from "@/components/character-scoped-header"
import { Star, Trash2, ExternalLink, Calendar, Filter } from "lucide-react"
import Link from "next/link"

const typeColors: Record<string, string> = {
  inventory: "bg-blue-100 text-blue-800",
  crafting: "bg-green-100 text-green-800",
  equipment: "bg-purple-100 text-purple-800",
  quest: "bg-orange-100 text-orange-800",
  character: "bg-pink-100 text-pink-800",
  timer: "bg-yellow-100 text-yellow-800",
  default: "bg-gray-100 text-gray-800",
}

export default function FavoritesPage() {
  const { favorites, removeFavorite, getFavoritesByType } = useFavorites()
  const [selectedType, setSelectedType] = useState("all")

  const types = Array.from(new Set(favorites.map((f) => f.type)))
  const filteredFavorites = selectedType === "all" ? favorites : getFavoritesByType(selectedType)

  const groupedByPage = filteredFavorites.reduce(
    (acc, favorite) => {
      const page = favorite.page || "기타"
      if (!acc[page]) acc[page] = []
      acc[page].push(favorite)
      return acc
    },
    {} as Record<string, typeof favorites>,
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getPageName = (path: string) => {
    const pageNames: Record<string, string> = {
      "/": "대시보드",
      "/inventory": "아이템 관리",
      "/equipment": "캐릭터 장비",
      "/quests": "퀘스트 관리",
      "/characters": "캐릭터 관리",
      "/crafting": "가공 시설",
      "/skills": "생활 스킬",
      "/assistant": "AI 어시스턴트",
      "/guides": "종합 가이드",
      "/stats": "게임 통계",
      "/timers": "타이머 관리",
      "/calculator": "게임 계산기",
    }
    return pageNames[path] || path
  }

  return (
    <div className="min-h-screen" style={{ paddingTop: "120px" }}>
      <div className="content-padding section-spacing">
        <CharacterScopedHeader
          title="즐겨찾기"
          description="자주 사용하는 컴포넌트와 기능들을 관리하세요"
          icon={Star}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Summary Cards */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="card">
                <CardContent className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 즐겨찾기</p>
                      <p className="text-2xl font-bold text-gray-900">{favorites.length}개</p>
                    </div>
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card">
                <CardContent className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">페이지 수</p>
                      <p className="text-2xl font-bold text-gray-900">{Object.keys(groupedByPage).length}개</p>
                    </div>
                    <ExternalLink className="w-6 h-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card">
                <CardContent className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">컴포넌트 유형</p>
                      <p className="text-2xl font-bold text-gray-900">{types.length}개</p>
                    </div>
                    <Filter className="w-6 h-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card">
                <CardContent className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">최근 추가</p>
                      <p className="text-sm font-bold text-gray-900">
                        {favorites.length > 0
                          ? formatDate(
                              favorites.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())[0].addedAt,
                            ).split(" ")[0]
                          : "없음"}
                      </p>
                    </div>
                    <Calendar className="w-6 h-6 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters */}
          <div className="lg:col-span-1">
            <Card className="card">
              <CardHeader className="card-header">
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>필터</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <div className="space-y-2">
                  <Button
                    variant={selectedType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("all")}
                    className="w-full justify-start"
                  >
                    전체 ({favorites.length})
                  </Button>
                  {types.map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                      className="w-full justify-start"
                    >
                      {type} ({getFavoritesByType(type).length})
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Favorites List */}
          <div className="lg:col-span-3">
            {favorites.length === 0 ? (
              <Card className="card">
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">아직 즐겨찾기가 없습니다.</p>
                  <p className="text-gray-500 text-sm">
                    각 페이지의 컴포넌트에서 ⭐ 버튼을 클릭하여 즐겨찾기에 추가하세요.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedByPage).map(([page, pageFavorites]) => (
                  <Card key={page} className="card">
                    <CardHeader className="card-header">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <ExternalLink className="w-5 h-5" />
                          <span>{getPageName(page)}</span>
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {pageFavorites.length}개
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="card-content">
                      <div className="space-y-3">
                        {pageFavorites.map((favorite) => (
                          <div
                            key={favorite.id}
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <div>
                                <div className="font-medium text-gray-900">{favorite.name}</div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <Badge className={`text-xs ${typeColors[favorite.type] || typeColors.default}`}>
                                    {favorite.type}
                                  </Badge>
                                  <span>•</span>
                                  <span>{formatDate(favorite.addedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700">
                                <Link href={favorite.page}>
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFavorite(favorite.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
