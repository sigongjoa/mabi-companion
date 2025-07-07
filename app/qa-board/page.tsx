
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { QAPost, UserProfile } from '@/types/qa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import UnifiedLayout from "@/components/unified-layout";
import { MessageSquare, PlusCircle } from "lucide-react";

const QABoardPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<QAPost[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', disclosureLevel: 'basic' as 'basic' | 'full', agreedToFullDisclosure: false });

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('qaPosts')
        .select('*, users(username, representativeCharacterId)') // Join with users table
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching QA posts:', error);
        return;
      }

      const postsData: (QAPost & { id: string; authorName?: string; authorCharacterName?: string })[] = data.map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        disclosureLevel: post.disclosureLevel,
        createdAt: post.createdAt,
        authorId: post.authorId,
        authorName: post.users?.username || 'Unknown User',
        authorCharacterName: post.users?.representativeCharacterId ? "(" + post.users.representativeCharacterId + ")" : '',
      }));
      setPosts(postsData);
    };

    fetchPosts();

    // Realtime subscription for new posts
    const subscription = supabase
      .channel('qa_posts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'qaPosts' },
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

    const { title, content, disclosureLevel, agreedToFullDisclosure } = newPost;

    if (!title || !content) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    if (disclosureLevel === 'full' && !agreedToFullDisclosure) {
        alert('전체 정보 공개에 동의해야 합니다.');
        return;
    }

    const { error } = await supabase
      .from('qaPosts')
      .insert({
        authorId: user.id,
        title,
        content,
        disclosureLevel,
      });

    if (error) {
      console.error('Error creating post:', error);
      alert('게시글 등록에 실패했습니다.');
      return;
    }

    // Notify followers (simplified for Supabase)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username, email, following')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data for notification:', userError);
    } else if (userData && userData.following && userData.following.length > 0) {
      const followers = userData.following;
      for (const followerId of followers) {
        await supabase
          .from('notifications')
          .insert({
            userId: followerId,
            type: 'new_qa_post',
            message: `${userData.username || user.email}님이 새로운 Q&A 질문을 작성했습니다: ${title}`,
            link: `/qa-board/${posts.length > 0 ? posts[0].id : ''}`,
            read: false,
            fromUserId: user.id,
          });
      }
    }

    setNewPost({ title: '', content: '', disclosureLevel: 'basic', agreedToFullDisclosure: false });
  };

  return (
    <UnifiedLayout>
      <div className="p-6 space-y-6 bg-white min-h-screen" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        {/* Enhanced Header - Dashboard style */}
        <div className="modern-card fade-in mb-6">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-green-100 rounded-2xl flex-shrink-0">
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-4xl font-bold text-gray-900">Q&A 게시판</h1>
                  <p className="text-lg text-gray-600 mt-1">궁금한 점을 질문하고 답변을 받아보세요.</p>
                  <p className="text-sm text-gray-500 mt-1">마비노기 모바일 관련 질문과 답변을 공유하는 공간입니다.</p>
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
                새로운 질문 등록
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="제목"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <Textarea
                placeholder="질문 내용"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              />
              <Select onValueChange={(value) => setNewPost({ ...newPost, disclosureLevel: value as 'basic' | 'full' })} defaultValue={newPost.disclosureLevel}>
                <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="정보 공개 범위" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">기본 정보만 공개</SelectItem>
                  <SelectItem value="full">전체 정보 공개</SelectItem>
                </SelectContent>
              </Select>
              {newPost.disclosureLevel === 'full' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="full-disclosure-agreement"
                    checked={newPost.agreedToFullDisclosure}
                    onCheckedChange={(checked) => setNewPost({ ...newPost, agreedToFullDisclosure: checked as boolean })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="full-disclosure-agreement" className="text-sm text-gray-700">
                    장비 내역, 스킬트리 등 민감한 정보 공개에 동의합니다.
                  </Label>
                </div>
              )}
              <Button onClick={handleCreatePost} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                등록하기
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {posts.map((post) => (
            <Link href={`/qa-board/${post.id}`} key={post.id}>
              <Card className="document-card hover:bg-gray-50 cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-gray-900">{post.title}</CardTitle>
                  <p className="text-sm text-gray-600">작성자: {post.authorName} {post.authorCharacterName ? "(" + post.authorCharacterName + ")" : ''}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 truncate">{post.content}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </UnifiedLayout>
  );
}; 

export default QABoardPage;
