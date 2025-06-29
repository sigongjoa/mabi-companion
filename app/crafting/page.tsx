'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { useCharacter } from '@/contexts/character-context';
import { toast } from 'sonner';
import { Hammer } from 'lucide-react'; // Assuming you want a hammer icon
import { Input } from '@/components/ui/input'; // For search if needed later

interface Item {
    id: string;
    name: string;
    description?: string;
    color?: string;
    qty?: number;
    image?: string;
}

interface Material {
    item: string;
    quantity: number;
}

interface Recipe {
    id: string;
    facility_id: string;
    level_condition: number;
    time: number;
    output_item: string;
    materials: Material[];
}

interface Facility {
    id: string;
    name: string;
    level: number;
    description: string;
}

interface CraftingQueueItem {
    recipeId: string;
    facilityId: string;
    startTime: number;
    duration: number; // seconds
    outputItemName: string;
    outputQuantity: number;
    status: 'in-progress' | 'completed';
}

interface CraftingRecipeCardProps {
    recipe: Recipe;
    onClick: (recipe: Recipe) => void;
    allRawItems: Record<string, Item>;
    canCraft: boolean;
}

const CraftingRecipeCard: React.FC<CraftingRecipeCardProps> = ({ recipe, onClick, allRawItems, canCraft }) => {
    logger.debug('CraftingRecipeCard 렌더링 시작', { recipe });
    const outputItem = allRawItems[recipe.output_item.toLowerCase()];

    const cardColor = outputItem?.color || '#555';

    return (
        <div
            className="document-card cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => {
                logger.debug('레시피 카드 클릭됨', { recipeId: recipe.id });
                onClick(recipe);
            }}
        >
            <div className="p-4 flex flex-col items-center justify-center h-2/3" style={{ backgroundColor: cardColor }}>
                {outputItem?.image ? (
                    <img src={outputItem.image} alt={outputItem.name} className="w-20 h-20 object-contain" />
                ) : (
                    <div className="w-20 h-20 flex items-center justify-center text-white text-2xl font-bold">
                        {outputItem?.name.substring(0, 1) || '?'}
                    </div>
                )}
                <div className="mt-2 text-white text-sm font-semibold text-center truncate w-full">
                    {outputItem?.name || recipe.output_item}
                </div>
            </div>
            <div className="p-2 text-center">
                <div className="text-gray-300 text-xs">
                    필요 레벨: Lv. {recipe.level_condition}
                </div>
                <Button
                    size="sm"
                    className="mt-2 w-full"
                    variant={canCraft ? "default" : "secondary"}
                    disabled={!canCraft}
                >
                    {canCraft ? "가공 가능" : "재료 부족"}
                </Button>
            </div>
        </div>
    );
};

