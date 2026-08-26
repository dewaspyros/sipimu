import { useState, useEffect, createContext, useContext, createElement, type ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  clearAttempts,
  formatRemaining,
  getLockStatus,
  registerFailedAttempt,
} from '@/lib/loginThrottle';


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

/** Durasi maksimal satu sesi login: 12 jam. */
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const SESSION_START_KEY = 'sipimu_session_start';

const readSessionStart = (): number | null => {
  try {
    const raw = localStorage.getItem(SESSION_START_KEY);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
};

const writeSessionStart = (value: number) => {
  try {
    localStorage.setItem(SESSION_START_KEY, String(value));
  } catch {
    /* abaikan */
  }
};

const clearSessionStart = () => {
  try {
    localStorage.removeItem(SESSION_START_KEY);
  } catch {
    /* abaikan */
  }
};

/** true bila sesi sudah melewati batas 12 jam. */
const isSessionExpired = () => {
  const start = readSessionStart();
  if (!start) return false;
  return Date.now() - start > SESSION_MAX_AGE_MS;
};


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

    const expireSession = async () => {
      clearSessionStart();
      await signOutLocally();
      if (!isMounted) return;
      clearAuthState();
      toast({
        title: 'Sesi berakhir',
        description: 'Sesi login sudah lebih dari 12 jam. Silakan login kembali.',
      });
    };

    const applySession = async (nextSession: Session | null) => {
      if (!isMounted) return;

      if (!nextSession?.user) {
        clearAuthState();
        return;
      }

      // Batas 12 jam per sesi login.
      if (isSessionExpired()) {
        await expireSession();
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

      if (!readSessionStart()) {
        writeSessionStart(Date.now());
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

    const checkExpiry = () => {
      if (isSessionExpired()) {
        void expireSession();
      }
    };

    const intervalId = window.setInterval(checkExpiry, 60 * 1000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkExpiry();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);


  const signIn = async (nik: string, password: string) => {
    // Tolak lebih awal bila masih dalam masa kunci 5 menit.
    const lock = getLockStatus(nik);
    if (lock.locked) {
      return {
        error: new Error(
          `Terlalu banyak percobaan login. Coba lagi dalam ${formatRemaining(lock.remainingMs)}.`,
        ),
      };
    }

    setLoading(true);

    try {
      const email = toHospitalEmail(nik);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setLoading(false);
        const status = registerFailedAttempt(nik);
        if (status.locked) {
          return {
            error: new Error(
              `Terlalu banyak percobaan login. Coba lagi dalam ${formatRemaining(status.remainingMs)}.`,
            ),
          };
        }
        return {
          error: new Error(`NIK atau password salah. Percobaan tersisa: ${status.attemptsLeft}`),
        };
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

      clearAttempts(nik);
      writeSessionStart(Date.now());
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
  return createElement(AuthContext.Provider, { value: auth }, children);
};

export const useAuth = useAuthValue;
export const useAuthContext = useAuthValue;
