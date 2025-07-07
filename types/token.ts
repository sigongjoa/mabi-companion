import { Timestamp } from 'firebase/firestore';

export interface TokenTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit'; // 지급 (credit) 또는 소진 (debit)
  amount: number;
  description: string; // 예: 'Q&A 베스트 답변 보상', 'LLM API 호출'
  createdAt: Timestamp;
  relatedDocId?: string; // 관련 문서 ID (예: Q&A 답변 ID)
}