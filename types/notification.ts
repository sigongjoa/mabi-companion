import { Timestamp } from 'firebase/firestore';

export interface AppNotification {
  id: string;
  userId: string; // The user who receives the notification
  type: 'new_raid_post' | 'new_qa_post' | 'match_accepted' | 'answer_received' | 'best_answer_selected' | 'new_follower';
  message: string;
  link?: string; // Optional link to the relevant page
  read: boolean;
  createdAt: Timestamp;
  fromUserId?: string; // Optional: The user who triggered the notification
}