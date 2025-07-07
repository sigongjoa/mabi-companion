"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { QAPost, QAAnswer, UserProfile } from '@/types/qa';
import { AppNotification } from '@/types/notification';
import { TokenTransaction } from '@/types/token';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UnifiedLayout from "@/components/unified-layout";
import { MessageSquare, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const QADetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<QAPost | null>(null);
  const [answers, setAnswers] = useState<QAAnswer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchPostAndAnswers = async () => {
      // Fetch post
      const { data: postData, error: postError } = await supabase
        .from('qaPosts')
        .select('*')
        .eq('id', id as string)
        .single();

      if (postError) {
        console.error('Error fetching post:', postError);
        setPost(null);
      } else {
        setPost(postData as QAPost);
      }

      // Fetch answers
      const { data: answersData, error: answersError } = await supabase
        .from('qaAnswers')
        .select('*')
        .eq('qaPostId', id as string)
        .order('createdAt', { ascending: true });

      if (answersError) {
        console.error('Error fetching answers:', answersError);
      }

      setAnswers(answersData as QAAnswer[]);
    };

    fetchPostAndAnswers();

    // Realtime subscription for post changes
    const postSubscription = supabase
      .channel(`qa_post_${id}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'qaPosts', filter: `id=eq.${id}` },
        (payload) => {
          fetchPostAndAnswers();
        }
      )
      .subscribe();

    // Realtime subscription for answer changes
    const answersSubscription = supabase
      .channel(`qa_answers_${id}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'qaAnswers', filter: `qaPostId=eq.${id}` },
        (payload) => {
          fetchPostAndAnswers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postSubscription);
      supabase.removeChannel(answersSubscription);
    };
  }, [id]);

  const handleAddAnswer = async () => {
    if (!user || !id || !newAnswer.trim()) return;

    const { error } = await supabase
      .from('qaAnswers')
      .insert({
        qaPostId: id as string,
        authorId: user.id,
        content: newAnswer,
        isBestAnswer: false,
      });

    if (error) {
      console.error('Error adding answer:', error);
      alert('답변 등록에 실패했습니다.');
      return;
    }

    // Notify the question author
    if (post && post.authorId !== user.id) {
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
          userId: post.authorId,
          type: 'answer_received',
          message: `${currentUserProfile?.username || user.email}님이 '${post.title}' 질문에 답변을 달았습니다.`,
          link: `/qa-board/${id}`,
          read: false,
          fromUserId: user.id,
        });
    }

    setNewAnswer('');
  };

  const handleSelectBestAnswer = async (answerId: string, authorId: string) => {
    if (!user || !post || post.authorId !== user.id || post.bestAnswerId) return;

    // Update post with best answer ID
    const { error: postUpdateError } = await supabase
      .from('qaPosts')
      .update({ bestAnswerId: answerId })
      .eq('id', id as string);

    if (postUpdateError) {
      console.error('Error updating post with best answer:', postUpdateError);
      alert('베스트 답변 채택에 실패했습니다.');
      return;
    }

    // Mark answer as best answer
    const { error: answerUpdateError } = await supabase
      .from('qaAnswers')
      .update({ isBestAnswer: true })
      .eq('id', answerId);

    if (answerUpdateError) {
      console.error('Error marking answer as best:', answerUpdateError);
      alert('베스트 답변 표시 실패했습니다.');
      return;
    }

    // Update user's tokens and best answer count
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('llmTokens, bestAnswerCount')
      .eq('id', authorId)
      .single();

    if (userFetchError) {
      console.error('Error fetching user data for best answer:', userFetchError);
      return;
    }

    const newTokens = (userData?.llmTokens || 0) + 100; // 보상 토큰: 100
    const newBestAnswerCount = (userData?.bestAnswerCount || 0) + 1;

    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ llmTokens: newTokens, bestAnswerCount: newBestAnswerCount })
      .eq('id', authorId);

    if (userUpdateError) {
      console.error('Error updating user for best answer:', userUpdateError);
      alert('사용자 정보 업데이트 실패했습니다.');
      return;
    }

    // Record token transaction
    const { error: tokenTxError } = await supabase
      .from('tokenLedger')
      .insert({
        userId: authorId,
        type: 'credit',
        amount: 100,
        description: 'Q&A 베스트 답변 보상',
        relatedDocId: answerId,
      });

    if (tokenTxError) {
      console.error('Error recording token transaction:', tokenTxError);
      alert('토큰 내역 기록 실패했습니다.');
      return;
    }

    // Notify the answer author
    const { data: answerAuthorProfile, error: answerAuthorProfileError } = await supabase
      .from('users')
      .select('username, email')
      .eq('id', authorId)
      .single();

    if (answerAuthorProfileError) {
      console.error('Error fetching answer author profile for notification:', answerAuthorProfileError);
      return;
    }

    await supabase
      .from('notifications')
      .insert({
        userId: authorId,
        type: 'best_answer_selected',
        message: `'${post.title}' 질문에 대한 당신의 답변이 베스트 답변으로 채택되었습니다! 보상으로 LLM 토큰 100개가 지급되었습니다.`,
        link: `/qa-board/${id}`,
        read: false,
        fromUserId: user.id,
      });
  };

  const handleUpdateDisclosure = async (newLevel: 'basic' | 'full') => {
    if (!user || !post || post.authorId !== user.id) return;

    const { error } = await supabase
      .from('qaPosts')
      .update({ disclosureLevel: newLevel })
      .eq('id', id as string);

    if (error) {
      console.error("Error updating disclosure level:", error);
      alert('공개 범위 업데이트에 실패했습니다.');
      return;
    }
    alert('공개 범위가 업데이트되었습니다.');
  };

  if (!post) return <UnifiedLayout><div className="p-6 text-center text-gray-500">Loading...</div></UnifiedLayout>;

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
                  <h1 className="text-4xl font-bold text-gray-900">Q&A 상세</h1>
                  <p className="text-lg text-gray-600 mt-1">질문과 답변을 확인하고 새로운 답변을 작성하세요.</p>
                  <p className="text-sm text-gray-500 mt-1">'" + post.title + "' 질문에 대한 상세 내용입니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="document-card mb-4">
          <CardHeader>
            <CardTitle className="text-gray-900">{post.title}</CardTitle>
            <p className="text-sm text-gray-600">작성자: {post.authorId} | 공개 범위: {post.disclosureLevel}</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800">{post.content}</p>
            {user && post.authorId === user.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold mb-2 text-gray-800">공개 범위 설정</h4>
                <Select onValueChange={handleUpdateDisclosure} defaultValue={post.disclosureLevel}>
                  <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="공개 범위" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">기본 정보만 공개</SelectItem>
                    <SelectItem value="full">전체 정보 공개</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4 text-gray-900">답변</h2>
        <div className="space-y-4 mb-4">
          {answers.map(answer => (
            <Card key={answer.id} className={"document-card " + (answer.isBestAnswer ? 'border-green-500 ring-2 ring-green-500' : '')}>
              <CardContent className="p-4">
                <p className="text-gray-800">{answer.content}</p>
                <p className="text-sm text-gray-600 mt-2">작성자: {answer.authorId}</p>
                {answer.isBestAnswer && (
                  <Badge className="mt-2 bg-green-500 text-white">베스트 답변</Badge>
                )}
                {post.authorId === user?.id && !post.bestAnswerId && (
                  <Button onClick={() => handleSelectBestAnswer(answer.id, answer.authorId)} size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <CheckCircle className="w-4 h-4 mr-2" /> 채택하기
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {user && (
          <Card className="document-card">
            <CardHeader>
              <CardTitle className="text-gray-900">답변 등록</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="답변을 입력하세요..."
                className="mb-2 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              />
              <Button onClick={handleAddAnswer} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                답변 등록
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </UnifiedLayout>
  );
};

export default QADetailPage;