"use client"

import React, { useState, useEffect } from 'react';

import { useCharacter } from "@/contexts/character-context";
import { Package, Book, ScrollText, BarChart, PlusCircle, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logger } from "@/lib/logger";
import { Sidebar } from "@/components/sidebar";
import UnifiedLayout from "@/components/unified-layout";

// Define interfaces for character data based on the provided document
interface InventoryItem {
  ItemID: string;
  ItemName: string;
  Quantity: number;
  AcquiredStatus: boolean;
  InventorySlot?: string;
  IsEquipped: boolean;
}

interface CharacterTitle {
  TitleID: string;
  TitleName: string;
  AcquisitionTimestamp: string;
}

interface CharacterQuest {
  QuestID: string;
  QuestName: string;
  IsCompleted: boolean;
}

interface CharacterStats {
  CharacterLevel: number;
  CumulativeClassLevel: number;
  MaxHP: number;
  Strength: number;
  Dexterity: number;
  Intelligence: number;
  Luck: number;
  Will: number;
}

// Data Input Modal Component
const DataInputModal = ({ onClose, onSave }: {
  onClose: () => void; // onClose is now passed from the parent Dialog
  onSave: (data: any) => void;
}) => {
  const [itemData, setItemData] = useState<Partial<InventoryItem>>({});
  const [dataType, setDataType] = useState("inventory"); // 'inventory', 'title', 'quest', 'stat'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setItemData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    logger.debug(`Saving data for type: ${dataType}`, itemData);
    onSave({ type: dataType, data: itemData });
    setItemData({}); // Reset form
    onClose(); // Close the dialog after saving
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>캐릭터 데이터 입력/수정</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataType" className="text-right">데이터 유형</Label>
            <select id="dataType" value={dataType} onChange={(e) => setDataType(e.target.value)} className="col-span-3 p-2 border rounded-md bg-background text-foreground">
              <option value="inventory">인벤토리 아이템</option>
              <option value="title">칭호</option>
              <option value="quest">퀘스트</option>
              <option value="stat">능력치</option>
            </select>
          </div>

          {dataType === "inventory" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ItemName" className="text-right">아이템 이름</Label>
                <Input id="ItemName" value={itemData.ItemName || ""} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="Quantity" className="text-right">수량</Label>
                <Input id="Quantity" type="number" value={itemData.Quantity || 0} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="IsEquipped" className="text-right">착용 여부</Label>
                <input type="checkbox" id="IsEquipped" checked={itemData.IsEquipped || false} onChange={handleInputChange} className="col-span-3" />
              </div>
            </>
          )}

          {dataType === "title" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="TitleName" className="text-right">칭호 이름</Label>
                <Input id="TitleName" value={itemData.TitleName || ""} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="AcquisitionTimestamp" className="text-right">획득 일시</Label>
                <Input id="AcquisitionTimestamp" type="datetime-local" value={itemData.AcquisitionTimestamp || ""} onChange={handleInputChange} className="col-span-3" />
              </div>
            </>
          )}

          {dataType === "quest" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="QuestName" className="text-right">퀘스트 이름</Label>
                <Input id="QuestName" value={itemData.QuestName || ""} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="IsCompleted" className="text-right">완료 여부</Label>
                <input type="checkbox" id="IsCompleted" checked={itemData.IsCompleted || false} onChange={handleInputChange} className="col-span-3" />
              </div>
            </>
          )}

          {dataType === "stat" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="CharacterLevel" className="text-right">캐릭터 레벨</Label>
                <Input id="CharacterLevel" type="number" value={itemData.CharacterLevel || 0} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="MaxHP" className="text-right">최대 HP</Label>
                <Input id="MaxHP" type="number" value={itemData.MaxHP || 0} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="Strength" className="text-right">힘</Label>
                <Input id="Strength" type="number" value={itemData.Strength || 0} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="Dexterity" className="text-right">솜씨</Label>
                <Input id="Dexterity" type="number" value={itemData.Dexterity || 0} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="Intelligence" className="text-right">지력</Label>
                <Input id="Intelligence" type="number" value={itemData.Intelligence || 0} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="Luck" className="text-right">행운</Label>
                <Input id="Luck" type="number" value={itemData.Luck || 0} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="Will" className="text-right">의지</Label>
                <Input id="Will" type="number" value={itemData.Will || 0} onChange={handleInputChange} className="col-span-3" />
              </div>
            </>
          )}
        </div>
        <Button type="submit" onClick={handleSave}>저장</Button>
    </DialogContent>
  );
};

