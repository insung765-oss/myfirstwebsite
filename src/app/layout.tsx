import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { paperlogy } from "./fonts"; // paperlogy 폰트 가져오기

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "모모22",
  description: "디깅으로 세상을 위대하게",
  openGraph: {
    title: "디깅으로 세상을 위대하게, 🎵모모22", // 카톡 굵은 글씨 (제목)
    description: "_", // 카톡 작은 글씨 (홍보 문구)
    url: "https://momotwotwo.vercel.app",
    siteName: "momotwotwo",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* paperlogy.className을 직접 적용하여 폰트를 확실하게 변경합니다. */}
      <body className={`${paperlogy.className} bg-gray-800`}>
        <AuthProvider>
          <Sidebar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
