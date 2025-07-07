### **페이지별 기능 및 컴포넌트 정리**

#### **1. 홈/대시보드 (`/`, `app/page.tsx`)**

*   **핵심 기능**: 애플리케이션의 메인 대시보드 페이지로, 캐릭터의 주요 정보(레벨, 전투력 등), 즐겨찾기 아이템, 최근 활동 요약 등을 한눈에 볼 수 있도록 제공합니다.
*   **주요 기능**:
    *   활성 캐릭터 정보 표시 (이름, 레벨, 직업).
    *   즐겨찾기 아이템 목록 표시.
    *   최근 추가된 아이템, 퀘스트, 타이머 등 요약 정보.
    *   캐릭터 선택 및 변경 기능.
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `PageHeader`: 페이지 상단 제목 및 설명.
        *   `CharacterSelector`: 활성 캐릭터를 선택하고 변경하는 드롭다운.
        *   `FavoriteToggle`: 즐겨찾기 상태를 토글하는 버튼.
    *   **Shadcn UI 컴포넌트**:
        *   `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`: 정보 블록을 구성.
        *   `Avatar`, `AvatarFallback`, `AvatarImage`: 캐릭터 아바타 표시.
        *   `Badge`: 상태나 카테고리 표시.
        *   `Button`: 액션 버튼.
        *   `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`: 데이터 테이블 표시.
    *   **컨텍스트/훅**:
        *   `useCharacter`: 캐릭터 데이터 및 활성 캐릭터 관리.
        *   `useNotification`: 알림 표시.
    *   **유틸리티**: `cn` (클래스 조건부 적용).

#### **2. AI 어시스턴트 (`/assistant`, `app/assistant/page.tsx`)**

*   **핵심 기능**: LLM(Large Language Model) 기반의 AI 챗봇과 대화하고, 필요에 따라 로컬 스토리지 데이터나 RAG(Retrieval-Augmented Generation) 컨텍스트를 LLM에 제공하여 답변의 정확성과 관련성을 높입니다.
*   **주요 기능**:
    *   LLM 제공자(LM Studio, OpenAI, Google Gemini) 선택.
    *   LM Studio 모델 목록 동적 로드.
    *   채팅 기록 표시 (사용자 메시지, AI 응답).
    *   로컬 스토리지 데이터(캐릭터, 인벤토리 등)를 선택하여 LLM에 컨텍스트로 전송.
    *   RAG 컨텍스트 사용 여부 선택 (체크박스).
    *   RAG 컨텍스트가 사용된 경우, 참조 문서를 아코디언 형태로 표시하여 사용자가 내용을 확인 가능.
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `PageHeader`: 페이지 상단 제목 및 설명.
        *   `DataSelectionModal`: 로컬 스토리지 데이터 선택 모달.
    *   **Shadcn UI 컴포넌트**:
        *   `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`: LLM 제공자 및 모델 선택.
        *   `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`: RAG 참조 문서 표시.
        *   `Input` (내부적으로 사용): 텍스트 입력 필드.
        *   `Button`: 메시지 전송, 모달 열기/닫기.
        *   `Label`: 폼 요소 라벨.
    *   **컨텍스트/훅**:
        *   `useCharacter`: 활성 캐릭터 정보 접근 (로컬 스토리지 데이터 로드 시).
    *   **유틸리티**: `logger` (디버깅 로그), `getLLMService` (LLM 서비스 인스턴스화).

#### **3. 아바타 (`/avatar`, `app/avatar/page.tsx`)**

*   **핵심 기능**: 마비노기 모바일의 아바타 세트 정보를 검색하고 표시합니다.
*   **주요 기능**:
    *   아바타 세트 목록 표시 (이름, 카테고리, 설명, 포함 아이템).
    *   카테고리별 필터링 (탭).
    *   검색어 기반 필터링.
    *   아바타 세트 아이콘 및 이미지 표시.
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `CharacterScopedHeader`: 캐릭터 정보와 함께 페이지 제목 표시.
    *   **Shadcn UI 컴포넌트**:
        *   `Card`, `CardContent`, `CardHeader`, `CardTitle`: 아바타 세트 정보 카드.
        *   `Badge`: 아바타 세트 카테고리 표시.
        *   `Avatar`, `AvatarFallback`, `AvatarImage`: 아바타 세트 아이콘 표시.
        *   `Input`: 검색어 입력.
        *   `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`: 카테고리 필터링.
    *   **컨텍스트/훅**:
        *   `useCharacter`: `allAvatarSets` 데이터 로드.
    *   **유틸리티**: `logger`.

