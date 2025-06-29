import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import dynamic from "next/dynamic";
import { headers } from "next/headers";

// const ClientProviders = dynamic(() => import("./ClientProviders"), {
//   ssr: false, // 클라이언트 전용으로 완전히 분리
// });
import ClientProviders from "./ClientProviders"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "마비노기 모바일 - 통합 관리 시스템",
  description: "캐릭터별 관리와 즐겨찾기 기능이 있는 마비노기 모바일 게임 관리 도구",
  keywords: "마비노기, 모바일, 게임관리, 캐릭터관리, 아이템관리",
  authors: [{ name: "Mabinogi Management System" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#3b82f6",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "마비노기 모바일 - 통합 관리 시스템",
    description: "캐릭터별 관리와 즐겨찾기 기능이 있는 마비노기 모바일 게임 관리 도구",
    type: "website",
    locale: "ko_KR",
  },
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const h = await headers();
  const csp = h.get("Content-Security-Policy") || "";

  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="Content-Security-Policy" content={csp} />
      </head>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
