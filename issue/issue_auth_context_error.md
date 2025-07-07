## 발생 이유
`contexts/AuthContext.tsx` 파일에서 `onAuthStateChanged` 함수를 `firebase/auth`에서 import하지 않아 발생한 문제입니다. 또한, `doc`, `getDoc`, `setDoc` 함수도 `firebase/firestore`에서 import해야 합니다.

## 재현 절차
1. 애플리케이션을 실행합니다.
2. 로그인 페이지에 접근합니다.
3. 콘솔에서 `onAuthStateChanged is not defined` 오류가 발생하는지 확인합니다.

## 기대 동작
오류 없이 정상적으로 인증 상태를 확인하고 사용자 정보를 가져옵니다.

## 환경
- Next.js
- Firebase Authentication