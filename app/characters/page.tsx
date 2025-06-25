"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Trash2, Star } from "lucide-react"

interface Character {
  id: number
  name: string
  server: string
  level: number
  profession: string
  silverCoins: number
  demonTribute: number
  favorite: boolean
}

const servers = ["류트", "만돌린", "하프", "울프", "던컨"]

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 1,
      name: "기사단장 테오",
      server: "류트",
      level: 120,
      profession: "석궁사수",
      silverCoins: 15000,
      demonTribute: 300,
      favorite: true,
    },
    {
      id: 2,
      name: "마법사 에리나",
      server: "만돌린",
      level: 95,
      profession: "화염술사",
      silverCoins: 8200,
      demonTribute: 120,
      favorite: false,
    },
    {
      id: 3,
      name: "음유시인 리안",
      server: "하프",
      level: 88,
      profession: "바드",
      silverCoins: 25000,
      demonTribute: 50,
      favorite: false,
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    server: "",
    level: "",
    profession: "",
  })

  const addCharacter = () => {
    if (!newCharacter.name || !newCharacter.server) return

    const character: Character = {
      id: Date.now(),
      name: newCharacter.name,
      server: newCharacter.server,
      level: Number.parseInt(newCharacter.level) || 1,
      profession: newCharacter.profession || "모험가",
      silverCoins: 0,
      demonTribute: 0,
      favorite: false,
    }

    setCharacters((prev) => [...prev, character])
    setNewCharacter({ name: "", server: "", level: "", profession: "" })
    setShowAddForm(false)
  }

  const deleteCharacter = (id: number) => {
    setCharacters((prev) => prev.filter((char) => char.id !== id))
  }

  const toggleFavorite = (id: number) => {
    setCharacters((prev) => prev.map((char) => (char.id === id ? { ...char, favorite: !char.favorite } : char)))
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="document-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">캐릭터 관리</h1>
            <p className="text-gray-600">다중 캐릭터 정보 관리</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-gray-900">{characters.length}명의 캐릭터</span>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="form-button-primary">
              <Plus className="w-4 h-4 mr-2" />
              캐릭터 추가
            </Button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <Card className="document-card">
          <CardHeader className="excel-header">
            <CardTitle className="text-gray-900">새 캐릭터 추가</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-700">
                  캐릭터 이름
                </Label>
                <Input
                  id="name"
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="캐릭터 이름 입력"
                  className="form-input"
                />
              </div>
              <div>
                <Label htmlFor="server" className="text-gray-700">
                  서버
                </Label>
                <Select
                  value={newCharacter.server}
                  onValueChange={(value) => setNewCharacter((prev) => ({ ...prev, server: value }))}
                >
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="서버 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {servers.map((server) => (
                      <SelectItem key={server} value={server}>
                        {server}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level" className="text-gray-700">
                  레벨
                </Label>
                <Input
                  id="level"
                  type="number"
                  value={newCharacter.level}
                  onChange={(e) => setNewCharacter((prev) => ({ ...prev, level: e.target.value }))}
                  placeholder="65"
                  className="form-input"
                />
              </div>
              <div>
                <Label htmlFor="profession" className="text-gray-700">
                  직업
                </Label>
                <Input
                  id="profession"
                  value={newCharacter.profession}
                  onChange={(e) => setNewCharacter((prev) => ({ ...prev, profession: e.target.value }))}
                  placeholder="모험가"
                  className="form-input"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button onClick={() => setShowAddForm(false)} className="form-button-secondary">
                취소
              </Button>
              <Button onClick={addCharacter} className="form-button-primary">
                저장
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
          <Card key={character.id} className="document-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {character.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 text-lg">{character.name}</CardTitle>
                    <p className="text-gray-600 text-sm">{character.server} 서버</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFavorite(character.id)}
                  className={character.favorite ? "text-yellow-500" : "text-gray-400"}
                >
                  <Star className={`w-4 h-4 ${character.favorite ? "fill-current" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">레벨</span>
                  <Badge className="status-medium">Lv. {character.level}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">직업</span>
                  <span className="text-gray-900">{character.profession}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">은동전</span>
                  <span className="text-yellow-600 font-medium">{character.silverCoins.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">마족공물</span>
                  <span className="text-red-600 font-medium">{character.demonTribute.toLocaleString()}</span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="flex-1 form-button-primary">
                    활성화
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => deleteCharacter(character.id)}
                    className="form-button-secondary text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
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
