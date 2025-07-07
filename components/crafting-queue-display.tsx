'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { type Character } from '@/contexts/character-context';
import {
    Item,
    ProcessingQueue,
} from '@/types/page-context';
import { Button } from '@/components/ui/button';

interface CraftingQueueDisplayProps {
    activeCharacter: Character | null;
    updateCharacter: (id: string, updates: Partial<Character>) => void;
    allItems: Record<string, Item>;
    currentFacilityId: string | null;
}

const CraftingQueueDisplay: React.FC<CraftingQueueDisplayProps> = ({ activeCharacter, updateCharacter, allItems, currentFacilityId }) => {
    logger.debug('CraftingQueueDisplay 렌더링 시작', { activeCharacterId: activeCharacter?.id, currentFacilityId });

    const [processingTimers, setProcessingTimers] = useState<Record<string, number>>({});

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

    // Render the queue display
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제작 큐 현황</h2>
            {activeCharacter && currentFacilityId && activeCharacter.craftingQueues[currentFacilityId] && activeCharacter.craftingQueues[currentFacilityId].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCharacter.craftingQueues[currentFacilityId].map((queueItem) => (
                        <div key={queueItem.id} className="border p-4 rounded-lg shadow-sm bg-white">
                            <h3 className="font-bold text-lg mb-2">{queueItem.itemName || '알 수 없는 아이템'}</h3>
                            {queueItem.isProcessing ? (
                                <>
                                    <p className="text-gray-600">남은 시간: {processingTimers[queueItem.id] !== undefined ? processingTimers[queueItem.id] : queueItem.timeLeft}초</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${((queueItem.totalTime - (processingTimers[queueItem.id] !== undefined ? processingTimers[queueItem.id] : queueItem.timeLeft)) / queueItem.totalTime) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex space-x-2 mt-4">
                                        <Button
                                            onClick={() => handleCollect(queueItem)}
                                            disabled={(processingTimers[queueItem.id] !== undefined ? processingTimers[queueItem.id] : queueItem.timeLeft) > 0}
                                            className="bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            수령
                                        </Button>
                                        <Button
                                            onClick={() => handleCancel(queueItem)}
                                            variant="outline"
                                            className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        >
                                            취소
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500">비어있음</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">현재 진행 중인 제작이 없습니다.</p>
            )}
        </div>
    );
};

export default CraftingQueueDisplay;