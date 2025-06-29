"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import avatarSetsData from '@/data/avatarSets.json';
import { logger } from '@/lib/logger';

interface AvatarItem {
  name: string;
  imageUrl: string;
}

interface AvatarSet {
  name: string;
  items: AvatarItem[];
}

// To store owned status in localStorage
interface OwnedAvatarItems {
  [setName: string]: { [itemName: string]: boolean };
}

const LOCAL_STORAGE_KEY = 'mabinogi-avatar-collection';

export default function AvatarPage() {
  const [ownedItems, setOwnedItems] = useState<OwnedAvatarItems>({});
  const [isCollectionMode, setIsCollectionMode] = useState(false);

  useEffect(() => {
    logger.debug('Entering useEffect for initial localStorage load.');
    // Load owned status from localStorage on component mount
    const storedOwnedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedOwnedItems) {
      try {
        const parsedItems: OwnedAvatarItems = JSON.parse(storedOwnedItems);
        setOwnedItems(parsedItems);
        logger.debug('Successfully loaded owned items from localStorage.');
      } catch (error) {
        console.error('Failed to parse owned items from localStorage:', error);
        logger.debug(`Error parsing localStorage for ${LOCAL_STORAGE_KEY}: ${error}`);
      }
    } else {
      logger.debug('No owned items found in localStorage. Initializing empty.');
    }
    logger.debug('Exiting useEffect for initial localStorage load.');
  }, []);

  useEffect(() => {
    logger.debug('Entering useEffect for localStorage update.');
    // Save owned status to localStorage whenever it changes
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ownedItems));
      logger.debug('Successfully saved owned items to localStorage.');
    } catch (error) {
      console.error('Failed to save owned items to localStorage:', error);
      logger.debug(`Error saving localStorage for ${LOCAL_STORAGE_KEY}: ${error}`);
    }
    logger.debug('Exiting useEffect for localStorage update.');
  }, [ownedItems]);

  const handleItemClick = (setName: string, itemName: string) => {
    logger.debug(`Item clicked: Set=${setName}, Item=${itemName}`);
    setOwnedItems(prevOwnedItems => {
      const newOwnedItems = { ...prevOwnedItems };
      if (!newOwnedItems[setName]) {
        newOwnedItems[setName] = {};
      }
      newOwnedItems[setName][itemName] = !newOwnedItems[setName][itemName];
      logger.debug(`Updated owned status for ${itemName}: ${newOwnedItems[setName][itemName]}`);
      return newOwnedItems;
    });
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    logger.debug(`Collection mode toggle changed to: ${e.target.checked}`);
    setIsCollectionMode(e.target.checked);
  };

  const totalSets = avatarSetsData.length;
  const ownedSetsCount = avatarSetsData.filter(set => 
    set.items.every(item => ownedItems[set.name]?.[item.name])
  ).length;

  // Inline styles to mimic the HTML provided, mixed with Tailwind for clarity
  const customStyles: { [key: string]: React.CSSProperties } = {
    // Base font and dark mode settings handled by global.css and tailwind.config.ts
    // .item-card:not(.owned) img
    itemCardNotOwnedImg: {
      filter: 'brightness(0.3) grayscale(1)',
      opacity: 0.6,
    },
    // .item-card.owned .item-image-wrapper
    itemCardOwnedImageWrapper: {
      borderColor: '#a38b4b',
      boxShadow: '0 0 15px rgba(163, 139, 75, 0.5)',
    },
    // .toggle-checkbox:checked + .toggle-label
    toggleCheckboxCheckedLabel: {
      backgroundColor: '#a38b4b',
    },
    // .toggle-checkbox:checked + .toggle-label .toggle-ball
    toggleCheckboxCheckedLabelToggleBall: {
      transform: 'translateX(24px)',
    },
    // .collection-mode .item-card:not(.owned)
    collectionModeItemCardNotOwned: {
      display: 'none',
    },
  };

  return (
    <div className={`p-4 sm:p-6 md:p-8 ${isCollectionMode ? 'collection-mode' : ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* 페이지 헤더 */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">아바타 세트</h1>
            <p className="text-lg text-gray-400 mt-1">세트 {ownedSetsCount} / {totalSets}</p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className="text-lg font-medium text-white">수집</span>
            <label htmlFor="collectionToggle" className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="collectionToggle" 
                className="sr-only toggle-checkbox" 
                checked={isCollectionMode}
                onChange={handleToggleChange}
              />
              <div className="toggle-label w-12 h-6 bg-gray-600 rounded-full transition-colors duration-300 ease-in-out"
                   style={isCollectionMode ? customStyles.toggleCheckboxCheckedLabel : {}}>
                <div className="toggle-ball absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out"
                     style={isCollectionMode ? customStyles.toggleCheckboxCheckedLabelToggleBall : {}}></div>
              </div>
            </label>
          </div>
        </header>

        {/* 아바타 세트 목록 */}
        <main id="avatar-sets-container" className="space-y-12">
          {avatarSetsData.map((set: AvatarSet) => {
            const ownedCount = set.items.filter(item => ownedItems[set.name]?.[item.name]).length;
            const totalCount = set.items.length;

            return (
              <section key={set.name}>
                <div className="pb-4 mb-6 border-b border-gray-700">
                  <h2 className="text-2xl font-bold text-white">{set.name}</h2>
                  <p className="text-md text-gray-400 font-medium">{ownedCount}세트 / {totalCount}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {set.items.map(item => {
                    const isOwned = ownedItems[set.name]?.[item.name] || false;
                    return (
                      <div 
                        key={item.name} 
                        className={`item-card group flex flex-col items-center text-center p-3 rounded-lg bg-gray-800/50 transition-all duration-300 ${isOwned ? 'owned' : ''}`}
                        onClick={() => handleItemClick(set.name, item.name)}
                        style={isCollectionMode && !isOwned ? customStyles.collectionModeItemCardNotOwned : {}}
                      >
                        <div 
                          className="item-image-wrapper w-full aspect-square bg-black/30 rounded-lg flex items-center justify-center p-2 border-2 border-transparent transition-all duration-300"
                          style={isOwned ? customStyles.itemCardOwnedImageWrapper : {}}
                        >
                          <Image 
                            src={item.imageUrl} 
                            alt={item.name} 
                            width={200} 
                            height={200} 
                            className="max-w-full max-h-full object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
                            style={!isOwned ? customStyles.itemCardNotOwnedImg : {}}
                          />
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-300 h-10 flex items-center justify-center">{item.name}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
} 