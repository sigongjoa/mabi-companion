## 버그: 전투력 데이터 `toLocaleString()` 오류

### 발생 이유
`app/characters/page.tsx` 파일에서 캐릭터의 `combatPower` 필드가 `undefined`인 경우, `character.combatPower.toLocaleString()` 호출 시 `Cannot read properties of undefined (reading 'toLocaleString')` 런타임 오류가 발생했습니다. 이는 주로 기존에 `combatPower` 필드가 없던 캐릭터 데이터가 로컬 스토리지에서 로드될 때 발생했습니다.

### 재현 절차
1. 이전 버전의 애플리케이션에서 `combatPower` 필드가 없는 캐릭터를 생성합니다.
2. 현재 버전으로 업데이트 후 애플리케이션을 실행합니다.
3. 캐릭터 관리 페이지(`/characters`)로 이동합니다.
4. "모든 캐릭터 요약" 테이블 또는 개별 캐릭터 카드에서 `combatPower`가 `undefined`인 캐릭터의 전투력을 표시할 때 오류가 발생합니다.

### 기대 동작
`combatPower` 필드가 없는 캐릭터 데이터가 로드되더라도 오류 없이 기본값(예: 0)으로 처리되어 전투력 정보가 정상적으로 표시되어야 합니다.

### 해결된 코드
`contexts/character-context.tsx` 파일에서 캐릭터 데이터를 로드하거나 새로 생성할 때 `combatPower` 필드가 없는 경우 `0`으로 초기화하도록 수정했습니다.

```typescript
// contexts/character-context.tsx 내 CharacterProvider 내부
// 캐릭터 로드 시
initialCharacters = parsedCharacters.map(char => {
    return {
        ...char,
        // ...기존 필드들...
        combatPower: char.combatPower || 0, // combatPower가 undefined일 경우 0으로 초기화
    };
});

// 새 캐릭터 추가 시 (addCharacter 함수 내)
const newCharacter: Character = {
    // ...기존 필드들...
    combatPower: character.combatPower || 0,
};
```

### 환경
- Next.js
- React Context API (캐릭터 데이터 관리) 