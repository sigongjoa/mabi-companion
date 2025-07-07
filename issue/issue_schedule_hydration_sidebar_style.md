## 발생 이유
`app/schedule/page.tsx`에서 `date.toLocaleDateString()`을 사용하여 날짜를 표시할 때 서버와 클라이언트 간의 로케일 설정 불일치로 인해 하이드레이션 오류가 발생했습니다. 또한, `components/sidebar.tsx`에서 하드코딩된 색상 값들이 테마와 일관성이 없었습니다.

## 해결 방법
- `app/schedule/page.tsx`에서 `Intl.DateTimeFormat`을 사용하여 명시적으로 로케일을 지정하고 날짜 형식을 통일하여 하이드레이션 오류를 해결했습니다.
- `components/sidebar.tsx`에서 `bg-white`, `border-gray-200`, `bg-gray-50`, `text-gray-700`, `text-gray-900`, `text-gray-500`, `text-gray-800`, `text-gray-600` 등 하드코딩된 색상 값들을 테마 변수(`bg-background`, `border`, `bg-muted`, `text-foreground`, `text-muted-foreground`)로 변경하여 테마와 일관성을 맞췄습니다.

## 재현 절차
1. 스케줄 페이지(`/schedule`)에 접근합니다.
2. 브라우저 콘솔에서 하이드레이션 오류가 발생하는지 확인합니다.
3. 사이드바의 색상이 테마와 일치하지 않는지 확인합니다.

## 기대 동작
하이드레이션 오류 없이 페이지가 정상적으로 렌더링되고, 사이드바의 색상이 테마와 일관성을 유지합니다.

## 환경
- Next.js
- React
- Tailwind CSS