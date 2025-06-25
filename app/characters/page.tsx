"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Trash2, Star } from "lucide-react"
import { useCharacter } from "@/contexts/character-context";

interface Character {
  id: string;
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
  const { characters, addCharacter: contextAddCharacter, deleteCharacter: contextDeleteCharacter, toggleCharacterFavorite, setActiveCharacter } = useCharacter();

  const [showAddForm, setShowAddForm] = useState(false)
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    server: "",
    level: "",
    profession: "",
  })

  const handleAddCharacter = () => {
    if (!newCharacter.name || !newCharacter.server) return

    contextAddCharacter({
      name: newCharacter.name,
      server: newCharacter.server,
      level: Number.parseInt(newCharacter.level) || 1,
      profession: newCharacter.profession || "모험가",
      silverCoins: 0,
      demonTribute: 0,
      favorite: false,
    });
    setNewCharacter({ name: "", server: "", level: "", profession: "" })
    setShowAddForm(false)
  }

  const handleDeleteCharacter = (id: string) => {
    contextDeleteCharacter(id);
  }

  const handleToggleFavorite = (id: string) => {
    toggleCharacterFavorite(id);
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
              <Button onClick={handleAddCharacter} className="form-button-primary">
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
                  <div className="flex-1">
                    <CardTitle className="text-gray-900 text-lg">
                      {character.name}
                      {character.favorite && <Star className="w-4 h-4 ml-2 inline text-yellow-400 fill-current" />}
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      {character.server} • Lv.{character.level} • {character.profession}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleToggleFavorite(character.id)}
                    className="text-yellow-500 border-yellow-500 hover:bg-yellow-50"
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteCharacter(character.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">실버 코인</p>
                <p className="font-medium text-gray-900">{character.silverCoins.toLocaleString()}개</p>
              </div>
              <div>
                <p className="text-gray-500">데몬 헌터 공물</p>
                <p className="font-medium text-gray-900">{character.demonTribute.toLocaleString()}개</p>
              </div>
              <div className="col-span-2 mt-2">
                <Button
                  onClick={() => {
                    console.debug(`'활성화' button clicked for character: ${character.name}`);
                    setActiveCharacter(character);
                  }}
                  className="form-button-primary w-full"
                >
                  활성화
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
