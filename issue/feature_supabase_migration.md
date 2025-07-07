## 변경 사항
Firebase에서 Supabase로의 전환을 완료했습니다. 다음 파일들이 변경되었습니다:

- `package.json`: `firebase` 의존성을 제거하고 `@supabase/supabase-js`를 추가했습니다.
- `lib/firebase.ts` -> `lib/supabase.ts`: 파일 이름을 변경하고 Supabase 클라이언트 초기화 코드를 추가했습니다.
- `firestore.rules`: 더 이상 필요 없으므로 삭제했습니다.
- `contexts/AuthContext.tsx`: Firebase Authentication 로직을 Supabase Authentication 로직으로 교체하고, 사용자 프로필 관리 로직을 Supabase DB를 사용하도록 변경했습니다.
- `app/qa-board/page.tsx`: Firestore DB 호출을 Supabase DB 호출로 변경했습니다.
- `app/schedule/page.tsx`: Firestore DB 호출을 Supabase DB 호출로 변경했습니다.

## 추가 설정 필요 사항

애플리케이션을 정상적으로 실행하려면 다음 환경 변수를 `.env.local` 파일에 추가해야 합니다:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

또한, Supabase 프로젝트에서 다음 DB 스키마를 직접 설정해야 합니다:

*   **`public.users` 테이블:**
    *   `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
    *   `username` (TEXT)
    *   `email` (TEXT)
    *   `llmTokens` (INT, default: 0)
    *   `rating` (INT, default: 0)
    *   `feedbackCount` (INT, default: 0)
    *   `following` (TEXT[], default: `{}`)
    *   `qaAnswerCount` (INT, default: 0)
    *   `bestAnswerCount` (INT, default: 0)
    *   `representativeCharacterId` (TEXT, nullable)
    *   `created_at` (TIMESTAMPZ, default: `now()`)
*   **`public.qaPosts` 테이블:**
    *   `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
    *   `authorId` (UUID, Foreign Key to `public.users.id`)
    *   `title` (TEXT)
    *   `content` (TEXT)
    *   `disclosureLevel` (TEXT)
    *   `createdAt` (TIMESTAMPZ, default: `now()`)
*   **`public.notifications` 테이블:**
    *   `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
    *   `userId` (UUID, Foreign Key to `public.users.id`)
    *   `type` (TEXT)
    *   `message` (TEXT)
    *   `link` (TEXT, nullable)
    *   `read` (BOOLEAN, default: `false`)
    *   `createdAt` (TIMESTAMPZ, default: `now()`)
    *   `fromUserId` (UUID, Foreign Key to `public.users.id`, nullable)
*   **`public.raidPosts` 테이블:**
    *   `id` (UUID, Primary Key, default: `uuid_generate_v4()`)
    *   `authorId` (UUID, Foreign Key to `public.users.id`)
    *   `startTime` (TIMESTAMPZ)
    *   `endTime` (TIMESTAMPZ)
    *   `description` (TEXT)
    *   `type` (TEXT)
    *   `created_at` (TIMESTAMPZ, default: `now()`)

## 기대 동작
Supabase를 백엔드로 사용하여 회원 관리 및 DB 기능이 정상적으로 작동합니다.

## 환경
- Next.js
- Supabase