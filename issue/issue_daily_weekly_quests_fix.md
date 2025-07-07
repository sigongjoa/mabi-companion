---
title: "일일/주간 숙제 개수 계산 오류 및 용어 통일, 알림 시스템 개선"
labels: "bug, enhancement, frontend"
assignees: ""
---

## 🐞 버그 수정

### 일일/주간 숙제 개수 불일치 문제 해결
- `app/page.tsx`에서 `getDailyQuestCount` 및 `getWeeklyQuestCount` 함수가 완료된 숙제만 정확하게 집계하도록 수정되었습니다.
- `getTotalDailyQuests` 및 `getTotalWeeklyQuests` 함수가 `public/data/quests.json` 데이터를 기반으로 총 숙제 수를 동적으로 계산하도록 변경되었습니다.
- `contexts/character-context.tsx`의 `createInitialQuestProgress` 함수가 `public/data/quests.json`에 현재 존재하는 숙제 ID만 병합하고, 오래된 숙제 ID는 명시적으로 제거하도록 수정되어 데이터 동기화 문제를 해결했습니다.
- `app/quests/page.tsx`에서 `logger`가 정의되지 않았던 런타임 오류를 `import { logger } from "@/lib/logger";` 추가로 해결했습니다.
- `app/characters/page.tsx`에서 길드 이름이 있는 캐릭터가 목록에서 제외되던 `!character.guildName` 필터링 조건을 제거하여 모든 캐릭터가 올바르게 표시되도록 수정했습니다.

### 타이머 무한 루프 및 캐릭터별 독립 작동 문제 해결
- `components/currency-timer.tsx`의 `useEffect` 훅에서 발생하던 무한 루프 문제를 해결하기 위해 의존성 배열을 `initialTimerState?.current`와 `initialTimerState?.isRunning`으로 설정했습니다.
- `app/timers/page.tsx`의 `handleCurrencyDataChange` 함수가 `activeCharacter` 대신 `data.characterId`를 사용하여 특정 캐릭터의 타이머 데이터를 업데이트하도록 수정하여, 타이머가 캐릭터마다 독립적으로 작동하도록 했습니다.
- `logger.debug`를 사용하여 디버깅 로그를 추가했습니다.

### UI 오류 수정
- 대시보드 페이지에 `*/} */}` 문자열이 보이는 문제를 `app/page.tsx`에서 잘못된 주석 처리를 제거하여 해결했습니다.

## ✨ 개선 사항

### 용어 통일 ("퀘스트"를 "숙제"로 변경)
- 사용자 요청에 따라 "퀘스트"라는 용어가 "숙제"로 통일되었습니다. 다음 파일들에서 관련 텍스트가 수정되었습니다:
  - `app/page.tsx`
  - `app/quests/page.tsx`
  - `components/sidebar.tsx`
  - `components/character-selector.tsx`
  - `app/guides/page.tsx`
  - `app/favorites/page.tsx`

### 대시보드 `CurrencyTimer` 컴포넌트 간소화
- `components/currency-timer.tsx`에 `dashboardMode` prop을 추가하여, 대시보드에서는 타이머 기능(입력 필드, 시작/정지 버튼)을 숨기고 현재 재화량만 표시하도록 간소화했습니다.

### 대시보드 UI 개선
- `components/currency-timers-container.tsx`에서 캐릭터 이름의 글자 크기를 `text-lg`로 늘려 시인성을 높였습니다.
- `components/currency-timer.tsx`에서 재화 수량 옆에 보이던 작은 캐릭터명 배지를 제거했습니다.

### 알림 시스템 자체 구현 및 교체
- `shadcn/ui` 토스트 라이브러리 대신, 사용자 요청에 따라 간단한 알림 배너를 자체 구현했습니다.
- `/contexts/notification-context.tsx` 파일을 생성하여 `NotificationProvider`와 `useNotification` 훅을 구현했습니다.
- `app/ClientProviders.tsx`에서 기존 `Toaster` 및 `ToastViewport` 관련 import와 컴포넌트를 제거하고 `NotificationProvider`로 대체했습니다.
- `app/characters/page.tsx`에서 `useToast` import 및 `toast()` 호출을 제거하고 `useNotification` 훅을 사용하여 `notify()`를 호출하도록 변경했습니다.
- `app/page.tsx`에서 테스트용 토스트 버튼 및 `useToast` import를 제거했습니다.
- 다음 파일들을 삭제했습니다: `components/ui/toaster.tsx`, `components/ui/use-toast.ts`, `components/ui/toast.tsx`, `hooks/use-toast.ts`.
- `app/ClientProviders.tsx`에서 `isSidebarOpen` 상태 초기화 로직을 수정하여 하이드레이션 오류를 해결했습니다.
- `contexts/character-context.tsx`에서 `defaultCharacters` 배열을 주석 처리하고, `localStorage`에 저장된 캐릭터가 없을 경우 `initialCharacters`를 빈 배열로 초기화하도록 수정하여 "기사단장 테오"가 기본으로 표시되던 문제를 해결했습니다.

### 캐릭터 관리 페이지 개선
- `app/characters/page.tsx`에서 "활성화" 버튼 텍스트를 "선택"으로 변경했습니다.
- `setActiveCharacter` 호출 시 `character.id` 대신 전체 `character` 객체를 전달하도록 수정했습니다.
- 선택 버튼 클릭 시 `useNotification` 훅을 사용하여 알림창이 뜨도록 구현했습니다.

### 헤더 및 사이드바 개선
- `components/character-scoped-header.tsx`를 수정하여 `viewMode === "single"` 조건을 제거하고 항상 활성 캐릭터 정보를 표시하도록 했습니다.
- `components/sidebar.tsx`를 수정하여 `useCharacter` 훅을 임포트하고 상단 헤더에 활성 캐릭터 이름을 표시하도록 했습니다.
- `app/quests/page.tsx`의 커스텀 헤더를 `CharacterScopedHeader`로 교체했습니다.

**영향을 받는 파일:**

*   `app/page.tsx`
*   `app/quests/page.tsx`
*   `contexts/character-context.tsx`
*   `public/data/quests.json`
*   `components/sidebar.tsx`
*   `components/character-selector.tsx`
*   `app/guides/page.tsx`
*   `app/favorites/page.tsx`

**테스트:**

*   대시보드와 숙제 페이지에서 일일/주간 숙제 개수가 작업을 켜고 끄고 새로고침한 후에도 정확하게 반영되는지 확인했습니다.
*   "퀘스트"의 모든 인스턴스가 "숙제"로 성공적으로 대체되었음을 확인했습니다.
*   새로운 런타임 오류가 발생하지 않음을 확인했습니다. 