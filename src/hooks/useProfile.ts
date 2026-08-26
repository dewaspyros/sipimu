import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/hooks/useAuth';

export interface CurrentProfile {
  full_name: string | null;
  nik: string;
}

/**
 * Profil user yang sedang login (cached). Dipakai untuk menampilkan nama
 * lengkap alih-alih NIK/angka.
 */
export const useProfile = () => {
  const { user } = useAuthContext();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<CurrentProfile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, nik')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as CurrentProfile | null;
    },
  });

/** Inisial dari nama (maks 2 huruf). Angka/simbol diabaikan. */
export const getInitials = (name: string): string => {
  const words = name
    .replace(/[^A-Za-z\s.]/g, ' ')
    .split(/[\s.]+/)
    .filter(Boolean);
  if (words.length === 0) return 'US';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

  const fallback = user?.email?.split('@')[0] ?? 'Pengguna';
  const displayName = query.data?.full_name?.trim() || query.data?.nik || fallback;

  return {
    profile: query.data ?? null,
    displayName,
    initials: getInitials(displayName),
    loading: query.isLoading,
  };
};
