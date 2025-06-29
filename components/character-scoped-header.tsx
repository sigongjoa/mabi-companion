"use client"

import type React from "react"

import { useCharacter } from "@/contexts/character-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, User } from "lucide-react"

interface CharacterScopedHeaderProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export function CharacterScopedHeader({ title, description, icon: Icon }: CharacterScopedHeaderProps) {
  const { activeCharacter, viewMode, characters } = useCharacter()

  return (
    <div className="card">
      <div className="card-content">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <Icon className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">{description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {activeCharacter ? (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-sm bg-blue-600 text-white">
                    {activeCharacter.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">{activeCharacter.name}</span>
                  </div>
                  <div className="text-xs text-blue-600">
                    Lv.{activeCharacter.level} • {activeCharacter.profession}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">전체 캐릭터</div>
                  <div className="text-xs text-green-600">{characters.length}명의 캐릭터</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
