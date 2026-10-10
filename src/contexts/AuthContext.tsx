"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  first_name: string;
  last_name: string;
  street: string;
  apartment: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  role: string;
  requires_2fa: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    };

    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        // Route Protection: Prevent customers from accessing admin routes
        if (data.role !== 'admin' && typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.href = '/products';
          return;
        }

        // Enforce 2FA for admins OR customers who opted in
        if (data.role === 'admin' || data.requires_2fa) {
          const isVerified = typeof window !== 'undefined' ? sessionStorage.getItem('2fa_verified') === 'true' : false;
          // If we are NOT on auth pages and not verified, log them out
          if (!isVerified && typeof window !== 'undefined' && !['/login', '/admin/login', '/register'].includes(window.location.pathname)) {
            await supabase.auth.signOut();
            setProfile(null);
            setUser(null);
            return;
          }
        }
        setProfile(data as Profile);
      }
      setIsLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    sessionStorage.removeItem("2fa_verified");
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
