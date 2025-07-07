'use client';

import { useState, useMemo } from 'react';
import { useFavorites } from '@/contexts/favorites-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Users, Package, Shield, Zap, Hammer, Clock, CheckSquare, BookOpen, Bot, Star } from 'lucide-react';
import UnifiedLayout from '@/components/unified-layout';
import { FavoriteToggle } from '@/components/favorite-toggle';

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState('Items');
  const router = useRouter();

  const groupedFavorites = useMemo(() => {
    const groups: Record<string, any[]> = {
      Items: [],
      Recipes: [],
      Quests: [],
    };
    favorites.forEach(fav => {
      if (fav.type === 'item' || fav.type === 'equipment' || fav.type === 'gem') {
        groups.Items.push(fav);
      } else if (fav.type === 'recipe') {
        groups.Recipes.push(fav);
      } else if (fav.type === 'quest') {
        groups.Quests.push(fav);
      }
    });
    return groups;
  }, [favorites]);

  const renderFavorites = (items: any[]) => {
    return items.map(item => (
      <div key={item.id} className="flex flex-1 gap-3 rounded-lg border border-[#dce2e5] bg-white p-4 flex-col">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-10 shrink-0"
          style={{ backgroundImage: `url(${item.icon || '/placeholder.svg'})` }}
        ></div>
        <div className="flex flex-col gap-1">
          <h2 className="text-[#111518] text-base font-bold leading-tight">{item.name}</h2>
          <p className="text-[#637c88] text-sm font-normal leading-normal">{item.type}</p>
        </div>
        <FavoriteToggle id={item.id} name={item.name} type={item.type} />
      </div>
    ));
  };

  return (
    <UnifiedLayout>
      <div className="px-40 flex flex-1 justify-center py-5 bg-white" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <div className="flex min-w-72 flex-col gap-3">
              <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight">Favorites</p>
              <p className="text-[#637c88] text-sm font-normal leading-normal">Manage your saved items, recipes, and quests.</p>
            </div>
          </div>
          <div className="pb-3">
            <div className="flex border-b border-[#dce2e5] px-4 gap-8">
              <button
                onClick={() => setActiveTab('Items')}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'Items' ? 'border-b-[#111518] text-[#111518]' : 'border-b-transparent text-[#637c88]'}`}>
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">Items ({groupedFavorites.Items.length})</p>
              </button>
              <button
                onClick={() => setActiveTab('Recipes')}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'Recipes' ? 'border-b-[#111518] text-[#111518]' : 'border-b-transparent text-[#637c88]'}`}>
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">Recipes ({groupedFavorites.Recipes.length})</p>
              </button>
              <button
                onClick={() => setActiveTab('Quests')}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'Quests' ? 'border-b-[#111518] text-[#111518]' : 'border-b-transparent text-[#637c88]'}`}>
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">Quests ({groupedFavorites.Quests.length})</p>
              </button>
            </div>
          </div>

          <h3 className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">{activeTab}</h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
            {renderFavorites(groupedFavorites[activeTab])}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
