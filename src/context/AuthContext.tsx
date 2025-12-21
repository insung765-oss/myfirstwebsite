"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (name: string, pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // 1. 새로고침 해도 로그인 유지하기 (localStorage 확인)
  useEffect(() => {
    const savedUser = localStorage.getItem("music_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 2. 로그인 함수
  const login = async (name: string, pin: string) => {
    // DB에서 이름과 핀번호가 일치하는 사람 찾기
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("name", name)
      .eq("pin", pin)
      .single();

    if (error || !data) {
      alert("이름이나 비밀번호가 틀렸어! 다시 확인해봐 🤔");
      return false;
    }

    // 로그인 성공!
    const userData = { id: data.id, name: data.name };
    setUser(userData);
    localStorage.setItem("music_user", JSON.stringify(userData)); // 브라우저에 저장
    return true;
  };

  // 3. 로그아웃 함수
  const logout = () => {
    setUser(null);
    localStorage.removeItem("music_user");
    router.push("/");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 편하게 쓰기 위한 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}