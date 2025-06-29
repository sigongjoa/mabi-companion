"use client"

import { useCharacter } from "@/contexts/character-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Sword, Shield, Star, TrendingUp, Users, Target, Zap, Heart, Package, Home, Hourglass } from "lucide-react"
import { CharacterScopedHeader } from "@/components/character-scoped-header"
import { useRouter } from 'next/navigation';
import { Item } from "@/types/page-context";
import { logger } from "@/lib/logger";
import { useEffect } from "react";

export default function HomePage() {
  logger.debug("HomePage 렌더링 시작");
  const router = useRouter();
  const { activeCharacter, allItems, allQuests, isLoadingData, dataLoadError, characters } = useCharacter();

  useEffect(() => {
    logger.debug("Redirecting to /characters page.");
    router.push('/characters');
  }, [router]);

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

  return null; // Return null while redirecting to prevent rendering content
}
