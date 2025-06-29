"use client"

import React, { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, Zap } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
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

  // Define a pure helper function that doesn't use hooks itself
  const calculateTimesPure = (current: number, currentConfig: CurrencyConfig) => {
    if (current >= currentConfig.max) {
      return { nextChargeTime: null, fullChargeTime: null };
    }

    const now = new Date();
    let nextChargeTime = new Date(now.getTime() + currentConfig.intervalMinutes * 60 * 1000);
    while (nextChargeTime <= now) {
      nextChargeTime = new Date(nextChargeTime.getTime() + currentConfig.intervalMinutes * 60 * 1000);
    }

    const remainingCharges = currentConfig.max - current;
    const fullChargeTime = new Date(now.getTime() + remainingCharges * currentConfig.intervalMinutes * 60 * 1000);

    return { nextChargeTime, fullChargeTime };
  };

  // Now, wrap it in useCallback for memoization when used in other effects/callbacks
  const calculateTimes = useCallback(
    (current: number) => calculateTimesPure(current, config),
    [config] // Dependency on memoized config
  );

  // Initialize timerState from initialTimerState prop or default
  const [timerState, setTimerState] = useState<TimerState>(() => {
    logger.debug("CurrencyTimer: useState initializer 호출", { initialTimerState });
    if (initialTimerState) {
      // Use the pure function directly here, passing config explicitly
      const { nextChargeTime: calculatedNextChargeTime, fullChargeTime: calculatedFullChargeTime } = calculateTimesPure(initialTimerState.current, config);

      return {
        current: initialTimerState.current,
        isRunning: initialTimerState.isRunning,
        nextChargeTime: calculatedNextChargeTime,
        fullChargeTime: calculatedFullChargeTime,
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
    logger.debug("[CurrencyTimer] useEffect triggered", { initialTimerState });
    // initialTimerState이 없으면 아무것도 하지 않습니다.
    if (!initialTimerState) {
      logger.debug("[CurrencyTimer] initialTimerState is null or undefined, returning.");
      return;
    }

    // 부모에서 내려준 값이 실제로 바뀌었을 때만 업데이트
    const newCurrent = initialTimerState.current;
    const newIsRunning = initialTimerState.isRunning;
    logger.debug("[CurrencyTimer] Checking for changes in current/isRunning", { newCurrent, newIsRunning, timerStateCurrent: timerState.current, timerStateIsRunning: timerState.isRunning });
    if (
      newCurrent === timerState.current &&
      newIsRunning === timerState.isRunning
    ) {
      logger.debug("[CurrencyTimer] current and isRunning are unchanged, early returning to prevent loop.");
      return; // 값이 같으면 루프를 방지하기 위해 종료
    }

    logger.debug("[CurrencyTimer] Updating timerState due to change in initialTimerState", { newCurrent, newIsRunning });
    const { nextChargeTime, fullChargeTime } = calculateTimes(newCurrent);
    const newState: TimerState = {
      current: newCurrent,
      isRunning: newIsRunning,
      nextChargeTime,
      fullChargeTime,
    };

    setTimerState(newState);
    logger.debug("[CurrencyTimer] Calling onDataChange", { characterId, type, current: newCurrent, isRunning: newIsRunning });
    onDataChange?.({
      characterId,
      type,
      current: newCurrent,
      isRunning: newIsRunning,
      nextChargeTime: nextChargeTime?.toISOString() ?? null,
      fullChargeTime: fullChargeTime?.toISOString() ?? null,
    });
  // 의존성은 initialTimerState.current, initialTimerState.isRunning만
  }, [
    initialTimerState?.current,
    initialTimerState?.isRunning,
  ]);
  
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
  }, [timerState.isRunning, timerState.nextChargeTime, timerState.current, config, calculateTimes, formatTime, onDataChange, characterId, type])

  // Set initial time display based on initialTimerState (if provided) or default
  useEffect(() => {
    logger.debug("CurrencyTimer: useEffect - 초기 시간 디스플레이 설정", { initialTimerState: timerState });
    setTimeDisplay({
      nextCharge: formatTime(timerState.nextChargeTime),
      fullCharge: formatTime(timerState.fullChargeTime),
    });
    setInputValue(timerState.current.toString()); // 현재 재화량으로 input value 초기화
  }, [timerState, formatTime]);

  const handleSetCurrentAmount = useCallback(() => {
    logger.debug("CurrencyTimer: handleSetCurrentAmount 호출", { inputValue });
    const newCurrent = Number.parseInt(inputValue) || 0;
    if (newCurrent < 0 || newCurrent > config.max) return;
  
    const { nextChargeTime, fullChargeTime } = calculateTimes(newCurrent);
  
    const newTimerState = {
      current: newCurrent,
      isRunning: newCurrent < config.max, // 현재량이 최대보다 작으면 실행, 아니면 중지
      nextChargeTime: newCurrent < config.max ? nextChargeTime : null,
      fullChargeTime: newCurrent < config.max ? fullChargeTime : null,
    };
  
    setTimerState(newTimerState);
  
    onDataChange?.({
      characterId,
      type,
      current: newCurrent,
      isRunning: newTimerState.isRunning,
      nextChargeTime: newTimerState.nextChargeTime ? newTimerState.nextChargeTime.toISOString() : null,
      fullChargeTime: newTimerState.fullChargeTime ? newTimerState.fullChargeTime.toISOString() : null,
    });
  }, [inputValue, config, calculateTimes, characterId, type, onDataChange]);

  const progressPercentage = useMemo(() => (timerState.current / config.max) * 100, [timerState.current, config.max])

  return (
    <Card className="currency-timer-card relative">
      {/* {dashboardMode && (
        <Badge
          className="absolute top-3 right-3 text-xs"
          variant={timerState.isRunning ? "default" : "secondary"}
        >
          {characterName}
        </Badge>
      )} */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center space-x-2">
          <config.icon className="w-4 h-4" />
          <span>{config.name}</span>
        </CardTitle>
        <Badge variant="outline" className="text-sm">
          {timerState.current}/{config.max}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{timeDisplay.fullCharge === "00:00:00" ? "완료" : timeDisplay.fullCharge}</div>
        <p className="text-xs text-muted-foreground">
          다음 충전까지: {timeDisplay.nextCharge === "00:00:00" ? "완료" : timeDisplay.nextCharge}
        </p>
        {!dashboardMode && (
          <div className="flex items-center space-x-2 mt-4">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-24"
              placeholder="수량"
            />
            <Button onClick={startTimer} className="flex-1">
              타이머 시작
            </Button>
            <Button onClick={stopTimer} className="flex-1" variant="outline">
              타이머 중지
            </Button>
          </div>
        )}
        {!dashboardMode && (
          <Button onClick={handleSetCurrentAmount} className="w-full mt-2" variant="secondary">
              현재량으로 설정
          </Button>
        )}
      </CardContent>
    </Card>
  )
})
