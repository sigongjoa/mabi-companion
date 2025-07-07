# 버그: CraftingRecipeCard에서 `recipe.resultId` undefined 오류

## 발생 이유
`app/crafting/page.tsx` 파일의 `CraftingRecipeCard` 컴포넌트에서 `recipe.resultId`가 `undefined` 상태일 때 `.toString()` 메서드를 호출하려고 시도하여 `Cannot read properties of undefined (reading 'toString')` 런타임 오류가 발생합니다.

이는 주로 다음과 같은 원인으로 추정됩니다:
1.  `processedRecipes`를 생성하는 과정에서 `rawRecipe.product`에 해당하는 아이템을 `allItems`에서 찾지 못하여 `recipe.resultId`가 올바르게 할당되지 않았을 수 있습니다.
2.  `public/data/items.json` 또는 `public/data/recipes.json` 데이터 자체에 불일치 또는 누락된 정보가 있을 수 있습니다.
3.  개발 환경의 캐싱 문제로 인해 최신 코드 변경 사항이 제대로 반영되지 않았을 가능성이 있습니다.

## 재현 절차
1.  애플리케이션을 실행합니다.
2.  `제작` 탭으로 이동합니다.
3.  `가공 시설 선택`에서 아무 시설이나 선택합니다.
4.  `모든 제작 레시피` 섹션에 레시피 카드들이 표시되지 않거나, 콘솔에 `Cannot read properties of undefined (reading 'toString')` 오류가 출력됩니다.

## 기대 동작
*   `제작` 탭에서 모든 제작 레시피가 정상적으로 표시되어야 합니다.
*   레시피 카드 클릭 시 팝업이 뜨고 타이머 기능이 정상적으로 동작해야 합니다.
*   `Cannot read properties of undefined (reading 'toString')`와 같은 런타임 오류가 발생하지 않아야 합니다.

## 시도했던 해결 방법
1.  `types/page-context.ts`의 `Recipe` 인터페이스에 `facilityId: string;`, `craftTime: number;`, `level_condition: number;` 필드를 추가했습니다.
2.  `app/crafting/page.tsx`에서 `allCraftingFacilitiesData`를 기반으로 `processedRecipes`라는 `useMemo` 훅을 생성하여 각 레시피에 `facilityId`, `resultId`, `craftTime`, `level_condition`을 올바르게 할당하도록 로직을 수정했습니다. 이 과정에서 `itemsByName` 맵을 활용하여 `product` 이름을 `resultId`로 매핑했습니다.
3.  `CraftingRecipeCard` 컴포넌트에 `recipe.resultId?.toString() ?? ''`와 같은 옵셔널 체이닝 및 널 병합 연산자를 포함한 방어 코드를 추가하여 `undefined.toString()` 호출을 방지했습니다.
4.  `CraftingPage`와 `CraftingRecipeCard`에 레시피 데이터 로딩 및 처리, 시설 매칭 과정을 진단하기 위한 상세 디버그 로깅을 추가했습니다.
5.  사용자에게 개발 서버 재시작, `.next`, `node_modules`, `pnpm-lock.yaml` 삭제 후 재설치, 브라우저 강제 새로고침을 요청했습니다.

## 환경
-   Next.js 애플리케이션
-   관련 파일:
    -   `app/crafting/page.tsx`
    -   `types/page-context.ts`
    -   `public/data/recipes.json`
    -   `public/data/items.json` 