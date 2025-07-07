import { Timestamp } from 'firebase/firestore';

export interface QAPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  disclosureLevel: 'basic' | 'full'; // 레벨/직업/소환 스펙만 | 장비/스킬트리 포함
  createdAt: Timestamp;
  bestAnswerId?: string;
}

export interface QAAnswer {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  isBestAnswer: boolean;
  createdAt: Timestamp;
}

export interface UserProfile {
  id: string;
  username: string;
  llmTokens: number;
  rating: number;
  feedbackCount: number;
  following: string[]; // user IDs
  representativeCharacterId?: string; // Optional: ID of the user's representative character
  qaAnswerCount: number; // 총 답변 수
  bestAnswerCount: number; // 베스트 답변 채택 수
}
