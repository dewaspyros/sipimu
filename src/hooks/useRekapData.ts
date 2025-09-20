import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useComplianceData } from './useComplianceData';

export interface RekapDataItem {
  id: string;
  no: number;
  namaPasien: string;
  noRM: string;
  tanggalMasuk: string;
  jamMasuk: string;
  tanggalKeluar: string | null;
  jamKeluar: string | null;
  diagnosis: string;
  los: number | null;
  sesuaiTarget: boolean;
  kepatuhanCP: boolean;
  kepatuhanPenunjang: boolean;
  kepatuhanTerapi: boolean;
  dpjp: string;
  verifikatorPelaksana: string;
}

export const useRekapData = () => {
  const [data, setData] = useState<RekapDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateComplianceData: updateComplianceInDB, getBulkComplianceData } = useComplianceData();

  const fetchDataByMonth = async (month: number, year: number = new Date().getFullYear()) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch pathways data
      const { data: pathways, error } = await supabase
        .from('clinical_pathways')
        .select(`
          id,
          nama_pasien,
          no_rm,
          tanggal_masuk,
          jam_masuk,
          tanggal_keluar,
          jam_keluar,
          jenis_clinical_pathway,
          los_hari,
          dpjp,
          verifikator_pelaksana,
          bangsal
        `)
        .gte('tanggal_masuk', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lt('tanggal_masuk', `${year}-${(month + 1).toString().padStart(2, '0')}-01`)
        .order('tanggal_masuk', { ascending: true });

      if (error) throw error;

      // Get patient IDs for compliance data lookup
      const patientIds = pathways?.map(p => p.id) || [];
      
      // Fetch compliance data for all patients
      const complianceData = await getBulkComplianceData(patientIds);
      const complianceMap = new Map(complianceData.map(c => [c.patient_id, c]));

      // Transform data to match RekapDataItem interface
      const transformedData: RekapDataItem[] = pathways?.map((pathway, index) => {
        // Get target LOS for the diagnosis
        const targetLOS = getTargetLOS(pathway.jenis_clinical_pathway);
        
        // Get compliance data from new compliance_data table
        const compliance = complianceMap.get(pathway.id);
        
        // Calculate basic compliance values
        const los = pathway.los_hari;
        const isSesuaiTarget = compliance?.sesuai_target ?? (pathway.los_hari ? pathway.los_hari <= targetLOS : false);
        const kepatuhanCP = compliance?.kepatuhan_cp ?? false;
        const kepatuhanPenunjang = compliance?.kepatuhan_penunjang ?? false;
        const kepatuhanTerapi = compliance?.kepatuhan_terapi ?? false;
        
        return {
          id: pathway.id,
          no: index + 1,
          namaPasien: pathway.nama_pasien,
          noRM: pathway.no_rm,
          tanggalMasuk: pathway.tanggal_masuk,
          jamMasuk: pathway.jam_masuk,
          tanggalKeluar: pathway.tanggal_keluar,
          jamKeluar: pathway.jam_keluar,
          diagnosis: pathway.jenis_clinical_pathway,
          los: los,
          sesuaiTarget: isSesuaiTarget,
          kepatuhanCP: kepatuhanCP,
          kepatuhanPenunjang: kepatuhanPenunjang,
          kepatuhanTerapi: kepatuhanTerapi,
          dpjp: pathway.dpjp || '',
          verifikatorPelaksana: pathway.verifikator_pelaksana || '',
        };
      }) || [];

      setData(transformedData);
    } catch (error) {
      console.error('Error fetching rekap data:', error);
      setError('Gagal mengambil data rekap');
      toast({
        title: "Error",
        description: "Gagal mengambil data rekap",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDataByPathway = (pathway: string): RekapDataItem[] => {
    if (pathway === "all") return data;
    
    // Direct mapping since we now use the actual database values as select values
    return data.filter(item => item.diagnosis === pathway);
  };

  const getTargetLOS = (diagnosis: string): number => {
    switch (diagnosis) {
      case "Sectio Caesaria":
        return 2;
      case "Pneumonia":
        return 6;
      case "Stroke Hemoragik":
      case "Stroke Non Hemoragik":
        return 5;
      case "Dengue Fever":
        return 3;
      default:
        return 2;
    }
  };

  const updatePatientData = async (patientId: string, updates: Partial<RekapDataItem>) => {
    try {
      const dbUpdates: any = {};
      
      // Map RekapDataItem fields to database fields
      if (updates.los !== undefined) dbUpdates.los_hari = updates.los;
      if (updates.tanggalKeluar !== undefined) dbUpdates.tanggal_keluar = updates.tanggalKeluar;
      if (updates.jamKeluar !== undefined) dbUpdates.jam_keluar = updates.jamKeluar;

      const { error } = await supabase
        .from('clinical_pathways')
        .update(dbUpdates)
        .eq('id', patientId);

      if (error) throw error;

      // Update local state
      setData(prev => prev.map(item => 
        item.id === patientId 
          ? { 
              ...item, 
              ...updates, 
              sesuaiTarget: updates.los ? updates.los <= getTargetLOS(item.diagnosis) : item.sesuaiTarget 
            }
          : item
      ));

      toast({
        title: "Berhasil",
        description: "Data pasien berhasil diperbarui",
      });
    } catch (error) {
      console.error('Error updating patient data:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data pasien",
        variant: "destructive",
      });
    }
  };

  // Function to save compliance updates using new compliance_data table
  const updateComplianceData = async (patientId: string, field: string, value: boolean) => {
    try {
      // Get current patient data
      const currentPatient = data.find(item => item.id === patientId);
      if (!currentPatient) {
        throw new Error("Patient not found");
      }

      // Prepare the update object based on the field being changed
      const updates: any = {};
      
      switch (field) {
        case 'kepatuhanPenunjang':
          updates.kepatuhan_penunjang = value;
          break;
        case 'kepatuhanTerapi':
          updates.kepatuhan_terapi = value;
          break;
        case 'kepatuhanCP':
          updates.kepatuhan_cp = value;
          break;
        case 'sesuaiTarget':
          updates.sesuai_target = value;
          break;
        default:
          throw new Error(`Unknown field: ${field}`);
      }

      // Update in database using the new compliance_data table
      const success = await updateComplianceInDB(patientId, updates);
      
      if (!success) {
        throw new Error("Failed to update compliance data");
      }

      // Update local state immediately after successful database update
      setData(prev => prev.map(item => 
        item.id === patientId 
          ? { ...item, [field]: value }
          : item
      ));

      console.log(`Successfully updated ${field} to ${value} for patient ${patientId}`);
    } catch (error) {
      console.error('Error updating compliance data:', error);
      throw error; // Re-throw to handle in calling function
    }
  };

  // Fetch all data for dashboard calculations
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all pathways data
      const { data: pathways, error } = await supabase
        .from('clinical_pathways')
        .select(`
          id,
          nama_pasien,
          no_rm,
          tanggal_masuk,
          jam_masuk,
          tanggal_keluar,
          jam_keluar,
          jenis_clinical_pathway,
          los_hari,
          dpjp,
          verifikator_pelaksana,
          bangsal
        `)
        .order('tanggal_masuk', { ascending: true });

      if (error) throw error;

      // Get patient IDs for compliance data lookup
      const patientIds = pathways?.map(p => p.id) || [];
      
      // Fetch compliance data for all patients
      const complianceData = await getBulkComplianceData(patientIds);
      const complianceMap = new Map(complianceData.map(c => [c.patient_id, c]));

      // Transform data to match RekapDataItem interface
      const transformedData: RekapDataItem[] = pathways?.map((pathway, index) => {
        // Get target LOS for the diagnosis
        const targetLOS = getTargetLOS(pathway.jenis_clinical_pathway);
        
        // Get compliance data from new compliance_data table
        const compliance = complianceMap.get(pathway.id);
        
        // Calculate basic compliance values
        const los = pathway.los_hari;
        const isSesuaiTarget = compliance?.sesuai_target ?? (pathway.los_hari ? pathway.los_hari <= targetLOS : false);
        const kepatuhanCP = compliance?.kepatuhan_cp ?? false;
        const kepatuhanPenunjang = compliance?.kepatuhan_penunjang ?? false;
        const kepatuhanTerapi = compliance?.kepatuhan_terapi ?? false;
        
        return {
          id: pathway.id,
          no: index + 1,
          namaPasien: pathway.nama_pasien,
          noRM: pathway.no_rm,
          tanggalMasuk: pathway.tanggal_masuk,
          jamMasuk: pathway.jam_masuk,
          tanggalKeluar: pathway.tanggal_keluar,
          jamKeluar: pathway.jam_keluar,
          diagnosis: pathway.jenis_clinical_pathway,
          los: los,
          sesuaiTarget: isSesuaiTarget,
          kepatuhanCP: kepatuhanCP,
          kepatuhanPenunjang: kepatuhanPenunjang,
          kepatuhanTerapi: kepatuhanTerapi,
          dpjp: pathway.dpjp || '',
          verifikatorPelaksana: pathway.verifikator_pelaksana || '',
        };
      }) || [];

      setData(transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching all rekap data:', error);
      setError('Gagal mengambil data rekap');
      toast({
        title: "Error",
        description: "Gagal mengambil data rekap",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchDataByMonth,
    fetchAllData,
    filterDataByPathway,
    updatePatientData,
    updateComplianceData,
    getTargetLOS,
  };
};