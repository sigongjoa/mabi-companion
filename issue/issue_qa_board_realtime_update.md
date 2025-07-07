## 발생 이유
`app/qa-board/page.tsx` 파일에서 Q&A 게시글을 가져올 때 `getDocs`를 사용하여 실시간 업데이트가 되지 않았고, `orderBy` 함수가 import되지 않아 오류가 발생했습니다. 또한, `hover:bg-gray-100`과 같이 하드코딩된 색상 값이 테마와 일관성이 없었습니다.

## 해결 방법
- `onSnapshot`을 사용하여 게시글을 실시간으로 가져오도록 수정했습니다.
- `firebase/firestore`에서 `orderBy`를 import하도록 수정했습니다.
- `hover:bg-gray-100`을 `hover:bg-muted`로 변경하여 테마와 일관성을 맞췄습니다.

## 재현 절차
1. Q&A 게시판 페이지(`/qa-board`)에 접근합니다.
2. 새로운 게시글을 작성하거나 기존 게시글을 수정/삭제합니다.
3. 게시글 목록이 실시간으로 업데이트되지 않는지 확인합니다.

## 기대 동작
게시글 목록이 실시간으로 업데이트되고, 페이지의 스타일이 테마와 일관성을 유지합니다.

## 환경
- Next.js
- Firebase Firestore
- Tailwind CSS