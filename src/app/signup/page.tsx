"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || pin.length !== 4) {
      return alert("이름과 4자리 비밀번호를 정확히 입력해주세요.");
    }

    // DB에 유저 등록
    const { error } = await supabase.from("users").insert({
      name: name,
      pin: pin,
    });

    if (error) {
      // 이미 있는 이름일 경우 (users 테이블 name에 UNIQUE 걸려있음)
      if (error.code === "23505") {
        alert("이미 사용 중인 이름입니다! 다른 이름을 써주세요.");
      } else {
        alert("회원가입 실패 ㅠㅠ 관리자에게 문의하세요.");
        console.error(error);
      }
    } else {
      alert(`환영합니다, ${name}님! 🎉\n이제 로그인해주세요.`);
      router.push("/login"); // 가입 후 로그인 페이지로 이동
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">회원가입 👋</h1>
        <p className="text-center text-gray-400 text-sm mb-8">이름과 비밀번호만 있으면 돼요</p>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">사용할 이름 (닉네임)</label>
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
          <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition mt-2">
            회원가입
          </button>
        </form>

         <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 underline">
            메인으로
          </Link>
        </div>
      </div>
    </main>
  );
}