export default function CharacterManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activeCharacter, characters } = useCharacter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [titles, setTitles] = useState<CharacterTitle[]>([]);
  const [quests, setQuests] = useState<CharacterQuest[]>([]);
  const [stats, setStats] = useState<CharacterStats | null>(null);

  useEffect(() => {
    // Load data from localStorage or activeCharacter
    // For demonstration, using dummy data or activeCharacter properties
    if (activeCharacter) {
      // Example: Load inventory from activeCharacter if available
      // Assuming activeCharacter has an inventory property
      // setInventory(activeCharacter.inventory || []); 
      // For now, let's use dummy data or parse from localStorage if available
      const storedInventory = localStorage.getItem(`inventory_${activeCharacter.id}`);
      if (storedInventory) {
        setInventory(JSON.parse(storedInventory));
      } else {
        setInventory([
          { ItemID: "item1", ItemName: "초보자용 검", Quantity: 1, AcquiredStatus: true, IsEquipped: true },
          { ItemID: "item2", ItemName: "생명력 포션", Quantity: 10, AcquiredStatus: true, IsEquipped: false },
        ]);
      }

      const storedTitles = localStorage.getItem(`titles_${activeCharacter.id}`);
      if (storedTitles) {
        setTitles(JSON.parse(storedTitles));
      } else {
        setTitles([
          { TitleID: "title1", TitleName: "모험가", AcquisitionTimestamp: "2024-01-01T10:00:00Z" },
          { TitleID: "title2", TitleName: "초보 전사", AcquisitionTimestamp: "2024-01-05T12:30:00Z" },
        ]);
      }

      const storedQuests = localStorage.getItem(`quests_${activeCharacter.id}`);
      if (storedQuests) {
        setQuests(JSON.parse(storedQuests));
      } else {
        setQuests([
          { QuestID: "quest1", QuestName: "튜토리얼 완료", IsCompleted: true },
          { QuestID: "quest2", QuestName: "던전 탐험", IsCompleted: false },
        ]);
      }

      const storedStats = localStorage.getItem(`stats_${activeCharacter.id}`);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      } else {
        setStats({
          CharacterLevel: 65,
          CumulativeClassLevel: 675,
          MaxHP: 5500,
          Strength: 550,
          Dexterity: 550,
          Intelligence: 550,
          Luck: 400,
          Will: 400,
        });
      }

    }
  }, [activeCharacter]);

  const handleSaveData = (data: { type: string; data: any }) => {
    if (!activeCharacter) return;

    switch (data.type) {
      case "inventory":
        setInventory(prev => {
          const newInventory = [...prev, { ...data.data, ItemID: `item_${Date.now()}` }];
          localStorage.setItem(`inventory_${activeCharacter.id}`, JSON.stringify(newInventory));
          return newInventory;
        });
        break;
      case "title":
        setTitles(prev => {
          const newTitles = [...prev, { ...data.data, TitleID: `title_${Date.now()}` }];
          localStorage.setItem(`titles_${activeCharacter.id}`, JSON.stringify(newTitles));
          return newTitles;
        });
        break;
      case "quest":
        setQuests(prev => {
          const newQuests = [...prev, { ...data.data, QuestID: `quest_${Date.now()}` }];
          localStorage.setItem(`quests_${activeCharacter.id}`, JSON.stringify(newQuests));
          return newQuests;
        });
        break;
      case "stat":
        setStats(data.data);
        localStorage.setItem(`stats_${activeCharacter.id}`, JSON.stringify(data.data));
        break;
      default:
        break;
    }
  };

  if (!activeCharacter) {
    return (
      <div className="flex min-h-screen">
        <Sidebar isOpen={true} setIsOpen={() => {}} />
        <main className="flex-1 bg-gray-50 p-4 md:p-8">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111618] tracking-light text-[32px] font-bold leading-tight min-w-72">Character Management</p>
            </div>
            <div className="card fade-in p-6 text-center text-muted-foreground">
              캐릭터를 선택해주세요.
            </div>
          </div>
        </main>
      </div>
    );
  }

  <UnifiedLayout>
      <div className="px-40 flex flex-1 justify-center py-5 bg-white" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <div className="flex min-w-72 flex-col gap-3">
              <p className="text-[#111618] tracking-light text-[32px] font-bold leading-tight">Character Management</p>
              <p className="text-[#607c8a] text-sm font-normal leading-normal">Manage your characters in Mabinogi Mobile. Add new characters or edit existing ones.</p>
            </div>
          </div>
          <h3 className="text-[#111618] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Your Characters</h3>
          {
            characters.map(char => (
              <div key={char.id} className="p-4">
                <div className="flex items-stretch justify-between gap-4 rounded-xl">
                  <div className="flex flex-[2_2_0px] flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-[#111618] text-base font-bold leading-tight">{char.name}</p>
                      <p className="text-[#607c8a] text-sm font-normal leading-normal">Level {char.level}, {char.class}</p>
                    </div>
                    <button
                      onClick={() => setActiveCharacter(char.id)}
                      disabled={activeCharacter?.id === char.id}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 flex-row-reverse bg-[#f0f3f5] text-[#111618] text-sm font-medium leading-normal w-fit disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="truncate">{activeCharacter?.id === char.id ? 'Active' : 'Set as Active'}</span>
                    </button>
                  </div>
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                    style={{ backgroundImage: `url(${char.imageUrl || '/placeholder.svg'})` }}
                  ></div>
                </div>
              </div>
            ))
          }
          <div className="flex px-4 py-3 justify-start">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#3db7f4] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Add New Character</span>
                </Button>
              </DialogTrigger>
              <DataInputModal onClose={() => setIsModalOpen(false)} onSave={handleSaveData} />
            </Dialog>
          </div>
        </div>
      </div>
    </UnifiedLayout>
}