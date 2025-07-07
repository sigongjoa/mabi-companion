import { Timestamp } from 'firebase/firestore';

export interface RaidPost {
  id: string;
  authorId: string;
  type: 'request' | 'offer'; // 도움이 필요해요 | 내가 도와줄게요
  startTime: Timestamp;
  endTime: Timestamp;
  partySize: number;
  partyType: 'solo' | 'duo' | 'four_person' | 'eight_person';
  description: string;
  createdAt: Timestamp;
  status: 'open' | 'matched' | 'closed';
}

export interface RaidMatch {
  id: string;
  postId: string;
  participants: string[]; // user IDs
  matchedTime: Timestamp;
  status: 'completed' | 'cancelled';
  feedback?: {
    rating: number;
    comment: string;
    from: string; // userID
    to: string; // userID
  };
}
