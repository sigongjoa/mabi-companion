"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyTimer } from "@/components/currency-timer"
import { Clock, Timer, Zap, Calendar } from "lucide-react"
import { FavoriteToggle } from "@/components/favorite-toggle"
import { Input } from "@/components/ui/input"
import { useCharacter } from "@/contexts/character-context"
import { CurrencyTimersContainer } from "@/components/currency-timers-container"
import { logger } from "@/lib/logger"

export default function TimersPage() {
  console.debug("TimersPage rendered.")
  const [searchQuery, setSearchQuery] = useState("")

  const { characters, activeCharacter, updateCharacter, isLoadingData, dataLoadError } = useCharacter()

  // Debugging logs
  logger.debug("TimersPage: characters", characters);
  logger.debug("TimersPage: activeCharacter", activeCharacter);
  logger.debug("TimersPage: isLoadingData", isLoadingData);
  logger.debug("TimersPage: dataLoadError", dataLoadError);

  const handleCurrencyDataChange = (data: any) => {
    logger.debug("handleCurrencyDataChange called with data:", data);
    const { characterId, type, current, isRunning, nextChargeTime, fullChargeTime } = data;

    // Find the character to update
    const targetCharacter = characters.find(char => char.id === characterId);

    if (!targetCharacter) {
      logger.debug("handleCurrencyDataChange: Target character not found. Exiting.", { characterId });
      return;
    }

    const updatedCurrencyTimers = {
      ...targetCharacter.currencyTimers, // Use the target character's timers as base
      [type]: {
        current,
        isRunning,
        nextChargeTime,
        fullChargeTime,
      },
    };
    logger.debug("handleCurrencyDataChange: Updating character with new currencyTimers:", { characterId, updatedCurrencyTimers });
    updateCharacter(characterId, { currencyTimers: updatedCurrencyTimers }); // Use data.characterId here
  };

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
          <CurrencyTimersContainer characters={characters} handleCurrencyDataChange={handleCurrencyDataChange} />
        </div>
      </div>
    </div>
  )
}
