'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { useCharacter, type Character } from '@/contexts/character-context';
import { toast } from 'sonner';
import { Hammer, Plus, Minus, Package, Sparkles, LayoutGrid, Table2, Star, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Item,
    Recipe,
    CraftingFacility,
    ProcessingQueue,
} from '@/types/page-context';
import { cn } from '@/lib/utils'; // cn 유틸리티 임포트

interface CraftingRecipeCardProps {
    recipe: Recipe;
    facility: CraftingFacility;
    allItems: Record<string, Item>;
    canCraft: boolean;
    activeCharacterInventory: Record<number, number>;
    onClick: (recipe: Recipe) => void;
}

const CraftingRecipeCard: React.FC<CraftingRecipeCardProps> = ({
    recipe,
    facility,
    allItems,
    canCraft,
    activeCharacterInventory,
    onClick,
}) => {
    logger.debug('CraftingRecipeCard 렌더링 시작', { recipe, facilityId: facility.id });
    const outputItem = allItems[recipe.resultId.toString()];

    // 레시피 재료 확인
    const materialsStatus = useMemo(() => {
        logger.debug('레시피 재료 상태 계산', { recipeId: recipe.resultId });
        return recipe.materials.map(material => {
            const materialItem = allItems[material.itemId.toString()];
            const currentQuantity = activeCharacterInventory[material.itemId] || 0;
            const hasEnough = currentQuantity >= material.quantity;
            logger.debug('재료 상태', {
                materialId: material.itemId,
                materialName: materialItem?.name,
                required: material.quantity,
                current: currentQuantity,
                hasEnough,
            });
            return {
                materialItem,
                requiredQuantity: material.quantity,
                currentQuantity,
                hasEnough,
            };
        });
    }, [recipe.materials, allItems, activeCharacterInventory]);

    const cardColor = '#555'; // 모든 카드에 동일한 배경색 적용

    return (
        <div
            className="modern-card cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => {
                logger.debug('레시피 카드 클릭됨', { recipeId: recipe.resultId });
                onClick(recipe);
            }}
        >
            <div className="p-4 flex flex-col items-center justify-center h-2/3 relative">
                <div className="absolute top-2 right-2 text-gray-400 text-xs">
                    Lv. {recipe.level_condition}
                </div>
                {outputItem?.icon ? (
                    <div className="text-5xl">{outputItem.icon}</div>
                ) : (
                    <div className="w-20 h-20 flex items-center justify-center text-white text-2xl font-bold">
                        {outputItem?.name?.substring(0, 1) || '?'}
                    </div>
                )}
                <div className="mt-2 text-lg font-semibold text-center truncate w-full text-gray-800">
                    {outputItem?.name || '알 수 없음'}
                </div>
            </div>
            <div className="p-2 text-center border-t border-gray-200">
                <div className="text-gray-600 text-xs mb-2">재료:</div>
                <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                    {materialsStatus.map((mat, index) => (
                        <div key={index} className="flex items-center justify-between text-gray-700">
                            <span>{mat.materialItem?.name || '알 수 없음'}:</span>
                            <span className={cn(mat.hasEnough ? "text-green-600" : "text-red-600", "font-medium")}>
                                {mat.currentQuantity} / {mat.requiredQuantity}
                            </span>
                        </div>
                    ))}
                </div>
                <Button
                    size="sm"
                    className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white"
                    variant={canCraft ? "default" : "secondary"}
                    disabled={!canCraft}
                >
                    {canCraft ? "제작 시작" : "재료 부족"}
                </Button>
            </div>
        </div>
    );
};

