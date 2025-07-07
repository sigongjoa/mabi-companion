"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Clock, Package, CheckCircle } from "lucide-react"
import { logger } from "@/lib/logger"
import Image from "next/image"
import { cn } from "@/lib/utils"

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

interface CraftingQueueItemProps {
  queue: ProcessingQueue;
  onOpenTimerPopup: (queue: ProcessingQueue, facilityId: string) => void;
  facilityId: string;
  allItems: Item[];
}

export function CraftingQueueItem({ queue, onOpenTimerPopup, facilityId, allItems }: CraftingQueueItemProps) {
  logger.debug(`CraftingQueueItem: Rendering queue ID ${queue.id}, isProcessing: ${queue.isProcessing}, timeLeft: ${queue.timeLeft}`);

  const progress = queue.totalTime > 0 ? ((queue.totalTime - queue.timeLeft) / queue.totalTime) * 100 : 0;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isCompleted = queue.timeLeft === 0 && queue.isProcessing;
  const isEmpty = !queue.isProcessing && queue.timeLeft === 0 && !queue.itemName;
  const isProcessing = queue.isProcessing && queue.timeLeft > 0;
  const isWaiting = !queue.isProcessing && queue.timeLeft > 0;

  const itemIcon = queue.itemName ? allItems.find(item => item.name === queue.itemName)?.icon : null;

  const handleClick = () => {
    logger.debug(`CraftingQueueItem: Clicked for queue item ${queue.id}. Opening timer popup.`);
    if (!isEmpty) {
      onOpenTimerPopup(queue, facilityId);
    }
  };

  return (
    <div
      className={cn(
        "relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200",
        "bg-gray-700 border-2",
        isEmpty ? "border-dashed border-gray-600" : "border-solid border-gray-500",
        {
          "hover:scale-105 hover:shadow-lg": !isEmpty,
        }
      )}
      onClick={handleClick}
    >
      <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-600"
          strokeWidth="6"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className={cn(
            "transition-all duration-500 ease-in-out",
            isProcessing ? "text-blue-500" : isCompleted ? "text-green-500" : "text-orange-500"
          )}
          strokeWidth="6"
          strokeDasharray={2 * Math.PI * 45}
          strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>

      <div className="absolute flex flex-col items-center justify-center p-1">
        {itemIcon && !isEmpty ? (
          <Image
            src={`/icons/${itemIcon}.png`}
            alt={queue.itemName || "Item"}
            width={40}
            height={40}
            className="rounded-md"
          />
        ) : isCompleted ? (
          <CheckCircle className="w-8 h-8 text-green-400" />
        ) : isEmpty ? (
          <Package className="w-8 h-8 text-gray-500" />
        ) : (
          <Clock className="w-8 h-8 text-orange-400" />
        )}
      </div>

      {isProcessing && (
        <span className="absolute bottom-1 text-xs text-white font-semibold">
          {Math.round(progress)}%
        </span>
      )}
      {isCompleted && (
        <span className="absolute bottom-1 text-xs text-white font-semibold">완료</span>
      )}
      {isEmpty && (
        <span className="absolute bottom-1 text-xs text-gray-400">비어있음</span>
      )}
      {isWaiting && (
        <span className="absolute bottom-1 text-xs text-white font-semibold">대기중</span>
      )}
    </div>
  );
} 