#### **4. 캐릭터 관리 (`/character-management`, `app/character-management/page.tsx`)**

*   **핵심 기능**: 현재 활성 캐릭터의 인벤토리, 칭호, 퀘스트, 능력치 데이터를 한눈에 확인하고, 모달을 통해 데이터를 추가/수정할 수 있습니다.
*   **주요 기능**:
    *   활성 캐릭터의 이름 표시.
    *   능력치(레벨, HP, 스탯 등) 요약 표시.
    *   인벤토리 아이템 목록 표시 (이름, 수량, 착용 여부).
    *   획득 칭호 목록 표시 (이름, 획득 일시).
    *   퀘스트 목록 표시 (이름, 완료 여부).
    *   데이터 추가/수정 모달을 통해 인벤토리 아이템, 칭호, 퀘스트, 능력치 데이터 입력.
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `PageHeader`: 페이지 상단 제목 및 설명.
        *   `DataInputModal`: 데이터 입력/수정 모달.
    *   **Shadcn UI 컴포넌트**:
        *   `Button`: 데이터 추가/수정 버튼.
        *   `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`: 데이터 입력 모달.
        *   `Input`: 모달 내 폼 입력 필드.
        *   `Label`: 폼 요소 라벨.
        *   `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`: 인벤토리, 칭호, 퀘스트 목록 표시.
    *   **컨텍스트/훅**:
        *   `useCharacter`: 활성 캐릭터 데이터 접근 및 업데이트.
    *   **유틸리티**: `logger`.

#### **5. 캐릭터 (`/characters`, `app/characters/page.tsx`)**

*   **핵심 기능**: 캐릭터 목록을 관리하고, 새로운 캐릭터를 추가하거나 기존 캐릭터를 삭제하며, 활성 캐릭터를 설정합니다.
*   **주요 기능**:
    *   캐릭터 목록 표시 (이름, 레벨, 직업).
    *   새 캐릭터 추가 폼.
    *   캐릭터 삭제 기능.
    *   활성 캐릭터 설정 기능.
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `PageHeader`: 페이지 상단 제목 및 설명.
    *   **Shadcn UI 컴포넌트**:
        *   `Card`, `CardContent`, `CardHeader`, `CardTitle`: 캐릭터 정보 카드.
        *   `Button`: 캐릭터 추가, 삭제, 활성 설정 버튼.
        *   `Input`: 캐릭터 이름, 레벨, 직업 입력.
        *   `Label`: 폼 요소 라벨.
        *   `Avatar`, `AvatarFallback`: 캐릭터 아바타 표시.
        *   `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`: 직업 선택.
    *   **컨텍스트/훅**:
        *   `useCharacter`: 캐릭터 목록 관리, 활성 캐릭터 설정.
    *   **유틸리티**: `cn`, `logger`.

#### **6. 제작 (`/crafting`, `app/crafting/page.tsx`)**

*   **핵심 기능**: 아이템 제작 레시피를 확인하고, 제작 가능한 아이템을 필터링하며, 제작 큐를 관리합니다.
*   **주요 기능**:
    *   레시피 목록 표시 (결과 아이템, 재료, 제작 시간).
    *   보유 재료 기반 제작 가능 아이템 필터링.
    *   제작 큐에 아이템 추가 및 관리.
    *   제작 타이머 표시.
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `PageHeader`: 페이지 상단 제목 및 설명.
        *   `CraftingQueueItem`: 제작 큐의 개별 아이템.
        *   `CraftingTimerPopup`: 제작 완료 알림 팝업.
    *   **Shadcn UI 컴포넌트**:
        *   `Card`, `CardContent`, `CardHeader`, `CardTitle`: 레시피 정보 카드.
        *   `Button`: 제작 시작, 큐 관리 버튼.
        *   `Input`: 검색어 입력.
        *   `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`: 레시피 필터링.
        *   `Progress`: 제작 진행률 표시.
        *   `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`: 제작 완료 팝업.
    *   **컨텍스트/훅**:
        *   `useCharacter`: 인벤토리, 레시피, 제작 큐 데이터 관리.
        *   `useNotification`: 알림 표시.
    *   **유틸리티**: `cn`, `logger`.

#### **7. 장비 (`/equipment`, `app/equipment/page.tsx`)**

*   **핵심 기능**: 캐릭터의 장비 아이템 목록을 확인하고 관리합니다. (파일이 제공되지 않아 `npm run build` 출력 기반으로 추정)
*   **주요 기능**:
    *   장비 아이템 목록 표시.
    *   장비 착용/해제 기능.
    *   장비 상세 정보 표시.
