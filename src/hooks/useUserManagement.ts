import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  nik: string;
  full_name: string | null;
  is_approved: boolean;
  created_at: string;
  role?: string;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    setIsAdmin(data === true);
    return data === true;
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const isAdminUser = await checkAdminStatus();
      
      if (!isAdminUser) {
        setLoading(false);
        return;
      }

      // Fetch all profiles (admin can see all)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: 'Error',
          description: 'Gagal mengambil data pengguna',
          variant: 'destructive'
        });
        return;
      }

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      // Combine profiles with roles
      const usersWithRoles = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || 'user'
        };
      });

      // Separate pending and approved users
      const pending = usersWithRoles.filter(u => !u.is_approved);
      const approved = usersWithRoles.filter(u => u.is_approved);

      setPendingUsers(pending);
      setUsers(approved);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Berhasil',
        description: 'Pengguna telah disetujui'
      });

      // Refresh data
      await fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyetujui pengguna',
        variant: 'destructive'
      });
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      // Delete profile and user role (cascade will handle auth.users)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) {
        throw profileError;
      }

      toast({
        title: 'Berhasil',
        description: 'Pengguna telah ditolak dan dihapus'
      });

      // Refresh data
      await fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: 'Error',
        description: 'Gagal menolak pengguna',
        variant: 'destructive'
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      // Check if user already has a role entry
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      toast({
        title: 'Berhasil',
        description: `Role pengguna telah diubah menjadi ${newRole}`
      });

      // Refresh data
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengubah role pengguna',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    pendingUsers,
    loading,
    isAdmin,
    fetchUsers,
    approveUser,
    rejectUser,
    updateUserRole,
    checkAdminStatus
  };
};
