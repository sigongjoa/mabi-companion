"use client"

import React, { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, Zap } from "lucide-react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { logger } from "@/lib/logger";

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
  initialTimerState?: CurrencyTimerStateFromStorage;
  dashboardMode?: boolean;
}

export const CurrencyTimer = memo(function CurrencyTimer({
  characterId,
  characterName,
  type,
  onDataChange,
  initialTimerState,
  dashboardMode,
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
    logger.debug("CurrencyTimer: useState initializer 호출", { initialTimerState });
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

  // initialTimerState prop이 변경될 때 timerState를 업데이트
  useEffect(() => {
    logger.debug("CurrencyTimer: useEffect - initialTimerState 변경 감지", { initialTimerState });
    if (initialTimerState) {
      setTimerState({
        current: initialTimerState.current,
        isRunning: initialTimerState.isRunning,
        nextChargeTime: initialTimerState.nextChargeTime ? new Date(initialTimerState.nextChargeTime) : null,
        fullChargeTime: initialTimerState.fullChargeTime ? new Date(initialTimerState.fullChargeTime) : null,
      });
    }
  }, [initialTimerState]);
  
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
      isRunning: true,
      nextChargeTime: nextChargeTime ? nextChargeTime.toISOString() : null,
      fullChargeTime: fullChargeTime ? fullChargeTime.toISOString() : null,
    })
  }, [inputValue, config, calculateTimes, characterId, type, onDataChange])

  const stopTimer = useCallback(() => {
    logger.debug("CurrencyTimer: stopTimer 호출");
    setTimerState((prev: TimerState) => ({ ...prev, isRunning: false }));
    onDataChange?.({
      characterId,
      type,
      current: timerState.current,
      isRunning: false,
      nextChargeTime: timerState.nextChargeTime ? timerState.nextChargeTime.toISOString() : null,
      fullChargeTime: timerState.fullChargeTime ? timerState.fullChargeTime.toISOString() : null,
    });
  }, [characterId, onDataChange, type, timerState.current, timerState.nextChargeTime, timerState.fullChargeTime]);

  // Optimized timer with requestAnimationFrame for better performance
  useEffect(() => {
    logger.debug("CurrencyTimer: useEffect - 타이머 로직 실행", { isRunning: timerState.isRunning });
    if (!timerState.isRunning) return

    let animationFrame: number

    const updateTimer = () => {
      const now = new Date()

      // Check if it's time to add a charge
      if (timerState.nextChargeTime && now >= timerState.nextChargeTime) {
        logger.debug("CurrencyTimer: 타이머 현재량 증가 및 다음 충전 시간 계산", { current: timerState.current });
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
          isRunning: true, // 타이머가 계속 실행 중임을 명시
          nextChargeTime: nextChargeTime ? nextChargeTime.toISOString() : null,
          fullChargeTime: fullChargeTime ? fullChargeTime.toISOString() : null,
          max: config.max,
        })
      } else if (timerState.current >= config.max && timerState.isRunning) {
        // Max reached and still running, stop it and notify parent
        logger.debug("CurrencyTimer: 최대 재화량 도달, 타이머 중지 및 부모에게 알림");
        setTimerState(prev => ({ ...prev, isRunning: false }));
        onDataChange?.({
          characterId,
          type,
          current: config.max,
          isRunning: false,
          nextChargeTime: null,
          fullChargeTime: null,
          max: config.max,
        });
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
      logger.debug("CurrencyTimer: useEffect 클린업 - requestAnimationFrame 취소");
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
        <Badge variant="secondary">
          {timerState.current}/{config.max}
        </Badge>
      </div>
      <div className="space-y-4">
        {!dashboardMode && (
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="현재 재화량"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              min={0}
              max={config.max}
            />
            <Button onClick={startTimer} disabled={timerState.isRunning || !inputValue}>
              타이머 시작
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {!dashboardMode && (
            <Button onClick={stopTimer} variant="outline" disabled={!timerState.isRunning}>
              타이머 중지
            </Button>
          )}
          {!dashboardMode && (
            <Button
              onClick={() => setInputValue(String(timerState.current))}
              variant="outline"
              disabled={!inputValue || timerState.isRunning}
            >
              현재량으로 설정
            </Button>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>다음 충전까지:</span>
            <span className="font-medium">{timeDisplay.nextCharge}</span>
          </div>
          <div className="flex justify-between">
            <span>완전 충전까지:</span>
            <span className="font-medium">{timeDisplay.fullCharge}</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full"
            style={{
              width: `${(timerState.current / config.max) * 100}%`,
              backgroundColor: config.color.replace("text-", "").replace("-600", "-500"),
            }}
          ></div>
        </div>
      </div>
    </div>
  )
})
