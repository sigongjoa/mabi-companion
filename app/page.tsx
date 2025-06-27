"use client"

import { useCharacter } from "@/contexts/character-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Sword, Shield, Star, TrendingUp, Users, Target, Zap, Heart } from "lucide-react"

export default function HomePage() {
  const { activeCharacter, characters } = useCharacter()

  // Helper functions to safely calculate quest counts
  const getDailyQuestCount = (character: any) => {
    if (!character?.completedDailyTasks) return 0
    return Object.keys(character.completedDailyTasks).length
  }

  const getWeeklyQuestCount = (character: any) => {
    if (!character?.completedWeeklyTasks) return 0
    return Object.keys(character.completedWeeklyTasks).length
  }

  const getTotalDailyQuests = () => 10 // Assuming 10 daily quests available
  const getTotalWeeklyQuests = () => 5 // Assuming 5 weekly quests available

  if (!activeCharacter) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Mabi Companion</h1>
          <p className="text-muted-foreground mb-6">Create or select a character to get started</p>
          <Button>Create Character</Button>
        </div>
      </div>
    )
  }

  const dailyProgress = (getDailyQuestCount(activeCharacter) / getTotalDailyQuests()) * 100
  const weeklyProgress = (getWeeklyQuestCount(activeCharacter) / getTotalWeeklyQuests()) * 100

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {activeCharacter.name}!</h1>
          <p className="text-muted-foreground">
            Level {activeCharacter.level || 1} • {activeCharacter.class || "Adventurer"}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Clock className="w-4 h-4 mr-1" />
          Last active: Today
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Quests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getDailyQuestCount(activeCharacter)}/{getTotalDailyQuests()}
            </div>
            <Progress value={dailyProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{Math.round(dailyProgress)}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Quests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getWeeklyQuestCount(activeCharacter)}/{getTotalWeeklyQuests()}
            </div>
            <Progress value={weeklyProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{Math.round(weeklyProgress)}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combat Power</CardTitle>
            <Sword className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCharacter.combatPower || "1,234"}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guild Rank</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCharacter.guildRank || "Member"}</div>
            <p className="text-xs text-muted-foreground">{activeCharacter.guildName || "No Guild"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump to your most used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Zap className="h-6 w-6 mb-2" />
              <span className="text-sm">Skills</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Shield className="h-6 w-6 mb-2" />
              <span className="text-sm">Equipment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Star className="h-6 w-6 mb-2" />
              <span className="text-sm">Quests</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Heart className="h-6 w-6 mb-2" />
              <span className="text-sm">Favorites</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Completed Daily Quest</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Leveled up to {activeCharacter.level || 1}</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Obtained new equipment</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Don't miss these limited-time events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Weekend EXP Boost</p>
                <p className="text-xs text-muted-foreground">Double experience points</p>
              </div>
              <Badge>2 days left</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Guild War Tournament</p>
                <p className="text-xs text-muted-foreground">Compete for rewards</p>
              </div>
              <Badge variant="outline">5 days left</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
