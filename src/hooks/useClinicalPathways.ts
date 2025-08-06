import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClinicalPathway {
  id: string;
  no_rm: string;
  nama_pasien: string;
  jenis_clinical_pathway: string;
  verifikator_pelaksana: string;
  dpjp: string;
  tanggal_masuk: string;
  jam_masuk: string;
  tanggal_keluar?: string;
  jam_keluar?: string;
  los_hari?: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  clinical_pathway_id: string;
  item_index: number;
  item_text: string;
  checklist_hari_1: boolean;
  checklist_hari_2: boolean;
  checklist_hari_3: boolean;
  checklist_hari_4: boolean;
  checklist_hari_5: boolean;
  checklist_hari_6: boolean;
}

export const useClinicalPathways = () => {
  const [pathways, setPathways] = useState<ClinicalPathway[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPathways = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinical_pathways')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPathways(data || []);
    } catch (error) {
      console.error('Error fetching clinical pathways:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data clinical pathways",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPathway = async (pathwayData: any) => {
    try {
      const { data, error } = await supabase
        .from('clinical_pathways')
        .insert([pathwayData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Data clinical pathway berhasil disimpan"
      });
      
      await fetchPathways();
      return data;
    } catch (error) {
      console.error('Error creating clinical pathway:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data clinical pathway",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePathway = async (id: string, pathwayData: any) => {
    try {
      const { data, error } = await supabase
        .from('clinical_pathways')
        .update(pathwayData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Data clinical pathway berhasil diperbarui"
      });
      
      await fetchPathways();
      return data;
    } catch (error) {
      console.error('Error updating clinical pathway:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data clinical pathway",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deletePathway = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clinical_pathways')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Data clinical pathway berhasil dihapus"
      });
      
      await fetchPathways();
    } catch (error) {
      console.error('Error deleting clinical pathway:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus data clinical pathway",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPathways();
  }, []);

  return {
    pathways,
    loading,
    fetchPathways,
    createPathway,
    updatePathway,
    deletePathway
  };
};

export const useChecklist = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const saveChecklist = async (pathwayId: string, checklistItems: any[]) => {
    try {
      setLoading(true);
      
      // Delete existing checklist items for this pathway
      await supabase
        .from('clinical_pathway_checklist')
        .delete()
        .eq('clinical_pathway_id', pathwayId);

      // Insert new checklist items
      const { error } = await supabase
        .from('clinical_pathway_checklist')
        .insert(checklistItems.map((item, index) => ({
          clinical_pathway_id: pathwayId,
          item_index: index,
          item_text: item.text,
          checklist_hari_1: item.day1 || false,
          checklist_hari_2: item.day2 || false,
          checklist_hari_3: item.day3 || false,
          checklist_hari_4: item.day4 || false,
          checklist_hari_5: item.day5 || false,
          checklist_hari_6: item.day6 || false
        })));

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Checklist berhasil disimpan"
      });
    } catch (error) {
      console.error('Error saving checklist:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan checklist",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getChecklistByPathwayId = async (pathwayId: string) => {
    try {
      const { data, error } = await supabase
        .from('clinical_pathway_checklist')
        .select('*')
        .eq('clinical_pathway_id', pathwayId)
        .order('item_index');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching checklist:', error);
      return [];
    }
  };

  return {
    loading,
    saveChecklist,
    getChecklistByPathwayId
  };
};