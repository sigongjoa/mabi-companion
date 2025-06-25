"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Plus, Minus } from "lucide-react"

interface LifeSkill {
  id: number
  name: string
  level: number
  category: string
}

const initialSkills: LifeSkill[] = [
  { id: 1, name: "일상 채집", level: 1, category: "채집" },
  { id: 2, name: "나무 베기", level: 1, category: "채집" },
  { id: 3, name: "광석 캐기", level: 2, category: "채집" },
  { id: 4, name: "약초 채집", level: 6, category: "채집" },
  { id: 5, name: "양털 깎기", level: 1, category: "채집" },
  { id: 6, name: "추수", level: 1, category: "채집" },
  { id: 7, name: "낚시", level: 1, category: "채집" },
  { id: 8, name: "대장 기술", level: 1, category: "제작" },
  { id: 9, name: "목공", level: 1, category: "제작" },
  { id: 10, name: "매직 크래프트", level: 1, category: "제작" },
  { id: 11, name: "종합 제작", level: 1, category: "제작" },
  { id: 12, name: "건강 제작", level: 1, category: "제작" },
  { id: 13, name: "천옷 제작", level: 1, category: "제작" },
  { id: 14, name: "물약 조제", level: 1, category: "제작" },
  { id: 15, name: "요리", level: 1, category: "제작" },
  { id: 16, name: "핸디크래프트", level: 1, category: "제작" },
  { id: 17, name: "연금술", level: 1, category: "제작" },
  { id: 18, name: "아르바이트", level: 1, category: "기타" },
]

const categories = ["전체", "채집", "제작", "기타"]

const categoryColors = {
  채집: "bg-green-600",
  제작: "bg-blue-600",
  기타: "bg-purple-600",
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<LifeSkill[]>(initialSkills)
  const [selectedCategory, setSelectedCategory] = useState("전체")

  const updateSkillLevel = (skillId: number, change: number) => {
    setSkills((prev) =>
      prev.map((skill) => {
        if (skill.id === skillId) {
          const newLevel = Math.max(1, skill.level + change)
          return { ...skill, level: newLevel }
        }
        return skill
      }),
    )
  }

  const filteredSkills = skills.filter((skill) => selectedCategory === "전체" || skill.category === selectedCategory)

  const getSkillIcon = (skillName: string) => {
    const iconMap: Record<string, string> = {
      "일상 채집": "🌿",
      "나무 베기": "🪓",
      "광석 캐기": "⛏️",
      "약초 채집": "🌱",
      "양털 깎기": "✂️",
      추수: "🌾",
      낚시: "🎣",
      "대장 기술": "🔨",
      목공: "🪚",
      "매직 크래프트": "✨",
      "종합 제작": "🛠️",
      "건강 제작": "💊",
      "천옷 제작": "🧵",
      "물약 조제": "🧪",
      요리: "🍳",
      핸디크래프트: "🎨",
      연금술: "⚗️",
      아르바이트: "💼",
    }
    return iconMap[skillName] || "📋"
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">생활 스킬</h1>
          <p className="text-gray-600">생활 스킬 레벨 관리</p>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <span className="text-gray-900 font-medium">
            총 {skills.reduce((sum, skill) => sum + skill.level, 0)} 레벨
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={
              selectedCategory === category
                ? "bg-purple-600 hover:bg-purple-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }
          >
            {category}
            {category !== "전체" && (
              <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                {skills.filter((s) => s.category === category).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSkills.map((skill) => (
          <Card key={skill.id} className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{getSkillIcon(skill.name)}</div>
                <div className="flex-1">
                  <CardTitle className="text-gray-900 text-sm">{skill.name}</CardTitle>
                  <Badge className={`text-xs ${categoryColors[skill.category as keyof typeof categoryColors]}`}>
                    {skill.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateSkillLevel(skill.id, -1)}
                    className="h-8 w-8 p-0 border-gray-300"
                    disabled={skill.level <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="w-16 text-center">
                    <span className="text-gray-900 font-medium text-sm">Lv. {skill.level}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateSkillLevel(skill.id, 1)}
                    className="h-8 w-8 p-0 border-gray-300"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
