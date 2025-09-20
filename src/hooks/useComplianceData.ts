import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ComplianceData {
  id: string;
  patient_id: string;
  kepatuhan_penunjang: boolean;
  kepatuhan_terapi: boolean;
  kepatuhan_cp: boolean;
  sesuai_target: boolean;
  created_at: string;
  updated_at: string;
}

export const useComplianceData = () => {
  const [loading, setLoading] = useState(false);

  // Get compliance data for a specific patient
  const getComplianceData = async (patientId: string): Promise<ComplianceData | null> => {
    try {
      const { data, error } = await supabase
        .from('compliance_data')
        .select('*')
        .eq('patient_id', patientId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      return null;
    }
  };

  // Update or create compliance data
  const updateComplianceData = async (
    patientId: string, 
    updates: Partial<Pick<ComplianceData, 'kepatuhan_penunjang' | 'kepatuhan_terapi' | 'kepatuhan_cp' | 'sesuai_target'>>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('compliance_data')
        .upsert({
          patient_id: patientId,
          ...updates
        }, {
          onConflict: 'patient_id'
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data kepatuhan berhasil disimpan",
      });

      return true;
    } catch (error) {
      console.error('Error updating compliance data:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data kepatuhan",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get compliance data for multiple patients
  const getBulkComplianceData = async (patientIds: string[]): Promise<ComplianceData[]> => {
    try {
      const { data, error } = await supabase
        .from('compliance_data')
        .select('*')
        .in('patient_id', patientIds);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bulk compliance data:', error);
      return [];
    }
  };

  // Delete compliance data
  const deleteComplianceData = async (patientId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('compliance_data')
        .delete()
        .eq('patient_id', patientId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting compliance data:', error);
      return false;
    }
  };

  return {
    loading,
    getComplianceData,
    updateComplianceData,
    getBulkComplianceData,
    deleteComplianceData,
  };
};