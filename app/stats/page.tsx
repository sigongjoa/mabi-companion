"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Target, Calendar, Activity } from "lucide-react"

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
  const [selectedPeriod, setSelectedPeriod] = useState("week")

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="document-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">게임 통계</h1>
            <p className="text-gray-600">플레이 기록 및 성과 분석</p>
          </div>
          <BarChart3 className="w-8 h-8 text-blue-600" />
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
            <CardContent className="p-6">
              <div className="space-y-4">
                {statsData.characters.map((character, index) => (
                  <div key={index} className="excel-cell hover:excel-selected p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {character.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{character.name}</h3>
                          <p className="text-sm text-gray-600">Lv.{character.level}</p>
                        </div>
                      </div>
                      <Badge className="status-complete">활성</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">전투력</p>
                        <p className="font-medium">{character.combatPower.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">플레이 시간</p>
                        <p className="font-medium">{character.playTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">완료 퀘스트</p>
                        <p className="font-medium">{character.questsCompleted}개</p>
                      </div>
                      <div>
                        <p className="text-gray-600">선호 활동</p>
                        <p className="font-medium">{character.favoriteActivity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div>
          <Card className="document-card">
            <CardHeader className="excel-header">
              <CardTitle>업적 진행도</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {statsData.achievements.map((achievement, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{achievement.name}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                      <Badge
                        className={
                          achievement.progress >= achievement.total
                            ? "status-complete"
                            : achievement.progress >= achievement.total * 0.7
                              ? "status-medium"
                              : "status-low"
                        }
                      >
                        {Math.round((achievement.progress / achievement.total) * 100)}%
                      </Badge>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {achievement.progress}/{achievement.total}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
