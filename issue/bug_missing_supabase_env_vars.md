## 발생 이유
Supabase로 마이그레이션 후 `pnpm run build` 실행 시 `Error: Missing Supabase URL or Anon Key` 오류가 발생했습니다. 이는 Supabase 클라이언트 초기화에 필요한 `NEXT_PUBLIC_SUPABASE_URL` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수가 `.env.local` 파일에 설정되지 않았거나 올바르지 않기 때문입니다.

## 해결 방법
프로젝트 루트 디렉토리의 `.env.local` 파일에 Supabase 프로젝트의 실제 URL과 `anon` 키를 추가해야 합니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 재현 절차
1. Supabase로 마이그레이션된 프로젝트에서 `pnpm run build`를 실행합니다.
2. 빌드 과정에서 `Error: Missing Supabase URL or Anon Key` 오류가 발생하는지 확인합니다.

## 기대 동작
환경 변수 설정 후 빌드가 성공적으로 완료됩니다.

## 환경
- Next.js
- Supabase