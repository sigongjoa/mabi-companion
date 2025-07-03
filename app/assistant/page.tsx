"use client"

import React, { useState, useEffect } from 'react';
import { logger } from "@/lib/logger";
import { PageHeader } from "@/components/page-header";
import { Brain } from "lucide-react";

// localStorage에 저장된 데이터 키 목록
const LOCAL_STORAGE_KEYS = [
  'mabinogi-favorites',
  'characters',
  'activeCharacterId',
  'viewMode',
  'characterGems',
  'craftingQueues',
  'inventory',
  'currencyTimers',
  'isSidebarOpen',
  // 새로 추가된 아바타 컬렉션 데이터 키
  'mabinogi-avatar-collection'
];

// 각 데이터 키에 대한 한글 설명
const DATA_DESCRIPTIONS: { [key: string]: string } = {
  'mabinogi-favorites': '즐겨찾기 아이템',
  'characters': '캐릭터 목록',
  'activeCharacterId': '현재 활성화된 캐릭터 ID',
  'viewMode': '캐릭터 보기 모드',
  'characterGems': '캐릭터 보석 정보',
  'craftingQueues': '가공 대기열',
  'inventory': '인벤토리',
  'currencyTimers': '재화 타이머',
  'isSidebarOpen': '사이드바 상태',
  // 새로 추가된 아바타 컬렉션 데이터 설명
  'mabinogi-avatar-collection': '아바타 컬렉션 보유 현황'
};

// 가상의 LLM API 호출 함수 (콘솔 로그로 대체)
async function queryLLM(prompt: string) {
  logger.debug(`---- LLM에 전송될 프롬프트 ----`);
  logger.debug(prompt);
  // 여기에 실제 LLM API 호출 로직을 구현합니다.
  // 예: const response = await openai.chat.completions.create(...)
  return "선택된 데이터를 성공적으로 받았습니다. 무엇을 도와드릴까요?";
}


// 데이터 선택 모달 컴포넌트
const DataSelectionModal = ({ isOpen, onClose, onConfirm }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedKeys: string[]) => void;
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  logger.debug(`DataSelectionModal rendered. isOpen: ${isOpen}`);

  useEffect(() => {
    if (isOpen) {
      logger.debug(`DataSelectionModal opened. Resetting selected keys.`);
      setSelectedKeys([]); // 모달이 열릴 때마다 선택 초기화
    }
  }, [isOpen]);


  if (!isOpen) {
    return null;
  }

  const handleCheckboxChange = (key: string) => {
    logger.debug(`Checkbox for key '${key}' changed.`);
    setSelectedKeys(prev => {
      const newSelectedKeys = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      logger.debug(`New selected keys: ${newSelectedKeys.join(', ')}`);
      return newSelectedKeys;
    });
  };

  const handleConfirm = () => {
    logger.debug(`Confirming data selection. Selected keys: ${selectedKeys.join(', ')}`);
    onConfirm(selectedKeys);
    onClose();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={styles.modalTitle}>LLM에게 전송할 데이터 선택</h3>
        <p style={styles.modalDescription}>AI 어시스턴트에게 제공할 컨텍스트를 선택하세요.</p>
        <div style={styles.checkboxContainer}>
          {LOCAL_STORAGE_KEYS.map(key => (
            <div key={key} style={styles.checkboxItem}>
              <input
                type="checkbox"
                id={key}
                checked={selectedKeys.includes(key)}
                onChange={() => handleCheckboxChange(key)}
                style={styles.checkboxInput}
              />
              <label htmlFor={key} style={styles.checkboxLabel}>
                {DATA_DESCRIPTIONS[key] || key}
              </label>
            </div>
          ))}
        </div>
        <div style={styles.modalActions}>
          <button onClick={() => {
            logger.debug(`Data selection modal: Cancel button clicked.`);
            onClose();
          }} style={{...styles.button, ...styles.buttonSecondary}}>취소</button>
          <button onClick={handleConfirm} style={{...styles.button, ...styles.buttonPrimary}}>선택 완료 및 전송</button>
        </div>
      </div>
    </div>
  );
};


