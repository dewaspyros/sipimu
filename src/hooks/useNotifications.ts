import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export type ActivityAction = 'create_pathway' | 'update_pathway' | 'save_checklist';

export interface ActivityNotification {
  id: string;
  actor_id: string;
  actor_name: string;
  action_type: string;
  pathway_id: string | null;
  nama_pasien: string | null;
  no_rm: string | null;
  jenis_clinical_pathway: string | null;
  created_at: string;
}

export const ACTION_LABELS: Record<string, string> = {
  create_pathway: 'menambahkan pasien Clinical Pathway',
  update_pathway: 'memperbarui data Clinical Pathway',
  save_checklist: 'menyimpan checklist Clinical Pathway',
};

const NOTIF_LIMIT = 5;

export const formatRelativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const useNotifications = () => {
  const { user } = useAuthContext();
  const { displayName } = useProfile();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['activity-notifications'],
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    queryFn: async (): Promise<ActivityNotification[]> => {
      const { data, error } = await supabase
        .from('activity_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(NOTIF_LIMIT);

      if (error) throw error;
      return (data ?? []) as ActivityNotification[];
    },
  });

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('activity-notifications-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_notifications' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activity-notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const logActivity = useCallback(
    async (payload: {
      action: ActivityAction;
      pathwayId?: string | null;
      namaPasien?: string | null;
      noRM?: string | null;
      jenisClinicalPathway?: string | null;
    }) => {
      if (!user?.id) return;

      try {
        const { error } = await supabase.from('activity_notifications').insert({
          actor_id: user.id,
          actor_name: displayName,
          action_type: payload.action,
          pathway_id: payload.pathwayId ?? null,
          nama_pasien: payload.namaPasien ?? null,
          no_rm: payload.noRM ?? null,
          jenis_clinical_pathway: payload.jenisClinicalPathway ?? null,
        });
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['activity-notifications'] });
      } catch {
        // Pencatatan notifikasi tidak boleh menggagalkan penyimpanan data pasien.
      }
    },
    [user?.id, displayName, queryClient]
  );

  return {
    notifications: query.data ?? [],
    loading: query.isLoading,
    logActivity,
  };
};
