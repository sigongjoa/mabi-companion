"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyTimer } from "@/components/currency-timer"
import { Zap } from "lucide-react"
import { Character } from "@/contexts/character-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
        <div className="overflow-x-auto">
          {characters.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>캐릭터</TableHead>
                  <TableHead>은화 타이머</TableHead>
                  <TableHead>마력 타이머</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {characters.map((character) => (
                  <TableRow key={character.id}>
                    <TableCell className="font-medium text-lg">
                      {character.name}
                      <span className="text-gray-500 text-sm ml-2">(Lv.{character.level})</span>
                    </TableCell>
                    <TableCell>
                      <CurrencyTimer
                        characterId={character.id}
                        characterName={character.name}
                        type="silver"
                        onDataChange={handleCurrencyDataChange}
                        initialTimerState={character?.currencyTimers?.silver}
                        dashboardMode={dashboardMode}
                      />
                    </TableCell>
                    <TableCell>
                      <CurrencyTimer
                        characterId={character.id}
                        characterName={character.name}
                        type="demon"
                        onDataChange={handleCurrencyDataChange}
                        initialTimerState={character?.currencyTimers?.demon}
                        dashboardMode={dashboardMode}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>표시할 캐릭터가 없습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 