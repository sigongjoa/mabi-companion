"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"

interface ExpandableTextProps {
  text: string
  maxLength?: number
  className?: string
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, maxLength = 200, className }) => {
  logger.debug("ExpandableText 컴포넌트 렌더링 시작", { textLength: text.length, maxLength });
  const [isExpanded, setIsExpanded] = useState(false);

  // 텍스트가 최대 길이를 초과하는지 확인
  const isLongText = text.length > maxLength;

  // 표시할 텍스트 결정
  const displayedText = isLongText && !isExpanded ? `${text.substring(0, maxLength)}...` : text;

  const toggleExpand = () => {
    logger.debug("toggleExpand 호출", { beforeIsExpanded: isExpanded });
    setIsExpanded(prev => !prev);
    logger.debug("toggleExpand 완료", { afterIsExpanded: !isExpanded });
  };

  logger.debug("ExpandableText 컴포넌트 렌더링 완료");
  return (
    <div className={className}>
      <p className="text-gray-700 whitespace-pre-wrap">{displayedText}</p>
      {isLongText && (
        <Button
          variant="link"
          onClick={toggleExpand}
          className="p-0 h-auto text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? "접기" : "더 보기"}
        </Button>
      )}
    </div>
  );
};

export default ExpandableText; 