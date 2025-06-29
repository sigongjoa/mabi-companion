"use client"

import { useCharacter } from "@/contexts/character-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Sword, Shield, Star, TrendingUp, Users, Target, Zap, Heart, Package, Home, Hourglass } from "lucide-react"
import { CharacterScopedHeader } from "@/components/character-scoped-header"
import allItemsData from "@/data/items.json";
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { activeCharacter, characters } = useCharacter()
  const router = useRouter();

  // Helper functions to safely calculate quest counts
  const getDailyQuestCount = (character: any) => {
    if (!character?.completedDailyTasks) return 0
    return Object.keys(character.completedDailyTasks).length
  }

  const getWeeklyQuestCount = (character: any) => {
    if (!character?.completedWeeklyTasks) return 0
    return Object.keys(character.completedWeeklyTasks).length
  }

  const getTotalDailyQuests = () => 10 // Assuming 10 daily quests available
  const getTotalWeeklyQuests = () => 5 // Assuming 5 weekly quests available

  if (!activeCharacter) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Mabi Companion</h1>
          <p className="text-muted-foreground mb-6">Create or select a character to get started</p>
          <Button onClick={() => router.push('/characters')}>Create Character</Button>
        </div>
      </div>
    )
  }

  const dailyProgress = (getDailyQuestCount(activeCharacter) / getTotalDailyQuests()) * 100
  const weeklyProgress = (getWeeklyQuestCount(activeCharacter) / getTotalWeeklyQuests()) * 100

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header - Dashboard style */}
      <div className="modern-card fade-in mb-6">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-4xl font-bold text-gray-900">대시보드</h1>
                <p className="text-lg text-gray-600 mt-1">환영합니다, {activeCharacter?.name || "모험가"}님!</p>
                {activeCharacter && (
                  <p className="text-sm text-gray-500 mt-1">
                    Lv.{activeCharacter.level || 1} • {activeCharacter.profession || "모험가"} • 전투력: {activeCharacter.combatPower || "N/A"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
              {/* 추가적인 요소가 필요하다면 여기에 추가 */}
            </div>
          </div>
        </div>
      </div>

      {!activeCharacter ? (
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-xl font-bold mb-4">캐릭터가 없습니다.</h2>
          <p className="text-muted-foreground mb-6">새로운 캐릭터를 생성하거나 기존 캐릭터를 선택해주세요.</p>
          <Button onClick={() => router.push('/characters')}>Create Character</Button>
        </div>
      ) : (
        <>
          <CharacterScopedHeader title="요약 정보" icon={Users} />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="document-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">일일 퀘스트</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getDailyQuestCount(activeCharacter)}/{getTotalDailyQuests()}
                </div>
                <Progress value={dailyProgress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round(dailyProgress)}% 완료</p>
              </CardContent>
            </Card>

            <Card className="document-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">주간 퀘스트</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getWeeklyQuestCount(activeCharacter)}/{getTotalWeeklyQuests()}
                </div>
                <Progress value={weeklyProgress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round(weeklyProgress)}% 완료</p>
              </CardContent>
            </Card>

            <Card className="document-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전투력</CardTitle>
                <Sword className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCharacter.combatPower || "N/A"}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  지난 주 대비 +12%
                </p>
              </CardContent>
            </Card>

            <Card className="document-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">길드 랭크</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCharacter.guildRank || "멤버"}</div>
                <p className="text-xs text-muted-foreground">{activeCharacter.guildName || "길드 없음"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="document-card">
            <CardHeader>
              <CardTitle>빠른 실행</CardTitle>
              <CardDescription>자주 사용하는 기능으로 바로 이동</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Zap className="h-6 w-6 mb-2" />
                  <span className="text-sm">스킬</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Shield className="h-6 w-6 mb-2" />
                  <span className="text-sm">장비</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Star className="h-6 w-6 mb-2" />
                  <span className="text-sm">퀘스트</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Heart className="h-6 w-6 mb-2" />
                  <span className="text-sm">즐겨찾기</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Completed Crafting Timers */}
          <CharacterScopedHeader title="완료된 제작 타이머" icon={Hourglass} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char) => {
              const completedTimers = Object.values(char.craftingQueues || {}).flatMap(queues => 
                queues.filter(q => !q.isProcessing && q.timeLeft === 0 && q.itemName)
              );

              if (completedTimers.length === 0) return null;

              return (
                <Card key={char.id} className="document-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{char.name}</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {completedTimers.map((timer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{timer.itemName || `아이템 #${timer.id}`}</p>
                        <Badge>완료</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Character Specific Item Counts */}
          <CharacterScopedHeader title="캐릭터별 재화" icon={Package} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char) => (
              <Card key={char.id} className="document-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{char.name}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">마족 공물:</p>
                      <p className="text-lg font-bold">{char.demonTribute?.toLocaleString() || 0}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">은동전:</p>
                      <p className="text-lg font-bold">{char.silverCoins?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
