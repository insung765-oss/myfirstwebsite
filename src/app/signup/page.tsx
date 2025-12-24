'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from "next/link";
import { Loader2 } from 'lucide-react'; // 로딩 아이콘은 UX를 위해 유지

// --- ㄴ버전의 로직 헬퍼 함수 ---
const PIN_SUFFIX = '__pin';

const createEmailFromName = (name: string) => {
  const encodedName = encodeURIComponent(name);
  const base64Name = btoa(encodedName).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${base64Name}@myapp.com`;
};

export default function SignUpPage() {
  // --- ㄴ버전의 상태 및 로직 ---
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (!pin.match(/^\d{4}$/)) {
      setError('비밀번호는 4자리 숫자로 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const email = createEmailFromName(name);
      const securePassword = pin + PIN_SUFFIX;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: securePassword,
        options: { data: { name: name } },
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          setError("이미 사용중인 닉네임이에요.");
        } else {
          throw signUpError;
        }
        return;
      }

      if (data.user) {
        router.push('/community');
        router.refresh();
      }

    } catch (err: any) {
      console.error('SignUp Error:', err);
      setError(err.message || '예기치 않은 문제로 가입에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // --- ㄱ버전의 UI (Visual & Layout) ---
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">회원가입</h1>
        
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

          {/* ㄴ버전의 기능인 에러 메시지 표시 (UI 스타일은 ㄱ버전에 맞춤) */}
          {error && (
            <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition mt-2 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : "회원가입"}
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