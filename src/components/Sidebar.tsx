'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Disc, Users, Home, LogIn, LogOut, User } from "lucide-react";
import { SpotifyLogoIcon } from "@/components/icons/SpotifyLogoIcon";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isLoggedIn } = useAuth();

  const closeMenu = () => setIsOpen(false);

  const handleLinkClick = () => {
    closeMenu();
  };

  const spotifyPlaylistUrl = 'https://open.spotify.com/playlist/2SnuoTKWO0YOoGqU53uvV4';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition text-gray-800"
        aria-label="메뉴 열기"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px] transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-black text-xl text-gray-800 tracking-tight">
            모모22
          </h2>
          <button onClick={closeMenu} className="text-gray-400 hover:text-gray-800 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 bg-gray-50">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold">반가워요!</p>
                <p className="text-sm font-bold text-gray-900">{user.name}님</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-3">로그인하고 더 많은 기능을 즐겨보세요</p>
              <Link
                href="/login"
                onClick={handleLinkClick}
                className="block w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
              >
                로그인 / 가입
              </Link>
            </div>
          )}
        </div>

        <nav className="p-4 space-y-1">
          <Link
            href="/"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
              pathname === "/" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home size={20} />
            홈
          </Link>

          <Link
            href="/digging"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
              pathname.startsWith("/digging") || pathname.startsWith("/post") 
                ? "bg-indigo-50 text-indigo-600" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Disc size={20} />
            디깅
          </Link>

          <Link
            href="/community"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
              pathname.startsWith("/community") 
                ? "bg-indigo-50 text-indigo-600" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Users size={20} />
            커뮤니티
          </Link>
          
          {/* 구분선 */}
          <div className="pt-2 pb-1">
            <hr className="border-gray-100" />
          </div>

          {/* 스포티파이 바로가기 */}
          <a
            href={spotifyPlaylistUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="flex items-start gap-3 px-4 pt-3 pb-2 rounded-xl transition font-medium text-gray-500 hover:bg-green-50 hover:text-green-700 group"
          >
            <SpotifyLogoIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400 group-hover:text-green-600 transition-colors" />
            <span className="text-sm leading-snug font-medium">플레이리스트</span>
          </a>
          <p className="px-4 text-xs text-gray-400 -mt-1">
            디깅 탭의 추천곡들을 스포티파이에서 편하게 들어보세요.
          </p>
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-100">
        {isLoggedIn && (
            <button
              onClick={() => {
                logout();
                closeMenu();
              }}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition font-medium text-sm"
            >
              <LogOut size={20} />
              로그아웃
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
