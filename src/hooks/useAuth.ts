import { useState, useEffect, createContext, useContext } from 'react';
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

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (nik: string, password: string) => {
    try {
      // Use consistent email format with signUp
      const email = `${nik}@hospital.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Check if it's an invalid credentials error
        if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
          return { error: new Error('NIK atau password salah') };
        }
        return { error: new Error('NIK atau password salah') };
      }

      // Check if user is approved
      if (data.user) {
        const { data: isApproved, error: approvalError } = await supabase.rpc('is_user_approved', {
          _user_id: data.user.id
        });

        if (approvalError) {
          console.error('Error checking approval status:', approvalError);
          await supabase.auth.signOut();
          return { error: new Error('Gagal memeriksa status persetujuan') };
        }

        if (!isApproved) {
          // Sign out the user immediately
          await supabase.auth.signOut();
          return { error: new Error('Akun Anda belum disetujui oleh admin. Silakan tunggu persetujuan.') };
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (nik: string, password: string, fullName: string) => {
    try {
      const email = `${nik}@hospital.local`; // Consistent email format
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nik,
            full_name: fullName
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          return { error: new Error('NIK sudah terdaftar') };
        }
        if (error.message.includes('Password should be at least')) {
          return { error: new Error('Password minimal 6 karakter') };
        }
        return { error: new Error('Gagal mendaftar akun') };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Gagal logout",
        variant: "destructive"
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
    resetPassword
  };
};

export const AuthProvider = AuthContext.Provider;
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};