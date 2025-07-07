"use client";

import Link from "next/link";
import React, { useState, useEffect, useCallback } from 'react';
import { logger } from "@/lib/logger";
import { getLLMService, ChatMessage } from "@/lib/llm-service";
import { Brain, Package, Book, ScrollText, BarChart, PlusCircle, Home, Sword, CheckSquare, Users, Hammer, Sparkles, Map, Save, FileText, Settings, Download, Upload, RefreshCw, Clock, Star, User, MessageSquare, Mic, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import UnifiedLayout from '@/components/unified-layout';

interface DisplayChatMessage extends ChatMessage {
  type?: "rag_context";
  documents?: string[];
}

// Placeholder for user avatar
const USER_AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuBUIDHCb-w9WuYen-_HGeFvwsbCCfTAsLDgP37CcW58jovNVJ7kRc_fMDpQX0oIL4zU3W3hvpTiwceyADrmHHOjeOlm_6xNmAkHK5CQ0G3_g_bNR-MQc-kbQJcjaND3iLz3RUvcaZsfR1dPP0-S-rwlzWjXGAhpgmEMMe-dxRzYdx-Xt5nGmHKUy70hPiw84kTBXKhNBLRLe0UQAEk_7IfgAGpQ5VUThk3fUEydwLDJJDFrxOzaUr9upa6arpXmqZOMF66LtnGX58o";
// Placeholder for AI avatar
const AI_AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuALx4KGDyMJEcSykBcnBL432h1PTy6Z82Y5GfEmZVeT3yFGjy4ndslmIchLqDiZ_Vf2T7at0O5YTbegEObZ8z2-tRHjpA5Z9NW1YQmqravZA_rk0DMSyIHGBH__FYJn5HysDIIvgy1se1_e6ufhVKXZcRkWwugidUE3_VmxdIC3DM89m_7282AZpFxvSCSoLQW1_3gKAi1KthNf_r0zyZkMQVPa7w6ozvkdQSB2Jx8BO4lfC3_-B-dJ5sldW1qwigmEX4nTrpiAdBs";

export default function AIAssistantChat() {
  logger.debug("AIAssistantChat 함수 진입");
  const [message, setMessage] = useState('');
  const [llmProvider, setLlmProvider] = useState("lmstudio"); // Default to LM Studio
  const [llmModel, setLlmModel] = useState(""); // Default model for LM Studio, now empty
  const [chatHistory, setChatHistory] = useState<DisplayChatMessage[]>([
    { role: "assistant", content: "Hello! How can I assist you today in your Mabinogi Mobile adventure?" }
  ]);
  const [lmStudioModels, setLmStudioModels] = useState<string[]>([]); // State to store LM Studio models
  const [useRAGContext, setUseRAGContext] = useState(false); // State for RAG context checkbox
  const [includeLocalStorageData, setIncludeLocalStorageData] = useState(false); // State for local storage data checkbox

  // Fetch LM Studio models when provider is LM Studio
  useEffect(() => {
    if (llmProvider === "lmstudio") {
      const fetchLmStudioModels = async () => {
        try {
          const lmStudioService = getLLMService("lmstudio");
          const response = await fetch(`${process.env.NEXT_PUBLIC_LMSTUDIO_BASE_URL}/v1/models`);
          if (!response.ok) {
            throw new Error(`Failed to fetch LM Studio models: ${response.statusText}`);
          }
          const data = await response.json();
          const models = data.data.map((m: any) => m.id); // Adjust based on actual response structure
          setLmStudioModels(models);
          setLlmModel(currentLlmModel => {
            if (models.length > 0 && !models.includes(currentLlmModel)) {
              return models[0]; // Set first model as default if current is not in list
            } else if (models.length === 0) {
              return "";
            }
            return currentLlmModel;
          });
        } catch (error) {
          logger.error("Error fetching LM Studio models", error);
          setLmStudioModels([]);
          setLlmModel("");
        }
      };
      fetchLmStudioModels();
    } else {
        setLmStudioModels([]);
        setLlmModel("");
    }
  }, [llmProvider]);

  const handleSendMessage = async () => {
    logger.debug("handleSendMessage 함수 진입", { messageLength: message.trim().length });
    if (!message.trim()) {
      logger.debug("메시지가 비어있습니다. 전송을 중단합니다.");
      return;
    }

    const userMessage: DisplayChatMessage = { role: "user", content: message };
    let updatedChatHistory: DisplayChatMessage[] = [...chatHistory, userMessage];
    setChatHistory(updatedChatHistory);
    setMessage(""); // Clear input after sending

    try {
      let messagesToSend: ChatMessage[] = [...chatHistory, userMessage]; // Start with the current chat history

      // Handle local storage data inclusion (simplified for this design)
      if (includeLocalStorageData) {
        // This part would typically involve a more sophisticated way to select and format data
        // For now, it's just a placeholder to acknowledge the setting.
        logger.debug("Local storage data inclusion is enabled, but not implemented in this design.");
      }

      if (useRAGContext) {
        logger.debug("RAG 컨텍스트 사용 활성화. RAG API 호출을 시작합니다.");
        try {
          const ragResponse = await fetch("/api/rag-chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: message,
            }),
          });

          if (!ragResponse.ok) {
            const errorData = await ragResponse.json();
            throw new Error(errorData.error || "RAG API 호출 실패");
          }

          const ragResult = await ragResponse.json();
          if (ragResult.response && Array.isArray(ragResult.response) && ragResult.response.length > 0) {
            const ragDocuments = ragResult.response; 
            const ragContextContent = ragDocuments.join("\n\n");
            
            const ragContextMessage: DisplayChatMessage = {
              role: "system",
              type: "rag_context",
              content: `참조 문서 (${ragDocuments.length}개)`, // Content for the Accordion header
              documents: ragDocuments,
            };
            updatedChatHistory = [...updatedChatHistory, ragContextMessage];
            setChatHistory(updatedChatHistory);
            logger.debug("RAG 컨텍스트 메시지가 채팅 기록에 추가되었습니다.");

            // Add RAG context as a system message for the LLM
            messagesToSend = [
              { role: "system", content: `다음 문서를 참고해서 답변해 줘:\n\n${ragContextContent}` },
              ...messagesToSend,
            ];
          } else {
            logger.debug("RAG API에서 유효한 응답을 받지 못했습니다.");
          }
        } catch (ragError) {
          logger.error("RAG API 호출 중 오류 발생:", ragError);
          // RAG 오류가 발생해도 LLM 호출은 계속 진행 (컨텍스트 없이)
        }
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesToSend,
          model: llmModel,
          provider: llmProvider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error");
      }

      const result = await response.json();
      const assistantMessage: DisplayChatMessage = { role: "assistant", content: result.response || result.result };
      setChatHistory((prev) => [...prev, assistantMessage]);
      logger.debug("LLM 응답 수신", result);
    } catch (error) {
      logger.error("LLM 호출 오류", error);
      const errorMessage: DisplayChatMessage = { role: "assistant", content: `오류: ${error instanceof Error ? error.message : String(error)}` };
      setChatHistory((prev) => [...prev, errorMessage]);
    }

    logger.debug("handleSendMessage 함수 종료");
  };

  return (
    <UnifiedLayout>
      <div className="px-40 flex flex-1 justify-center py-5 bg-white" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex p-4 @container">
            <div className="flex w-full flex-col gap-4 items-center">
              <div className="flex gap-4 flex-col items-center">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                  style={{ backgroundImage: `url('${AI_AVATAR_URL}')` }}
                ></div>
                <div className="flex flex-col items-center justify-center justify-center">
                  <p className="text-[#111618] text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">AI Assistant</p>
                  <p className="text-[#607c8a] text-base font-normal leading-normal text-center">Your Mabinogi Mobile Companion</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 rounded-lg">
            {chatHistory.filter(msg => msg.type !== "rag_context").map((msg, index) => (
              <div key={index} className={`flex items-start gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="size-10 rounded-full bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url("${AI_AVATAR_URL}")` }}></div>
                )}
                <div className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : ""}`}>
                  <p className="text-sm text-gray-500">{msg.role === "user" ? "You" : "AI Chatbot"}</p>
                  <div className={`max-w-md rounded-lg ${msg.role === "user" ? "rounded-tr-none bg-blue-500 text-white" : "rounded-tl-none bg-gray-200"} px-4 py-3`}>
                    <p>{msg.content}</p>
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="size-10 rounded-full bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url("${USER_AVATAR_URL}")` }}></div>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  className="form-input w-full resize-none rounded-lg border-gray-300 bg-gray-100 text-black placeholder:text-gray-500 focus:border-blue-500 focus:ring-0 pl-4 pr-24 h-12"
                  placeholder="Type your message..."
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              <button
                className="flex-shrink-0 rounded-lg bg-blue-500 px-6 h-12 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}