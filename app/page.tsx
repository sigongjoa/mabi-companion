"use client"

import { useCharacter } from "@/contexts/character-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Sword, Shield, Star, TrendingUp, Users, Target, Zap, Heart, Package, Home, Hourglass } from "lucide-react"
import { CharacterScopedHeader } from "@/components/character-scoped-header"
import { useRouter } from 'next/navigation';
import { Item } from "@/types/page-context";
import { logger } from "@/lib/logger";
import itemsData from "/public/data/items.json";
import { CurrencyTimersContainer } from "@/components/currency-timers-container";

export default function HomePage() {
  logger.debug("HomePage 렌더링 시작");
  const router = useRouter();
  const { activeCharacter, allItems, allQuests, isLoadingData, dataLoadError, characters, updateCharacter } = useCharacter();

  const handleCurrencyDataChange = (data: any) => {
    logger.debug("handleCurrencyDataChange 호출됨", { data });
    if (!activeCharacter) {
      logger.debug("handleCurrencyDataChange: 활성 캐릭터 없음. 종료.");
      return;
    }

    const updatedCurrencyTimers = {
      ...activeCharacter.currencyTimers,
      [data.type]: {
        current: data.current,
        isRunning: data.isRunning,
        nextChargeTime: data.nextChargeTime,
        fullChargeTime: data.fullChargeTime,
      },
    };
    logger.debug("handleCurrencyDataChange: 새 currencyTimers로 캐릭터 업데이트:", updatedCurrencyTimers);
    updateCharacter(activeCharacter.id, { currencyTimers: updatedCurrencyTimers });
  };

  // Helper functions to safely calculate quest counts
  const getDailyQuestCount = (character: any) => {
    logger.debug("getDailyQuestCount: 캐릭터 객체", character);
    if (!character?.completedDailyTasks) {
      logger.debug("getDailyQuestCount: completedDailyTasks 없음, 0 반환");
      return 0;
    }
    logger.debug("getDailyQuestCount: completedDailyTasks 원본 객체", character.completedDailyTasks);
    const completedTasksArray = Object.values(character.completedDailyTasks);
    logger.debug("getDailyQuestCount: completedDailyTasks 배열 (모든 값)", completedTasksArray);
    const trueCount = completedTasksArray.filter(Boolean).length;
    logger.debug("getDailyQuestCount: true 값의 개수", trueCount);
    return trueCount; // Only count true values
  };

  const getWeeklyQuestCount = (character: any) => {
    logger.debug("getWeeklyQuestCount: 캐릭터 객체", character);
    if (!character?.completedWeeklyTasks) {
      logger.debug("getWeeklyQuestCount: completedWeeklyTasks 없음, 0 반환");
      return 0;
    }
    const completedTasksArray = Object.values(character.completedWeeklyTasks);
    logger.debug("getWeeklyQuestCount: completedWeeklyTasks 배열 (모든 값)", completedTasksArray);
    const trueCount = completedTasksArray.filter(Boolean).length;
    logger.debug("getWeeklyQuestCount: true 값의 개수", trueCount);
    return trueCount; // Only count true values
  };

  const getTotalDailyQuests = () => {
    const totalDaily = Object.values(allQuests?.daily || {}).flat().length;
    logger.debug("getTotalDailyQuests: 총 일일 숙제 수", totalDaily);
    return totalDaily;
  };

  const getTotalWeeklyQuests = () => {
    const totalWeekly = Object.values(allQuests?.weekly || {}).flat().length;
    logger.debug("getTotalWeeklyQuests: 총 주간 숙제 수", totalWeekly);
    return totalWeekly;
  };

  const dailyProgress = activeCharacter ? (getDailyQuestCount(activeCharacter) / getTotalDailyQuests()) * 100 : 0;
  const weeklyProgress = activeCharacter ? (getWeeklyQuestCount(activeCharacter) / getTotalWeeklyQuests()) * 100 : 0;

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

      <>
        <CharacterScopedHeader title="요약 정보" icon={Users} />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="document-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">일일 숙제</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeCharacter ? getDailyQuestCount(activeCharacter) : 0}/{getTotalDailyQuests()}
              </div>
              <Progress value={dailyProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(dailyProgress)}% 완료</p>
            </CardContent>
          </Card>

          <Card className="document-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">주간 숙제</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeCharacter ? getWeeklyQuestCount(activeCharacter) : 0}/{getTotalWeeklyQuests()}
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
              <div className="text-2xl font-bold">{activeCharacter?.combatPower || "N/A"}</div>
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
              <div className="text-2xl font-bold">{activeCharacter?.guildRank || "멤버"}</div>
              <p className="text-xs text-muted-foreground">{activeCharacter?.guildName || "길드 없음"}</p>
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
                <span className="text-sm">숙제</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Heart className="h-6 w-6 mb-2" />
                <span className="text-sm">즐겨찾기</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 재화 충전 타이머 */}
        {/* <CharacterScopedHeader title="재화 충전 타이머" icon={Clock} /> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CurrencyTimersContainer characters={characters} handleCurrencyDataChange={handleCurrencyDataChange} dashboardMode={true} />
        </div>

        {/* Completed Crafting Timers 섹션 제거 */}
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
        {/* <CharacterScopedHeader title="캐릭터별 재화" icon={Package} /> */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> */}
          {/* {characters.map((char) => ( */}
            {/* <Card key={char.id} className="document-card"> */}
              {/* <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> */}
                {/* <CardTitle className="text-sm font-medium">{char.name}</CardTitle> */}
                {/* <Users className="h-4 w-4 text-muted-foreground" /> */}
              {/* </CardHeader> */}
              {/* <CardContent> */}
                {/* <div className="flex items-center justify-between space-x-2 text-sm"> */}
                  {/* <p className="text-muted-foreground">골드</p> */}
                  {/* <span className="font-bold">{char.gold?.toLocaleString() || 0}</span> */}
                {/* </div> */}
                {/* <div className="flex items-center justify-between space-x-2 text-sm"> */}
                  {/* <p className="text-muted-foreground">두카트</p> */}
                  {/* <span className="font-bold">{char.ducats?.toLocaleString() || 0}</span> */}
                {/* </div> */}
                {/* Dynamically display other key items */}
                {/* {Object.entries(char.inventory || {}).map(([itemId, quantity]) => { } */}
                  {/* const item = itemsData[itemId]; */}
                {/* if (!item || !['골드', '두카트'].includes(item.name)) return null; // Filter out gold and ducats if already displayed */}
                {/* return ( */}
                  {/* <div key={itemId} className="flex items-center justify-between space-x-2 text-sm"> */}
                    {/* <p className="text-muted-foreground">{item.name}</p> */}
                    {/* <span className="font-bold">{quantity.toLocaleString()}</span> */}
                  {/* </div> */}
                {/* ); */}
              {/* </CardContent> */}
            {/* </Card> */}
          {/* ))} */}
        {/* </div> */}
      </>
    </div>
  )
}
