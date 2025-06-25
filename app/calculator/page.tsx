"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Zap, Coins, Target } from "lucide-react"

export default function CalculatorPage() {
  const [enhanceCalc, setEnhanceCalc] = useState({
    currentLevel: "",
    targetLevel: "",
    successRate: "",
    materialCost: "",
  })

  const [currencyCalc, setCurrencyCalc] = useState({
    silverCoins: "",
    demonArtifacts: "",
    targetSilver: "",
    targetDemons: "",
  })

  const [combatCalc, setCombatCalc] = useState({
    baseAttack: "",
    weaponEnhance: "",
    runeBonus: "",
    gemBonus: "",
  })

  const calculateEnhancement = () => {
    const current = Number.parseInt(enhanceCalc.currentLevel) || 0
    const target = Number.parseInt(enhanceCalc.targetLevel) || 0
    const rate = Number.parseFloat(enhanceCalc.successRate) || 0
    const cost = Number.parseInt(enhanceCalc.materialCost) || 0

    const attempts = target - current
    const expectedCost = Math.round((attempts * cost) / (rate / 100))
    const expectedAttempts = Math.round(attempts / (rate / 100))

    return { expectedCost, expectedAttempts, attempts }
  }

  const calculateCurrency = () => {
    const currentSilver = Number.parseInt(currencyCalc.silverCoins) || 0
    const currentDemons = Number.parseInt(currencyCalc.demonArtifacts) || 0
    const targetSilver = Number.parseInt(currencyCalc.targetSilver) || 100
    const targetDemons = Number.parseInt(currencyCalc.targetDemons) || 10

    const silverNeeded = Math.max(0, targetSilver - currentSilver)
    const demonsNeeded = Math.max(0, targetDemons - currentDemons)

    const silverTime = silverNeeded * 30 // 30분마다 1개
    const demonTime = demonsNeeded * 12 * 60 // 12시간마다 1개

    return {
      silverNeeded,
      demonsNeeded,
      silverTime: Math.round(silverTime),
      demonTime: Math.round(demonTime),
    }
  }

  const calculateCombatPower = () => {
    const base = Number.parseInt(combatCalc.baseAttack) || 0
    const weapon = Number.parseInt(combatCalc.weaponEnhance) || 0
    const rune = Number.parseInt(combatCalc.runeBonus) || 0
    const gem = Number.parseInt(combatCalc.gemBonus) || 0

    const total = base + weapon + rune + gem
    const multiplier = 1 + weapon * 0.1 + rune * 0.05 + gem * 0.03

    return {
      totalAttack: total,
      estimatedCombatPower: Math.round(total * multiplier * 2.5),
      improvement: Math.round(total * multiplier * 2.5 - base * 2.5),
    }
  }

  const enhanceResult = calculateEnhancement()
  const currencyResult = calculateCurrency()
  const combatResult = calculateCombatPower()

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="document-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">게임 계산기</h1>
            <p className="text-gray-600">강화, 재화, 전투력 계산 도구</p>
          </div>
          <Calculator className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <Tabs defaultValue="enhance" className="space-y-6">
        <div className="document-card p-4">
          <TabsList className="bg-gray-100 border border-gray-200">
            <TabsTrigger value="enhance" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              <Zap className="w-4 h-4 mr-2" />
              강화 계산
            </TabsTrigger>
            <TabsTrigger value="currency" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              <Coins className="w-4 h-4 mr-2" />
              재화 계산
            </TabsTrigger>
            <TabsTrigger value="combat" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
              <Target className="w-4 h-4 mr-2" />
              전투력 계산
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="enhance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="document-card">
              <CardHeader className="excel-header">
                <CardTitle>강화 비용 계산</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="currentLevel">현재 강화 수치</Label>
                  <Input
                    id="currentLevel"
                    type="number"
                    value={enhanceCalc.currentLevel}
                    onChange={(e) => setEnhanceCalc((prev) => ({ ...prev, currentLevel: e.target.value }))}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="targetLevel">목표 강화 수치</Label>
                  <Input
                    id="targetLevel"
                    type="number"
                    value={enhanceCalc.targetLevel}
                    onChange={(e) => setEnhanceCalc((prev) => ({ ...prev, targetLevel: e.target.value }))}
                    placeholder="10"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="successRate">성공 확률 (%)</Label>
                  <Input
                    id="successRate"
                    type="number"
                    value={enhanceCalc.successRate}
                    onChange={(e) => setEnhanceCalc((prev) => ({ ...prev, successRate: e.target.value }))}
                    placeholder="50"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="materialCost">재료 비용 (골드)</Label>
                  <Input
                    id="materialCost"
                    type="number"
                    value={enhanceCalc.materialCost}
                    onChange={(e) => setEnhanceCalc((prev) => ({ ...prev, materialCost: e.target.value }))}
                    placeholder="1000"
                    className="form-input"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="document-card">
              <CardHeader className="excel-header">
                <CardTitle>계산 결과</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="excel-cell p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">필요 강화 횟수:</span>
                      <span className="font-bold">{enhanceResult.attempts}회</span>
                    </div>
                  </div>
                  <div className="excel-cell p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">예상 시도 횟수:</span>
                      <span className="font-bold text-orange-600">{enhanceResult.expectedAttempts}회</span>
                    </div>
                  </div>
                  <div className="excel-cell p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">예상 총 비용:</span>
                      <span className="font-bold text-red-600">{enhanceResult.expectedCost.toLocaleString()}G</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="currency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="document-card">
              <CardHeader className="excel-header">
                <CardTitle>재화 충전 계산</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="silverCoins">현재 은동전</Label>
                  <Input
                    id="silverCoins"
                    type="number"
                    value={currencyCalc.silverCoins}
                    onChange={(e) => setCurrencyCalc((prev) => ({ ...prev, silverCoins: e.target.value }))}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="targetSilver">목표 은동전</Label>
                  <Input
                    id="targetSilver"
                    type="number"
                    value={currencyCalc.targetSilver}
                    onChange={(e) => setCurrencyCalc((prev) => ({ ...prev, targetSilver: e.target.value }))}
                    placeholder="100"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="demonArtifacts">현재 마족공물</Label>
                  <Input
                    id="demonArtifacts"
                    type="number"
                    value={currencyCalc.demonArtifacts}
                    onChange={(e) => setCurrencyCalc((prev) => ({ ...prev, demonArtifacts: e.target.value }))}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="targetDemons">목표 마족공물</Label>
                  <Input
                    id="targetDemons"
                    type="number"
                    value={currencyCalc.targetDemons}
                    onChange={(e) => setCurrencyCalc((prev) => ({ ...prev, targetDemons: e.target.value }))}
                    placeholder="10"
                    className="form-input"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="document-card">
              <CardHeader className="excel-header">
                <CardTitle>충전 시간 계산</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="excel-cell p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">필요 은동전:</span>
                      <span className="font-bold">{currencyResult.silverNeeded}개</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500 text-sm">충전 시간:</span>
                      <span className="text-sm text-blue-600">
                        {Math.floor(currencyResult.silverTime / 60)}시간 {currencyResult.silverTime % 60}분
                      </span>
                    </div>
                  </div>
                  <div className="excel-cell p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">필요 마족공물:</span>
                      <span className="font-bold">{currencyResult.demonsNeeded}개</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500 text-sm">충전 시간:</span>
                      <span className="text-sm text-red-600">{Math.floor(currencyResult.demonTime / 60)}시간</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="combat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="document-card">
              <CardHeader className="excel-header">
                <CardTitle>전투력 계산</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="baseAttack">기본 공격력</Label>
                  <Input
                    id="baseAttack"
                    type="number"
                    value={combatCalc.baseAttack}
                    onChange={(e) => setCombatCalc((prev) => ({ ...prev, baseAttack: e.target.value }))}
                    placeholder="1000"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="weaponEnhance">무기 강화 수치</Label>
                  <Input
                    id="weaponEnhance"
                    type="number"
                    value={combatCalc.weaponEnhance}
                    onChange={(e) => setCombatCalc((prev) => ({ ...prev, weaponEnhance: e.target.value }))}
                    placeholder="10"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="runeBonus">룬 보너스</Label>
                  <Input
                    id="runeBonus"
                    type="number"
                    value={combatCalc.runeBonus}
                    onChange={(e) => setCombatCalc((prev) => ({ ...prev, runeBonus: e.target.value }))}
                    placeholder="500"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="gemBonus">보석 보너스</Label>
                  <Input
                    id="gemBonus"
                    type="number"
                    value={combatCalc.gemBonus}
                    onChange={(e) => setCombatCalc((prev) => ({ ...prev, gemBonus: e.target.value }))}
                    placeholder="300"
                    className="form-input"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="document-card">
              <CardHeader className="excel-header">
                <CardTitle>예상 전투력</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="excel-cell p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 공격력:</span>
                      <span className="font-bold">{combatResult.totalAttack.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="excel-cell p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">예상 전투력:</span>
                      <span className="font-bold text-purple-600">
                        {combatResult.estimatedCombatPower.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="excel-cell p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">전투력 증가:</span>
                      <span className="font-bold text-green-600">+{combatResult.improvement.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