const CraftingQueueDisplay: React.FC<{
    activeCharacter: Character | null;
    updateCharacter: (id: string, updates: Partial<Character>) => void;
    allItems: Record<string, Item>;
    currentFacilityId: string | null;
}> = ({ activeCharacter, updateCharacter, allItems, currentFacilityId }) => {
    logger.debug('CraftingQueueDisplay 렌더링 시작', { activeCharacterId: activeCharacter?.id, currentFacilityId });

    const [processingTimers, setProcessingTimers] = useState<Record<string, number>>({});

    useEffect(() => {
        logger.debug('CraftingQueueDisplay useEffect - 타이머 시작');
        const interval = setInterval(() => {
            setProcessingTimers(prevTimers => {
                const newTimers = { ...prevTimers };
                let changed = false;
                if (activeCharacter && currentFacilityId && activeCharacter.craftingQueues[currentFacilityId]) {
                    activeCharacter.craftingQueues[currentFacilityId].forEach((queueItem) => {
                        if (queueItem.isProcessing && queueItem.timeLeft > 0) {
                            newTimers[queueItem.id] = (newTimers[queueItem.id] || queueItem.timeLeft) - 1;
                            changed = true;
                        } else if (queueItem.isProcessing && queueItem.timeLeft <= 0) {
                            // 이미 완료된 항목 처리 (선택적으로 이곳에서 status: 'completed'로 변경)
                            if (newTimers[queueItem.id] !== 0) {
                                newTimers[queueItem.id] = 0; // Ensures it hits 0
                                changed = true;
                            }
                        }
                    });
                }
                return changed ? newTimers : prevTimers;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            logger.debug('CraftingQueueDisplay useEffect - 타이머 정리');
        };
    }, [activeCharacter, currentFacilityId]);

    useEffect(() => {
        // activeCharacter.craftingQueues가 변경될 때마다 타이머 초기화
        if (activeCharacter && currentFacilityId && activeCharacter.craftingQueues[currentFacilityId]) {
            logger.debug('activeCharacter.craftingQueues 변경 감지, 타이머 초기화', { craftingQueues: activeCharacter.craftingQueues[currentFacilityId] });
            const initialTimers: Record<string, number> = {};
            activeCharacter.craftingQueues[currentFacilityId].forEach(queueItem => {
                initialTimers[queueItem.id] = queueItem.timeLeft;
            });
            setProcessingTimers(initialTimers);
        }
    }, [activeCharacter, currentFacilityId]);


    const handleCollect = useCallback((queueItem: ProcessingQueue) => {
        logger.debug('handleCollect 호출', { queueItemId: queueItem.id });
        if (!activeCharacter || !currentFacilityId) return;

        const facilityQueues = activeCharacter.craftingQueues[currentFacilityId];
        if (!facilityQueues) {
            logger.warn('시설 큐를 찾을 수 없음', { currentFacilityId });
            return;
        }

        const updatedQueues = facilityQueues.map(q => {
            if (q.id === queueItem.id && q.isProcessing && (processingTimers[q.id] || q.timeLeft) <= 0) {
                // 아이템을 인벤토리에 추가
                const newInventory = { ...activeCharacter.inventory };
                const outputItem = allItems[q.itemName?.toString() || '-']; // itemName 사용 (현재는 string)
                if (outputItem && q.quantity) {
                    newInventory[outputItem.id] = (newInventory[outputItem.id] || 0) + q.quantity;
                    logger.debug('인벤토리에 아이템 추가됨', { itemId: outputItem.id, quantity: q.quantity });
                } else {
                    logger.warn('결과 아이템 정보 또는 수량 부족', { outputItem, quantity: q.quantity });
                }

                // 큐 항목 초기화 (재사용을 위해)
                toast.success(`${q.itemName || '아이템'} ${q.quantity || 1}개가 인벤토리에 추가되었습니다.`);
                return { id: q.id, isProcessing: false, timeLeft: 0, totalTime: 0, itemName: undefined, quantity: undefined };
            }
            return q;
        });

        const newCraftingQueues = { ...activeCharacter.craftingQueues, [currentFacilityId]: updatedQueues };
        updateCharacter(activeCharacter.id, { inventory: updatedQueues, craftingQueues: newCraftingQueues }); // inventory 업데이트 추가
        logger.debug('제작 큐 항목 수령 완료 및 초기화', { queueItemId: queueItem.id });
    }, [activeCharacter, updateCharacter, currentFacilityId, allItems, processingTimers]);

    const handleCancel = useCallback((queueItem: ProcessingQueue) => {
        logger.debug('handleCancel 호출', { queueItemId: queueItem.id });
        if (!activeCharacter || !currentFacilityId) return;

        const facilityQueues = activeCharacter.craftingQueues[currentFacilityId];
        if (!facilityQueues) {
            logger.warn('시설 큐를 찾을 수 없음', { currentFacilityId });
            return;
        }

        const updatedQueues = facilityQueues.map(q => {
            if (q.id === queueItem.id && q.isProcessing) {
                toast.info(`'${q.itemName || '아이템'}' 제작이 취소되었습니다.`);
                return { id: q.id, isProcessing: false, timeLeft: 0, totalTime: 0, itemName: undefined, quantity: undefined };
            }
            return q;
        });

        const newCraftingQueues = { ...activeCharacter.craftingQueues, [currentFacilityId]: updatedQueues };
        updateCharacter(activeCharacter.id, { craftingQueues: newCraftingQueues });
        logger.debug('제작 큐 항목 취소 완료 및 초기화', { queueItemId: queueItem.id });
    }, [activeCharacter, updateCharacter, currentFacilityId]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
    };

    if (!currentFacilityId || !activeCharacter) {
        return null;
    }

    const facilityQueues = activeCharacter.craftingQueues[currentFacilityId] || [];
    logger.debug('현재 시설 큐 목록', { facilityQueues });

    const collectAll = useCallback(() => {
        logger.debug('collectAll 호출');
        if (!activeCharacter || !currentFacilityId) return;

        let anyCollected = false;
        const newInventory = { ...activeCharacter.inventory };
        const updatedQueues = facilityQueues.map(q => {
            if (q.isProcessing && (processingTimers[q.id] || q.timeLeft) <= 0) {
                const outputItem = allItems[q.itemName?.toString() || '-'];
                if (outputItem && q.quantity) {
                    newInventory[outputItem.id] = (newInventory[outputItem.id] || 0) + q.quantity;
                    anyCollected = true;
                }
                return { id: q.id, isProcessing: false, timeLeft: 0, totalTime: 0, itemName: undefined, quantity: undefined };
            }
            return q;
        });

        if (anyCollected) {
            const newCraftingQueues = { ...activeCharacter.craftingQueues, [currentFacilityId]: updatedQueues };
            updateCharacter(activeCharacter.id, { inventory: newInventory, craftingQueues: newCraftingQueues });
            toast.success('완료된 모든 아이템을 수령했습니다!');
            logger.debug('모든 아이템 수령 완료');
        } else {
            toast.info('수령할 완료된 아이템이 없습니다.');
            logger.debug('수령할 아이템 없음');
        }
    }, [activeCharacter, updateCharacter, currentFacilityId, facilityQueues, allItems, processingTimers]);

    const cancelAll = useCallback(() => {
        logger.debug('cancelAll 호출');
        if (!activeCharacter || !currentFacilityId) return;

        let anyCancelled = false;
        const updatedQueues = facilityQueues.map(q => {
            if (q.isProcessing) {
                anyCancelled = true;
                return { id: q.id, isProcessing: false, timeLeft: 0, totalTime: 0, itemName: undefined, quantity: undefined };
            }
            return q;
        });

        if (anyCancelled) {
            const newCraftingQueues = { ...activeCharacter.craftingQueues, [currentFacilityId]: updatedQueues };
            updateCharacter(activeCharacter.id, { craftingQueues: newCraftingQueues });
            toast.info('모든 진행 중인 제작을 취소했습니다.');
            logger.debug('모든 제작 취소 완료');
        } else {
            toast.info('취소할 진행 중인 제작이 없습니다.');
            logger.debug('취소할 제작 없음');
        }
    }, [activeCharacter, updateCharacter, currentFacilityId, facilityQueues]);

    return (
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">현재 제작 현황 ({currentFacilityId === 'metal' ? '금속 가공' : currentFacilityId})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {facilityQueues.map((queueItem, index) => {
                    const outputItem = allItems[queueItem.itemName?.toString() || '-'];
                    const timeLeft = processingTimers[queueItem.id] !== undefined ? processingTimers[queueItem.id] : queueItem.timeLeft;
                    const progress = queueItem.totalTime > 0 ? ((queueItem.totalTime - timeLeft) / queueItem.totalTime) * 100 : 0;

                    return (
                        <div key={queueItem.id} className="document-card p-4 flex flex-col items-center border border-gray-200 rounded-lg shadow-sm">
                            <div className="text-4xl mb-2">{outputItem?.icon || '?'}</div>
                            <div className="font-semibold text-lg mb-1 truncate w-full text-center">{outputItem?.name || 'Unknown Item'}</div>
                            <div className="text-sm text-gray-600 mb-2">
                                {queueItem.quantity ? `${queueItem.quantity}개` : '1개'}
                            </div>
                            <div className="relative w-full h-2 bg-gray-200 rounded-full mb-2">
                                <div
                                    className="absolute h-full bg-blue-500 rounded-full"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-500 mb-4">
                                {queueItem.isProcessing ? (
                                    timeLeft > 0 ? (
                                        `남은 시간: ${formatTime(timeLeft)}`
                                    ) : (
                                        '제작 완료!'
                                    )
                                ) : (
                                    '대기 중'
                                )}
                            </div>
                            <div className="flex space-x-2 w-full">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => handleCollect(queueItem)}
                                    disabled={!queueItem.isProcessing || timeLeft > 0}
                                >
                                    수령
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                                    onClick={() => handleCancel(queueItem)}
                                    disabled={!queueItem.isProcessing || timeLeft <= 0} // 완료된 항목은 취소 불가
                                >
                                    취소
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
                <Button onClick={collectAll} className="bg-purple-600 hover:bg-purple-700 text-white">
                    모두 수령
                </Button>
                <Button onClick={cancelAll} variant="destructive">
                    모두 취소
                </Button>
            </div>
        </div>
    );
};


export default function CraftingPage() {
    logger.debug('CraftingPage 렌더링 시작');
    const { activeCharacter, updateCharacter, allItems, recipes, allCraftingFacilitiesData, isLoadingData, dataLoadError } = useCharacter();

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Context에서 불러온 데이터를 기반으로 currentFacility와 filteredRecipes 설정
    const currentFacility = useMemo(() => {
        logger.debug('currentFacility useMemo 계산');
        // facility_id가 'metal'인 시설을 찾습니다.
        // public/data/craftingFacilities.json에서 id가 'metal'로 되어있으므로 이에 맞춰 찾습니다.
        const foundFacility = allCraftingFacilitiesData.find(f => f.id === 'metal');
        logger.debug('찾은 시설', { foundFacility });
        return foundFacility || null;
    }, [allCraftingFacilitiesData]);

    const filteredRecipes = useMemo(() => {
        logger.debug('filteredRecipes useMemo 계산', { currentFacilityId: currentFacility?.id });
        if (!currentFacility || !recipes) return [];
        // public/data/recipes.json에서 facility_id가 'metal'로 되어있으므로 이에 맞춰 필터링합니다.
        const filtered = recipes.filter(recipe => recipe.facility_id === currentFacility.id);
        logger.debug('필터링된 레시피', { count: filtered.length });
        return filtered;
    }, [recipes, currentFacility]);


    const handleCardClick = useCallback((recipe: Recipe) => {
        logger.debug('handleCardClick 호출', { recipeId: recipe.resultId });
        setSelectedRecipe(recipe);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        logger.debug('handleCloseModal 호출');
        setIsModalOpen(false);
        setSelectedRecipe(null);
    }, []);

    const canCraftRecipe = useCallback((recipe: Recipe) => {
        logger.debug('canCraftRecipe 호출', { recipeId: recipe.resultId });
        if (!activeCharacter) {
            logger.warn('활성 캐릭터 없음, 제작 가능 여부 확인 불가');
            return false;
        }

        const result = recipe.materials.every(material => {
            const materialItem = allItems[material.itemId.toString()];
            if (!materialItem) {
                logger.warn('재료 아이템을 allItems에서 찾을 수 없음', { itemId: material.itemId });
                return false;
            }
            const currentQuantity = activeCharacter.inventory[material.itemId] || 0;
            const hasEnough = currentQuantity >= material.quantity;
            logger.debug('재료 확인', {
                materialName: materialItem.name,
                required: material.quantity,
                current: currentQuantity,
                hasEnough,
            });
            return hasEnough;
        });
        logger.debug('canCraftRecipe 결과', { recipeId: recipe.resultId, result });
        return result;
    }, [activeCharacter, allItems]);

    const startCrafting = useCallback(() => {
        logger.debug('startCrafting 호출', { selectedRecipeId: selectedRecipe?.resultId });
        if (!activeCharacter || !selectedRecipe || !currentFacility) {
            logger.warn('제작 시작 불가 조건', { activeCharacter: !!activeCharacter, selectedRecipe: !!selectedRecipe, currentFacility: !!currentFacility });
            return;
        }

        if (!canCraftRecipe(selectedRecipe)) {
            logger.warn('재료 부족으로 제작 시작 불가', { selectedRecipeId: selectedRecipe.resultId });
            toast.error('재료가 부족하여 제작을 시작할 수 없습니다.');
            return;
        }

        const facilityId = currentFacility.id;
        const currentQueues = activeCharacter.craftingQueues[facilityId] || [];

        // 비어있는 큐 슬롯 찾기
        const emptySlotIndex = currentQueues.findIndex(q => !q.isProcessing);
        if (emptySlotIndex === -1) {
            logger.warn('제작 큐가 가득 참');
            toast.error('제작 큐가 가득 찼습니다. 현재 제작 중인 아이템을 수령하거나 취소해주세요.');
            return;
        }

        const outputItem = allItems[selectedRecipe.resultId.toString()];
        if (!outputItem) {
            logger.error('결과 아이템을 allItems에서 찾을 수 없음', { resultId: selectedRecipe.resultId });
            toast.error('제작 아이템 정보를 찾을 수 없습니다.');
            return;
        }

        // 인벤토리에서 재료 소모
        const newInventory = { ...activeCharacter.inventory };
        selectedRecipe.materials.forEach(material => {
            const materialItem = allItems[material.itemId.toString()];
            if (materialItem) {
                newInventory[materialItem.id] = (newInventory[materialItem.id] || 0) - material.quantity;
                logger.debug('재료 소모됨', { materialId: materialItem.id, quantity: material.quantity });
            }
        });

        // 새로운 큐 항목 생성
        const newQueueItem: ProcessingQueue = {
            id: emptySlotIndex, // 사용 가능한 슬롯의 인덱스를 ID로 사용
            isProcessing: true,
            startTime: Date.now(),
            duration: selectedRecipe.time, // 초 단위
            timeLeft: selectedRecipe.time,
            totalTime: selectedRecipe.time,
            itemName: outputItem.name,
            quantity: 1, // 한 번 제작 시 1개 생성으로 가정
        };
        logger.debug('새로운 큐 아이템 생성됨', { newQueueItem });

        // 큐 업데이트
        const updatedFacilityQueues = [...currentQueues];
        updatedFacilityQueues[emptySlotIndex] = newQueueItem;

        const newCraftingQueuesRecord = {
            ...activeCharacter.craftingQueues,
            [facilityId]: updatedFacilityQueues,
        };

        updateCharacter(activeCharacter.id, {
            inventory: newInventory,
            craftingQueues: newCraftingQueuesRecord,
        });

        toast.success(`${outputItem.name} 제작을 시작합니다!`);
        logger.debug('제작 시작 완료', { recipeId: selectedRecipe.resultId });
        handleCloseModal();
    }, [activeCharacter, selectedRecipe, currentFacility, allItems, updateCharacter, canCraftRecipe, handleCloseModal]);

    if (isLoadingData) {
        logger.debug('데이터 로딩 중...');
        return <Skeleton className="w-full h-96" />;
    }

    if (dataLoadError) {
        logger.error('데이터 로드 오류', { dataLoadError });
        return <div className="text-red-500">데이터 로드 중 오류 발생: {dataLoadError}</div>;
    }

    if (!activeCharacter) {
        logger.debug('활성 캐릭터 없음');
        return (
            <div className="p-4 text-center text-gray-500">
                캐릭터를 선택하거나 생성해주세요.
                <Link href="/characters" className="text-blue-500 underline ml-2">캐릭터 페이지로 이동</Link>
            </div>
        );
    }

    if (!currentFacility) {
        logger.warn('현재 제작 시설을 찾을 수 없음', { allCraftingFacilitiesData });
        return <div className="text-red-500">제작 시설 데이터를 불러올 수 없습니다.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">제작</h1>
            <p className="text-gray-600 mb-8">'금속 가공' 시설에서 제작 가능한 아이템 목록입니다.</p>

            {/* 제작 큐 현황 */}
            <CraftingQueueDisplay
                activeCharacter={activeCharacter}
                updateCharacter={updateCharacter}
                allItems={allItems}
                currentFacilityId={currentFacility.id}
            />

            <Separator className="my-8" />

            <h2 className="text-2xl font-semibold mb-6 text-gray-800">제작 가능한 레시피</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredRecipes.map((recipe) => (
                    <CraftingRecipeCard
                        key={recipe.resultId}
                        recipe={recipe}
                        facility={currentFacility}
                        allItems={allItems}
                        canCraft={canCraftRecipe(recipe)}
                        activeCharacterInventory={activeCharacter.inventory}
                        onClick={handleCardClick}
                    />
                ))}
            </div>

            {/* 제작 상세 모달 */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{allItems[selectedRecipe?.resultId.toString() || '']?.name || '레시피 상세'}</DialogTitle>
                        <DialogDescription>
                            이 아이템을 제작하시겠습니까?
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRecipe && allItems && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">필요 재료:</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {selectedRecipe.materials.map((material, index) => {
                                    const materialItem = allItems[material.itemId.toString()];
                                    const currentQuantity = activeCharacter.inventory[material.itemId] || 0;
                                    const hasEnough = currentQuantity >= material.quantity;
                                    return (
                                        <li key={index} className={cn(hasEnough ? 'text-gray-700' : 'text-red-600')}>
                                            {materialItem?.name} ({currentQuantity} / {material.quantity})
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="mt-4 text-sm text-gray-600">
                                제작 시간: {selectedRecipe.time}초
                            </div>
                            <Button
                                onClick={startCrafting}
                                className="mt-6 w-full"
                                disabled={!canCraftRecipe(selectedRecipe)}
                            >
                                {canCraftRecipe(selectedRecipe) ? '제작 시작' : '재료 부족'}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}