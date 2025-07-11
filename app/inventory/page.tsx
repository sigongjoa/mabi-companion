"use client";

import React, { useState, useEffect, useCallback } from 'react';
import UnifiedLayout from '@/components/unified-layout';
import { useCharacter } from '@/contexts/character-context';
import { useGlobalData, GameItem } from '@/contexts/GlobalDataContext'; // Import useGlobalData and GameItem
import { UserItem } from '@/types/page-context';
import debounce from 'lodash.debounce';

export default function InventoryPage() {
  const { activeCharacter, updateCharacter } = useCharacter();
  const { allItems } = useGlobalData(); // Get allItems from GlobalDataContext
  const [activeTab, setActiveTab] = useState('items'); // 'items', 'craftable', 'gems', 'image-parsing'
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'consumables', 'equipment', etc.
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<UserItem[]>([]);

  useEffect(() => {
    if (activeCharacter && allItems) {
      const mergedItems: UserItem[] = [];
      const userItemMap = new Map<string, UserItem>();

      // Populate map with user's actual items
      (activeCharacter.userItems || []).forEach(item => {
        userItemMap.set(item.item_id, item);
      });

      // Iterate through all game items and merge with user's items
      Object.values(allItems).forEach(gameItem => {
        const userItem = userItemMap.get(gameItem.id.toString());
        if (userItem) {
          mergedItems.push({
            ...userItem,
            item_name: gameItem.name, // Ensure item_name is from gameItem
            category: gameItem.category, // Ensure category is from gameItem
            isFavorite: activeCharacter.favoriteItems?.[gameItem.id.toString()] || false, // Get favorite status
          });
        } else {
          // Item not owned by character, add with quantity 0
          mergedItems.push({
            item_id: gameItem.id.toString(),
            item_name: gameItem.name,
            category: gameItem.category,
            quantity: 0,
            durability: null, // Default for unowned
            custom_props: {}, // Default for unowned
            isFavorite: activeCharacter.favoriteItems?.[gameItem.id.toString()] || false, // Get favorite status
          });
        }
      });
      console.log('useEffect: mergedItems before setItems', mergedItems); // Debug log
      setItems(mergedItems);
    }
  }, [activeCharacter, allItems]);

  const filteredItems = React.useMemo(() => {
    console.log('filteredItems calculation: items', items, 'activeCategory', activeCategory, 'showFavoritesOnly', showFavoritesOnly, 'searchTerm', searchTerm); // Debug log
    return items.filter(item => {
      const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category.toLowerCase() === activeCategory; // category를 소문자로 변환하여 비교
      const matchesFavorites = !showFavoritesOnly || item.isFavorite;
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [items, activeCategory, showFavoritesOnly, searchTerm]);
  console.log('filteredItems calculation: result', filteredItems); // Debug log

  // Debounced function for updating character items in the database
  const debouncedUpdateCharacterItems = useCallback(
    debounce((charId: string, updatedItems: UserItem[]) => {
      updateCharacter(charId, { userItems: updatedItems });
    }, 500), // Adjust debounce time as needed (e.g., 500ms)
    [updateCharacter]
  );

  const handleFavoriteToggle = (itemId: string) => {
    if (activeCharacter && updateCharacter) {
      const newFavoriteItems = { ...activeCharacter.favoriteItems };
      newFavoriteItems[itemId] = !newFavoriteItems[itemId];

      // If the item is not in userItems, add it with quantity 0 when favorited
      const existingUserItem = activeCharacter.userItems.find(ui => ui.item_id === itemId);
      if (!existingUserItem && newFavoriteItems[itemId]) {
        const gameItem = allItems[itemId];
        if (gameItem) {
          const newUserItems = [...activeCharacter.userItems, {
            item_id: gameItem.id.toString(),
            item_name: gameItem.name,
            category: gameItem.category,
            quantity: 0,
            durability: null,
            custom_props: {},
            isFavorite: true,
          }];
          updateCharacter(activeCharacter.id, { favoriteItems: newFavoriteItems, userItems: newUserItems });
        } else {
          updateCharacter(activeCharacter.id, { favoriteItems: newFavoriteItems });
        }
      } else {
        updateCharacter(activeCharacter.id, { favoriteItems: newFavoriteItems });
      }
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (!activeCharacter || !updateCharacter) return;

    const updatedUserItems = (activeCharacter.userItems || []).map(item =>
      item.item_id === itemId ? { ...item, quantity: newQuantity } : item
    );

    // If the item doesn't exist in userItems and newQuantity > 0, add it
    const existingItem = updatedUserItems.find(item => item.item_id === itemId);
    if (!existingItem && newQuantity > 0) {
      const gameItem = allItems[itemId];
      if (gameItem) {
        updatedUserItems.push({
          item_id: gameItem.id.toString(),
          item_name: gameItem.name,
          category: gameItem.category,
          quantity: newQuantity,
          durability: null,
          custom_props: {},
          isFavorite: activeCharacter.favoriteItems?.[gameItem.id.toString()] || false,
        });
      }
    }

    setItems(prev =>
      prev.map(item =>
        item.item_id === itemId ? { ...item, quantity: newQuantity } : item
      )
    ); // Update local state immediately for smooth UI

    // Call the debounced function to update the database
    debouncedUpdateCharacterItems(activeCharacter.id, updatedUserItems);
  };

  return (
    <UnifiedLayout>
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
              <span className="text-sm text-secondary">총 {filteredItems.length}개 아이템 ({activeCharacter ? activeCharacter.name : '선택된 캐릭터 없음'})</span>
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
                onClick={() => {
                  console.log('Category button clicked:', category.toLowerCase()); // Debug log
                  setActiveCategory(category.toLowerCase());
                }}
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
                    <tr key={item.item_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button onClick={() => handleFavoriteToggle(item.item_id)}>
                          <svg className={`w-5 h-5 ${item.isFavorite ? 'text-red-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Placeholder for item icon */}
                        <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                          {item.item_name.charAt(0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            className="px-2 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                            onClick={() => handleQuantityChange(item.item_id, Math.max(0, item.quantity - 1))}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.item_id, Number(e.target.value))}
                            className="w-16 text-center border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                          <button
                            className="px-2 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                            onClick={() => handleQuantityChange(item.item_id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
    </UnifiedLayout>
  );
}