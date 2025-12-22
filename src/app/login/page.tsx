"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(name, pin);
    if (success) {
      router.push('/'); // 메인 화면으로 이동
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">로그인 🔐</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">닉네임</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">비밀번호 (4자리 숫자)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              placeholder=""
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest text-center text-lg"
            />
          </div>
          <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">
            로그인
          </button>
        </form>
        
        {/* 회원가입 및 메인으로 돌아가기 링크 */}
        <div className="mt-6 flex justify-center items-center text-sm">
          <Link href="/signup" className="text-gray-500 hover:text-gray-800 underline">
            회원가입
          </Link>
          <span className="mx-2 text-gray-300">|</span>
          <Link href="/" className="text-gray-500 hover:text-gray-800 underline">
            메인으로
          </Link>
        </div>
      </div>
    </main>
  );
}