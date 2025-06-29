## 발생 이유
`components/currency-timer.tsx` 파일의 `useEffect` 훅에서 `initialTimerState` prop의 변경을 감지하여 `timerState`를 업데이트할 때, `onDataChange` 콜백이 부모 상태를 갱신하고, 이로 인해 다시 `initialTimerState` prop이 변경되어 `useEffect`가 반복적으로 실행되는 무한 루프가 발생했습니다.

## 재현 절차
1. `CurrencyTimer` 컴포넌트가 사용되는 페이지로 이동합니다 (예: 타이머 탭 또는 대시보드 탭).
2. `initialTimerState` prop이 변경되는 조건(예: 데이터 로드 또는 초기화)을 만족시킵니다.
3. 콘솔에서 "Maximum update depth exceeded" 오류가 발생하는지 확인합니다.

## 기대 동작
`initialTimerState` prop이 변경될 때 `useEffect`가 한 번만 실행되며, 무한 루프 없이 정상적으로 `timerState`가 초기화 및 업데이트됩니다.

## 해결된 코드
`components/currency-timer.tsx` 파일에서 `useEffect`의 의존성 배열을 `initialTimerState?.current`와 `initialTimerState?.isRunning`으로 최소화하고, `timerState`와 비교하여 값이 동일할 경우 조기 반환하는 방어 코드를 추가했습니다. 