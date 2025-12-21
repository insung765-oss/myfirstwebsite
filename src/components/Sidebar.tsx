"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Disc, Users, Home, LogIn, LogOut, User } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // 페이지 이동 감지용
  const { user, logout } = useAuth();

  // 메뉴 닫기 함수
  const closeMenu = () => setIsOpen(false);

  // 페이지 이동 시 자동으로 메뉴 닫기
  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <>
      {/* 1. 햄버거 버튼 (좌상단 고정) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition text-gray-800"
        aria-label="메뉴 열기"
      >
        <Menu size={24} />
      </button>

      {/* 2. 어두운 배경 (Overlay) - 메뉴 열렸을 때만 보임 */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px] transition-opacity"
        />
      )}

      {/* 3. 사이드바 본체 */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 사이드바 헤더 */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-black text-xl text-gray-800 tracking-tight">
            RMP
          </h2>
          <button onClick={closeMenu} className="text-gray-400 hover:text-gray-800 transition">
            <X size={24} />
          </button>
        </div>

        {/* 유저 정보 영역 */}
        <div className="p-6 bg-gray-50">
          {user ? (
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
              <p className="text-xs text-gray-500 mb-3">더 많은 기능을 사용하려면?</p>
              <Link
                href="/login"
                onClick={handleLinkClick}
                className="block w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
              >
                로그인 하러 가기
              </Link>
            </div>
          )}
        </div>

        {/* 메뉴 리스트 */}
        <nav className="p-4 space-y-2">
          <Link
            href="/"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
              pathname === "/" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home size={20} />
            홈 (대문)
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
            디깅 (음악 추천)
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
        </nav>

        {/* 하단 로그아웃 버튼 (로그인 상태일 때만) */}
        {user && (
          <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-100">
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
          </div>
        )}
      </aside>
    </>
  );
}