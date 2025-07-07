"use client";

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { RaidPost } from '@/types/raid';
import UnifiedLayout from "@/components/unified-layout";

const SchedulePage = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [userRaidPosts, setUserRaidPosts] = useState<RaidPost[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchRaidPosts = async () => {
      const { data, error } = await supabase
        .from('raidPosts')
        .select('*')
        .eq('authorId', user.id);

      if (error) {
        console.error('Error fetching raid posts:', error);
        return;
      }
      setUserRaidPosts(data as RaidPost[]);
    };

    fetchRaidPosts();

    const subscription = supabase
      .channel('raid_posts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'raidPosts' },
        (payload) => {
          fetchRaidPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const getEventsForDate = (selectedDate: Date) => {
    return userRaidPosts.filter(post => {
      const postStartTime = new Date(post.startTime);
      const postEndTime = new Date(post.endTime);

      // Check if the selected date falls within the post's start and end time
      return selectedDate.toDateString() === postStartTime.toDateString() ||
             (selectedDate >= postStartTime && selectedDate <= postEndTime);
    });
  };

  const selectedDayEvents = date ? getEventsForDate(date) : [];

  return (
    <UnifiedLayout>
      <div className="p-6 space-y-6 bg-white min-h-screen" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        {/* Enhanced Header - Dashboard style */}
        <div className="modern-card fade-in mb-6">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                  <CalendarIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-4xl font-bold text-gray-900">내 스케줄</h1>
                  <p className="text-lg text-gray-600 mt-1">레이드 및 개인 일정을 관리하세요.</p>
                  <p className="text-sm text-gray-500 mt-1">등록된 레이드 매칭과 개인 일정을 한눈에 확인하세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Card className="document-card flex-1">
            <CardHeader>
              <CardTitle className="text-gray-900">캘린더</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border border-gray-200 shadow-sm"
              />
            </CardContent>
          </Card>

          <Card className="document-card flex-1">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span>{date ? new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date) : '날짜 선택'}의 이벤트</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayEvents.length > 0 ? (
                <ul className="space-y-3">
                  {selectedDayEvents.map(post => (
                    <li key={post.id} className="p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                      <p className="font-semibold text-gray-800">{post.description}</p>
                      <p className="text-sm text-gray-600">{post.type === 'request' ? '도움 요청' : '도움 제공'}</p>
                      <p className="text-xs text-gray-500">{new Date(post.startTime).toLocaleTimeString()} - {new Date(post.endTime).toLocaleTimeString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">선택된 날짜에 이벤트가 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SchedulePage;