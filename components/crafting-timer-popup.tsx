"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, XCircle, Package } from "lucide-react"
import { logger } from "@/lib/logger"
import Image from "next/image"

interface Item {
  id: number
  name: string
  category: string
  icon: string
  description: string
  weight: number
  price: number
  tradeable: boolean
  sellable: boolean
  isFavorite: boolean
}

interface ProcessingQueue {
  id: number
  isProcessing: boolean
  timeLeft: number
  totalTime: number
  itemName?: string
  quantity?: number
}

interface CraftingTimerPopupProps {
  isOpen: boolean
  onClose: () => void
  queue: ProcessingQueue | null
  onClaim: (facilityId: string) => void
  onCancel: (facilityId: string, queueId: number) => void
  facilityId: string
  allItems: Item[]
}

export function CraftingTimerPopup({
  isOpen,
  onClose,
  queue,
  onClaim,
  onCancel,
  facilityId,
  allItems
}: CraftingTimerPopupProps) {
  const [currentQueue, setCurrentQueue] = useState<ProcessingQueue | null>(queue);

  useEffect(() => {
    setCurrentQueue(queue);
  }, [queue]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleClaim = useCallback(() => {
    if (currentQueue && currentQueue.timeLeft === 0 && currentQueue.isProcessing) {
      logger.debug(`CraftingTimerPopup: Attempting to claim item for facility ${facilityId}, queue ${currentQueue.id}`);
      onClaim(facilityId);
      onClose(); // Close popup after claiming
    } else {
      logger.debug(`CraftingTimerPopup: Cannot claim. timeLeft: ${currentQueue?.timeLeft}, isProcessing: ${currentQueue?.isProcessing}`);
    }
  }, [currentQueue, onClaim, onClose, facilityId]);

  const handleCancel = useCallback(() => {
    if (currentQueue && currentQueue.isProcessing) {
      logger.debug(`CraftingTimerPopup: Attempting to cancel item for facility ${facilityId}, queue ${currentQueue.id}`);
      onCancel(facilityId, currentQueue.id);
      onClose(); // Close popup after canceling
    } else {
      logger.debug(`CraftingTimerPopup: Cannot cancel. Item is not processing.`);
    }
  }, [currentQueue, onCancel, onClose, facilityId]);

  if (!queue) return null;

  const progress = queue.totalTime > 0 ? ((queue.totalTime - queue.timeLeft) / queue.totalTime) * 100 : 0;

  // Find item icon
  const itemIcon = queue.itemName ? allItems.find(item => item.name === queue.itemName)?.icon : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="w-6 h-6" />
            <span>제작 타이머: {queue.itemName || "알 수 없음"}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              {itemIcon ? (
                <Image
                  src={`/icons/${itemIcon}.png`}
                  alt={queue.itemName || "Item"}
                  width={64}
                  height={64}
                  className="rounded-md"
                />
              ) : (
                <Package className="w-12 h-12 text-blue-600" />
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">수량: {queue.quantity}</p>
            {queue.isProcessing ? (
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatTime(queue.timeLeft)}
              </p>
            ) : queue.timeLeft === 0 ? (
              <p className="text-xl font-bold text-green-600 mt-2">완료됨!</p>
            ) : (
              <p className="text-xl font-bold text-gray-500 mt-2">대기 중</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              총 제작 시간: {formatTime(queue.totalTime)}
            </p>
          </div>
          <Progress value={progress} className="w-full h-3" />
        </div>
        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={!queue.isProcessing || queue.timeLeft === 0}
          >
            <XCircle className="mr-2 h-4 w-4" /> 제작 취소
          </Button>
          <Button
            onClick={handleClaim}
            disabled={queue.timeLeft !== 0 || !queue.isProcessing}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> 아이템 수령
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 