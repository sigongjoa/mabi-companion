"use client"

import React, { useState, useEffect, useCallback, useMemo, memo } from "react"
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

// Add CurrencyTimerState for parsing from localStorage (ISO strings)
interface CurrencyTimerStateFromStorage {
  current: number;
  isRunning: boolean;
  nextChargeTime: string | null;
  fullChargeTime: string | null;
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
  type?: "silver" | "demon"
  onDataChange?: (data: any) => void
  initialTimerState?: CurrencyTimerStateFromStorage; // Add this prop
}

export const CurrencyTimer = memo(function CurrencyTimer({
  characterId,
  characterName,
  type,
  onDataChange,
  initialTimerState, // Destructure the new prop
}: CurrencyTimerProps) {
  // If an invalid or missing type is passed, gracefully fall back to "silver"
  const config = useMemo<CurrencyConfig>(() => {
    if (type && currencyConfigs[type]) {
      return currencyConfigs[type];
    }
    return currencyConfigs.silver;
  }, [type])
  const [inputValue, setInputValue] = useState("")

  // Initialize timerState from initialTimerState prop or default
  const [timerState, setTimerState] = useState<TimerState>(() => {
    if (initialTimerState) {
      return {
        current: initialTimerState.current,
        isRunning: initialTimerState.isRunning,
        nextChargeTime: initialTimerState.nextChargeTime ? new Date(initialTimerState.nextChargeTime) : null,
        fullChargeTime: initialTimerState.fullChargeTime ? new Date(initialTimerState.fullChargeTime) : null,
      };
    } else {
      return {
        current: 0,
        isRunning: false,
        nextChargeTime: null,
        fullChargeTime: null,
      };
    }
  });
  
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
    setTimerState((prev: TimerState) => ({ ...prev, isRunning: false }))
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

        setTimerState((prev: TimerState) => ({
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
      setTimeDisplay((prev: { nextCharge: string; fullCharge: string }) => ({
        ...prev,
        nextCharge: formatTime(timerState.nextChargeTime),
        fullCharge: formatTime(timerState.fullChargeTime),
      }))

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
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="현재 재화량"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={startTimer} disabled={timerState.isRunning || inputValue === ""}>
            {timerState.isRunning ? "재시작" : "타이머 시작"}
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={stopTimer} disabled={!timerState.isRunning}>
            타이머 중지
          </Button>
          <Button onClick={() => setInputValue(String(timerState.current))}>
            현재량으로 설정
          </Button>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg space-y-2 text-sm text-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-medium">다음 충전까지:</span>
            <span className="font-semibold text-gray-800">{timeDisplay.nextCharge}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">완전 충전까지:</span>
            <span className="font-semibold text-gray-800">{timeDisplay.fullCharge}</span>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>
    </div>
  )
})