*   **주요 컴포넌트**: (추정)
    *   `PageHeader` 또는 `CharacterScopedHeader`.
    *   `Table` 또는 `Card` 기반의 아이템 목록.
    *   `Button`, `Input` 등.
    *   `useCharacter` 컨텍스트.

#### **8. 즐겨찾기 (`/favorites`, `app/favorites/page.tsx`)**

*   **핵심 기능**: 사용자가 즐겨찾기로 표시한 아이템, 레시피, 퀘스트 등을 한곳에 모아 보여줍니다.
*   **주요 기능**:
    *   즐겨찾기 아이템, 레시피, 퀘스트 목록 표시.
    *   각 즐겨찾기 항목의 상세 정보 요약.
    *   즐겨찾기 해제 기능.
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `PageHeader`: 페이지 상단 제목 및 설명.
        *   `FavoriteToggle`: 즐겨찾기 상태를 토글하는 버튼.
    *   **Shadcn UI 컴포넌트**:
        *   `Card`, `CardContent`, `CardHeader`, `CardTitle`: 즐겨찾기 항목 카드.
        *   `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`: 즐겨찾기 카테고리 필터링.
        *   `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`: 목록 표시.
    *   **컨텍스트/훅**:
        *   `useCharacter`: 즐겨찾기 데이터 접근.
    *   **유틸리티**: `cn`, `logger`.

#### **9. 보석 (`/gems`, `app/gems/page.tsx`)**

*   **핵심 기능**: 캐릭터가 보유한 보석 아이템을 관리하고, 보석의 등급별 효과를 확인합니다.
*   **주요 기능**:
    *   보석 목록 표시 (이름, 등급, 효과, 수량).
    *   보석 수량 증감 기능.
    *   보석 즐겨찾기 기능.
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `PageHeader`: 페이지 상단 제목 및 설명.
        *   `FavoriteToggle`: 즐겨찾기 상태를 토글하는 버튼.
    *   **Shadcn UI 컴포넌트**:
        *   `Card`, `CardContent`, `CardHeader`, `CardTitle`: 보석 정보 카드.
        *   `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`: 보석 목록 표시.
        *   `Button`: 수량 증감 버튼.
        *   `Input`: 수량 직접 입력.
        *   `Badge`: 보석 등급 표시.
        *   `Switch`, `Label`: 즐겨찾기만 보기 토글.
    *   **컨텍스트/훅**:
        *   `useCharacter`: 보석 데이터 관리.
    *   **유틸리티**: `cn`, `logger`.

#### **10. 가이드 (`/guides`, `app/guides/page.tsx`)**

*   **핵심 기능**: 던전 정보, 무한 채집, 직업 가이드, 룬 티어, 전투력 상승 팁 등 게임 플레이에 필요한 다양한 가이드 정보를 제공합니다.
*   **주요 기능**:
    *   다양한 가이드 카테고리 (던전, 무한 채집, 직업, 룬, 전투력) 탭으로 전환.
    *   각 가이드 섹션별 상세 정보 표시 (테이블, 카드).
    *   검색어 기반 필터링.
*   **주요 컴포넌트**:
    *   **Shadcn UI 컴포넌트**:
        *   `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`: 가이드 정보 카드.
        *   `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`: 가이드 카테고리 전환.
        *   `Input`: 검색어 입력.
        *   `Badge`: 룬 티어, 직업 태그 표시.
        *   `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`: 데이터 테이블 표시.
    *   **훅**: `useState`, `useMemo`.
    *   **유틸리티**: `cn`.

#### **11. 인벤토리 (`/inventory`, `app/inventory/page.tsx`)**

*   **핵심 기능**: 캐릭터의 통합 인벤토리를 관리하고, 아이템 수량을 조절하며, 이미지 파싱을 통해 인벤토리를 업데이트합니다.
*   **주요 기능**:
    *   인벤토리 아이템 목록 표시 (이름, 카테고리, 수량).
    *   아이템 수량 증감 및 직접 입력.
    *   카테고리별 필터링.
    *   즐겨찾기 아이템만 보기.
    *   제작 가능한 아이템 목록 표시.
    *   보석 인벤토리 관리.
    *   이미지 기반 인벤토리 파싱 기능.
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `ImageInventoryParser`: 이미지 기반 인벤토리 파싱.
        *   `FavoriteToggle`: 즐겨찾기 상태 토글.
    *   **Shadcn UI 컴포넌트**:
        *   `Card`, `CardContent`, `CardHeader`, `CardTitle`: 인벤토리 섹션 카드.
        *   `Button`: 수량 조절, 카테고리 필터 버튼.
        *   `Input`: 수량 입력, 검색어 입력.
        *   `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`: 메인 탭 (인벤토리, 제작 가능, 보석, 이미지 파싱).
        *   `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`: 아이템 및 보석 목록.
        *   `Badge`: 아이템 수량, 보석 등급.
        *   `Switch`, `Label`: 즐겨찾기만 보기 토글.
    *   **컨텍스트/훅**:
        *   `useCharacter`: 인벤토리, 보석, 레시피, 아이템 데이터 관리.
    *   **유틸리티**: `cn`, `logger`.

