'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, Music, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth(); // isLoggedIn은 user 객체로 대체 가능하므로 제거
  const pathname = usePathname();

  const isCommunity = pathname.startsWith('/community');
  const writeButtonLink = isCommunity ? '/community/write' : '/write';

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-20 h-16">
      <Link href="/" className="flex items-center gap-2 pl-2">
        <Music className="text-indigo-600" />
        <h1 className="font-bold text-lg text-gray-800 tracking-tight">
          모모22
        </h1>
      </Link>

      <div className="flex items-center gap-3">
        {/* 💡 수정: isLoggedIn 대신 user 객체의 존재 여부를 직접 확인 */}
        {user && (
          <span className="text-sm font-bold text-gray-600">
            {/* 이제 user.name 접근은 타입스크립트 관점에서 100% 안전합니다 */}
            안녕, {user.name}!
          </span>
        )}

        <Link href={writeButtonLink}>
          <button className="text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 transition bg-gray-900 hover:bg-gray-800">
            <PlusCircle size={14} />
            글쓰기
          </button>
        </Link>

        {/* 💡 수정: isLoggedIn 대신 user 객체의 존재 여부를 직접 확인 */}
        {user ? (
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-500 transition p-1"
            aria-label="로그아웃"
          >
            <LogOut size={20} />
          </button>
        ) : (
          <Link href="/login">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition">
              <LogIn size={16} />
              로그인
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
