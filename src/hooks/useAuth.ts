import { useState, useEffect, createContext, useContext, createElement, type ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (nik: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (nik: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toHospitalEmail = (nik: string) => `${nik.trim()}@hospital.local`;

const useProvideAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const clearAuthState = () => {
    setSession(null);
    setUser(null);
    setLoading(false);
  };

  const signOutLocally = async () => {
    await supabase.auth.signOut({ scope: 'local' });
  };

  useEffect(() => {
    let isMounted = true;

    const applySession = async (nextSession: Session | null) => {
      if (!isMounted) return;

      if (!nextSession?.user) {
        clearAuthState();
        return;
      }

      setLoading(true);

      const { data: isApproved, error } = await supabase.rpc('is_user_approved', {
        _user_id: nextSession.user.id,
      });

      if (!isMounted) return;

      if (error || isApproved !== true) {
        await signOutLocally();
        if (!isMounted) return;
        clearAuthState();
        return;
      }

      setSession(nextSession);
      setUser(nextSession.user);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      void applySession(currentSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (nik: string, password: string) => {
    setLoading(true);

    try {
      const email = toHospitalEmail(nik);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setLoading(false);
        return { error: new Error('NIK atau password salah') };
      }

      if (!data.user) {
        await signOutLocally();
        clearAuthState();
        return { error: new Error('Gagal login') };
      }

      const { data: isApproved, error: approvalError } = await supabase.rpc('is_user_approved', {
        _user_id: data.user.id,
      });

      if (approvalError || isApproved !== true) {
        await signOutLocally();
        clearAuthState();
        return {
          error: new Error('Akun Anda belum disetujui oleh admin. Silakan tunggu persetujuan.'),
        };
      }

      setLoading(false);
      return { error: null };
    } catch (error) {
      await signOutLocally();
      clearAuthState();
      return { error: error as Error };
    }
  };

  const signUp = async (nik: string, password: string, fullName: string) => {
    setLoading(true);

    try {
      const email = toHospitalEmail(nik);
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nik,
            full_name: fullName,
          },
        },
      });

      if (error) {
        setLoading(false);
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          return { error: new Error('NIK sudah terdaftar') };
        }
        if (error.message.includes('Password should be at least')) {
          return { error: new Error('Password minimal 6 karakter') };
        }
        return { error: new Error('Gagal mendaftar akun') };
      }

      // Paksa hapus session lokal sesaat setelah signup agar akun baru tidak bisa langsung masuk.
      await signOutLocally();
      clearAuthState();
      return { error: null };
    } catch (error) {
      await signOutLocally();
      clearAuthState();
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await signOutLocally();
      clearAuthState();
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal logout',
        variant: 'destructive',
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};

const useAuthValue = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = useAuthValue;
export const useAuthContext = useAuthValue;
