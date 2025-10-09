import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsappGroup {
  id: string;
  name: string;
  subject?: string;
}

export interface WhatsappSettings {
  id?: string;
  api_key: string;
  notification_phones: string[];
  message_template: string;
  group_list?: WhatsappGroup[];
  last_group_update?: string;
}

export function useWhatsappSettings() {
  const [settings, setSettings] = useState<WhatsappSettings>({
    api_key: '',
    notification_phones: [''],
    message_template: '',
    group_list: [],
    last_group_update: undefined
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching WhatsApp settings:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat pengaturan WhatsApp',
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        setSettings({
          id: data.id,
          api_key: data.api_key || '',
          notification_phones: data.notification_phones || [''],
          message_template: data.message_template || '',
          group_list: (data.group_list as unknown as WhatsappGroup[]) || [],
          last_group_update: data.last_group_update || undefined
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat memuat pengaturan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: WhatsappSettings) => {
    try {
      setSaving(true);
      
      // Filter out empty phone numbers
      const filteredPhones = updatedSettings.notification_phones.filter(phone => phone.trim() !== '');
      
      const dataToSave = {
        api_key: updatedSettings.api_key,
        notification_phones: filteredPhones,
        message_template: updatedSettings.message_template
      };

      const { error } = settings.id 
        ? await supabase
            .from('whatsapp_settings')
            .update(dataToSave)
            .eq('id', settings.id)
        : await supabase
            .from('whatsapp_settings')
            .insert(dataToSave);

      if (error) {
        console.error('Error saving WhatsApp settings:', error);
        toast({
          title: 'Error',
          description: 'Gagal menyimpan pengaturan WhatsApp',
          variant: 'destructive'
        });
        return false;
      }

      setSettings({ ...updatedSettings, notification_phones: filteredPhones });
      toast({
        title: 'Berhasil',
        description: 'Pengaturan WhatsApp telah disimpan',
      });
      
      // Refresh settings after save
      await fetchSettings();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan pengaturan',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setFetchingGroups(true);
      
      // First update groups from Fonnte
      const updateResponse = await supabase.functions.invoke('fonnte-update-group');
      
      if (updateResponse.error) {
        console.error('Error updating groups:', updateResponse.error);
        toast({
          title: 'Error',
          description: 'Gagal mengupdate daftar grup dari Fonnte',
          variant: 'destructive'
        });
        return;
      }
      
      // Then fetch the updated group list
      const getResponse = await supabase.functions.invoke('fonnte-get-groups');
      
      if (getResponse.error) {
        console.error('Error fetching groups:', getResponse.error);
        toast({
          title: 'Error',
          description: 'Gagal mengambil daftar grup WhatsApp',
          variant: 'destructive'
        });
        return;
      }
      
      // Refresh settings to get updated group list
      await fetchSettings();
      
      toast({
        title: 'Berhasil',
        description: 'Daftar grup WhatsApp berhasil diperbarui',
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengambil daftar grup',
        variant: 'destructive'
      });
    } finally {
      setFetchingGroups(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    setSettings,
    loading,
    saving,
    fetchingGroups,
    saveSettings,
    fetchGroups,
    refetch: fetchSettings
  };
}