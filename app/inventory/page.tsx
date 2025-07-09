"use client";

import React, { useState } from 'react';

interface Item {
  id: string;
  icon: string; // Placeholder for icon path or component
  name: string;
  category: string;
  quantity: number;
  isFavorite: boolean;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('items'); // 'items', 'craftable', 'gems', 'image-parsing'
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'consumables', 'equipment', etc.
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [items, setItems] = useState<Item[]>([
    // Dummy data
    { id: '1', icon: '', name: '생명력 포션', category: '소모품', quantity: 10, isFavorite: false },
    { id: '2', icon: '', name: '롱 소드', category: '장비', quantity: 1, isFavorite: true },
    { id: '3', icon: '', name: '마나 허브', category: '기타', quantity: 50, isFavorite: false },
    { id: '4', icon: '', name: '금화 주머니', category: '화폐', quantity: 1, isFavorite: false },
  ]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesFavorites = !showFavoritesOnly || item.isFavorite;
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const handleFavoriteToggle = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="header">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" clipRule="evenodd"></path></svg>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">아이템 관리</h1>
            <p className="text-sm text-secondary">인벤토리 및 아이템 현황 관리</p>
            <p className="text-xs text-secondary">내 캐릭터의 아이템을 효율적으로 관리하고 생산에 활용하세요.</p>
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="검색..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="card main-card-padding mb-6">
          {/* Tabs */}
          <div className="flex space-x-2 mb-4">
            <button
              className={`tab-button ${activeTab === 'items' ? 'active' : ''} flex items-center`}
              onClick={() => setActiveTab('items')}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 00-1 1v1a1 1 0 002 0V4a1 1 0 00-1-1zM10 3a1 1 0 00-1 1v1a1 1 0 002 0V4a1 1 0 00-1-1zM13 3a1 1 0 00-1 1v1a1 1 0 002 0V4a1 1 0 00-1-1z"></path><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5-8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
              아이템 (테이블)
            </button>
            <button
              className={`tab-button ${activeTab === 'craftable' ? 'active' : ''} flex items-center`}
              onClick={() => setActiveTab('craftable')}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414L7 9.586V7a1 1 0 10-2 0v3a1 1 0 001 1h3a1 1 0 100-2H7.414l1.293-1.293z" clipRule="evenodd"></path></svg>
              제작 가능 (0)
            </button>
            <button
              className={`tab-button ${activeTab === 'gems' ? 'active' : ''} flex items-center`}
              onClick={() => setActiveTab('gems')}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586V7a1 1 0 10-2 0v3.586L5.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 000-1.414z" clipRule="evenodd"></path></svg>
              보석
            </button>
            <button
              className={`tab-button ${activeTab === 'image-parsing' ? 'active' : ''} flex items-center`}
              onClick={() => setActiveTab('image-parsing')}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"></path></svg>
              이미지 파싱
            </button>
          </div>

          {/* Integrated Inventory Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-800 mr-2">통합 인벤토리</h3>
              <span className="text-sm text-secondary">총 {filteredItems.length}개 아이템 (선택된 캐릭터 없음)</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">즐겨찾기만</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                />
                <span className="toggle-slider"></span>
              </label>
              <button className="ml-4 text-gray-500 hover:text-red-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['전체', '소모품', '장비', '기타', '화폐', '광물', '가죽', '옷감', '버섯', '결정', '마법', '파편', '꽃', '요리재료', '보석'].map(category => (
              <button
                key={category}
                className={`category-button ${activeCategory === category.toLowerCase() ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.toLowerCase())}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Item List Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-md">즐겨찾기</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아이콘</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-md">수량</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-secondary">표시할 아이템이 없습니다.</td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button onClick={() => handleFavoriteToggle(item.id)}>
                          <svg className={`w-5 h-5 ${item.isFavorite ? 'text-red-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Placeholder for item icon */}
                        <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                          {item.name.charAt(0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </body>
  );
}