import type { Metadata } from "next"
import { Noto_Sans, Plus_Jakarta_Sans, Spline_Sans } from "next/font/google"
import "./globals.css"
// import dynamic from "next/dynamic";
import { headers } from "next/headers";

// const ClientProviders = dynamic(() => import("./ClientProviders"), {
//   ssr: false, // 클라이언트 전용으로 완전히 분리
// });
import ClientProviders from "./ClientProviders"

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "마비노기 모바일 - 통합 관리 시스템",
  description: "캐릭터별 관리와 즐겨찾기 기능이 있는 마비노기 모바일 게임 관리 도구",
  keywords: "마비노기, 모바일, 게임관리, 캐릭터관리, 아이템관리",
  authors: [{ name: "Mabinogi Management System" }],
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3b82f6",
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
      <body className={`${plusJakartaSans.variable} ${notoSans.variable}`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
