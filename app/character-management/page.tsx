"use client";

import React, { useState, useEffect } from 'react';
import supabase from '@/lib/supabase'; // Import Supabase client
import { useNotification } from '@/contexts/notification-context';
import { useCharacter } from '@/contexts/character-context'; // Import useCharacter

import UnifiedLayout from "@/components/unified-layout";

interface Character {
  id: string;
  name: string;
  server: string;
  level: number;
  job: string;
  combat_power: string;
}

export default function CharacterManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterName, setCharacterName] = useState('');
  const [server, setServer] = useState('');
  const [level, setLevel] = useState(65);
  const [job, setJob] = useState('');
  const [combatPower, setCombatPower] = useState('');
  const { notify } = useNotification();
  const { setActiveCharacter, activeCharacter } = useCharacter(); // Get setActiveCharacter and activeCharacter from context

  useEffect(() => {
    const fetchCharacters = async () => {
      const { data, error } = await supabase.from('characters').select('*');
      if (data) {
        setCharacters(data);
      } else if (error) {
        console.error('Error fetching characters:', error.message);
        notify(`Error fetching characters: ${error.message}`);
      }
    };
    fetchCharacters();
  }, []);

  const handleSaveCharacter = async () => {
    const { data: { user } } = await supabase.auth.getUser(); // Get the authenticated user
    if (!user || !user.id) {
      console.error("User not authenticated or user ID not available. Cannot save character.");
      notify("User not authenticated. Please log in to save a character.");
      return;
    }

    const newCharacter = {
      name: characterName,
      server: server,
      level: level,
      job: job,
      combat_power: combatPower,
      user_id: user.id, // Include user_id
    };

    const { data, error } = await supabase.from('characters').insert([newCharacter]).select();

    if (error) {
      console.error('Error saving character:', error.message);
      if (error.code === '23505') { // 23505 is the unique violation error code in PostgreSQL
        notify("Character with this name already exists for your account. Please choose a different name.");
      } else {
        notify(`Error saving character: ${error.message}`);
      }
    } else if (data) {
      setCharacters((prevCharacters) => [...prevCharacters, data[0]]);
      // Reset form fields
      setCharacterName('');
      setServer('');
      setLevel(65);
      setJob('');
      setCombatPower('');
      setIsModalOpen(false);
    }
  };

  const handleSelectCharacter = (character: Character) => {
    setActiveCharacter(character);
    notify(`${character.name}(으)로 캐릭터가 선택되었습니다.`);
  };

  return (
    <UnifiedLayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="header">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">캐릭터 관리</h1>
            <p className="text-secondary">다중 캐릭터 정보 관리</p>
          </div>
          <div className="flex items-center">
            <input type="text" placeholder="캐릭터 검색..." className="input-field" />
            <span className="text-sm text-gray-600 mr-4">{characters.length}명의 캐릭터</span>
            <button id="addCharacterBtn" className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              캐릭터 추가
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="card main-card-padding">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">모든 캐릭터 요약</h2>
            {characters.length === 0 ? (
              <>
                <p className="text-secondary mb-2">표시할 캐릭터가 없습니다.</p>
                <p className="text-secondary">검색 결과가 없습니다.</p>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((char) => (
                  <div key={char.id} className={`card character-card-layout ${activeCharacter?.id === char.id ? 'border-blue-500' : ''}`}>
                    <div className="flex-shrink-0">
                      {/* Placeholder for character image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl font-bold">
                        {char.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{char.name}</h3>
                      <p className="text-sm text-secondary">서버: {char.server}</p>
                      <p className="text-sm text-secondary">레벨: {char.level}</p>
                      <p className="text-sm text-secondary">직업: {char.job}</p>
                      <p className="text-sm text-secondary">전투력: {char.combat_power}</p>
                      <button className="btn-primary mt-2" onClick={() => handleSelectCharacter(char)}>
                        선택
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Add Character Modal */}
        {isModalOpen && (
          <div id="addCharacterModal" className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="text-lg font-semibold">새 캐릭터 추가</h3>
                <button id="closeModalBtn" className="text-white hover:text-gray-200" onClick={() => setIsModalOpen(false)}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 py-4">
                <div>
                  <label htmlFor="characterName" className="block text-sm font-medium text-gray-700 mb-1">캐릭터 이름</label>
                  <input
                    type="text"
                    id="characterName"
                    placeholder="캐릭터 이름 입력"
                    className="input-field"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="serverSelect" className="block text-sm font-medium text-gray-700 mb-1">서버</label>
                  <select
                      id="serverSelect"
                      className="input-field"
                      value={server}
                      onChange={(e) => setServer(e.target.value)}
                    >
                      <option value="">서버 선택</option>
                      <option value="데이안">데이안</option>
                      <option value="아이라">아이라</option>
                      <option value="던컨">던컨</option>
                      <option value="알리사">알리사</option>
                      <option value="메이븐">메이븐</option>
                      <option value="라사">라사</option>
                      <option value="칼릭스">칼릭스</option>
                    </select>
                </div>
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">레벨</label>
                  <input
                    type="number"
                    id="level"
                    value={level}
                    className="input-field"
                    onChange={(e) => setLevel(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label htmlFor="jobSelect" className="block text-sm font-medium text-gray-700 mb-1">직업</label>
                  <select
                      id="jobSelect"
                      className="input-field"
                      value={job}
                      onChange={(e) => setJob(e.target.value)}
                    >
                      <option value="">직업 선택</option>
                      <option value="전사">전사</option>
                      <option value="대검전사">대검전사</option>
                      <option value="검술사">검술사</option>
                      <option value="궁수">궁수</option>
                      <option value="석궁사수">석궁사수</option>
                      <option value="장궁병">장궁병</option>
                      <option value="마법사">마법사</option>
                      <option value="화염술사">화염술사</option>
                      <option value="빙결술사">빙결술사</option>
                      <option value="전격술사">전격술사</option>
                      <option value="힐러">힐러</option>
                      <option value="사제">사제</option>
                      <option value="수도사">수도사</option>
                      <option value="음유시인">음유시인</option>
                      <option value="댄서">댄서</option>
                      <option value="악사">악사</option>
                      <option value="도적">도적</option>
                      <option value="격투가">격투가</option>
                      <option value="듀얼블레이드">듀얼블레이드</option>
                    </select>
                </div>
                <div>
                  <label htmlFor="combatPower" className="block text-sm font-medium text-gray-700 mb-1">전투력</label>
                  <input
                    type="text"
                    id="combatPower"
                    placeholder="전투력 입력 (예: 12345)"
                    className="input-field"
                    value={combatPower}
                    onChange={(e) => setCombatPower(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button id="cancelModalBtn" className="btn-secondary" onClick={() => setIsModalOpen(false)}>취소</button>
                <button className="btn-primary" onClick={handleSaveCharacter}>저장</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UnifiedLayout>
  );
}