## 발생 이유
- `lib/firebase.ts` 파일에서 Firebase Analytics를 서버 측에서 초기화하려고 시도하여 `ReferenceError: window is not defined` 오류가 발생했습니다. Firebase Analytics는 브라우저 환경에서만 지원됩니다.
- `app/layout.tsx` 파일에서 `viewport` 및 `themeColor` 메타데이터가 `metadata` export에 정의되어 있어 Next.js 15의 새로운 메타데이터 구성 방식과 일치하지 않아 경고가 발생했습니다.

## 해결 방법
- `lib/firebase.ts` 파일에서 `analytics` 초기화를 `typeof window !== 'undefined'` 조건부로 감싸 클라이언트 측에서만 실행되도록 수정했습니다.
- `app/layout.tsx` 파일에서 `viewport` 및 `themeColor` 메타데이터를 `metadata` export에서 `viewport` export로 이동했습니다.

## 재현 절차
1. 개발 서버를 시작합니다 (`pnpm run dev`).
2. 콘솔에서 `ReferenceError: window is not defined` 오류와 메타데이터 경고가 발생하는지 확인합니다.

## 기대 동작
오류와 경고 없이 애플리케이션이 정상적으로 빌드되고 실행됩니다.

## 환경
- Next.js 15.2.4
- Firebase
- React