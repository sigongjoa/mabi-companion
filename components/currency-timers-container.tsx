"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyTimer } from "@/components/currency-timer"
import { Zap } from "lucide-react"
import { Character } from "@/contexts/character-context"

interface CurrencyTimersContainerProps {
  characters: Character[];
  handleCurrencyDataChange: (data: any) => void;
  dashboardMode?: boolean;
}

export function CurrencyTimersContainer({ characters, handleCurrencyDataChange, dashboardMode }: CurrencyTimersContainerProps) {
  return (
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
                  initialTimerState={character?.currencyTimers?.silver}
                  dashboardMode={dashboardMode}
                />
                <CurrencyTimer
                  characterId={character.id}
                  characterName={character.name}
                  type="demon"
                  onDataChange={handleCurrencyDataChange}
                  initialTimerState={character?.currencyTimers?.demon}
                  dashboardMode={dashboardMode}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 