#### **12. 퀘스트 (`/quests`, `app/quests/page.tsx`)**

*   **핵심 기능**: 일일/주간 퀘스트 목록을 관리하고, 완료 상태를 추적하며, 보상을 확인합니다.
*   **주요 기능**:
    *   퀘스트 목록 표시 (이름, 유형, 완료 상태, 보상).
    *   퀘스트 완료 상태 토글.
    *   퀘스트 즐겨찾기 기능.
    *   퀘스트 필터링 (완료/미완료, 일일/주간).
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `PageHeader`: 페이지 상단 제목 및 설명.
        *   `FavoriteToggle`: 즐겨찾기 상태 토글.
    *   **Shadcn UI 컴포넌트**:
        *   `Card`, `CardContent`, `CardHeader`, `CardTitle`: 퀘스트 정보 카드.
        *   `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`: 퀘스트 목록.
        *   `Button`: 퀘스트 완료 토글.
        *   `Badge`: 퀘스트 유형 표시.
        *   `Switch`, `Label`: 즐겨찾기만 보기 토글.
    *   **컨텍스트/훅**:
        *   `useCharacter`: 퀘스트 데이터 관리.
    *   **유틸리티**: `cn`, `logger`.

#### **13. 스킬 (`/skills`, `app/skills/page.tsx`)**

*   **핵심 기능**: 캐릭터의 스킬 목록을 확인하고, 스킬 레벨 및 상세 정보를 관리합니다.
*   **주요 기능**:
    *   스킬 목록 표시 (이름, 유형, 레벨, 설명).
    *   스킬 레벨 조정 기능.
    *   스킬 즐겨찾기 기능.
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `PageHeader`: 페이지 상단 제목 및 설명.
        *   `FavoriteToggle`: 즐겨찾기 상태 토글.
    *   **Shadcn UI 컴포넌트**:
        *   `Card`, `CardContent`, `CardHeader`, `CardTitle`: 스킬 정보 카드.
        *   `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`: 스킬 목록.
        *   `Button`: 스킬 레벨 조정.
        *   `Input`: 스킬 레벨 직접 입력.
        *   `Badge`: 스킬 유형 표시.
        *   `Switch`, `Label`: 즐겨찾기만 보기 토글.
    *   **컨텍스트/훅**:
        *   `useCharacter`: 스킬 데이터 관리.
    *   **유틸리티**: `cn`, `logger`.

#### **14. 타이머 (`/timers`, `app/timers/page.tsx`)**

*   **핵심 기능**: 게임 내 재화(골드, 마일리지 등)의 획득 타이머를 관리하고, 알림을 설정합니다.
*   **주요 기능**:
    *   재화 타이머 목록 표시 (이름, 현재 값, 최대 값, 리셋 주기, 남은 시간).
    *   타이머 시작/정지/리셋.
    *   타이머 값 수동 조정.
    *   알림 설정.
*   **주요 컴포넌트**:
    *   **커스텀 컴포넌트**:
        *   `PageHeader`: 페이지 상단 제목 및 설명.
        *   `CurrencyTimer`: 개별 재화 타이머 컴포넌트.
        *   `CurrencyTimersContainer`: 타이머 목록 컨테이너.
    *   **Shadcn UI 컴포넌트**:
        *   `Card`, `CardContent`, `CardHeader`, `CardTitle`: 타이머 정보 카드.
        *   `Button`: 타이머 제어 버튼.
        *   `Input`: 타이머 값 입력.
        *   `Progress`: 타이머 진행률 표시.
        *   `Switch`, `Label`: 알림 설정 토글.
    *   **컨텍스트/훅**:
        *   `useCharacter`: 타이머 데이터 관리.
        *   `useNotification`: 알림 표시.
    *   **유틸리티**: `cn`, `logger`.
