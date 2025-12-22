'use client';

import Link from "next/link";
import { Disc, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SpotifyLogoIcon } from "@/components/icons/SpotifyLogoIcon";
import { motion, Variants } from 'framer-motion';

export default function LandingPage() {
  const spotifyPlaylistUrl = 'https://open.spotify.com/playlist/2SnuoTKWO0YOoGqU53uvV4';
  const { isLoggedIn, logout } = useAuth();

  const sectionVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      transition: { duration: 0.8, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="bg-gray-800 relative">
      {/* --- 통합 배경 장식 --- */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute top-[5vh] left-[-15vw] w-[40vw] h-[40vw] bg-indigo-600 rounded-full blur-[150px] opacity-15"></div>
        <div className="absolute top-[140vh] left-[-10vw] w-[45vw] h-[45vw] bg-indigo-600 rounded-full blur-[160px] opacity-20"></div>
      </div>

      {/* --- 섹션 1: 메인 콘텐츠 --- */}
      <main className="relative z-10">
        <div className="flex flex-col items-center px-6 pt-12">
          
          {/* 로고 영역 */}
          <div className="text-center mb-12">
            <h1 className="text-7xl font-black text-white tracking-tighter mb-2">
              모모22
            </h1>
            <p className="text-2xl font-light text-gray-400">
              디깅으로 세상을 아름답게
            </p>
          </div>

          {/* 메뉴 리스트 */}
          <div className="w-full max-w-sm space-y-4">
            <MenuItem 
              href="/digging" 
              icon={<Disc size={24} />} 
              title="Digging" 
              subtitle="음악 추천"
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
          <div className="text-center mt-12 h-5"> 
            {isLoggedIn ? (
              <button 
                onClick={logout}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                로그아웃
              </button>
            ) : (
              <>
                <Link href="/signup" className="text-sm text-gray-400 hover:text-white transition">회원가입</Link>
                <span className="mx-2 text-gray-600">|</span>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition">로그인</Link>
              </>
            )}
          </div>

          {/* Spotify 플로팅 버튼 */}
          <a
            href={spotifyPlaylistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 w-14 h-14 bg-[#1DB954] rounded-lg flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300 z-20"
            aria-label="스포티파이 플레이리스트 바로가기"
          >
            <SpotifyLogoIcon className="w-8 h-8" />
          </a>
        </div>
      </main>

      {/* --- 섹션 2: Framer Motion으로 애니메이션 효과 적용 --- */}
      <motion.section 
        className="text-white flex flex-col items-center text-left p-8 relative z-10 pt-20 pb-20"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.3 }}
      >
        <div className="max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
                디깅이란.
            </h1>
            <div className="text-lg text-gray-300 leading-relaxed tracking-tighter">
                <p className="mb-2">
                  디깅은 자신의 취향이나 관심사를 넓힐 목적으로 특정 분야에 깊이 파고들어 탐구하고 몰입하는 행위를 뜻한다. 
                  그리고 이러한 활동을 즐기는 사람을 '디깅러'라고 부른다.
                </p>
                <p className="mb-2">
                  우리는 모두가 타고난 디깅러였다. 어린 시절, 온종일 모래를 파헤치며 찾아낸 반짝이던 돌멩이 하나를 지금도 기억한다. 
                  언제부턴가 우리는 더 이상 땅을 파며 놀지 않게 되었고, 어른이 되어가며 눈에 익은 풍경은 회색빛이었다. 
                  디깅은 무뎌지기 전 그때의 나 자신과 마주볼 수 있게 해준다. 
                  운명처럼 찾아온 그 곡에서 잊고 있던 설렘을 발견하는 순간, 무채색 손바닥 위에 다시금 반짝이는 돌멩이 하나가 쥐어져 있을 것이다. 
                </p>
                <p>
                  뛰어난 성취의 작품을 감상하는 건 잔잔한 호수에 돌을 던지는 것과 비슷하다. 
                  무의식이란 수면에 너울을 일으켜 바닥에 가라앉은 이름 모를 정서들을 한번씩 환기한다. 
                  이 메커니즘은 단순한 감상을 넘어 창작을 위한 영감의 불씨가 되어준다. 
                  우리들 중 누군가 세상에 없던 멋진 걸 만들어낼지 누가 아는가. 
                  그래서 우리는 믿어 의심치 않는다. 디깅이 세상을 아름답게 할 수 있다고.
                </p>
            </div>
            <p className="text-sm text-gray-400 mt-4">
                폰트: PAPERLOGY
            </p>
        </div>
      </motion.section>
    </div>
  );
}

// 메뉴 아이템 컴포넌트
function MenuItem({ href, icon, title, subtitle, color }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: 'indigo' | 'purple';
}) {
  const colorClasses = { indigo: "bg-indigo-500", purple: "bg-purple-500" };
  return (
    <Link href={href} className="group block">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-xl flex items-center justify-between hover:bg-white/15 transition-all duration-300 shadow-md">
        <div className="flex items-center gap-4">
          <div className={`${colorClasses[color]} p-3 rounded-lg text-white`}>{icon}</div>
          <div>
            <h2 className="text-white font-bold text-lg">{title}</h2>
            <p className="text-gray-400 text-sm">{subtitle}</p>
          </div>
        </div>
        <ArrowRight className="text-gray-600 group-hover:text-white transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
