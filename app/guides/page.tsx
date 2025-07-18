'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Map, Sword, Infinity, Users, Target, Zap, Shield } from "lucide-react";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import UnifiedLayout from "@/components/unified-layout";

const dungeonData = [
  { name: "알비 1층", level: "~Lv.20", weaponRunes: "혹한", armorRunes: "방호, 결핍", note: "초보자~중급자 추천" },
  { name: "알비 2층", level: "~Lv.30", weaponRunes: "화염", armorRunes: "초자연, 침식", note: "화염 특화 룬 드랍" },
  {
    name: "키아 1층",
    level: "~Lv.30",
    weaponRunes: "극독, 강철, 궁극, 적혈",
    armorRunes: "쇠약, 끈기",
    note: "중독, 방어 특화",
  },
  {
    name: "키아 2층",
    level: "~Lv.40",
    weaponRunes: "질풍, 역병",
    armorRunes: "폭풍, 안정, 생명, 흡혈",
    note: "연타/중독/회복 특화",
  },
  {
    name: "라비 1층",
    level: "~Lv.40",
    weaponRunes: "전율, 경이, 결투, 연격, 선고",
    armorRunes: "초기, 성채, 얼어붙음, 제물, 위협, 전술가",
    note: "상위 스펙 룬 다수",
  },
  {
    name: "라비 2층",
    level: "~Lv.50+",
    weaponRunes: "격전, 격노, 고통",
    armorRunes: "저격, 난투, 격통, 절망, 기습, 압도",
    note: "최상위 난이도, 고효율",
  },
];

const infiniteCollectionData = [
  {
    item: "치명타 비약",
    target: "네잎클로버",
    quantity: "10회(100개)",
    method: "제작 10회 설정 → 네잎클로버 100개 필요 → 구하는 방법 약초 채집",
    tip: "티르코네일 남쪽, 약초 밀집 지역",
  },
  {
    item: "마나 회복 비약",
    target: "마나 허브",
    quantity: "10회(100개)",
    method: "제작 10회 설정 → 마나 허브 100개 필요 → 구하는 방법 약초 채집",
    tip: "마나 허브 출현 지역",
  },
  {
    item: "조개찜",
    target: "조개",
    quantity: "10회(40개)",
    method: "제작 10회 설정 → 조개 40개 필요 → 구하는 방법 채집",
    tip: "강가, 조개밀집 지역",
  },
  {
    item: "숙련 캠프파이어 키트",
    target: "돌멩이(광석)",
    quantity: "10회(100개)",
    method: "제작 10회 설정 → 돌멩이 100개 필요 → 구하는 방법 광석 캐기",
    tip: "늑대의 숲, 여신의 뜰 등 광맥 위치",
  },
  {
    item: "마력 기폭제(가공)",
    target: "반짝이는 이끼(버섯류)",
    quantity: "10회(100개)",
    method: "약품 가공 메뉴 → 마력 기폭제 10회 설정 → 구하는 방법 약초 채집",
    tip: "새록버섯, 튼튼버섯 등 버섯류 주변",
  },
];

const jobData = [
  {
    series: "전사 계열",
    jobs: [
      {
        name: "전사",
        tags: ["생존", "방해", "강타", "보조", "이동", "연타"],
        feature: "밸런스형, 방어력 높음, 초보자 추천",
      },
      { name: "대검전사", tags: ["강타", "보조", "이동", "연타", "방해"], feature: "광역 공격, 탱커, 한방 대미지" },
      {
        name: "검술사",
        tags: ["강타", "이동", "보조", "방해", "연타", "생존"],
        feature: "빠른 근접 딜러, 반격 중심, 컨트롤 필요",
      },
    ],
  },
  {
    series: "궁수 계열",
    jobs: [
      { name: "궁수", tags: ["이동", "연타", "방해", "강타", "생존", "보조"], feature: "명중률, 민첩, 빠른 공격" },
      { name: "석궁사수", tags: ["강타", "연타", "이동", "방해", "원소"], feature: "높은 딜, 타임어택 강세, 0티어" },
      { name: "장궁병", tags: ["방해", "강타", "연타", "보조", "원소"], feature: "광역 방해, 범위 공격" },
    ],
  },
  {
    series: "마법사 계열",
    jobs: [
      {
        name: "마법사",
        tags: ["원소", "생존", "보조", "연타", "방해", "강타", "소환"],
        feature: "원소 마법, 범용성, 마나 관리 중요",
      },
      {
        name: "화염술사",
        tags: ["원소", "연타", "강타", "방해", "보조"],
        feature: "화염 특화, 연타, 강력한 딜, 0티어",
      },
      {
        name: "빙결술사",
        tags: ["원소", "생존", "소환", "강타", "방해", "보조"],
                feature: "빙결 특화, CC기, 파티 유틸",
      },
    ],
  },
];

