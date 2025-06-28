import { useContext, useState, useEffect } from 'react';
import { CharacterContext } from '@/contexts/character-context';
import { Gem, CharacterGem } from '@/types/gem';
import gemsData from '@/data/gems.json';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import logger from '@/app/logger';

interface CharacterGemsState {
  [characterName: string]: CharacterGem[];
}

// 보석 승급 확률 (임의로 지정)
const UPGRADE_PROBABILITIES: Record<CharacterGem['tier'], number> = {
  '티어1': 0.70, // 티어1에서 티어2로 갈 확률
  '티어2': 0.50, // 티어2에서 티어3으로 갈 확률
  '티어3': 0.30, // 티어3에서 티어4로 갈 확률
  '티어4': 0.10, // 티어4에서 티어5로 갈 확률
  '티어5': 0,    // 티어5는 더 이상 승급 불가
};

export default function GemsPage() {
  logger.debug('GemsPage 컴포넌트 진입');
  const { currentCharacter } = useContext(CharacterContext);
  const [characterGems, setCharacterGems] = useState<CharacterGemsState>(() => {
    if (typeof window !== 'undefined') {
      const savedGems = localStorage.getItem('characterGems');
      return savedGems ? JSON.parse(savedGems) : {};
    }
    return {};
  });

  const [selectedGemName, setSelectedGemName] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<CharacterGem['tier']>('티어1');
  const [quantity, setQuantity] = useState<number>(1);

  // 승급 시뮬레이션 관련 상태
  const [simGemName, setSimGemName] = useState<string>('');
  const [simStartTier, setSimStartTier] = useState<CharacterGem['tier']>('티어1');
  const [simAttempts, setSimAttempts] = useState<number>(100);
  const [simResults, setSimResults] = useState<{ success: number; failure: number; gemsConsumed: number } | null>(null);

  useEffect(() => {
    logger.debug('characterGems 상태 변경 감지, localStorage에 저장 시도');
    if (typeof window !== 'undefined') {
      localStorage.setItem('characterGems', JSON.stringify(characterGems));
    }
  }, [characterGems]);

  useEffect(() => {
    logger.debug('currentCharacter 변경 감지');
    if (currentCharacter && !characterGems[currentCharacter.name]) {
      setCharacterGems((prev: CharacterGemsState) => ({ ...prev, [currentCharacter.name]: [] }));
    }
  }, [currentCharacter, characterGems]);

  const handleAddGem = () => {
    logger.debug('handleAddGem 함수 진입', { selectedGemName, selectedTier, quantity, currentCharacter });
    if (!currentCharacter || !selectedGemName || quantity <= 0) {
      logger.debug('유효하지 않은 입력으로 보석 추가 실패');
      return;
    }

    const gemToAdd = gemsData.find(gem => gem.이름 === selectedGemName);
    if (gemToAdd) {
      const newGem: CharacterGem = {
        ...gemToAdd,
        quantity,
        tier: selectedTier,
      };

      setCharacterGems((prev: CharacterGemsState) => {
        const currentCharacterName = currentCharacter.name;
        const currentGems = prev[currentCharacterName] || [];
        const existingGemIndex = currentGems.findIndex(
          (g: CharacterGem) => g.이름 === newGem.이름 && g.tier === newGem.tier
        );

        let updatedGems;
        if (existingGemIndex > -1) {
          updatedGems = currentGems.map((g: CharacterGem, index: number) =>
            index === existingGemIndex ? { ...g, quantity: g.quantity + newGem.quantity } : g
          );
          logger.debug('기존 보석 수량 업데이트', { updatedGems });
        } else {
          updatedGems = [...currentGems, newGem];
          logger.debug('새로운 보석 추가', { updatedGems });
        }

        return {
          ...prev,
          [currentCharacterName]: updatedGems,
        };
      });

      // Reset form fields
      setSelectedGemName('');
      setQuantity(1);
      setSelectedTier('티어1');
      logger.debug('보석 추가 성공, 입력 필드 초기화');
    } else {
      logger.debug('선택된 보석을 찾을 수 없음', { selectedGemName });
    }
  };

  const handleRemoveGem = (gemName: string, tier: CharacterGem['tier']) => {
    logger.debug('handleRemoveGem 함수 진입', { gemName, tier, currentCharacter });
    if (!currentCharacter) return;

    setCharacterGems((prev: CharacterGemsState) => {
      const currentCharacterName = currentCharacter.name;
      const currentGems = prev[currentCharacterName] || [];
      const updatedGems = currentGems.filter(
        gem => !(gem.이름 === gemName && gem.tier === tier)
      );
      logger.debug('보석 제거 완료', { updatedGems });
      return {
        ...prev,
        [currentCharacterName]: updatedGems,
      };
    });
  };

  const handleQuantityChange = (gemName: string, tier: CharacterGem['tier'], newQuantity: number) => {
    logger.debug('handleQuantityChange 함수 진입', { gemName, tier, newQuantity, currentCharacter });
    if (!currentCharacter || newQuantity < 0) return;

    setCharacterGems((prev: CharacterGemsState) => {
      const currentCharacterName = currentCharacter.name;
      const currentGems = prev[currentCharacterName] || [];
      const updatedGems = currentGems.map(gem =>
        gem.이름 === gemName && gem.tier === tier ? { ...gem, quantity: newQuantity } : gem
      );
      logger.debug('보석 수량 변경 완료', { updatedGems });
      return {
        ...prev,
        [currentCharacterName]: updatedGems,
      };
    });
  };

  const getGemValue = (gem: CharacterGem) => {
    logger.debug('getGemValue 함수 진입', { gem });
    let value = gem[gem.tier];
    // '씩' 접미사 제거
    if (value.endsWith('씩')) {
      value = value.replace('씩', '');
    }
    logger.debug('계산된 보석 값', { value });
    return value;
  };

  const handleSimulateUpgrade = () => {
    logger.debug('handleSimulateUpgrade 함수 진입', { simGemName, simStartTier, simAttempts });
    if (!simGemName || !simStartTier || simAttempts <= 0) {
      logger.debug('시뮬레이션 입력 유효성 검사 실패');
      return;
    }

    const gemToSimulate = gemsData.find(gem => gem.이름 === simGemName);
    if (!gemToSimulate) {
      logger.debug('시뮬레이션할 보석을 찾을 수 없음', { simGemName });
      return;
    }

    const upgradeTiers: (CharacterGem['tier'] | null)[] = ['티어1', '티어2', '티어3', '티어4', '티어5', null];
    const currentTierIndex = upgradeTiers.indexOf(simStartTier);
    const nextTier = upgradeTiers[currentTierIndex + 1];

    if (!nextTier) {
      logger.debug('최대 티어이거나 다음 티어가 없습니다.');
      setSimResults({ success: 0, failure: simAttempts, gemsConsumed: simAttempts });
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    let gemsConsumed = 0;

    const probability = UPGRADE_PROBABILITIES[simStartTier];
    logger.debug('시뮬레이션 시작', { probability });

    for (let i = 0; i < simAttempts; i++) {
      gemsConsumed++; // 매 시도마다 보석 1개 소모
      if (Math.random() < probability) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    logger.debug('시뮬레이션 완료', { successCount, failureCount, gemsConsumed });
    setSimResults({ success: successCount, failure: failureCount, gemsConsumed });
  };

  if (!currentCharacter) {
    logger.debug('현재 캐릭터가 없어 페이지 로드 불가');
    return (
      <div className="flex items-center justify-center h-full text-lg">
        캐릭터를 선택해주세요.
      </div>
    );
  }

  const currentCharacterAssignedGems = characterGems[currentCharacter.name] || [];
  logger.debug('현재 캐릭터 할당 보석', { currentCharacterAssignedGems });

  return (
    <div className="container mx-auto p-4">
      {logger.debug('보석 페이지 렌더링 시작')}
      <h1 className="text-2xl font-bold mb-4">캐릭터 보석 관리: {currentCharacter.name}</h1>

      <div className="mb-6 p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">보석 추가</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col">
            <label htmlFor="gem-select" className="mb-1 text-sm font-medium">보석 이름</label>
            <Select onValueChange={setSelectedGemName} value={selectedGemName}>
              <SelectTrigger id="gem-select">
                <SelectValue placeholder="보석 선택" />
              </SelectTrigger>
              <SelectContent>
                {gemsData.map((gem) => (
                  <SelectItem key={gem.이름} value={gem.이름}>
                    {gem.이름}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="tier-select" className="mb-1 text-sm font-medium">티어</label>
            <Select onValueChange={(value: CharacterGem['tier']) => setSelectedTier(value)} value={selectedTier}>
              <SelectTrigger id="tier-select">
                <SelectValue placeholder="티어 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="티어1">1티어 (조각난)</SelectItem>
                <SelectItem value="티어2">2티어 (조각난 S)</SelectItem>
                <SelectItem value="티어3">3티어 (투박한)</SelectItem>
                <SelectItem value="티어4">4티어 (투박한 S)</SelectItem>
                <SelectItem value="티어5">5티어 (정식)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="quantity-input" className="mb-1 text-sm font-medium">수량</label>
            <Input
              id="quantity-input"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="수량"
            />
          </div>

          <Button onClick={handleAddGem} className="md:col-span-1">보석 추가</Button>
        </div>
      </div>

      {/* 보석 승급 시뮬레이션 섹션 */}
      <div className="mb-6 p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">보석 승급 시뮬레이션</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
          <div className="flex flex-col">
            <label htmlFor="sim-gem-select" className="mb-1 text-sm font-medium">보석 이름</label>
            <Select onValueChange={setSimGemName} value={simGemName}>
              <SelectTrigger id="sim-gem-select">
                <SelectValue placeholder="시뮬레이션할 보석 선택" />
              </SelectTrigger>
              <SelectContent>
                {gemsData.map((gem) => (
                  <SelectItem key={gem.이름} value={gem.이름}>
                    {gem.이름}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="sim-tier-select" className="mb-1 text-sm font-medium">시작 티어</label>
            <Select onValueChange={(value: CharacterGem['tier']) => setSimStartTier(value)} value={simStartTier}>
              <SelectTrigger id="sim-tier-select">
                <SelectValue placeholder="시작 티어 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="티어1">1티어</SelectItem>
                <SelectItem value="티어2">2티어</SelectItem>
                <SelectItem value="티어3">3티어</SelectItem>
                <SelectItem value="티어4">4티어</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="sim-attempts-input" className="mb-1 text-sm font-medium">시도 횟수</label>
            <Input
              id="sim-attempts-input"
              type="number"
              min="1"
              value={simAttempts}
              onChange={(e) => setSimAttempts(Number(e.target.value))}
              placeholder="시도 횟수"
            />
          </div>

          <Button onClick={handleSimulateUpgrade} className="md:col-span-1">시뮬레이션 시작</Button>
        </div>

        {simResults && (
          <div className="mt-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-2">시뮬레이션 결과:</h3>
            <p>성공 횟수: <span className="font-semibold text-green-600 dark:text-green-400">{simResults.success}</span></p>
            <p>실패 횟수: <span className="font-semibold text-red-600 dark:text-red-400">{simResults.failure}</span></p>
            <p>총 소모된 보석: <span className="font-semibold">{simResults.gemsConsumed}</span> 개</p>
          </div>
        )}
      </div>
      {/* 시뮬레이션 섹션 끝 */}

      <h2 className="text-xl font-semibold mb-3">{currentCharacter.name}의 할당된 보석</h2>
      {currentCharacterAssignedGems.length === 0 ? (
        <p>할당된 보석이 없습니다.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>보석 이름</TableHead>
              <TableHead>능력치</TableHead>
              <TableHead>티어</TableHead>
              <TableHead>수량</TableHead>
              <TableHead>효과</TableHead>
              <TableHead>동작</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCharacterAssignedGems.map((gem, index) => (
              <TableRow key={`${gem.이름}-${gem.tier}-${index}`}>
                <TableCell className="font-medium">{gem.이름}</TableCell>
                <TableCell>{gem.능력치1}{gem.능력치2 ? ` / ${gem.능력치2}` : ''}</TableCell>
                <TableCell>{gem.tier.replace('티어', '')}티어</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={gem.quantity}
                    onChange={(e) => handleQuantityChange(gem.이름, gem.tier, Number(e.target.value))}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>{getGemValue(gem)}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveGem(gem.이름, gem.tier)}>
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 