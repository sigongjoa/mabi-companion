"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar'; // Import the new Sidebar component
import supabase from '@/lib/supabase'; // Import Supabase client
import { useAuth } from '@/contexts/AuthContext';

interface Character {
  id: string;
  name: string;
  image_url: string;
  level: number;
  job: string;
  combat_power: number;
  silverCoins: number;
  demonTribute: number;
  server: string;
}

interface CraftingTimer {
  id: string;
  item_name: string;
  time_remaining: string; // e.g., "2시간 30분"
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [craftingTimers, setCraftingTimers] = useState<CraftingTimer[]>([]);

  useEffect(() => {
    if (loading) return; // Wait for auth to load
    if (!user) {
      window.location.href = '/login'; // Redirect to login if no user
      return;
    }

    const fetchCharacters = async () => {
      const { data, error } = await supabase.from('characters').select('*');
      if (data) {
        setCharacters(data);
      } else if (error) {
        console.error('Error fetching characters:', error.message);
      }
    };

    const fetchCraftingTimers = async () => {
      // Assuming a 'crafting_timers' table in Supabase
      const { data, error } = await supabase.from('crafting_timers').select('*');
      if (data) {
        setCraftingTimers(data);
      } else if (error) {
        console.error('Error fetching crafting timers:', error.message);
      }
    };

    fetchCharacters();
    fetchCraftingTimers();
  }, [loading, user]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      // Redirect to login page or update UI
      window.location.href = '/login'; // Example redirect
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar userEmail={user?.email || 'Guest'} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-100">
        {/* Header */}
        <header className="header rounded-bl-lg">
            <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-800">마비노기 모바일</h1>
                <nav className="ml-8 text-gray-600">
                    <a href="#" className="mr-4 hover:text-blue-600">홈</a>
                    <a href="#" className="mr-4 hover:text-blue-600">거래소</a>
                    <a href="#" className="mr-4 hover:text-blue-600">커뮤니티</a>
                    <a href="#" className="mr-4 hover:text-blue-600">가이드</a>
                    <a href="#" className="hover:text-blue-600">고객지원</a>
                </nav>
            </div>
            <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-600 mr-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm4 0h2v2h-2V8z"></path></svg>
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Character Info Card */}
                <div className="card">
                    <div className="card-header-bg py-3 px-4 -mx-6 -mt-6 mb-6 rounded-t-lg">
                        <h2 className="text-lg font-semibold">캐릭터 정보</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-md">이름</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이미지</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">레벨</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직업</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전투력</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">서버</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">은동전</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-md">마족공물</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {characters.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-sm text-secondary">캐릭터 정보가 없습니다.</td>
                                    </tr>
                                ) : (
                                    characters.map(char => (
                                        <tr key={char.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{char.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <img src={char.image_url || "https://placehold.co/40x40/E0E0E0/808080?text=IMG"} alt="Character Image" className="w-10 h-10 rounded-full" />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{char.level}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{char.job}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{char.combat_power.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{char.server}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{char.silverCoins}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{char.demonTribute}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Crafting Timer Card */}
                <div className="card">
                    <div className="card-header-bg py-3 px-4 -mx-6 -mt-6 mb-6 rounded-t-lg">
                        <h2 className="text-lg font-semibold">제작 타이머</h2>
                    </div>
                    <div className="space-y-4">
                        {craftingTimers.length === 0 ? (
                            <p className="text-sm text-secondary text-center">진행 중인 제작 타이머가 없습니다.</p>
                        ) : (
                            craftingTimers.map(timer => (
                                <div key={timer.id} className="timer-card p-4 flex items-center">
                                    <svg className="timer-icon w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd"></path></svg>
                                    <div>
                                        <p className="font-medium text-gray-800">{timer.item_name}</p>
                                        <p className="text-sm text-secondary">남은 시간: {timer.time_remaining}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}