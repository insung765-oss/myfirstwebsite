import Link from "next/link";
import { Disc, Users, UserPlus, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 배경 장식 (은은한 그라데이션) */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-30"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-30"></div>

      {/* 로고 영역 */}
      <div className="text-center mb-12 z-10">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
          RateMyPlaylist
        </h1>
        <p className="text-gray-400 text-sm">우리들의 음악 취향 보관소</p>
      </div>

      {/* 메뉴 리스트 */}
      <div className="w-full max-w-sm space-y-4 z-10">
        
        {/* 1. 디깅 (기존 기능) */}
        <Link href="/digging" className="group block">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center justify-between hover:bg-white/20 transition duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500 p-3 rounded-xl text-white">
                <Disc size={24} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Digging</h2>
                <p className="text-gray-400 text-xs">친구들의 추천 음악 탐색</p>
              </div>
            </div>
            <ArrowRight className="text-gray-500 group-hover:text-white transition" />
          </div>
        </Link>

        {/* 2. 커뮤니티 (새 기능) */}
        <Link href="/community" className="group block">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center justify-between hover:bg-white/20 transition duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 p-3 rounded-xl text-white">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Community</h2>
                <p className="text-gray-400 text-xs">자유로운 음악 이야기</p>
              </div>
            </div>
            <ArrowRight className="text-gray-500 group-hover:text-white transition" />
          </div>
        </Link>

      </div>

      {/* 3. 회원가입 (하단 고정 느낌) */}
      <div className="mt-12 z-10">
        <Link href="/signup" className="flex items-center gap-2 text-gray-500 hover:text-white transition text-sm font-medium">
          <UserPlus size={16} />
          아직 계정이 없으신가요? <span className="underline decoration-indigo-500 underline-offset-4 text-gray-300">회원가입</span>
        </Link>
      </div>
      
       {/* 이미 계정이 있다면? */}
       <div className="mt-4 z-10">
        <Link href="/login" className="text-xs text-gray-600 hover:text-gray-400 transition">
          이미 계정이 있어요 (로그인)
        </Link>
      </div>

    </main>
  );
}