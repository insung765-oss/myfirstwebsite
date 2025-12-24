'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// --- Start: Logic from signup/page.tsx for consistency ---
const PIN_SUFFIX = '__pin';

const createEmailFromName = (name: string) => {
    const encodedName = encodeURIComponent(name);
    // Use a URL-safe Base64 encoding
    const base64Name = btoa(encodedName).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return `${base64Name}@myapp.com`;
};
// --- End: Logic from signup/page.tsx ---

interface AuthUser extends User {
  user_metadata: {
    name?: string;
    [key: string]: any;
  };
}

// --- Start: Add login(name, pin) function to Context Type ---
interface AuthContextType {
  user: { id: string; name: string; email: string } | null;
  session: Session | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (name: string, pin: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
}
// --- End: Add login(name, pin) function to Context Type ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const authUser = session?.user as AuthUser | null;
      const currentUser = authUser ? {
        id: authUser.id,
        name: authUser.user_metadata?.name || '사용자',
        email: authUser.email || ''
      } : null;
      setUser(currentUser);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      const authUser = session?.user as AuthUser | null;
      const currentUser = authUser ? {
        id: authUser.id,
        name: authUser.user_metadata?.name || '사용자',
        email: authUser.email || ''
      } : null;
      setUser(currentUser);
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  // --- Start: Correctly implement login(name, pin) ---
  const login = async (name: string, pin: string) => {
    const email = createEmailFromName(name);
    const securePassword = pin + PIN_SUFFIX;

    const { error } = await supabase.auth.signInWithPassword({ 
        email: email,
        password: securePassword
    });
    
    // onAuthStateChange will handle success, we just return the error if it exists.
    return { error };
  };
  // --- End: Correctly implement login(name, pin) ---

  const logout = async () => {
    await supabase.auth.signOut();
  };
  
  // --- Start: Provide the new login function ---
  const value = {
    session,
    user,
    isLoggedIn: !!user,
    loading,
    login, // Provide the new login function
    logout,
  };
  // --- End: Provide the new login function ---

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
