## 재현 절차
1. 로그인
2. GET /api/getKey 요청
3. 401 Unauthorized 반환

## 기대 동작
로그인된 사용자에게 복호화 키 반환

## 환경
- Next.js 13.4.2
- Clerk v4 