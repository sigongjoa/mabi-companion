"use client"

import React, { useState, useEffect } from 'react';
import { logger } from "@/lib/logger";

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
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  logger.debug(`AIAssistantChat component rendered. Modal open state: ${isModalOpen}`);

  // 모달에서 선택된 데이터를 처리하는 함수
  const handleConfirmSelection = (selectedKeys: string[]) => {
    logger.debug(`handleConfirmSelection called with keys: ${selectedKeys.join(', ')}`);
    if (selectedKeys.length === 0) {
      alert("전송할 데이터를 하나 이상 선택해주세요.");
      logger.debug(`No data selected. Alert shown.`);
      return;
    }

    let prompt = "아래는 사용자가 선택한 현재 애플리케이션 데이터입니다. 이 정보를 바탕으로 다음 질문에 답변해주세요.\n\n";
    prompt += "--- 사용자가 선택한 데이터 ---\n";
    logger.debug(`Starting to build prompt with selected data.`);

    selectedKeys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          prompt += `\n[${DATA_DESCRIPTIONS[key] || key} (${key})]:\n`;
          prompt += "```json\n"; // Escaping backticks for prompt string
          // JSON.parse 시도, 실패하면 원본 문자열 사용
          try {
             prompt += JSON.stringify(JSON.parse(item), null, 2);
             logger.debug(`Successfully parsed and added JSON for key: ${key}`);
          } catch {
             prompt += item;
             logger.debug(`Added raw string for key: ${key} (not valid JSON)`);
          }
          prompt += "\n```\n";
        } else {
          logger.debug(`localStorage item '${key}' not found.`);
        }
      } catch (error) {
        logger.debug(`Error reading '${key}' data from localStorage: ${error}`);
        console.error(`'${key}' 데이터를 읽는 중 오류 발생:`, error);
      }
    });

    prompt += "\n--- 데이터 끝 ---\n\n이제 이 정보를 바탕으로 질문을 입력하세요.";
    logger.debug(`Prompt built. Setting message input field.`);
    // 가공된 프롬프트를 메시지 입력창에 설정
    setMessage(prompt);
  };
  
  const handleSendMessage = async () => {
    logger.debug(`Attempting to send message. Message length: ${message.trim().length}`);
    if (!message.trim()) {
      logger.debug(`Message is empty. Aborting send.`);
      return;
    }
    // ... 실제 메시지 전송 로직 ...
    logger.debug(`메시지 전송: ${message}`);
    // 예시: await queryLLM(message);
    setMessage('');
    logger.debug(`Message sent and input cleared.`);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>AI 어시스턴트</h2>
      {/* ... 기존 채팅 히스토리 UI가 여기에 위치 ... */}

      <div style={styles.inputArea}>
        <textarea
          value={message}
          onChange={(e) => {
            logger.debug(`Message input changed. New value length: ${e.target.value.length}`);
            setMessage(e.target.value);
          }}
          placeholder="메시지를 입력하거나, 데이터를 선택하여 질문의 컨텍스트를 추가하세요."
          style={styles.textarea}
        />
        <div style={styles.buttonContainer}>
          <button onClick={() => {
            logger.debug(`"컨텍스트 데이터 선택" button clicked. Opening modal.`);
            setIsModalOpen(true);
          }} style={{...styles.button, ...styles.buttonAccent}}>
            컨텍스트 데이터 선택
          </button>
          <button onClick={handleSendMessage} style={{...styles.button, ...styles.buttonPrimary}}>
            전송
          </button>
        </div>
      </div>

      <DataSelectionModal
        isOpen={isModalOpen}
        onClose={() => {
          logger.debug(`DataSelectionModal closed.`);
          setIsModalOpen(false);
        }}
        onConfirm={handleConfirmSelection}
      />
    </div>
  );
}

// 간단한 스타일 객체
const styles: { [key: string]: React.CSSProperties } = {
    container: { fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: 'auto' },
    title: { color: '#333' },
    inputArea: { marginTop: '20px', border: '1px solid #ccc', borderRadius: '8px', padding: '10px' },
    textarea: { width: '100%', minHeight: '120px', border: 'none', resize: 'vertical', padding: '10px', boxSizing: 'border-box', outline: 'none' },
    buttonContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' },
    button: { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    buttonPrimary: { backgroundColor: '#007bff', color: 'white' },
    buttonSecondary: { backgroundColor: '#6c757d', color: 'white' },
    buttonAccent: { backgroundColor: '#17a2b8', color: 'white' },
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