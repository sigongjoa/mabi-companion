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
import { Hammer, Plus, Minus, Package, Sparkles, LayoutGrid, Table2, Star, User, Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sidebar } from "@/components/sidebar";
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
    }, [recipe.materials, allItems, activeCharacterInventory, recipe.resultId]);

    const cardColor = '#555'; // 모든 카드에 동일한 배경색 적용

    return (
        <div
            className="flex flex-col gap-3 pb-3"
            onClick={() => {
                logger.debug('레시피 카드 클릭됨', { recipeId: recipe.resultId });
                onClick(recipe);
            }}
        >
            <div
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl bg-blue-500"
                // style={{ backgroundImage: `url(${outputItem?.icon || ''})` }}
            ></div>
            <div>
                <p className="text-[#111518] text-base font-medium leading-normal">{outputItem?.name || '알 수 없음'}</p>
                <p className="text-[#637c88] text-sm font-normal leading-normal">
                    Materials: {materialsStatus.map(mat => `${mat.materialItem?.name || '알 수 없음'} x${mat.requiredQuantity}`).join(', ')}
                    , Time: {recipe.craftingTime}m
                </p>
            </div>
        </div>
    );
};

import CraftingQueueDisplay from '@/components/crafting-queue-display';

export default function CraftingPage() {
    const { activeCharacter, allItems, allRecipes, updateCharacter } = useCharacter();
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isCrafting, setIsCrafting] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const facilities: CraftingFacility[] = useMemo(() => [
        { id: 'workbench', name: '작업대', description: '기본적인 아이템을 제작합니다.' },
        { id: 'furnace', name: '용광로', description: '금속 제련 및 주괴 제작에 사용됩니다.' },
        { id: 'alchemy_station', name: '연금술 스테이션', description: '포션 및 마법 아이템을 제작합니다.' },
    ], []);

    const activeCharacterInventory = useMemo(() => {
        return activeCharacter?.inventory || {};
    }, [activeCharacter]);

    const filteredRecipes = useMemo(() => {
        let recipes = Object.values(allRecipes || {});

        if (filter !== 'All') {
            recipes = recipes.filter(recipe => recipe.category === filter);
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            recipes = recipes.filter(recipe => {
                const outputItem = allItems[recipe.resultId.toString()];
                return outputItem?.name.toLowerCase().includes(lowerCaseSearchTerm);
            });
        }
        return recipes;
    }, [allRecipes, filter, searchTerm, allItems]);

    const handleCraftItem = useCallback(() => {
        if (!activeCharacter || !selectedRecipe) return;

        const missingMaterials = selectedRecipe.materials.filter(material => {
            const currentQuantity = activeCharacterInventory[material.itemId] || 0;
            return currentQuantity < material.quantity * quantity;
        });

        if (missingMaterials.length > 0) {
            toast.error('재료가 부족합니다!', {
                description: missingMaterials.map(m => allItems[m.itemId]?.name || '알 수 없음').join(', ') + '이(가) 부족합니다.'
            });
            return;
        }

        setIsCrafting(true);

        const newCraftingQueueItem: ProcessingQueue = {
            id: `craft_${Date.now()}`,
            itemName: allItems[selectedRecipe.resultId]?.name || '알 수 없음',
            itemId: selectedRecipe.resultId,
            quantity: quantity,
            craftingTime: selectedRecipe.craftingTime * quantity, // Total time
            timeLeft: selectedRecipe.craftingTime * quantity, // Initial time left
            isProcessing: true,
            startTime: Date.now(),
            facilityId: selectedRecipe.facilityId, // Add facilityId to queue item
        };

        const updatedCraftingQueues = {
            ...activeCharacter.craftingQueues,
            [selectedRecipe.facilityId]: [
                ...(activeCharacter.craftingQueues?.[selectedRecipe.facilityId] || []),
                newCraftingQueueItem,
            ],
        };

        const updatedInventory = { ...activeCharacterInventory };
        selectedRecipe.materials.forEach(material => {
            updatedInventory[material.itemId] = (updatedInventory[material.itemId] || 0) - (material.quantity * quantity);
        });

        updateCharacter(activeCharacter.id, {
            craftingQueues: updatedCraftingQueues,
            inventory: updatedInventory,
        });

        toast.success(`${allItems[selectedRecipe.resultId]?.name || '아이템'} ${quantity}개 제작을 시작합니다!`);
        setSelectedRecipe(null);
        setQuantity(1);
        setIsCrafting(false);
    }, [activeCharacter, selectedRecipe, quantity, activeCharacterInventory, allItems, updateCharacter]);

    if (!activeCharacter) {
        return (
            <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
                <div className="layout-container flex h-full grow flex-col">
                    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f3f4] px-10 py-3">
                        <div className="flex items-center gap-4 text-[#111518]">
                            <div className="size-4">
                                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <h2 className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em]">Mabinogi Mobile</h2>
                        </div>
                        <div className="flex flex-1 justify-end gap-8">
                            <div className="flex items-center gap-9">
                                <a className="text-[#111518] text-sm font-medium leading-normal" href="#">Home</a>
                                <a className="text-[#111518] text-sm font-medium leading-normal" href="#">Crafting</a>
                                <a className="text-[#111518] text-sm font-medium leading-normal" href="#">Inventory</a>
                                <a className="text-[#111518] text-sm font-medium leading-normal" href="#">Quests</a>
                                <a className="text-[#111518] text-sm font-medium leading-normal" href="#">Community</a>
                            </div>
                            <button
                                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f0f3f4] text-[#111518] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                            >
                                <Bell className="w-5 h-5" />
                            </button>
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-blue-500"
                                // style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAm_J5_vyVfvdH2_8C_D8Lfpjev_cahyqQt42fq0IpC7NSkLJE7zyFtH29VXikDgBDAKKFvorUBRox1tle2jiCRG5ABu_qbtytMfoi30JwnI-Ki8bI3X5Vy7_aYtzjUfe5OXEA_gJZXkbdb9qwcd7VLxhosyGS96G6JmPU0bio4dH5nYDaq11D3ttj3Mjig9U2OGeWZi-Zk8G1_HpasyI6u-GSCgf6H_dR6irmL4-5QdlqLeviDkpIdeS0DBlie8CNLrJueG3UvvBYW")' }}
                            ></div>
                        </div>
                    </header>
                    <div className="px-40 flex flex-1 justify-center py-5">
                        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                            <div className="flex flex-wrap justify-between gap-3 p-4"><p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight min-w-72">Crafting</p></div>
                            <div className="card fade-in p-6 text-center text-muted-foreground">
                                캐릭터를 선택해주세요.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f3f4] px-10 py-3">
                    <div className="flex items-center gap-4 text-[#111518]">
                        <div className="size-4">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em]">Mabinogi Mobile</h2>
                    </div>
                    <div className="flex flex-1 justify-end gap-8">
                        <div className="flex items-center gap-9">
                            <a className="text-[#111518] text-sm font-medium leading-normal" href="#">Home</a>
                            <a className="text-[#111518] text-sm font-medium leading-normal" href="#">Crafting</a>
                            <a className="text-[#111518] text-sm font-medium leading-normal" href="#">Inventory</a>
                            <a className="text-[#111518] text-sm font-medium leading-normal" href="#">Quests</a>
                            <a className="text-[#111518] text-sm font-medium leading-normal" href="#">Community</a>
                        </div>
                        <button
                            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f0f3f4] text-[#111518] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                        >
                            <Bell className="w-5 h-5" />
                        </button>
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-blue-500"
                            // style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAm_J5_vyVfvdH2_8C_D8Lfpjev_cahyqQt42fq0IpC7NSkLJE7zyFtH29VXikDgBDAKKFvorUBRox1tle2jiCRG5ABu_qbtytMfoi30JwnI-Ki8bI3X5Vy7_aYtzjUfe5OXEA_gJZXkbdb9qwcd7VLxhosyGS96G6JmPU0bio4dH5nYDaq11D3ttj3Mjig9U2OGeWZi-Zk8G1_HpasyI6u-GSCgf6H_dR6irmL4-5QdlqLeviDkpIdeS0DBlie8CNLrJueG3UvvBYW")' }}
                        ></div>
                    </div>
                </header>
                <div className="px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        <div className="flex flex-wrap justify-between gap-3 p-4"><p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight min-w-72">Crafting</p></div>
                        <div className="px-4 py-3">
                            <label className="flex flex-col min-w-40 h-12 w-full">
                                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                                    <div
                                        className="text-[#637c88] flex border-none bg-[#f0f3f4] items-center justify-center pl-4 rounded-l-xl border-r-0"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                                            <path
                                                d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                                            ></path>
                                        </svg>
                                    </div>
                                    <Input
                                        placeholder="Search for recipes..."
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111518] focus:outline-0 focus:ring-0 border-none bg-[#f0f3f4] focus:border-none h-full placeholder:text-[#637c88] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </label>
                        </div>
                        <div className="pb-3">
                            <div className="flex border-b border-[#dce2e5] px-4 gap-8">
                                <button
                                    className={cn(
                                        "flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4",
                                        filter === 'All' ? "border-b-[#111518] text-[#111518]" : "border-b-transparent text-[#637c88]"
                                    )}
                                    onClick={() => setFilter('All')}
                                >
                                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">All</p>
                                </button>
                                <button
                                    className={cn(
                                        "flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4",
                                        filter === 'Weapon' ? "border-b-[#111518] text-[#111518]" : "border-b-transparent text-[#637c88]"
                                    )}
                                    onClick={() => setFilter('Weapon')}
                                >
                                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Weapons</p>
                                </button>
                                <button
                                    className={cn(
                                        "flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4",
                                        filter === 'Armor' ? "border-b-[#111518] text-[#111518]" : "border-b-transparent text-[#637c88]"
                                    )}
                                    onClick={() => setFilter('Armor')}
                                >
                                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Armor</p>
                                </button>
                                <button
                                    className={cn(
                                        "flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4",
                                        filter === 'Tool' ? "border-b-[#111518] text-[#111518]" : "border-b-transparent text-[#637c88]"
                                    )}
                                    onClick={() => setFilter('Tool')}
                                >
                                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Tools</p>
                                </button>
                                <button
                                    className={cn(
                                        "flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4",
                                        filter === 'Consumable' ? "border-b-[#111518] text-[#111518]" : "border-b-transparent text-[#637c88]"
                                    )}
                                    onClick={() => setFilter('Consumable')}
                                >
                                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Consumables</p>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
                            {filteredRecipes.map(recipe => {
                                const facility = facilities.find(f => f.id === recipe.facilityId);
                                if (!facility) return null;
                                const canCraft = recipe.materials.every(material => {
                                    const currentQuantity = activeCharacterInventory[material.itemId] || 0;
                                    return currentQuantity >= material.quantity;
                                });
                                return (
                                    <CraftingRecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        facility={facility}
                                        allItems={allItems}
                                        canCraft={canCraft}
                                        activeCharacterInventory={activeCharacterInventory}
                                        onClick={setSelectedRecipe}
                                    />
                                );
                            })}
                        </div>
                        <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Crafting Queue</h2>
                        <CraftingQueueDisplay
                            craftingQueues={activeCharacter.craftingQueues || {}}
                            facilities={facilities}
                            allItems={allItems}
                            updateCharacter={updateCharacter}
                            activeCharacterId={activeCharacter.id}
                        />
                        <div className="flex gap-4 py-6 px-4">
                            <div className="flex grow basis-0 flex-col items-stretch gap-4">
                                <div className="flex h-14 grow items-center justify-center rounded-xl px-3 bg-[#f0f3f4]">
                                    <p className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em]">01</p>
                                </div>
                                <div className="flex items-center justify-center"><p className="text-[#111518] text-sm font-normal leading-normal">Hours</p></div>
                            </div>
                            <div className="flex grow basis-0 flex-col items-stretch gap-4">
                                <div className="flex h-14 grow items-center justify-center rounded-xl px-3 bg-[#f0f3f4]">
                                    <p className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em]">23</p>
                                </div>
                                <div className="flex items-center justify-center"><p className="text-[#111518] text-sm font-normal leading-normal">Minutes</p></div>
                            </div>
                            <div className="flex grow basis-0 flex-col items-stretch gap-4">
                                <div className="flex h-14 grow items-center justify-center rounded-xl px-3 bg-[#f0f3f4]">
                                    <p className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em]">45</p>
                                </div>
                                <div className="flex items-center justify-center"><p className="text-[#111518] text-sm font-normal leading-normal">Seconds</p></div>
                            </div>
                        </div>
                        <div className="flex justify-stretch">
                            <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-between">
                                <Button
                                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#19a1e5] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                                    onClick={handleCraftItem}
                                    disabled={!selectedRecipe || isCrafting}
                                >
                                    <span className="truncate">Start Crafting</span>
                                </Button>
                                <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{selectedRecipe?.name || ''} 제작</DialogTitle>
                                            <DialogDescription>
                                                {selectedRecipe ? `${allItems[selectedRecipe.resultId]?.name || '알 수 없음'}을(를) 제작합니다.` : ''}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex items-center justify-center space-x-4 py-4">
                                            <Button variant="outline" size="icon" onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <Input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Number(e.target.value))}
                                                className="w-24 text-center"
                                            />
                                            <Button variant="outline" size="icon" onClick={() => setQuantity(prev => prev + 1)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Button onClick={handleCraftItem} disabled={isCrafting}>
                                            {isCrafting ? '제작 중...' : '제작 시작'}
                                        </Button>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f0f3f4] text-[#111518] text-sm font-bold leading-normal tracking-[0.015em]"
                                    onClick={() => {
                                        // Implement manage queue functionality or navigate to a queue management page
                                        toast.info("Manage Queue functionality not yet implemented.");
                                    }}
                                >
                                    <span className="truncate">Manage Queue</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}