# 이슈: 로컬 스토리지에서 즐겨찾기 아이템 로딩 실패

## 문제 설명

애플리케이션이 로컬 스토리지에서 `mabinogi-favorites` 키를 사용하여 즐겨찾기 아이템 데이터를 로드할 때, 데이터가 올바르게 파싱되지 않거나 비어있는 상태로 LLM에 전송되는 문제가 발생했습니다. 이로 인해 즐겨찾기 기능이 예상대로 작동하지 않았습니다.

## 원인

`contexts/favorites-context.tsx` 파일에서 로컬 스토리지로부터 데이터를 로드하는 과정에서 `JSON.parse`가 반환하는 데이터가 유효한 배열이 아닐 경우에 대한 방어적인 로직이 부족했습니다. 또한, 오류 로깅이 중복되어 있었습니다.

## 해결

1.  **데이터 유효성 검사 추가**: `favorites-context.tsx` 파일의 `useEffect` 훅에서 `localStorage.getItem("mabinogi-favorites")`으로 가져온 데이터를 `JSON.parse`한 후, `Array.isArray(parsed)`를 통해 파싱된 데이터가 유효한 배열인지 확인하는 로직을 추가했습니다.
    *   만약 `parsed` 데이터가 배열이 아니면, `favorites` 상태를 빈 배열로 초기화하고 경고 로그를 남기도록 했습니다.
2.  **중복된 로그 제거**: `console.warn`과 `logger.warn`이 동시에 호출되던 부분을 `logger.warn`만 남도록 수정하여 중복 로깅을 제거했습니다.

## 변경 사항

`contexts/favorites-context.tsx` 파일에 다음 변경 사항이 적용되었습니다:

```typescript
// ... existing code ...

  // Load from localStorage on mount
  useEffect(() => {
    logger.debug("FavoritesProvider: Attempting to load favorites from localStorage.");
    try {
      const savedFavorites = localStorage.getItem("mabinogi-favorites")
      logger.debug("FavoritesProvider: Raw savedFavorites from localStorage:", savedFavorites);
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites).map((f: any) => {
          logger.debug("FavoritesProvider: Parsing favorite item:", f);
          return {
            ...f,
            addedAt: new Date(f.addedAt),
          };
        });
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
          logger.debug("FavoritesProvider: Successfully loaded and set favorites:", parsed);
        } else {
          logger.warn("FavoritesProvider: Parsed data is not an array, resetting favorites.", parsed);
          setFavorites([]); // Reset to empty if parsed data is not an array
        }
      } else {
        logger.debug("FavoritesProvider: No saved favorites found in localStorage.");
      }
    } catch (error) {
      logger.warn("FavoritesProvider: Failed to load favorites:", error);
    }
  }, []);

  // Save to localStorage when favorites change
  useEffect(() => {
    logger.debug("FavoritesProvider: Favorites state changed, attempting to save to localStorage:", favorites);
    try {
      localStorage.setItem("mabinogi-favorites", JSON.stringify(favorites));
      logger.debug("FavoritesProvider: Successfully saved favorites to localStorage.");
    } catch (error) {
      logger.warn("FavoritesProvider: Failed to save favorites:", error);
    }
  }, [favorites]);

// ... existing code ...
```

## 테스트

1.  브라우저의 로컬 스토리지에서 `mabinogi-favorites` 데이터를 임의로 유효하지 않은 JSON 문자열(예: `"invalid json"` 또는 `{}`)로 변경합니다.
2.  애플리케이션을 새로고침합니다.
3.  개발자 도구의 콘솔에서 `FavoritesProvider: Parsed data is not an array, resetting favorites.` 로그가 출력되는지 확인합니다.
4.  즐겨찾기 목록이 비어 있는지 확인합니다.
5.  유효한 즐겨찾기 아이템을 추가한 후, 로컬 스토리지에 올바른 JSON 배열 형태로 저장되는지 확인합니다.
6.  애플리케이션을 새로고침하여 즐겨찾기 아이템이 올바르게 로드되는지 확인합니다. 