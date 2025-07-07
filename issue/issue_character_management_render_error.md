## 발생 이유
`character-management/page.tsx` 파일에서 정의되지 않은 `modern-card` CSS 클래스를 사용하여 렌더링 오류가 발생했습니다. 또한, 다크 모드 테마와 일치하지 않는 하드코딩된 색상 값으로 인해 가독성 문제가 있었습니다.

## 해결 방법
- `modern-card` 클래스를 `card` 클래스로 변경했습니다.
- `bg-gray-50`, `text-gray-800` 등 하드코딩된 색상 값을 `bg-background`, `text-foreground` 등 `tailwind.config.ts`에 정의된 테마 변수를 사용하도록 수정했습니다.

## 재현 절차
1. `character-management` 페이지에 접근합니다.
2. 렌더링 오류가 발생하는지 확인합니다.

## 기대 동작
오류 없이 페이지가 정상적으로 렌더링되고, 다크 모드 테마에 맞는 색상으로 표시됩니다.

## 환경
- Next.js
- Tailwind CSS