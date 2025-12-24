'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  // --- ㄴ버전의 상태 및 로직 ---
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 유효성 검사
    if (!name.trim() || !pin.trim()){
        setError("닉네임과 비밀번호를 모두 입력해주세요.");
        setLoading(false);
        return;
    }

    try {
      const { error: loginError } = await login(name, pin);

      if (loginError) {
        setError(loginError);
        return;
      }

      router.push('/');
      router.refresh();

    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.message || '로그인 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">로그인 🔐</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading} 
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
             {/* 로딩 아이콘 (ㄴ버전 기능) */}
            {loading ? <Loader2 className="animate-spin" /> : "로그인"}
          </button>
        </form>
        
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