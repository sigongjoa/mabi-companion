"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserProfile, QAPost } from '@/types/qa';
import { RaidPost, RaidMatch } from '@/types/raid';
import { AppNotification } from '@/types/notification';
import { TokenTransaction } from '@/types/token';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCharacter } from '@/contexts/character-context';
import UnifiedLayout from "@/components/unified-layout";
import { User, MessageSquare, Zap, DollarSign } from "lucide-react";

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [raidPosts, setRaidPosts] = useState<RaidPost[]>([]);
  const [qaPosts, setQaPosts] = useState<QAPost[]>([]);
  const [completedMatches, setCompletedMatches] = useState<RaidMatch[]>([]);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [tokenTransactions, setTokenTransactions] = useState<TokenTransaction[]>([]);
  const { characters } = useCharacter();

  const handleSubmitFeedback = async (matchId: string, toUserId: string, rating: number, comment: string) => {
    if (!user) return;

    try {
      // This API route needs to be updated to use Supabase internally
      await fetch('/api/raids/match', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          rating,
          comment,
          from: user.id,
          to: toUserId,
        }),
      });
      alert('피드백이 제출되었습니다.');
      // Refresh matches or update UI
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert('피드백 제출 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchProfileData = async () => {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id as string)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setProfile(null);
      } else {
        setProfile(profileData as UserProfile);
      }

      // Fetch raid posts
      const { data: raidPostsData, error: raidPostsError } = await supabase
        .from('raidPosts')
        .select('*')
        .eq('authorId', id as string);
      if (raidPostsError) {
        console.error('Error fetching raid posts:', raidPostsError);
      } else {
        setRaidPosts(raidPostsData as RaidPost[]);
      }

      // Fetch QA posts
      const { data: qaPostsData, error: qaPostsError } = await supabase
        .from('qaPosts')
        .select('*')
        .eq('authorId', id as string);
      if (qaPostsError) {
        console.error('Error fetching QA posts:', qaPostsError);
      } else {
        setQaPosts(qaPostsData as QAPost[]);
      }

      // Fetch completed matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('raidMatches')
        .select('*')
        .contains('participants', [id as string]);
      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
      }
      else {
        setCompletedMatches(matchesData as RaidMatch[]);
      }

      // Fetch token transactions
      const { data: tokenTxData, error: tokenTxError } = await supabase
        .from('tokenLedger')
        .select('*')
        .eq('userId', id as string)
        .order('createdAt', { ascending: false });
      if (tokenTxError) {
        console.error('Error fetching token transactions:', tokenTxError);
      } else {
        setTokenTransactions(tokenTxData as TokenTransaction[]);
      }
    };

    fetchProfileData();
  }, [id]);

  useEffect(() => {
    if (user && profile) {
      // Check if the current user is following this profile
      setIsFollowing(profile.following?.includes(user.id) || false);
    }
  }, [user, profile, id]);

  const handleFollow = async () => {
    if (!user || !profile) return;

    const newFollowing = [...(profile.following || []), user.id];
    const { error } = await supabase
      .from('users')
      .update({ following: newFollowing })
      .eq('id', id as string);

    if (error) {
      console.error('Error following user:', error);
      alert('팔로우 실패했습니다.');
      return;
    }
    setIsFollowing(true);

    // Notify the followed user
    const { data: currentUserProfile, error: currentUserProfileError } = await supabase
      .from('users')
      .select('username, email')
      .eq('id', user.id)
      .single();

    if (currentUserProfileError) {
      console.error('Error fetching current user profile for notification:', currentUserProfileError);
      return;
    }

    await supabase
      .from('notifications')
      .insert({
        userId: id as string,
        type: 'new_follower',
        message: `${currentUserProfile?.username || user.email}님이 당신을 팔로우하기 시작했습니다.`,
        link: `/profile/${user.id}`,
        read: false,
        fromUserId: user.id,
      });
  };

  const handleUnfollow = async () => {
    if (!user || !profile) return;

    const newFollowing = (profile.following || []).filter((followerId: string) => followerId !== user.id);
    const { error } = await supabase
      .from('users')
      .update({ following: newFollowing })
      .eq('id', id as string);

    if (error) {
      console.error('Error unfollowing user:', error);
      alert('언팔로우 실패했습니다.');
      return;
    }
    setIsFollowing(false);
  };

  const handleSetRepresentativeCharacter = async (characterId: string) => {
    if (!user || user.id !== id) return; // Only the profile owner can set representative character

    const { error } = await supabase
      .from('users')
      .update({ representativeCharacterId: characterId })
      .eq('id', user.id);

    if (error) {
      console.error("Error setting representative character:", error);
      alert('대표 캐릭터 설정에 실패했습니다.');
      return;
    }
    setProfile(prev => prev ? { ...prev, representativeCharacterId: characterId } : null);
    alert('대표 캐릭터가 설정되었습니다.');
  };

  return (
    <UnifiedLayout>
      <div className="p-6 space-y-6 bg-white min-h-screen" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        {/* Enhanced Header - Dashboard style */}
        <div className="modern-card fade-in mb-6">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-4xl font-bold text-gray-900">{profile?.username || 'User'}'s Profile</h1>
                  <p className="text-lg text-gray-600 mt-1">사용자 프로필 및 활동 내역</p>
                  <p className="text-sm text-gray-500 mt-1">사용자의 정보, 작성 글, 레이드 참여 내역 등을 확인하세요.</p>
                </div>
              </div>
              {user && user.id !== id && (
                isFollowing ? (
                  <Button onClick={handleUnfollow} variant="outline" className="w-full md:w-auto">Unfollow</Button>
                ) : (
                  <Button onClick={handleFollow} className="w-full md:w-auto">Follow</Button>
                )
              )}
            </div>
          </div>
        </div>

        {!profile ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <Card className="document-card">
              <CardHeader>
                <CardTitle className="text-gray-900">기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">사용자 이름:</span>
                  <span className="text-gray-900">{profile.username || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">LLM 토큰:</span>
                  <span className="text-gray-900">{profile.llmTokens || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">평점:</span>
                  <span className="text-gray-900">{profile.rating || 'N/A'}</span>
                </div>
                {user && user.id === id && characters.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold mb-2 text-gray-800">대표 캐릭터 설정</h4>
                    <Select onValueChange={handleSetRepresentativeCharacter} defaultValue={profile.representativeCharacterId || ''}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="대표 캐릭터 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {characters.map(char => (
                          <SelectItem key={char.id} value={char.id}>{char.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="document-card">
                <CardHeader><CardTitle className="text-gray-900 flex items-center space-x-2"><Zap className="w-5 h-5 text-purple-600" /> 작성한 레이드 매칭</CardTitle></CardHeader>
                <CardContent>
                  {raidPosts.length > 0 ? (
                    raidPosts.map(post => (
                      <div key={post.id} className="mb-2 p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                        <p className="font-medium text-gray-800">{post.description}</p>
                        <p className="text-sm text-gray-600">{post.type === 'request' ? '도움 요청' : '도움 제공'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">작성한 레이드 매칭이 없습니다.</p>
                  )}
                </CardContent>
              </Card>
              <Card className="document-card">
                <CardHeader><CardTitle className="text-gray-900 flex items-center space-x-2"><MessageSquare className="w-5 h-5 text-green-600" /> 작성한 Q&A 질문</CardTitle></CardHeader>
                <CardContent>
                  {qaPosts.length > 0 ? (
                    qaPosts.map(post => (
                      <div key={post.id} className="mb-2 p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                        <p className="font-medium text-gray-800">{post.title}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">작성한 Q&A 질문이 없습니다.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="document-card mt-4">
              <CardHeader><CardTitle className="text-gray-900 flex items-center space-x-2"><Zap className="w-5 h-5 text-orange-600" /> 완료된 레이드 매칭</CardTitle></CardHeader>
              <CardContent>
                {completedMatches.length > 0 ? (
                  completedMatches.map(match => (
                    <div key={match.id} className="mb-2 p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                      <p className="font-medium text-gray-800">매칭 ID: {match.id}</p>
                      {user && match.participants.includes(user.id) && !match.feedback && (
                        <div className="mt-4 p-3 border-t border-gray-200">
                          <h5 className="font-semibold mb-2 text-gray-800">피드백 남기기</h5>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            placeholder="평점 (1-5)"
                            className="border p-2 rounded-md w-full mb-2 text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => setFeedbackRating(parseInt(e.target.value))}
                          />
                          <textarea
                            placeholder="간단한 피드백"
                            className="border p-2 rounded-md w-full mb-2 text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => setFeedbackComment(e.target.value)}
                          ></textarea>
                          <Button onClick={() => handleSubmitFeedback(match.id, match.participants.find(p => p !== user.id)!, feedbackRating, feedbackComment)} className="w-full">피드백 제출</Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">완료된 레이드 매칭이 없습니다.</p>
                )}
              </CardContent>
            </Card>

            <Card className="document-card mt-4">
              <CardHeader><CardTitle className="text-gray-900 flex items-center space-x-2"><DollarSign className="w-5 h-5 text-green-600" /> 토큰 내역</CardTitle></CardHeader>
              <CardContent>
                {tokenTransactions.length > 0 ? (
                  <ul className="space-y-2">
                    {tokenTransactions.map(tx => (
                      <li key={tx.id} className="p-3 border border-gray-200 rounded-md flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-800">{tx.description}</p>
                          <p className="text-xs text-gray-600">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={tx.type === 'credit' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">토큰 내역이 없습니다.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </UnifiedLayout>
  );
}