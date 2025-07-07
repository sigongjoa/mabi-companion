"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/qa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UnifiedLayout from "@/components/unified-layout";

const LeaderboardPage = () => {
  const [topAnswerers, setTopAnswerers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchTopAnswerers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, bestAnswerCount')
        .order('bestAnswerCount', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching top answerers:', error);
        return;
      }
      setTopAnswerers(data as UserProfile[]);
    };

    fetchTopAnswerers();

    const subscription = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          fetchTopAnswerers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <UnifiedLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Q&A 베스트 답변자 리더보드</h1>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 베스트 답변자</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              {topAnswerers.map((user, index) => (
                <li key={user.id} className="flex justify-between items-center">
                  <span>{index + 1}. {user.username || 'Unknown User'}</span>
                  <span className="font-semibold">{user.bestAnswerCount || 0} 베스트 답변</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </UnifiedLayout>
  );
};

export default LeaderboardPage;