## 발생 이유
`character-management/page.tsx` 파일에서 `DataInputModal` 컴포넌트를 `DialogTrigger`의 자식으로 잘못 전달하여 렌더링 오류가 발생했습니다. `DataInputModal`은 `DialogContent`를 포함하고 있으므로 `Dialog` 컴포넌트의 직접적인 자식으로 전달되어야 합니다.

## 해결 방법
- `DataInputModal` 컴포넌트를 `Dialog` 컴포넌트의 자식으로 직접 전달하도록 수정했습니다.
- `Dialog`의 열림/닫힘 상태를 제어하기 위해 `useState`를 사용하여 `isModalOpen` 상태를 추가했습니다.

## 재현 절차
1. `character-management` 페이지에 접근합니다.
2. '데이터 추가/수정' 버튼을 클릭합니다.
3. 렌더링 오류가 발생하는지 확인합니다.

## 기대 동작
오류 없이 데이터 추가/수정 모달이 정상적으로 열리고 닫힙니다.

## 환경
- Next.js
- Radix UI (Dialog)