## 발생 이유
`app/assistant/page.tsx` 파일에서 `next/link`의 `Link` 컴포넌트를 import하지 않고 사용하여 `ReferenceError: Link is not defined` 오류가 발생했습니다.

## 해결 방법
`app/assistant/page.tsx` 파일 상단에 `import Link from "next/link";` 구문을 추가하여 `Link` 컴포넌트를 정상적으로 사용할 수 있도록 수정했습니다.

## 재현 절차
1. AI 어시스턴트 채팅 페이지(`/assistant`)에 접근합니다.
2. 브라우저 콘솔에서 `ReferenceError: Link is not defined` 오류가 발생하는지 확인합니다.

## 기대 동작
오류 없이 페이지가 정상적으로 렌더링되고, 상단의 네비게이션 링크들이 올바르게 작동합니다.

## 환경
- Next.js
- React