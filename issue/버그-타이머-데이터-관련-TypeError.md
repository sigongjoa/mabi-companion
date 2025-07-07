## 발생 이유
app/page.tsx 및 app/timers/page.tsx의 handleCurrencyDataChange 함수에서 data.nextChargeTime.toISOString() 호출이 불필요하게 다시 발생하여, 이미 ISO 문자열로 변환된 값을 다시 toISOString()으로 변환하려고 시도하여 발생한 타입 에러입니다.

## 재현 절차
1. 타이머 탭으로 이동합니다.
2. 통화 타이머 데이터를 수정합니다.
3. 대시보드 탭으로 이동하거나 페이지를 새로고침합니다.
4. 콘솔에서 TypeError가 발생하는지 확인합니다.

## 기대 동작
타이머 데이터 수정 시 TypeError 없이 정상적으로 데이터가 처리되고 반영됩니다.

## 환경
- Next.js
- Clerk (데이터 저장/관리 관련) 