const runeData = [
  { tier: "1티어", name: "현란함", effect: "치명타 확률 +10%, 치명타 피해 +30%", note: "전 직업 공통, 딜러 필수" },
  { tier: "1티어", name: "지혜로움", effect: "모든 스킬 재사용 대기시간 18% 감소", note: "전 직업 공통, 쿨감 필요" },
  {
    tier: "1티어",
    name: "여신의 가호",
    effect: "전투 시작·궁극기 사용 시 30초간 피해 25% 증가",
    note: "전 직업 공통, 보스전 등",
  },
  {
    tier: "2티어",
    name: "굳건함+",
    effect: "공격 적중 시 15초마다 공격력·방어력 1%씩, 최대 10회 중첩",
    note: "탱커/근딜 추천",
  },
  { tier: "2티어", name: "날쌤+", effect: "강타 적중 시 5초간 연타 피해 18% 증가", note: "근딜, 연타 위주" },
  { tier: "3티어", name: "강렬함+", effect: "연타 적중 시 5초간 강타 피해 18% 증가", note: "연타/강타 혼합 세팅" },
];

const combatTips = [
  {
    category: "장비 강화",
    tips: [
      "무기 강화를 최우선으로 투자 (+10 이상 목표)",
      "6성 이상 무기 확보",
      "방어구는 무기 다음 우선순위",
      "장비 등급 업그레이드로 소켓 수 증가",
    ],
  },
  {
    category: "룬 및 보석",
    tips: [
      "전설 룬 장착으로 500+ 전투력 상승",
      "보석 소켓 최대 활용",
      "고등급 보석(스타프리즘) 교체",
      "보석 합성 및 승급",
    ],
  },
  {
    category: "효율적 성장",
    tips: [
      "일일/주간 던전 꾸준히 파밍",
      "강화 확률 상승 이벤트 활용",
      "메인 숙제 및 일일 미션 완료",
      "경매장 활용한 효율적 구매",
    ],
  },
];

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDungeonData = dungeonData.filter(
    (dungeon) =>
      dungeon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dungeon.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dungeon.weaponRunes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dungeon.armorRunes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dungeon.note.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInfiniteCollectionData = infiniteCollectionData.filter(
    (item) =>
      item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJobData = jobData
    .map((series) => ({
      ...series,
      jobs: series.jobs.filter(
        (job) =>
          job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((series) => series.jobs.length > 0);

  const filteredRuneData = runeData.filter(
    (rune) =>
      rune.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rune.effect.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rune.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rune.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCombatTips = combatTips
    .map((category) => ({
      ...category,
      tips: category.tips.filter((tip) => tip.toLowerCase().includes(searchQuery.toLowerCase())),
    }))
    .filter((category) => category.tips.length > 0);

  return (
    <UnifiedLayout>
      <div className="p-6 space-y-6 bg-white min-h-screen" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight">종합 가이드</p>
            <p className="text-[#637c88] text-sm font-normal leading-normal">던전, 직업, 무한채집, 룬 티어, 전투력 가이드</p>
          </div>
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        <Tabs defaultValue="dungeons" className="space-y-6">
          <div className="p-4">
            <TabsList className="grid w-full grid-cols-5 bg-[#f0f3f5] rounded-lg">
              <TabsTrigger value="dungeons" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md">
                <Sword className="w-4 h-4 mr-2" />
                던전 정보
              </TabsTrigger>
              <TabsTrigger value="infinite" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md">
                <Infinity className="w-4 h-4 mr-2" />
                무한 채집
              </TabsTrigger>
              <TabsTrigger value="jobs" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md">
                <Users className="w-4 h-4 mr-2" />
                직업 가이드
              </TabsTrigger>
              <TabsTrigger value="runes" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md">
                <Zap className="w-4 h-4 mr-2" />룬 티어
              </TabsTrigger>
              <TabsTrigger value="combat" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md">
                <Target className="w-4 h-4 mr-2" />
                전투력
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dungeons" className="space-y-6">
            <Card className="shadow-sm border border-[#dce2e5]">
              <CardHeader>
                <CardTitle className="text-[#111518]">심층 던전별 드랍 아이템</CardTitle>
                <CardDescription className="text-[#637c88]">
                  던전별 입장 레벨과 주요 드롭 룬(에픽 등급) 정보
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">던전명</th>
                        <th scope="col" className="px-6 py-3">입장 레벨</th>
                        <th scope="col" className="px-6 py-3">무기 룬</th>
                        <th scope="col" className="px-6 py-3">방어구 룬</th>
                        <th scope="col" className="px-6 py-3">특징</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDungeonData.map((dungeon, index) => (
                        <tr key={index} className="bg-white border-b">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{dungeon.name}</td>
                          <td className="px-6 py-4">{dungeon.level}</td>
                          <td className="px-6 py-4">{dungeon.weaponRunes}</td>
                          <td className="px-6 py-4">{dungeon.armorRunes}</td>
                          <td className="px-6 py-4 text-xs">{dungeon.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="infinite" className="space-y-6">
            <Card className="shadow-sm border border-[#dce2e5]">
              <CardHeader>
                <CardTitle className="text-[#111518]">무한/반자동 채집 아이템 정리표</CardTitle>
                <CardDescription className="text-[#637c88]">
                  제작 아이템을 활용해 특정 재료를 무한 또는 반자동으로 채집하는 방법
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInfiniteCollectionData.map((item, index) => (
                    <Card key={index} className="shadow-sm border border-[#dce2e5]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-[#111518] text-lg flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center text-white font-bold">
                            {item.item.charAt(0)}
                          </div>
                          <span>{item.item}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-[#637c88] mb-1">채집 대상</p>
                            <p className="text-[#111518]">{item.target}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-[#637c88] mb-1">설정 수량</p>
                            <p className="text-[#111518]">{item.quantity}</p>
                          </div>
                          <div className="lg:col-span-2">
                            <p className="font-semibold text-[#637c88] mb-1">자동 채집 방식</p>
                            <p className="text-[#111518]">{item.method}</p>
                          </div>
                          <div className="md:col-span-2 lg:col-span-4">
                            <p className="font-semibold text-[#637c88] mb-1">팁 & 장소 예시</p>
                            <p className="text-[#111518]">{item.tip}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card className="shadow-sm border border-[#dce2e5]">
              <CardHeader>
                <CardTitle className="text-[#111518]">직업 계열 및 스킬 특징</CardTitle>
                <CardDescription className="text-[#637c88]">마비노기 모바일의 다양한 직업과 그 특징</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredJobData.map((series, index) => (
                    <div key={index}>
                      <h3 className="text-xl font-bold text-[#19a1e5] mb-4">{series.series}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {series.jobs.map((job, jobIndex) => (
                          <Card key={jobIndex} className="shadow-sm border border-[#dce2e5]">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-[#111518] text-lg">{job.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-[#637c88] text-sm mb-2">주요 스킬 태그</p>
                                  <div className="flex flex-wrap gap-1">
                                    {job.tags.map((tag, tagIndex) => (
                                      <Badge
                                        key={tagIndex}
                                        variant="secondary"
                                        className="text-xs bg-[#e0f2fe] text-[#19a1e5] border-[#bfdbfe]"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[#637c88] text-sm mb-1">특징</p>
                                  <p className="text-[#111518] text-sm">{job.feature}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="runes" className="space-y-6">
            <Card className="shadow-sm border border-[#dce2e5]">
              <CardHeader>
                <CardTitle className="text-[#111518]">엠블럼 룬 티어 가이드</CardTitle>
                <CardDescription className="text-[#637c88]">
                  직업과 상황에 맞는 최적의 엠블럼 룬을 선택하여 전투력을 극대화하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">티어</th>
                        <th scope="col" className="px-6 py-3">룬 이름</th>
                        <th scope="col" className="px-6 py-3">주요 효과 요약</th>
                        <th scope="col" className="px-6 py-3">비고/추천 직업군</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRuneData.map((rune, index) => (
                        <tr key={index} className="bg-white border-b">
                          <td className="px-6 py-4">
                            <Badge
                              className={
                                rune.tier === "1티어"
                                  ? "bg-[#fee2e2] text-[#ef4444] border-[#fecaca]"
                                  : rune.tier === "2티어"
                                    ? "bg-[#e0f2fe] text-[#19a1e5] border-[#bfdbfe]"
                                    : "bg-[#dcfce7] text-[#22c55e] border-[#bbf7d0]"
                              }
                            >
                              {rune.tier}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{rune.name}</td>
                          <td className="px-6 py-4">{rune.effect}</td>
                          <td className="px-6 py-4 text-sm">{rune.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="combat" className="space-y-6">
            <Card className="shadow-sm border border-[#dce2e5]">
              <CardHeader>
                <CardTitle className="text-[#111518]">전투력 상승 가이드</CardTitle>
                <CardDescription className="text-[#637c88]">효율적으로 전투력을 높이는 핵심 전략들</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredCombatTips.map((section, index) => (
                    <Card key={index} className="shadow-sm border border-[#dce2e5]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-[#111518] flex items-center space-x-2">
                          {section.category === "장비 강화" && <Shield className="w-5 h-5 text-[#19a1e5]" />}
                          {section.category === "룬 및 보석" && <Zap className="w-5 h-5 text-[#a855f7]" />}
                          {section.category === "효율적 성장" && <Target className="w-5 h-5 text-[#22c55e]" />}
                          <span>{section.category}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {section.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-sm text-[#111518] flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-[#19a1e5] rounded-full mt-2 flex-shrink-0"></div>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedLayout>
  );
}
