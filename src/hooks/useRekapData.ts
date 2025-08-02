import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

  const fetchDataByMonth = async (month: number, year: number = new Date().getFullYear()) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch pathways and their checklist data + compliance overrides
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
          clinical_pathway_checklist (
            id,
            item_text,
            checklist_hari_1,
            checklist_hari_2,
            checklist_hari_3,
            checklist_hari_4,
            checklist_hari_5,
            checklist_hari_6
          ),
          compliance_overrides (
            los_hari,
            sesuai_target,
            kepatuhan_cp,
            kepatuhan_penunjang,
            kepatuhan_terapi
          )
        `)
        .gte('tanggal_masuk', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lt('tanggal_masuk', `${year}-${(month + 1).toString().padStart(2, '0')}-01`)
        .order('tanggal_masuk', { ascending: true });

      if (error) throw error;

      // Transform data to match RekapDataItem interface
      const transformedData: RekapDataItem[] = await Promise.all(
        pathways?.map(async (pathway, index) => {
          // Get target LOS for the diagnosis
          const targetLOS = getTargetLOS(pathway.jenis_clinical_pathway);
          
          // Use override data if available, otherwise calculate
          const override = pathway.compliance_overrides?.[0];
          let isSesuaiTarget, kepatuhanCP, kepatuhanPenunjang, kepatuhanTerapi, los;
          
          if (override) {
            // Use manually set compliance data
            isSesuaiTarget = override.sesuai_target;
            kepatuhanCP = override.kepatuhan_cp;
            kepatuhanPenunjang = override.kepatuhan_penunjang;
            kepatuhanTerapi = override.kepatuhan_terapi;
            los = override.los_hari || pathway.los_hari;
          } else {
            // Calculate compliance based on checklist data and LOS
            los = pathway.los_hari;
            isSesuaiTarget = pathway.los_hari ? pathway.los_hari <= targetLOS : false;
            const compliance = calculateComplianceFromChecklist(pathway.clinical_pathway_checklist || []);
            kepatuhanCP = compliance.kepatuhanCP;
            kepatuhanPenunjang = compliance.kepatuhanPenunjang;
            kepatuhanTerapi = compliance.kepatuhanTerapi;
          }
          
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
        }) || []
      );

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

  // Calculate compliance based on checklist data
  const calculateComplianceFromChecklist = (checklistItems: any[]) => {
    if (!checklistItems || checklistItems.length === 0) {
      return {
        kepatuhanCP: false,
        kepatuhanPenunjang: false,
        kepatuhanTerapi: false
      };
    }

    // Group checklist items by type based on their text content
    const terapiItems = checklistItems.filter(item => 
      item.item_text.toLowerCase().includes('terapi') || 
      item.item_text.toLowerCase().includes('obat') ||
      item.item_text.toLowerCase().includes('medikasi')
    );
    
    const penunjangItems = checklistItems.filter(item => 
      item.item_text.toLowerCase().includes('laboratorium') || 
      item.item_text.toLowerCase().includes('radiologi') ||
      item.item_text.toLowerCase().includes('pemeriksaan penunjang') ||
      item.item_text.toLowerCase().includes('rontgen') ||
      item.item_text.toLowerCase().includes('ct scan')
    );

    // CP compliance: overall compliance based on all items
    const totalItems = checklistItems.length;
    const completedItems = checklistItems.filter(item => 
      item.checklist_hari_1 || item.checklist_hari_2 || item.checklist_hari_3 || 
      item.checklist_hari_4 || item.checklist_hari_5 || item.checklist_hari_6
    ).length;
    
    const kepatuhanCP = totalItems > 0 ? (completedItems / totalItems) >= 0.75 : false;
    
    // Therapy compliance: at least 75% of therapy items completed
    const completedTerapiItems = terapiItems.filter(item => 
      item.checklist_hari_1 || item.checklist_hari_2 || item.checklist_hari_3 || 
      item.checklist_hari_4 || item.checklist_hari_5 || item.checklist_hari_6
    ).length;
    const kepatuhanTerapi = terapiItems.length > 0 ? (completedTerapiItems / terapiItems.length) >= 0.75 : true;
    
    // Support compliance: at least 75% of support items completed
    const completedPenunjangItems = penunjangItems.filter(item => 
      item.checklist_hari_1 || item.checklist_hari_2 || item.checklist_hari_3 || 
      item.checklist_hari_4 || item.checklist_hari_5 || item.checklist_hari_6
    ).length;
    const kepatuhanPenunjang = penunjangItems.length > 0 ? (completedPenunjangItems / penunjangItems.length) >= 0.75 : true;

    return {
      kepatuhanCP,
      kepatuhanPenunjang,
      kepatuhanTerapi
    };
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

      // Also update or create compliance override if LOS changed
      if (updates.los !== undefined) {
        const patient = data.find(p => p.id === patientId);
        if (patient) {
          const newSesuaiTarget = updates.los <= getTargetLOS(patient.diagnosis);
          
          const overrideData = {
            patient_id: patientId,
            los_hari: updates.los,
            sesuai_target: newSesuaiTarget,
            kepatuhan_cp: patient.kepatuhanCP,
            kepatuhan_penunjang: patient.kepatuhanPenunjang,
            kepatuhan_terapi: patient.kepatuhanTerapi
          };

          await supabase
            .from('compliance_overrides')
            .upsert(overrideData, {
              onConflict: 'patient_id'
            });
        }
      }

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

  // Function to save compliance updates (for checkbox changes) - now with persistent storage
  const updateComplianceData = async (patientId: string, field: string, value: boolean) => {
    try {
      // Update local state immediately for better UX
      setData(prev => prev.map(item => 
        item.id === patientId 
          ? { ...item, [field]: value }
          : item
      ));

      // Save to database for persistent storage
      const currentPatient = data.find(item => item.id === patientId);
      if (!currentPatient) return;

      // Prepare the override data
      const overrideData = {
        patient_id: patientId,
        los_hari: currentPatient.los,
        sesuai_target: field === 'sesuaiTarget' ? value : currentPatient.sesuaiTarget,
        kepatuhan_cp: field === 'kepatuhanCP' ? value : currentPatient.kepatuhanCP,
        kepatuhan_penunjang: field === 'kepatuhanPenunjang' ? value : currentPatient.kepatuhanPenunjang,
        kepatuhan_terapi: field === 'kepatuhanTerapi' ? value : currentPatient.kepatuhanTerapi
      };

      // Use upsert to insert or update the override
      const { error } = await supabase
        .from('compliance_overrides')
        .upsert(overrideData, {
          onConflict: 'patient_id'
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data kepatuhan berhasil disimpan permanen",
      });
    } catch (error) {
      console.error('Error updating compliance data:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data kepatuhan",
        variant: "destructive",
      });
      
      // Rollback local state on error
      setData(prev => prev.map(item => 
        item.id === patientId 
          ? { ...item, [field]: !value }
          : item
      ));
    }
  };

  // Fetch all data for dashboard calculations
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all pathways and their checklist data + compliance overrides
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
          clinical_pathway_checklist (
            id,
            item_text,
            checklist_hari_1,
            checklist_hari_2,
            checklist_hari_3,
            checklist_hari_4,
            checklist_hari_5,
            checklist_hari_6
          ),
          compliance_overrides (
            los_hari,
            sesuai_target,
            kepatuhan_cp,
            kepatuhan_penunjang,
            kepatuhan_terapi
          )
        `)
        .order('tanggal_masuk', { ascending: true });

      if (error) throw error;

      // Transform data to match RekapDataItem interface
      const transformedData: RekapDataItem[] = pathways?.map((pathway, index) => {
        // Get target LOS for the diagnosis
        const targetLOS = getTargetLOS(pathway.jenis_clinical_pathway);
        
        // Use override data if available, otherwise calculate
        const override = pathway.compliance_overrides?.[0];
        let isSesuaiTarget, kepatuhanCP, kepatuhanPenunjang, kepatuhanTerapi, los;
        
        if (override) {
          // Use manually set compliance data
          isSesuaiTarget = override.sesuai_target;
          kepatuhanCP = override.kepatuhan_cp;
          kepatuhanPenunjang = override.kepatuhan_penunjang;
          kepatuhanTerapi = override.kepatuhan_terapi;
          los = override.los_hari || pathway.los_hari;
        } else {
          // Calculate compliance based on checklist data and LOS
          los = pathway.los_hari;
          isSesuaiTarget = pathway.los_hari ? pathway.los_hari <= targetLOS : false;
          const compliance = calculateComplianceFromChecklist(pathway.clinical_pathway_checklist || []);
          kepatuhanCP = compliance.kepatuhanCP;
          kepatuhanPenunjang = compliance.kepatuhanPenunjang;
          kepatuhanTerapi = compliance.kepatuhanTerapi;
        }
        
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