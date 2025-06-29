## 발생 이유
`components/currency-timer.tsx` 파일의 `useEffect` 훅에서 `initialTimerState` prop의 변경을 감지하여 `timerState`를 업데이트할 때, `onDataChange` 콜백이 부모 상태를 갱신하고, 이로 인해 다시 `initialTimerState` prop이 변경되어 `useEffect`가 반복적으로 실행되는 무한 루프가 발생했습니다. 또한, 대시보드 페이지에 불필요한 UI 요소 및 중복된 섹션이 존재했습니다.

## 재현 절차
1. `CurrencyTimer` 컴포넌트가 사용되는 페이지로 이동합니다 (예: 타이머 탭 또는 대시보드 탭).
2. `initialTimerState` prop이 변경되는 조건(예: 데이터 로드 또는 초기화)을 만족시킵니다.
3. 콘솔에서 "Maximum update depth exceeded" 오류가 발생하는지 확인합니다.
4. 대시보드 페이지에서 재화 타이머 관련 UI가 복잡하거나 중복되는지 확인합니다.

## 기대 동작
`initialTimerState` prop 변경 시 `useEffect`가 한 번만 실행되며, 무한 루프 없이 정상적으로 `timerState`가 초기화 및 업데이트됩니다. 대시보드 페이지에서는 간소화된 재화 타이머 UI가 표시되며, 불필요한 요소나 중복된 섹션이 제거됩니다.

## 해결된 코드

### `components/currency-timer.tsx` 수정
- `useEffect`의 의존성 배열을 `initialTimerState?.current`와 `initialTimerState?.isRunning`으로 최소화하고, `timerState`와 비교하여 값이 동일할 경우 조기 반환하는 방어 코드를 추가했습니다.
- `dashboardMode` prop이 `true`일 때 재화량 입력 필드와 타이머 시작/정지 버튼이 렌더링되지 않도록 조건부 렌더링을 적용했습니다.
- 재화 수량 옆에 표시되던 작은 캐릭터명 배지를 제거했습니다.

```typescript
// components/currency-timer.tsx (수정된 useEffect 부분)
// ... existing code ...
  useEffect(() => {
    logger.debug("[CurrencyTimer] useEffect triggered", { initialTimerState });
    if (!initialTimerState) {
      logger.debug("[CurrencyTimer] initialTimerState is null or undefined, returning.");
      return;
    }

    const newCurrent = initialTimerState.current;
    const newIsRunning = initialTimerState.isRunning;
    logger.debug("[CurrencyTimer] Checking for changes in current/isRunning", { newCurrent, newIsRunning, timerStateCurrent: timerState.current, timerStateIsRunning: timerState.isRunning });
    if (
      newCurrent === timerState.current &&
      newIsRunning === timerState.isRunning
    ) {
      logger.debug("[CurrencyTimer] current and isRunning are unchanged, early returning to prevent loop.\n");
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
  }, [
    initialTimerState?.current,
    initialTimerState?.isRunning,
  ]);
// ... existing code ...

// components/currency-timer.tsx (UI 간소화 부분)
// ... existing code ...
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
// ... existing code ...
```

### `app/timers/page.tsx` 수정
- `handleCurrencyDataChange` 함수가 `activeCharacter`가 아닌 `data.characterId`를 사용하여 해당 캐릭터를 찾아 타이머 데이터를 업데이트하도록 변경했습니다.
- `logger` import 경로를 `@/lib/logger`로 수정했습니다.

```typescript
// app/timers/page.tsx (handleCurrencyDataChange 함수 부분)
// ... existing code ...
  const handleCurrencyDataChange = (data: any) => {
    logger.debug("handleCurrencyDataChange 호출됨", { data });
    const { characterId, type, current, isRunning, nextChargeTime, fullChargeTime } = data;

    const targetCharacter = characters.find(char => char.id === characterId);

    if (!targetCharacter) {
      logger.debug("handleCurrencyDataChange: Target character not found. Exiting.", { characterId });
      return;
    }

    const updatedCurrencyTimers = {
      ...targetCharacter.currencyTimers,
      [type]: {
        current,
        isRunning,
        nextChargeTime,
        fullChargeTime,
      },
    };
    logger.debug("handleCurrencyDataChange: Updating character with new currencyTimers:", { characterId, updatedCurrencyTimers });
    updateCharacter(characterId, { currencyTimers: updatedCurrencyTimers });
  };
// ... existing code ...
```

### `components/currency-timers-container.tsx` 수정
- 테이블에서 캐릭터 이름의 글자 크기를 `text-lg`로 늘렸습니다.

```typescript
// components/currency-timers-container.tsx
// ... existing code ...
                  <TableRow key={character.id}>
                    <TableCell className="font-medium text-lg">
                      {character.name}
                      <span className="text-gray-500 text-sm ml-2">(Lv.{character.level})</span>
                    </TableCell>
// ... existing code ...
```

### `app/page.tsx` 수정
- 대시보드 페이지에서 상단의 중복된 "재화 충전 타이머" 섹션을 주석 처리하여 제거했습니다.
- 대시보드 페이지에 노출되던 불필요한 `*/} */}` 문자열을 제거했습니다.

```typescript
// app/page.tsx
// ... existing code ...
        {/* 재화 충전 타이머 */}
        {/* <CharacterScopedHeader title="재화 충전 타이머" icon={Clock} /> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CurrencyTimersContainer characters={characters} handleCurrencyDataChange={handleCurrencyDataChange} dashboardMode={true} />
        </div>

        {/* Completed Crafting Timers 섹션 제거 */}
// ... existing code ...

// app/page.tsx (불필요한 주석 제거)
// ... existing code ...
                {/* Dynamically display other key items */}
                {/* {Object.entries(char.inventory || {}).map(([itemId, quantity]) => { } */} 
                  {/* const item = itemsData[itemId]; */}
                {/* if (!item || !['골드', '두카트'].includes(item.name)) return null; // Filter out gold and ducats if already displayed */}
                {/* return ( */}
// ... existing code ...
```

</rewritten_file>