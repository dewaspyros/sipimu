import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsappSettings {
  id?: string;
  api_key: string;
  notification_phones: string[];
  message_template: string;
}

export function useWhatsappSettings() {
  const [settings, setSettings] = useState<WhatsappSettings>({
    api_key: '',
    notification_phones: [''],
    message_template: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
          message_template: data.message_template || ''
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

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    setSettings,
    loading,
    saving,
    saveSettings,
    refetch: fetchSettings
  };
}