"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from 'next/navigation';
import { Inter } from "next/font/google"
import { CharacterProvider } from "@/contexts/character-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"
import { NotificationProvider } from "@/contexts/notification-context"
import { AuthProvider } from "@/contexts/AuthContext"
import supabase from "@/lib/supabase";

const inter = Inter({ subsets: ["latin"], display: "swap", preload: true })

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  console.debug(`Entering ClientProviders`);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // 클라이언트에서만 실행: 마운트 한 번 완료 후에 mounted를 true로 설정
    useEffect(() => {
      setMounted(true);

      // URL에서 오류 파라미터 확인 및 로깅
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        const errorDescriptionParam = urlParams.get('error_description');

        if (errorParam || errorDescriptionParam) {
          logger.error('URL Error Parameters:', {
            error: errorParam,
            error_description: errorDescriptionParam,
          });
        }
      }

      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
        logger.info('SIGNED_IN', session);
        router.replace('/'); // 로그인 성공 시 홈으로 리디렉션
      }
      if (event === 'SIGNED_OUT') {
        logger.info('SIGNED_OUT');
        router.replace('/'); // 로그아웃 시 홈으로 리디렉션
      }
        setReady(true);
      });

      return () => {
        listener.subscription.unsubscribe();
      };

    }, [router]);

  if (!ready) {
    return <p>로딩 중…</p>;
  }

  return (
    <AuthProvider>
      <CharacterProvider>
        <FavoritesProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </FavoritesProvider>
      </CharacterProvider>
    </AuthProvider>
  )
}