// 메인 채팅 컴포넌트
export default function AIAssistantChat() {
  logger.debug("AIAssistantChat 함수 진입");
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  logger.debug(`AIAssistantChat component rendered. Modal open state: ${isModalOpen}`);

  // 모달에서 선택된 데이터를 처리하는 함수
  const handleConfirmSelection = (selectedKeys: string[]) => {
    logger.debug("handleConfirmSelection 함수 진입", { selectedKeys });
    if (selectedKeys.length === 0) {
      logger.debug("전송할 데이터가 없습니다. 알림을 표시합니다.");
      alert("전송할 데이터를 하나 이상 선택해주세요.");
      return;
    }

    let prompt = "아래는 사용자가 선택한 현재 애플리케이션 데이터입니다. 이 정보를 바탕으로 다음 질문에 답변해주세요.\n\n";
    prompt += "--- 사용자가 선택한 데이터 ---\n";
    logger.debug("프롬프트 구성을 시작합니다.");

    selectedKeys.forEach(key => {
      logger.debug(`데이터 키 처리: ${key}`);
      try {
        const item = localStorage.getItem(key);
        if (item) {
          prompt += `\n[${DATA_DESCRIPTIONS[key] || key} (${key})]:\n`;
          prompt += "```json\n"; // Escaping backticks for prompt string
          // JSON.parse 시도, 실패하면 원본 문자열 사용
          try {
             prompt += JSON.stringify(JSON.parse(item), null, 2);
             logger.debug(`키 ${key}에 대한 JSON 파싱 및 추가 성공`);
          } catch {
             prompt += item;
             logger.debug(`키 ${key}에 대한 원본 문자열 추가 (유효한 JSON 아님)`);
          }
          prompt += "\n```\n";
        } else {
          logger.debug(`localStorage 항목 '${key}'를 찾을 수 없습니다.`);
        }
      } catch (error) {
        logger.debug(`localStorage에서 '${key}' 데이터 읽기 오류 발생: ${error}`);
        console.error(`'${key}' 데이터를 읽는 중 오류 발생:`, error);
      }
    });

    prompt += "\n--- 데이터 끝 ---\n\n이제 이 정보를 바탕으로 질문을 입력하세요.";
    logger.debug("프롬프트 구성 완료. 메시지 입력 필드를 설정합니다.");
    // 가공된 프롬프트를 메시지 입력창에 설정
    setMessage(prompt);
    logger.debug("handleConfirmSelection 함수 종료");
  };
  
  const handleSendMessage = async () => {
    logger.debug("handleSendMessage 함수 진입", { messageLength: message.trim().length });
    if (!message.trim()) {
      logger.debug("메시지가 비어있습니다. 전송을 중단합니다.");
      return;
    }
    // ... 실제 메시지 전송 로직 ...
    logger.debug(`메시지 전송: ${message}`);
    // 예시: await queryLLM(message);
    setMessage('');
    logger.debug("메시지 전송 및 입력 지우기 완료");
    logger.debug("handleSendMessage 함수 종료");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="AI 어시스턴트"
        description="메시지를 입력하거나, 데이터를 선택하여 질문의 컨텍스트를 추가하세요."
        icon={<Brain className="w-8 h-8 text-blue-600" />}
      />

      <div className="modern-card fade-in p-6">
        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => {
              logger.debug(`메시지 입력 변경. 새 값 길이: ${e.target.value.length}`);
              setMessage(e.target.value);
            }}
            placeholder="메시지를 입력하거나, 데이터를 선택하여 질문의 컨텍스트를 추가하세요."
            className="w-full min-h-[120px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button onClick={() => {
              logger.debug(`"컨텍스트 데이터 선택" 버튼 클릭. 모달을 엽니다.`);
              setIsModalOpen(true);
            }} className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500">
              컨텍스트 데이터 선택
            </button>
            <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
              전송
            </button>
          </div>
        </div>
      </div>

      <DataSelectionModal
        isOpen={isModalOpen}
        onClose={() => {
          logger.debug(`DataSelectionModal 닫힘.`);
          setIsModalOpen(false);
        }}
        onConfirm={handleConfirmSelection}
      />
    </div>
  );
}

// 간단한 스타일 객체 (이제 필요 없는 스타일은 제거하거나 Tailwind CSS로 대체)
const styles: { [key: string]: React.CSSProperties } = {
    // container, title, inputArea, textarea, buttonContainer, button, buttonPrimary, buttonSecondary, buttonAccent 스타일은 Tailwind CSS로 대체
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '500px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    modalTitle: { marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '15px' },
    modalDescription: { color: '#666', fontSize: '14px' },
    checkboxContainer: { maxHeight: '300px', overflowY: 'auto', padding: '10px', border: '1px solid #eee', borderRadius: '4px', marginTop: '15px' },
    checkboxItem: { display: 'flex', alignItems: 'center', padding: '8px 0' },
    checkboxInput: { marginRight: '10px', width: '16px', height: '16px' },
    checkboxLabel: { fontSize: '16px', cursor: 'pointer' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' },
}; 