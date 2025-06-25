"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Plus, Minus } from "lucide-react"
import { useCharacter } from "@/contexts/character-context"
import skillsData from "@/data/skills.json"

interface LifeSkill {
  id: number
  name: string
  category: string
}

const allSkillsData: LifeSkill[] = skillsData as LifeSkill[];

const categories = ["전체", "채집", "제작", "기타"]

const categoryColors = {
  채집: "bg-green-600",
  제작: "bg-blue-600",
  기타: "bg-purple-600",
}

export default function SkillsPage() {
  console.debug("SkillsPage rendered.");
  const { activeCharacter, updateCharacter } = useCharacter();
  const [selectedCategory, setSelectedCategory] = useState("전체")

  const updateSkillLevel = (skillId: number, change: number) => {
    console.debug(`Entering updateSkillLevel - skillId: ${skillId}, change: ${change}`);
    if (!activeCharacter) {
      console.warn("No active character, cannot update skill level.");
      return;
    }

    const currentLevel = activeCharacter.skills[skillId] || 1; // Default to 1 if not found
    const newLevel = Math.max(1, currentLevel + change);

    const newSkills = { ...activeCharacter.skills, [skillId]: newLevel };
    updateCharacter(activeCharacter.id, { skills: newSkills });
    console.debug(`Skill ${skillId} level updated to ${newLevel}. New skills:`, newSkills);
  }

  // Combine allSkillsData with active character's skill levels
  const skillsWithLevels = allSkillsData.map(skill => ({
    ...skill,
    level: activeCharacter?.skills[skill.id] || 1 // Default to 1 if not found in activeCharacter
  }));
  console.debug("skillsWithLevels:", skillsWithLevels);

  const filteredSkills = skillsWithLevels.filter((skill) => selectedCategory === "전체" || skill.category === selectedCategory)
  console.debug("filteredSkills:", filteredSkills);

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

  // Calculate total skill levels based on active character's skills
  const totalSkillLevels = skillsWithLevels.reduce((sum, skill) => sum + skill.level, 0);
  console.debug("totalSkillLevels:", totalSkillLevels);

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
            총 {totalSkillLevels} 레벨
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => {
                console.debug(`Category ${category} selected.`);
                setSelectedCategory(category);
            }}
            className={
              selectedCategory === category
                ? "bg-purple-600 hover:bg-purple-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }
          >
            {category}
            {category !== "전체" && (
              <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                {skillsWithLevels.filter((s) => s.category === category).length}
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
                    onClick={() => {
                        console.debug(`Decrementing skill level for ${skill.name} (ID: ${skill.id})`);
                        updateSkillLevel(skill.id, -1);
                    }}
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
                    onClick={() => {
                        console.debug(`Incrementing skill level for ${skill.name} (ID: ${skill.id})`);
                        updateSkillLevel(skill.id, 1);
                    }}
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
