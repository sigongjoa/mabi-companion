"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  userEmail: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userEmail, onLogout }) => {
  const pathname = usePathname();

  const navItems = [
    { name: '홈', href: '/', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
    )},
    { name: '캐릭터 관리', href: '/character-management', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
    )},
    { name: '인벤토리', href: '/inventory', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"></path></svg>
    )},
    { name: '장비', href: '/equipment', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v16a1 1 0 01-1.707.707L6 14.414V9.586L10.293 5.293a1 1 0 011.014-.247zM16 11a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1z" clipRule="evenodd"></path></svg>
    )},
    { name: '젬', href: '/gems', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v3a4 4 0 00-4 4v1a2 2 0 002 2h12a2 2 0 002-2v-1a4 4 0 00-4-4V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 110-2 1 1 0 010 2zm8 0a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd"></path></svg>
    )},
    { name: '제작', href: '/crafting', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414L7 9.586V7a1 1 0 10-2 0v3a1 1 0 001 1h3a1 1 0 100-2H7.414l1.293-1.293z" clipRule="evenodd"></path></svg>
    )},
    { name: '퀘스트', href: '/quests', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586V7a1 1 0 10-2 0v3.586L5.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 000-1.414z" clipRule="evenodd"></path></svg>
    )},
    { name: '레이드 매칭', href: '/raid-board', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"></path></svg>
    )},
    { name: '스케줄', href: '/schedule', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 00-1-1H7z" clipRule="evenodd"></path></svg>
    )},
    { name: '생활 스킬', href: '/skills', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 00-1 1v1a1 1 0 002 0V4a1 1 0 00-1-1zM10 3a1 1 0 00-1 1v1a1 1 0 002 0V4a1 1 0 00-1-1zM13 3a1 1 0 00-1 1v1a1 1 0 002 0V4a1 1 0 00-1-1z"></path><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5-8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
    )},
    { name: '타이머', href: '/timers', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd"></path></svg>
    )},
    { name: 'Q&A 게시판', href: '/qa-board', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 00-1 1v3a1 1 0 001 1h2a1 1 0 001-1V9a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
    )},
    { name: 'AI 어시스턴트', href: '/assistant', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586V7a1 1 0 10-2 0v3.586L5.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 000-1.414z" clipRule="evenodd"></path></svg>
    )},
    { name: '리더보드', href: '/leaderboard', icon: (
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6 9a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
    )},
  ];

  return (
    <aside className="sidebar w-64 p-4 flex flex-col justify-between rounded-r-lg">
      <div>
        <div className="flex items-center mb-6 px-2">
          <span className="text-xl font-semibold text-gray-800">Mabinogi Mobile</span>
        </div>
        <nav>
          <ul>
            {navItems.map((item) => (
              <li
                key={item.name}
                className={`sidebar-item flex items-center p-3 rounded-lg mb-2 cursor-pointer ${
                  pathname === item.href ? 'active' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Link href={item.href} className="flex items-center w-full">
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex items-center p-3 rounded-lg mt-6 bg-gray-100">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
          {userEmail ? userEmail.charAt(0).toUpperCase() : 'N'}
        </div>
        <div className="ml-3 text-sm">
          <div className="font-medium text-gray-800">{userEmail}</div>
          <button className="text-xs text-blue-600 hover:underline" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;