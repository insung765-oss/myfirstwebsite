"use client";

import Link from "next/link";
import { PlusCircle, Music, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-10">
      <Link href="/" className="flex items-center gap-2">
        <Music className="text-indigo-600" />
        <h1 className="font-bold text-lg text-gray-800 tracking-tight">
          RateMyPlaylist
        </h1>
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm font-bold text-gray-600">
              안녕, {user.name}!
            </span>
            <Link href="/write">
              <button className="bg-gray-900 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-gray-800 transition">
                <PlusCircle size={14} />
                추천
              </button>
            </Link>
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <LogOut size={20} />
            </button>
          </>
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