export default function CraftingPage() {
    logger.debug('CraftingPage 렌더링 시작');
    const { activeCharacter, updateCharacter } = useCharacter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [allRawItems, setAllRawItems] = useState<Record<string, Item>>({});
    const [currentFacility, setCurrentFacility] = useState<Facility | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        logger.debug('데이터 가져오기 시작');
        setLoading(true);
        setError(null);
        try {
            const [itemsResponse, facilitiesResponse, recipesResponse] = await Promise.all([
                fetch('/data/items.json'),
                fetch('/data/craftingFacilities.json'),
                fetch('/data/recipes.json'),
            ]);

            const rawItemsData: Record<string, Item> = await itemsResponse.json();
            const allFacilities: Facility[] = await facilitiesResponse.json();
            const allRecipes: Recipe[] = await recipesResponse.json();

            logger.debug('가져온 원시 아이템 데이터', { rawItemsData });
            logger.debug('가져온 시설 데이터', { allFacilities });
            logger.debug('가져온 레시피 데이터', { allRecipes });

            const processedItems: Record<string, Item> = {};
            for (const key in rawItemsData) {
                if (Object.prototype.hasOwnProperty.call(rawItemsData, key)) {
                    processedItems[rawItemsData[key].name.toLowerCase()] = rawItemsData[key];
                }
            }
            setAllRawItems(processedItems);

            // Changed from 'metal_crafting' to 'metal'
            const metalCraftingFacility = allFacilities.find(f => f.id === 'metal');
            setCurrentFacility(metalCraftingFacility || null);

            // Changed from 'metal_crafting' to 'metal'
            const filteredRecipes = allRecipes.filter(recipe => recipe.facility_id === 'metal');
            setRecipes(filteredRecipes);

            logger.debug('데이터 가져오기 완료');
        } catch (err) {
            logger.debug('데이터 가져오기 오류', { error: err });
            setError('데이터를 불러오는 데 실패했습니다.');
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
            logger.debug('데이터 가져오기 finally 블록 완료');
        }
    }, []);

    useEffect(() => {
        logger.debug('useEffect 시작: 데이터 가져오기 호출');
        fetchData();
        logger.debug('useEffect 완료: 데이터 가져오기 호출');
    }, [fetchData]);

    // Timer logic for crafting queues
    useEffect(() => {
        if (!activeCharacter?.craftingQueues || Object.keys(activeCharacter.craftingQueues).length === 0) return; // Modified condition

        logger.debug('제작 큐 타이머 시작');
        const interval = setInterval(() => {
            const now = Date.now();
            let updated = false;
            const newCraftingQueuesRecord = { ...activeCharacter.craftingQueues }; // Create a mutable copy of the record

            for (const facilityId in newCraftingQueuesRecord) {
                const queuesForFacility = newCraftingQueuesRecord[facilityId];
                const newQueuesForFacility = queuesForFacility.map(queueItem => {
                    const endTime = queueItem.startTime + queueItem.duration * 1000;
                    if (queueItem.status === 'in-progress' && now >= endTime) {
                        updated = true;
                        return { ...queueItem, status: 'completed' };
                    }
                    return queueItem;
                });
                newCraftingQueuesRecord[facilityId] = newQueuesForFacility;
            }

            if (updated) {
                logger.debug('제작 큐 상태 업데이트', { newCraftingQueuesRecord });
                updateCharacter(activeCharacter.id, { craftingQueues: newCraftingQueuesRecord });
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            logger.debug('제작 큐 타이머 정리');
        };
    }, [activeCharacter, updateCharacter]);

    const getItemQuantity = useCallback((itemName: string): number => {
        logger.debug('getItemQuantity 호출', { itemName });
        if (!activeCharacter) return 0;
        const itemObj = allRawItems[itemName.toLowerCase()];
        return itemObj ? (activeCharacter.inventory[itemObj.id] || 0) : 0;
    }, [activeCharacter, allRawItems]);

    const canCraft = useCallback((recipe: Recipe): boolean => {
        logger.debug('canCraft 호출', { recipe });
        if (!activeCharacter) return false;
        for (const material of recipe.materials) {
            if (getItemQuantity(material.item) < material.quantity) {
                logger.debug('재료 부족', { material: material.item, needed: material.quantity, has: getItemQuantity(material.item) });
                return false;
            }
        }
        logger.debug('재료 충분함');
        return true;
    }, [activeCharacter, getItemQuantity]);

    const handleCraftItem = useCallback(() => {
        logger.debug('handleCraftItem 호출', { selectedRecipe, activeCharacter });
        if (!activeCharacter || !selectedRecipe) {
            toast.error('오류: 캐릭터 또는 레시피가 선택되지 않았습니다.');
            logger.warn('activeCharacter 또는 selectedRecipe 없음');
            return;
        }

        if (!canCraft(selectedRecipe)) {
            toast.error('재료가 부족합니다.');
            logger.warn('재료 부족으로 제작 불가');
            return;
        }

        const currentFacilityQueues = activeCharacter.craftingQueues[selectedRecipe.facility_id] || [];
        if (currentFacilityQueues.length >= 4) {
            toast.error('해당 시설의 제작 슬롯이 모두 사용 중입니다.');
            logger.warn('제작 슬롯 부족');
            return;
        }

        const newInventory = { ...activeCharacter.inventory };
        for (const material of selectedRecipe.materials) {
            const materialItem = allRawItems[material.item.toLowerCase()];
            if (materialItem) {
                newInventory[materialItem.id] = (newInventory[materialItem.id] || 0) - material.quantity;
                if (newInventory[materialItem.id] < 0) newInventory[materialItem.id] = 0; // Should not happen if canCraft is true
            }
        }

        const newCraftingQueueItem: CraftingQueueItem = {
            recipeId: selectedRecipe.id,
            facilityId: selectedRecipe.facility_id,
            startTime: Date.now(),
            duration: selectedRecipe.time,
            outputItemName: selectedRecipe.output_item,
            outputQuantity: 1, // Defaulting to 1 for now, assuming recipes have single output unless specified
            status: 'in-progress',
        };

        // Update the specific facility's queue within the craftingQueues record
        const updatedCraftingQueuesRecord = {
            ...activeCharacter.craftingQueues,
            [selectedRecipe.facility_id]: [...currentFacilityQueues, newCraftingQueueItem],
        };

        updateCharacter(activeCharacter.id, {
            inventory: newInventory,
            craftingQueues: updatedCraftingQueuesRecord,
        });

        toast.success(`${selectedRecipe.output_item} 제작이 시작되었습니다!`);
        setIsModalOpen(false);
        setSelectedRecipe(null);
        logger.debug('아이템 제작 시작됨', { newInventory, updatedCraftingQueuesRecord });
    }, [activeCharacter, selectedRecipe, canCraft, updateCharacter, allRawItems]);

    const handleCardClick = (recipe: Recipe) => {
        logger.debug('카드 클릭 핸들러 호출', { recipeId: recipe.id });
        setSelectedRecipe(recipe);
        setIsModalOpen(true);
        logger.debug('모달 열림 상태 설정됨');
    };

    const handleCloseModal = () => {
        logger.debug('모달 닫기 핸들러 호출');
        setIsModalOpen(false);
        setSelectedRecipe(null);
        logger.debug('모달 닫힘 상태 설정됨');
    };

    const getRemainingTime = useCallback((queueItem: CraftingQueueItem): string => {
        logger.debug('getRemainingTime 호출', { queueItem });
        const now = Date.now();
        const endTime = queueItem.startTime + queueItem.duration * 1000;
        const remaining = endTime - now;

        if (remaining <= 0) {
            return "완료";
        }

        const totalSeconds = Math.floor(remaining / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const timeString = [
            hours > 0 ? `${hours}시간` : "",
            minutes > 0 ? `${minutes}분` : "",
            seconds > 0 ? `${seconds}초` : "",
        ].filter(Boolean).join(" ") || "0초";

        logger.debug('남은 시간 계산됨', { timeString });
        return timeString;
    }, []);

    const calculateProgress = useCallback((queueItem: CraftingQueueItem): number => {
        logger.debug('calculateProgress 호출', { queueItem });
        const now = Date.now();
        const elapsed = now - queueItem.startTime;
        const progress = (elapsed / (queueItem.duration * 1000)) * 100;
        logger.debug('진행률 계산됨', { progress });
        return Math.min(100, Math.max(0, progress));
    }, []);

    const handleClaimItem = useCallback((itemToClaim: CraftingQueueItem) => {
        logger.debug('handleClaimItem 호출', { itemToClaim });
        if (!activeCharacter) {
            toast.error('오류: 캐릭터 정보가 없습니다.');
            logger.warn('activeCharacter 없음');
            return;
        }

        const newInventory = { ...activeCharacter.inventory };
        const outputItem = allRawItems[itemToClaim.outputItemName.toLowerCase()];

        if (outputItem) {
            newInventory[outputItem.id] = (newInventory[outputItem.id] || 0) + itemToClaim.outputQuantity;
        }

        // Remove item from the specific facility's queue
        const updatedCraftingQueuesRecord = { ...activeCharacter.craftingQueues };
        updatedCraftingQueuesRecord[itemToClaim.facilityId] = updatedCraftingQueuesRecord[itemToClaim.facilityId].filter(item => item !== itemToClaim);

        updateCharacter(activeCharacter.id, {
            inventory: newInventory,
            craftingQueues: updatedCraftingQueuesRecord,
        });

        toast.success(`${itemToClaim.outputItemName} ${itemToClaim.outputQuantity}개가 인벤토리에 추가되었습니다.`);
        logger.debug('아이템 수령됨', { newInventory, updatedCraftingQueuesRecord });
    }, [activeCharacter, updateCharacter, allRawItems]);

    const handleClaimAllCompleted = useCallback(() => {
        logger.debug('handleClaimAllCompleted 호출');
        if (!activeCharacter) {
            toast.error('오류: 캐릭터 정보가 없습니다.');
            logger.warn('activeCharacter 없음');
            return;
        }

        let newInventory = { ...activeCharacter.inventory };
        const updatedCraftingQueuesRecord = { ...activeCharacter.craftingQueues };
        let itemsClaimed = 0;

        for (const facilityId in updatedCraftingQueuesRecord) {
            const queuesForFacility = updatedCraftingQueuesRecord[facilityId];
            const remainingQueuesForFacility: CraftingQueueItem[] = [];

            queuesForFacility.forEach(queueItem => {
                if (queueItem.status === 'completed') {
                    const outputItem = allRawItems[queueItem.outputItemName.toLowerCase()];
                    if (outputItem) {
                        newInventory[outputItem.id] = (newInventory[outputItem.id] || 0) + queueItem.outputQuantity;
                        itemsClaimed++;
                    }
                } else {
                    remainingQueuesForFacility.push(queueItem);
                }
            });
            updatedCraftingQueuesRecord[facilityId] = remainingQueuesForFacility;
        }

        if (itemsClaimed > 0) {
            updateCharacter(activeCharacter.id, {
                inventory: newInventory,
                craftingQueues: updatedCraftingQueuesRecord,
            });
            toast.success(`${itemsClaimed}개의 제작 완료 아이템을 모두 수령했습니다.`);
            logger.debug('모든 완료 아이템 수령됨', { newInventory, updatedCraftingQueuesRecord });
        } else {
            toast.info('수령할 제작 완료 아이템이 없습니다.');
            logger.debug('수령할 아이템 없음');
        }
    }, [activeCharacter, updateCharacter, allRawItems]);

    const handleCancelItem = useCallback((itemToCancel: CraftingQueueItem) => {
        logger.debug('handleCancelItem 호출', { itemToCancel });
        if (!activeCharacter) {
            toast.error('오류: 캐릭터 정보가 없습니다.');
            logger.warn('activeCharacter 없음');
            return;
        }

        // Return materials to inventory
        const newInventory = { ...activeCharacter.inventory };
        const recipe = recipes.find(r => r.id === itemToCancel.recipeId);
        if (recipe) {
            for (const material of recipe.materials) {
                const materialItem = allRawItems[material.item.toLowerCase()];
                if (materialItem) {
                    newInventory[materialItem.id] = (newInventory[materialItem.id] || 0) + material.quantity;
                }
            }
        }

        // Remove item from the specific facility's queue
        const updatedCraftingQueuesRecord = { ...activeCharacter.craftingQueues };
        updatedCraftingQueuesRecord[itemToCancel.facilityId] = updatedCraftingQueuesRecord[itemToCancel.facilityId].filter(item => item !== itemToCancel);

        updateCharacter(activeCharacter.id, {
            inventory: newInventory,
            craftingQueues: updatedCraftingQueuesRecord,
        });

        toast.info(`${itemToCancel.outputItemName} 제작이 취소되고 재료가 반환되었습니다.`);
        logger.debug('제작 취소됨', { newInventory, updatedCraftingQueuesRecord });
    }, [activeCharacter, updateCharacter, recipes, allRawItems]);

    if (loading) {
        logger.debug('로딩 상태 렌더링');
        return (
            <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
                <Skeleton className="w-[300px] h-[100px] rounded-md" />
            </div>
        );
    }

    if (error) {
        logger.debug('오류 상태 렌더링', { error });
        return (
            <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50 text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    logger.debug('일반 페이지 내용 렌더링');
    const allCraftingQueues = activeCharacter ? Object.values(activeCharacter.craftingQueues).flat() : []; // Flatten all queues
    const emptySlots = Array(4 - allCraftingQueues.length).fill(null); // Adjusted to total slots

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="modern-card fade-in mb-6">
                <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-purple-100 rounded-2xl flex-shrink-0">
                                <Hammer className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-4xl font-bold text-gray-900">가공 시설</h1>
                                <p className="text-lg text-gray-600 mt-1">아이템 제작 및 생산</p>
                                <p className="text-sm text-gray-500 mt-1">다양한 가공 시설에서 아이템을 제작하고 생산 현황을 관리하세요.</p>
                            </div>
                        </div>
                        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 text-gray-800 font-medium">
                            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mr-2">
                                <span className="text-yellow-900 text-xs font-bold">G</span>
                            </div>
                            <span>{activeCharacter?.gold.toLocaleString() || '0'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Pane - Crafting Slots and Facility Info */}
                <div className="document-card p-6 flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-4 text-center text-gray-900">
                        {currentFacility ? `${currentFacility.name} Lv. ${currentFacility.level || 1}` : '시설 정보 로딩 중...'}
                    </h2>
                    <p className="text-gray-600 text-sm text-center mb-6">
                        {currentFacility?.description || ''}
                    </p>
                    <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-2xl font-bold mb-6">
                        Forge Placeholder
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                        {allCraftingQueues.map((queueItem, index) => {
                            const progress = calculateProgress(queueItem);
                            const remainingTime = getRemainingTime(queueItem);
                            const isCompleted = remainingTime === "완료";
                            const outputItem = allRawItems[queueItem.outputItemName.toLowerCase()];

                            return (
                                <div key={index} className="relative w-full aspect-square rounded-lg bg-gray-100 border border-gray-200 flex flex-col items-center justify-center overflow-hidden p-2">
                                    {/* Progress circle */}
                                    {!isCompleted && (
                                        <div
                                            className="absolute inset-0 rounded-lg"
                                            style={{
                                                background: `conic-gradient(#a78bfa ${progress}%, transparent ${progress}%)`,
                                            }}
                                        ></div>
                                    )}
                                    <div className="relative z-10 flex flex-col items-center justify-center text-gray-800 text-sm font-medium text-center">
                                        {isCompleted ? (
                                            <>
                                                <span className="text-green-600 font-bold">완료!</span>
                                                {outputItem?.image ? (
                                                    <img src={outputItem.image} alt={outputItem.name} className="w-10 h-10 object-contain mt-1" />
                                                ) : (
                                                    <span className="text-xs mt-1">{outputItem?.name || queueItem.outputItemName}</span>
                                                )}
                                                <span className="text-xs text-gray-500 mt-1">x{queueItem.outputQuantity}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{remainingTime}</span>
                                                {outputItem?.image ? (
                                                    <img src={outputItem.image} alt={outputItem.name} className="w-10 h-10 object-contain mt-1" />
                                                ) : (
                                                    <span className="text-xs mt-1">{outputItem?.name || queueItem.outputItemName}</span>
                                                )}
                                                <span className="text-xs text-gray-500 mt-1">x{queueItem.outputQuantity}</span>
                                            </>
                                        )}
                                    </div>
                                    {isCompleted && ( // Individual claim/cancel buttons for completed items
                                        <div className="absolute bottom-2 w-full flex justify-center text-xs space-x-1">
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleClaimItem(queueItem)}>
                                                수령
                                            </Button>
                                            <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50" onClick={() => handleCancelItem(queueItem)}>
                                                취소
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {emptySlots.map((_, index) => (
                            <div key={`empty-${index}`} className="relative w-full aspect-square rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                                <span className="text-sm">비어있음</span>
                            </div>
                        ))}
                    </div>
                    <Button 
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors duration-200"
                        onClick={handleClaimAllCompleted}
                        disabled={activeCharacter?.craftingQueues && Object.values(activeCharacter.craftingQueues).flat().filter(item => item.status === 'completed').length === 0}
                    >
                        모두 받기
                    </Button>
                </div>

                {/* Right Pane - Recipes */}
                <div className="document-card p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">제작 레시피</h2>
                    <div className="flex items-center mb-4">
                        <Button variant="outline" className="px-6 py-2 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50">
                            전체
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {recipes.map((recipe) => (
                            <CraftingRecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onClick={handleCardClick}
                                allRawItems={allRawItems}
                                canCraft={canCraft(recipe)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Recipe Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white text-gray-900 border border-gray-200 rounded-lg shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                            {allRawItems[selectedRecipe?.output_item.toLowerCase()]?.name || selectedRecipe?.output_item || '레시피 상세'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 text-sm">
                            {allRawItems[selectedRecipe?.output_item.toLowerCase()]?.description || '설명 없음'}
                        </DialogDescription>
                    </DialogHeader>
                    <Separator className="my-4 bg-gray-200" />
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            ▲ {currentFacility ? currentFacility.name : '시설'} Lv. {selectedRecipe?.level_condition || 1}
                        </p>
                        <p className="text-gray-700">
                            ◷ 가공 시간 {selectedRecipe?.time || 0}초 소요
                        </p>
                        <h3 className="text-lg font-semibold text-gray-800 mt-6">필요한 재료</h3>
                        <div className="space-y-2">
                            {selectedRecipe?.materials.length ? (
                                selectedRecipe.materials.map((material, index) => {
                                    const rawMaterial = allRawItems[material.item.toLowerCase()];
                                    const hasEnough = getItemQuantity(material.item) >= material.quantity;
                                    return (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md" style={{ backgroundColor: rawMaterial?.color || '#888' }}></div>
                                            <div>
                                                <p className="text-gray-800 font-medium">{material.item}</p>
                                                <p className={`text-sm ${hasEnough ? 'text-green-600' : 'text-red-600'}`}>
                                                    {getItemQuantity(material.item)} / {material.quantity}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-600">재료 정보 없음</p>
                            )}
                        </div>
                        <p className="text-gray-700 text-sm mt-6">가까운 설비: 티비흐</p>
                    </div>
                    <Button 
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg mt-6"
                        onClick={handleCraftItem}
                        disabled={!canCraft(selectedRecipe!) || (allCraftingQueues.length || 0) >= 4}
                    >
                        가공하러 가기
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}