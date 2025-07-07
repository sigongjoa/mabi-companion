"use client";

import { useCharacter } from "@/contexts/character-context";
import { useRouter } from 'next/navigation';
import { logger } from "@/lib/logger";

export default function HomePage() {
  logger.debug("HomePage 렌더링 시작");
  const router = useRouter();
  const { activeCharacter, characters, isLoadingData, dataLoadError } = useCharacter();

  if (isLoadingData) {
    return <div>로딩중...</div>;
  }

  if (dataLoadError) {
    return <div>데이터를 불러오는데 실패했습니다.</div>;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f4f3f0] px-10 py-3">
          <div className="flex items-center gap-4 text-[#171511]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-[#171511] text-lg font-bold leading-tight tracking-[-0.015em]">마비노기 모바일</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-[#171511] text-sm font-medium leading-normal" href="#">홈</a>
              <a className="text-[#171511] text-sm font-medium leading-normal" href="#">거래소</a>
              <a className="text-[#171511] text-sm font-medium leading-normal" href="#">커뮤니티</a>
              <a className="text-[#171511] text-sm font-medium leading-normal" href="#">가이드</a>
              <a className="text-[#171511] text-sm font-medium leading-normal" href="#">고객지원</a>
            </div>
            <button
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f4f3f0] text-[#171511] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
            >
              <div className="text-[#171511]" data-icon="Bell" data-size="20px" data-weight="regular">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path
                    d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"
                  ></path>
                </svg>
              </div>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: `url(${activeCharacter?.imageUrl || '/placeholder-user.jpg'})` }}
            ></div>
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <section className="my-12 rounded-xl shadow-lg overflow-hidden">
              <div className="h-1 bg-violet-500 rounded-t-xl"></div>
              <div className="p-6 bg-gray-50">
                <h2 className="text-violet-600 text-[32px] font-bold leading-tight tracking-[-0.015em] pb-3">
                  캐릭터 정보
                </h2>
                <div className="px-4 py-3 @container">
                  <div className="flex overflow-hidden rounded-xl border border-[#e5e2dc] bg-white">
                    <table className="flex-1">
                      <thead>
                        <tr className="bg-white">
                          <th className="px-4 py-3 text-left text-[#171511] w-[150px] text-sm font-medium leading-normal">이름</th>
                          <th className="px-4 py-3 text-left text-[#171511] w-14 text-sm font-medium leading-normal">이미지</th>
                          <th className="px-4 py-3 text-left text-[#171511] w-[80px] text-sm font-medium leading-normal">레벨</th>
                          <th className="px-4 py-3 text-left text-[#171511] w-[120px] text-sm font-medium leading-normal">클래스</th>
                          <th className="px-4 py-3 text-left text-[#171511] w-[120px] text-sm font-medium leading-normal">전투력</th>
                          <th className="px-4 py-3 text-left text-[#171511] w-[100px] text-sm font-medium leading-normal">방어</th>
                          <th className="px-4 py-3 text-left text-[#171511] w-[100px] text-sm font-medium leading-normal">마법방어</th>
                        </tr>
                      </thead>
                      <tbody>
                        {characters && characters.map((character) => (
                          <tr className="border-t border-t-[#e5e2dc] bg-white transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5" key={character.id}>
                            <td className="h-[72px] px-4 py-2 text-[#171511] text-sm font-normal leading-normal">{character.name}</td>
                            <td className="h-[72px] px-4 py-2 w-14 text-sm font-normal leading-normal">
                              <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10"
                                style={{ backgroundImage: `url(${character.imageUrl || '/placeholder-user.jpg'})` }}
                              ></div>
                            </td>
                            <td className="h-[72px] px-4 py-2 text-[#877b64] text-sm font-normal leading-normal">{character.level}</td>
                            <td className="h-[72px] px-4 py-2 text-[#877b64] text-sm font-normal leading-normal">{character.profession}</td>
                            <td className="h-[72px] px-4 py-2 text-[#877b64] text-sm font-normal leading-normal">{character.combatPower?.toLocaleString() || 'N/A'}</td>
                            <td className="h-[72px] px-4 py-2 text-[#877b64] text-sm font-normal leading-normal">{character.defense || 'N/A'}</td>
                            <td className="h-[72px] px-4 py-2 text-[#877b64] text-sm font-normal leading-normal">{character.magicDefense || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <section className="my-12 rounded-xl shadow-lg overflow-hidden">
              <div className="h-1 bg-violet-500 rounded-t-xl"></div>
              <div className="p-6 bg-gray-50">
                <h2 className="text-violet-600 text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">
                  제작 타이머
                </h2>
                <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 rounded-lg shadow-sm mb-3 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                  <div className="text-violet-500 flex items-center justify-center rounded-lg bg-[#f4f3f0] shrink-0 size-12" data-icon="Clock" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[#171511] text-base font-medium leading-normal line-clamp-1">아이템 이름</p>
                    <p className="text-violet-700 text-sm font-normal leading-normal line-clamp-2">남은 시간: 2시간 30분</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                  <div className="text-violet-500 flex items-center justify-center rounded-lg bg-[#f4f3f0] shrink-0 size-12" data-icon="Clock" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[#171511] text-base font-medium leading-normal line-clamp-1">다른 아이템 이름</p>
                    <p className="text-violet-700 text-sm font-normal leading-normal line-clamp-2">남은 시간: 1시간 15분</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
