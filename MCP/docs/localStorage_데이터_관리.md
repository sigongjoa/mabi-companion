# LocalStorage 데이터 관리

이 문서에서는 애플리케이션에서 `localStorage`를 사용하여 관리되는 데이터 항목들을 설명합니다.

## 저장되는 데이터 항목

*   **`mabinogi-favorites`**
    *   **설명**: 사용자가 즐겨찾기로 추가한 아이템들의 목록을 JSON 형식으로 저장합니다.
    *   **위치**: `contexts/favorites-context.tsx`에서 관리됩니다.

*   **`characters`**
    *   **설명**: 사용자가 생성하거나 관리하는 캐릭터들의 정보를 JSON 형식으로 저장합니다. 각 캐릭터는 고유 ID, 이름, 기타 관련 데이터를 포함할 수 있습니다.
    *   **위치**: `contexts/character-context.tsx`에서 관리됩니다.

*   **`activeCharacterId`**
    *   **설명**: 현재 활성화되어 있는 캐릭터의 고유 ID를 문자열로 저장합니다. 이 ID는 `characters` 목록의 캐릭터 중 하나와 일치합니다.
    *   **위치**: `contexts/character-context.tsx`에서 관리됩니다.

*   **`viewMode`**
    *   **설명**: 캐릭터 보기 모드를 저장합니다. 가능한 값은 "single" (단일 캐릭터 보기) 또는 "all" (모든 캐릭터 보기)입니다.
    *   **위치**: `contexts/character-context.tsx`에서 관리됩니다.

*   **`characterGems`**
    *   **설명**: 캐릭터와 관련된 보석 정보를 JSON 형식으로 저장합니다. 이 데이터는 캐릭터별 보석 인벤토리 또는 장착 상태를 나타낼 수 있습니다.
    *   **위치**: `app/gems/page.tsx`에서 관리됩니다.

*   **`craftingQueues`**
    *   **설명**: 각 캐릭터의 가공 시설 큐 상태를 JSON 형식으로 저장합니다. 현재 진행 중이거나 대기 중인 가공 작업에 대한 정보를 포함합니다.
    *   **위치**: `contexts/character-context.tsx`에서 `characters` 데이터의 일부로 관리됩니다.

*   **`inventory`**
    *   **설명**: 각 캐릭터의 인벤토리 아이템 및 수량을 JSON 형식으로 저장합니다. 아이템 ID를 키로, 수량을 값으로 가집니다.
    *   **위치**: `contexts/character-context.tsx`에서 `characters` 데이터의 일부로 관리됩니다.

*   **`currencyTimers`**
    *   **설명**: 각 캐릭터의 재화 충전 타이머 상태 (은동전, 마족공물 등)를 JSON 형식으로 저장합니다. 현재 값, 타이머 실행 여부, 다음 충전 시간, 전체 충전 시간을 포함합니다.
    *   **위치**: `contexts/character-context.tsx`에서 `characters` 데이터의 일부로 관리됩니다.

*   **`isSidebarOpen`**
    *   **설명**: 사이드바의 열림/닫힘 상태를 불리언(boolean) 값 (문자열 "true" 또는 "false")으로 저장합니다.
    *   **위치**: `app/ClientProviders.tsx`에서 관리됩니다. 