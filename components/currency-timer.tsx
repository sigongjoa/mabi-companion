"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, Zap } from "lucide-react"

interface CurrencyConfig {
  name: string
  icon: React.ComponentType<any>
  max: number
  intervalMinutes: number
  color: string
  bgColor: string
}

interface TimerState {
  current: number
  isRunning: boolean
  nextChargeTime: Date | null
  fullChargeTime: Date | null
}

const currencyConfigs: Record<string, CurrencyConfig> = {
  silver: {
    name: "은동전",
    icon: Coins,
    max: 100,
    intervalMinutes: 30,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  demon: {
    name: "마족공물",
    icon: Zap,
    max: 10,
    intervalMinutes: 12 * 60, // 12 hours
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
}

interface CurrencyTimerProps {
  characterId: string
  characterName: string
  type: "silver" | "demon"
  onDataChange?: (data: any) => void
}

export const CurrencyTimer = memo(function CurrencyTimer({
  characterId,
  characterName,
  type,
  onDataChange,
}: CurrencyTimerProps) {
  const config = useMemo(() => currencyConfigs[type], [type])
  const [inputValue, setInputValue] = useState("")
  const [timerState, setTimerState] = useState<TimerState>({
    current: 0,
    isRunning: false,
    nextChargeTime: null,
    fullChargeTime: null,
  })
  const [timeDisplay, setTimeDisplay] = useState({
    nextCharge: "00:00:00",
    fullCharge: "00:00:00",
  })

  const formatTime = useCallback((date: Date | null): string => {
    if (!date) return "00:00:00"

    const now = new Date()
    const diff = date.getTime() - now.getTime()

    if (diff <= 0) return "00:00:00"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) {
      return `${days}일 ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }, [])

  const calculateTimes = useCallback(
    (current: number) => {
      if (current >= config.max) {
        return { nextChargeTime: null, fullChargeTime: null }
      }

      const now = new Date()
      const nextChargeTime = new Date(now.getTime() + config.intervalMinutes * 60 * 1000)
      const remainingCharges = config.max - current
      const fullChargeTime = new Date(now.getTime() + remainingCharges * config.intervalMinutes * 60 * 1000)

      return { nextChargeTime, fullChargeTime }
    },
    [config],
  )

  const startTimer = useCallback(() => {
    const current = Number.parseInt(inputValue) || 0
    if (current < 0 || current > config.max) return

    const { nextChargeTime, fullChargeTime } = calculateTimes(current)

    setTimerState({
      current,
      isRunning: true,
      nextChargeTime,
      fullChargeTime,
    })

    onDataChange?.({
      characterId,
      type,
      current,
      nextChargeTime,
      fullChargeTime,
      max: config.max,
    })
  }, [inputValue, config, calculateTimes, characterId, type, onDataChange])

  const stopTimer = useCallback(() => {
    setTimerState((prev) => ({ ...prev, isRunning: false }))
  }, [])

  // Optimized timer with requestAnimationFrame for better performance
  useEffect(() => {
    if (!timerState.isRunning) return

    let animationFrame: number

    const updateTimer = () => {
      const now = new Date()

      // Check if it's time to add a charge
      if (timerState.nextChargeTime && now >= timerState.nextChargeTime) {
        const newCurrent = Math.min(timerState.current + 1, config.max)
        const { nextChargeTime, fullChargeTime } = calculateTimes(newCurrent)

        setTimerState((prev) => ({
          ...prev,
          current: newCurrent,
          nextChargeTime,
          fullChargeTime,
        }))

        onDataChange?.({
          characterId,
          type,
          current: newCurrent,
          nextChargeTime,
          fullChargeTime,
          max: config.max,
        })
      }

      // Update display times
      setTimeDisplay({
        nextCharge: formatTime(timerState.nextChargeTime),
        fullCharge: formatTime(timerState.fullChargeTime),
      })

      animationFrame = requestAnimationFrame(updateTimer)
    }

    animationFrame = requestAnimationFrame(updateTimer)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [timerState, config, calculateTimes, formatTime, characterId, type, onDataChange])

  const progressPercentage = useMemo(() => (timerState.current / config.max) * 100, [timerState.current, config.max])

  return (
    <div className="timer-widget">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 min-w-0">
          <div className={`p-2 rounded-lg flex-shrink-0 ${config.bgColor}`}>
            <config.icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{config.name}</h3>
            <p className="text-xs text-gray-500 truncate">{characterName}</p>
          </div>
        </div>
        <Badge className={timerState.current >= config.max ? "status-complete" : "status-medium"}>
          {timerState.current}/{config.max}
        </Badge>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">현재 보유량</label>
        <div className="flex space-x-2">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`0-${config.max}`}
            min="0"
            max={config.max}
            className="form-input flex-1 text-sm"
          />
          <Button onClick={startTimer} className="form-button-primary text-sm px-3" size="sm">
            시작
          </Button>
          {timerState.isRunning && (
            <Button onClick={stopTimer} className="form-button-secondary text-sm px-3" size="sm">
              정지
            </Button>
          )}
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
      </div>

      {timerState.isRunning && (
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">다음 충전까지</div>
            <div className="timer-display text-sm font-mono">{timeDisplay.nextCharge}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">최대 충전까지</div>
            <div className="timer-display text-sm font-mono">{timeDisplay.fullCharge}</div>
          </div>
        </div>
      )}

      {timerState.fullChargeTime && (
        <div className="text-center p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-600 font-medium">
            완전 충전 예정: {timerState.fullChargeTime.toLocaleString("ko-KR")}
          </div>
        </div>
      )}
    </div>
  )
})
