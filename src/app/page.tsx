import Link from "next/link";
import { Disc, Users, UserPlus, ArrowRight } from "lucide-react";
import { SpotifyLogoIcon } from "@/components/icons/SpotifyLogoIcon"; // 스포티파이 아이콘 임포트

export default function LandingPage() {
  const spotifyPlaylistUrl = 'https://open.spotify.com/playlist/2SnuoTKWO0YOoGqU53uvV4';

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 배경 장식 (은은한 그라데이션) */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-600 rounded-full blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-purple-600 rounded-full blur-[120px] opacity-20"></div>

      {/* 로고 영역 */}
      <div className="text-center mb-12 z-10">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
          모모22
        </h1>
        <p className="text-gray-400">디깅으로 세상을 위대하게</p>
      </div>

      {/* 메뉴 리스트 */}
      <div className="w-full max-w-sm space-y-4 z-10">
        
        <MenuItem 
          href="/digging" 
          icon={<Disc size={24} />} 
          title="Digging" 
          subtitle="노래 추천"
          color="indigo"
        />
        
        <MenuItem 
          href="/community"
          icon={<Users size={24} />}
          title="Community"
          subtitle="자유로운 게시판"
          color="purple"
        />

      </div>

      {/* 하단 링크 */}
      <div className="text-center mt-12 z-10">
        <Link href="/signup" className="text-sm text-gray-400 hover:text-white transition">
        <span className="text-gray">회원가입</span>
        </Link>
        <span className="mx-2 text-gray-600">|</span>
        <Link href="/login" className="text-sm text-gray-400 hover:text-white transition">
            로그인
        </Link>
      </div>

      {/* Spotify 플레이리스트 바로가기 플로팅 버튼 */}
      <a
        href={spotifyPlaylistUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#1DB954] rounded-lg flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300 z-20"
        aria-label="스포티파이 플레이리스트 바로가기"
      >
        <SpotifyLogoIcon className="w-8 h-8" />
      </a>

    </main>
  );
}

// 메뉴 아이템 컴포넌트 분리 (가독성 향상)
function MenuItem({ href, icon, title, subtitle, color }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: 'indigo' | 'purple';
}) {
  const colorClasses = {
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
  };

  return (
    <Link href={href} className="group block">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-xl flex items-center justify-between hover:bg-white/15 transition-all duration-300 shadow-md">
        <div className="flex items-center gap-4">
          <div className={`${colorClasses[color]} p-3 rounded-lg text-white`}>
            {icon}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{title}</h2>
            <p className="text-gray-400 text-sm">{subtitle}</p>
          </div>
        </div>
        <ArrowRight className="text-gray-600 group-hover:text-white transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
