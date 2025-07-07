"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { RaidPost } from '@/types/raid';
import { UserProfile } from '@/types/qa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UnifiedLayout from "@/components/unified-layout";
import { Swords, PlusCircle } from "lucide-react";

const RaidBoardPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<(RaidPost & { id: string })[]>([]);
  const [newPost, setNewPost] = useState({ type: 'request' as 'request' | 'offer', description: '', startTime: '', endTime: '', partySize: 1, partyType: 'solo' as 'solo' | 'duo' | 'four_person' | 'eight_person' });
  const [matchingOffers, setMatchingOffers] = useState<RaidPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('raidPosts')
        .select('*, users(username, representativeCharacterId)') // Join with users table
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching raid posts:', error);
        return;
      }

      const postsData: (RaidPost & { id: string; authorName?: string; authorCharacterName?: string })[] = data.map((post: any) => ({
        id: post.id,
        type: post.type,
        description: post.description,
        startTime: post.startTime,
        endTime: post.endTime,
        partySize: post.partySize,
        partyType: post.partyType,
        createdAt: post.createdAt,
        status: post.status,
        authorId: post.authorId,
        authorName: post.users?.username || 'Unknown User',
        authorCharacterName: post.users?.representativeCharacterId ? "(" + post.users.representativeCharacterId + ")" : '',
      }));
      setPosts(postsData);
    };

    fetchPosts();

    // Realtime subscription for new posts
    const subscription = supabase
      .channel('raid_posts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'raidPosts' },
        (payload) => {
          fetchPosts(); // Re-fetch all posts on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleCreatePost = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const { type, description, startTime, endTime, partySize, partyType } = newPost;

    if (!description || !startTime || !endTime) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    const { error } = await supabase
      .from('raidPosts')
      .insert({
        authorId: user.id,
        type,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        partySize,
        partyType,
        status: 'open',
      });

    if (error) {
      console.error('Error creating post:', error);
      alert('게시글 등록에 실패했습니다.');
      return;
    }

    // Notify followers (simplified for Supabase)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username, email')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data for notification:', userError);
    } else if (userData) {
      const { data: followersData, error: followersError } = await supabase
        .from('users')
        .select('id')
        .contains('following', [user.id]);

      if (followersError) {
        console.error('Error fetching followers:', followersError);
      } else if (followersData && followersData.length > 0) {
        for (const follower of followersData) {
          await supabase
            .from('notifications')
            .insert({
              userId: follower.id,
              type: 'new_raid_post',
              message: (userData.username || user.email) + "님이 새로운 레이드 게시글을 작성했습니다: " + description,
              link: `/raid-board`,
              read: false,
              fromUserId: user.id,
            });
        }
      }
    }

    setNewPost({ type: 'request', description: '', startTime: '', endTime: '', partySize: 1, partyType: 'solo' });
  };

  const findMatches = async (postId: string) => {
    setSelectedPostId(postId);
    try {
      // This API route needs to be updated to use Supabase internally
      const response = await fetch(`/api/raids/match?postId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        setMatchingOffers(data);
      } else {
        console.error("Failed to fetch matches");
        setMatchingOffers([]);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      setMatchingOffers([]);
    }
  };

  const handleAcceptOffer = async (postId: string, offerId: string) => {
    try {
      // This API route needs to be updated to use Supabase internally
      const response = await fetch('/api/raids/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, offerId }),
      });

      if (response.ok) {
        alert('매칭이 수락되었습니다!');
        // Optionally, refresh posts or update UI
        setSelectedPostId(null);
      } else {
        alert('매칭 수락에 실패했습니다.');
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      alert('매칭 수락 중 오류가 발생했습니다.');
    }
  };

  return (
    <UnifiedLayout>
      <div className="p-6 space-y-6 bg-white min-h-screen" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        {/* Enhanced Header - Dashboard style */}
        <div className="modern-card fade-in mb-6">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-red-100 rounded-2xl flex-shrink-0">
                  <Swords className="w-8 h-8 text-red-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-4xl font-bold text-gray-900">레이드 매칭 게시판</h1>
                  <p className="text-lg text-gray-600 mt-1">함께 레이드할 파티원을 찾아보세요.</p>
                  <p className="text-sm text-gray-500 mt-1">도움이 필요하거나 도움을 줄 수 있는 게시글을 등록하고 매칭하세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {user && (
          <Card className="document-card mb-4">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center space-x-2">
                <PlusCircle className="w-5 h-5" />
                새로운 매칭 등록
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={(value) => setNewPost({ ...newPost, type: value as 'request' | 'offer' })} defaultValue={newPost.type}>
                <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="request">도움이 필요해요</SelectItem>
                  <SelectItem value="offer">내가 도와줄게요</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="설명 (예: 글렌 베르나 어려움)"
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex gap-4">
                  <Input
                  type="datetime-local"
                  value={newPost.startTime}
                  onChange={(e) => setNewPost({ ...newPost, startTime: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Input
                  type="datetime-local"
                  value={newPost.endTime}
                  onChange={(e) => setNewPost({ ...newPost, endTime: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
              </div>
              <Input
                type="number"
                placeholder="파티 규모"
                value={newPost.partySize}
                onChange={(e) => setNewPost({ ...newPost, partySize: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <Select onValueChange={(value) => setNewPost({ ...newPost, partyType: value as 'solo' | 'duo' | 'four_person' | 'eight_person' })} defaultValue={newPost.partyType}>
                <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="파티 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">솔로</SelectItem>
                  <SelectItem value="duo">2인</SelectItem>
                  <SelectItem value="four_person">4인</SelectItem>
                  <SelectItem value="eight_person">8인</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreatePost} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                등록하기
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="document-card">
              <CardHeader>
                <CardTitle className="text-gray-900">{post.type === 'request' ? '도움이 필요해요' : '내가 도와줄게요'}</CardTitle>
                <p className="text-sm text-gray-600">작성자: {post.authorName} {post.authorCharacterName ? "(" + post.authorCharacterName + ")" : ''}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-800">{post.description}</p>
                <p className="text-gray-600 text-sm">시간: {new Date(post.startTime).toLocaleString()} - {new Date(post.endTime).toLocaleString()}</p>
                <p className="text-gray-600 text-sm">파티 규모: {post.partySize}</p>
                <p className="text-gray-600 text-sm">파티 유형: {post.partyType}</p>
                {post.type === 'request' && (
                  <Button onClick={() => findMatches(post.id)} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                    매칭 가능한 도움 제안 보기
                  </Button>
                )}
                {selectedPostId === post.id && matchingOffers.length > 0 && (
                  <div className="mt-4 p-3 border border-gray-200 rounded-md bg-gray-50">
                    <h4 className="font-bold text-gray-800 mb-2">매칭 가능한 도움 제안:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {matchingOffers.map(offer => (
                        <li key={offer.id} className="flex justify-between items-center text-gray-800">
                          <span>{offer.description} ({new Date(offer.startTime).toLocaleString()} - {new Date(offer.endTime).toLocaleString()}) - {offer.partyType}</span>
                          <Button size="sm" onClick={() => handleAcceptOffer(post.id, offer.id)} className="bg-green-600 hover:bg-green-700 text-white">
                            수락
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedPostId === post.id && matchingOffers.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">매칭 가능한 도움 제안이 없습니다.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </UnifiedLayout>
  );
};