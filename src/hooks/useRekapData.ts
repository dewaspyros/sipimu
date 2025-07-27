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
          verifikator_pelaksana
        `)
        .gte('tanggal_masuk', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lt('tanggal_masuk', `${year}-${(month + 1).toString().padStart(2, '0')}-01`)
        .order('tanggal_masuk', { ascending: true });

      if (error) throw error;

      // Transform data to match RekapDataItem interface
      const transformedData: RekapDataItem[] = pathways?.map((pathway, index) => {
        // Get target LOS for the diagnosis
        const targetLOS = getTargetLOS(pathway.jenis_clinical_pathway);
        const isSesuaiTarget = pathway.los_hari ? pathway.los_hari <= targetLOS : false;
        
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
          los: pathway.los_hari,
          sesuaiTarget: isSesuaiTarget,
          // For now, set compliance values to true as placeholder
          // These should ideally come from checklist data
          kepatuhanCP: true,
          kepatuhanPenunjang: true,
          kepatuhanTerapi: true,
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
    
    const pathwayMap: {[key: string]: string} = {
      "sectio-caesaria": "sectio_caesaria",
      "stroke-hemoragik": "stroke_hemoragik", 
      "stroke-non-hemoragik": "stroke_non_hemoragik",
      "pneumonia": "pneumonia",
      "dengue-fever": "dengue_fever"
    };
    
    const targetPathway = pathwayMap[pathway];
    return data.filter(item => item.diagnosis === targetPathway);
  };

  const getTargetLOS = (diagnosis: string): number => {
    switch (diagnosis) {
      case "sectio_caesaria":
        return 2;
      case "pneumonia":
        return 6;
      case "stroke_hemoragik":
      case "stroke_non_hemoragik":
        return 5;
      case "dengue_fever":
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
          ? { ...item, ...updates, sesuaiTarget: updates.los ? updates.los <= getTargetLOS(item.diagnosis) : item.sesuaiTarget }
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

  return {
    data,
    loading,
    error,
    fetchDataByMonth,
    filterDataByPathway,
    updatePatientData,
    getTargetLOS,
  };
};