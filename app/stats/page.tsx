"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Target, Calendar, Activity } from "lucide-react"
import { FavoriteToggle } from "@/components/favorite-toggle"
import { Input } from "@/components/ui/input"

const statsData = {
  overview: {
    totalPlayTime: "156시간 32분",
    totalCharacters: 3,
    averageLevel: 101,
    totalCombatPower: 135690,
  },
  weekly: {
    questsCompleted: 84,
    dungeonsCleared: 21,
    itemsCrafted: 156,
    experienceGained: 2450000,
  },
  characters: [
    {
      name: "기사단장 테오",
      level: 120,
      combatPower: 52340,
      playTime: "68시간 15분",
      questsCompleted: 342,
      favoriteActivity: "던전 탐험",
    },
    {
      name: "마법사 에리나",
      level: 95,
      combatPower: 41850,
      playTime: "45시간 22분",
      questsCompleted: 278,
      favoriteActivity: "마법 연구",
    },
    {
      name: "음유시인 리안",
      level: 88,
      combatPower: 41500,
      playTime: "42시간 55분",
      questsCompleted: 234,
      favoriteActivity: "음악 연주",
    },
  ],
  achievements: [
    { name: "던전 마스터", description: "100개 던전 클리어", progress: 87, total: 100 },
    { name: "제작의 달인", description: "1000개 아이템 제작", progress: 756, total: 1000 },
    { name: "퀘스트 헌터", description: "500개 퀘스트 완료", progress: 432, total: 500 },
    { name: "레벨 마스터", description: "모든 캐릭터 100레벨 달성", progress: 2, total: 3 },
  ],
}

export default function StatsPage() {
  console.debug("StatsPage rendered.")
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCharacters = statsData.characters.filter(character =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.favoriteActivity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAchievements = statsData.achievements.filter(achievement =>
    achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header - Dashboard style */}
      <div className="modern-card fade-in mb-6">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-4xl font-bold text-gray-900">게임 통계</h1>
                <p className="text-lg text-gray-600 mt-1">플레이 기록 및 성과 분석</p>
                <p className="text-sm text-gray-500 mt-1">나의 게임 데이터를 분석하여 성장 목표를 설정하고 효율적인 플레이를 계획하세요.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FavoriteToggle id="stats-header" name="게임 통계 헤더" type="header" />
              <Input
                type="text"
                placeholder="통계 검색..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  console.debug(`Stats search query changed: ${e.target.value}`);
                }}
                className="max-w-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="document-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 플레이 시간</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.overview.totalPlayTime}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="document-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">관리 캐릭터</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.overview.totalCharacters}명</p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="document-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 레벨</p>
                <p className="text-2xl font-bold text-gray-900">Lv.{statsData.overview.averageLevel}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="document-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 전투력</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsData.overview.totalCombatPower.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <Target className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Performance */}
        <div className="lg:col-span-2">
          <Card className="document-card">
            <CardHeader className="excel-header">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>주간 성과</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="excel-grid w-full">
                <thead>
                  <tr>
                    <th className="excel-header excel-cell">활동</th>
                    <th className="excel-header excel-cell">이번 주</th>
                    <th className="excel-header excel-cell">상태</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="excel-cell font-medium">완료한 퀘스트</td>
                    <td className="excel-cell">{statsData.weekly.questsCompleted}개</td>
                    <td className="excel-cell">
                      <Badge className="status-complete">우수</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="excel-cell font-medium">클리어한 던전</td>
                    <td className="excel-cell">{statsData.weekly.dungeonsCleared}개</td>
                    <td className="excel-cell">
                      <Badge className="status-medium">보통</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="excel-cell font-medium">제작한 아이템</td>
                    <td className="excel-cell">{statsData.weekly.itemsCrafted}개</td>
                    <td className="excel-cell">
                      <Badge className="status-complete">우수</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="excel-cell font-medium">획득 경험치</td>
                    <td className="excel-cell">{statsData.weekly.experienceGained.toLocaleString()}</td>
                    <td className="excel-cell">
                      <Badge className="status-complete">우수</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Character Details */}
          <Card className="document-card mt-6">
            <CardHeader className="excel-header">
              <CardTitle>캐릭터별 상세 통계</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="excel-grid w-full">
                <thead>
                  <tr>
                    <th className="excel-header excel-cell">이름</th>
                    <th className="excel-header excel-cell">레벨</th>
                    <th className="excel-header excel-cell">전투력</th>
                    <th className="excel-header excel-cell">주요 활동</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCharacters.length > 0 ? (
                    filteredCharacters.map((char, index) => (
                      <tr key={index}>
                        <td className="excel-cell font-medium">{char.name}</td>
                        <td className="excel-cell">Lv.{char.level}</td>
                        <td className="excel-cell">{char.combatPower.toLocaleString()}</td>
                        <td className="excel-cell">{char.favoriteActivity}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="excel-cell text-center text-gray-500">검색 결과가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div className="lg:col-span-1">
          <Card className="document-card h-full">
            <CardHeader className="excel-header">
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>내 업적</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="space-y-4 p-6">
                {filteredAchievements.length > 0 ? (
                  filteredAchievements.map((achievement, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{achievement.name}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.progress.toLocaleString()}/{achievement.total.toLocaleString()} ({(
                            (achievement.progress / achievement.total) *
                            100
                          ).toFixed(0)}%)
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">검색 결과가 없습니다.</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
