import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChecklistSummaryData {
  id: string;
  bulan: number;
  tahun: number;
  jenis_clinical_pathway: string;
  total_checklist_items: number;
  completed_items: number;
  completion_percentage: number;
  total_patients: number;
  data_detail?: any;
  created_at: string;
  updated_at: string;
}

export interface AggregatedChecklistData {
  jenis_clinical_pathway: string;
  total_items: number;
  completed_items: number;
  completion_percentage: number;
  total_patients: number;
}

export const useChecklistSummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getChecklistSummaryByMonth = async (month: number, year: number = new Date().getFullYear()): Promise<ChecklistSummaryData[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('checklist_summary')
        .select('*')
        .eq('bulan', month)
        .eq('tahun', year)
        .order('jenis_clinical_pathway');

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error fetching checklist summary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const aggregateChecklistData = async (month: number, year: number = new Date().getFullYear(), pathwayType?: string): Promise<AggregatedChecklistData[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('aggregate_checklist_data', {
        target_month: month,
        target_year: year,
        pathway_type: pathwayType || null
      });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error aggregating checklist data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveChecklistSummary = async (summaryData: Omit<ChecklistSummaryData, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('checklist_summary')
        .upsert(summaryData, {
          onConflict: 'bulan,tahun,jenis_clinical_pathway'
        });

      if (error) throw error;

      return true;
    } catch (err) {
      console.error('Error saving checklist summary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateChecklistSummaryForMonth = async (month: number, year: number = new Date().getFullYear()): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Get aggregated data for all pathways in the month
      const aggregatedData = await aggregateChecklistData(month, year);

      // Save each pathway's summary
      for (const pathway of aggregatedData) {
        await saveChecklistSummary({
          bulan: month,
          tahun: year,
          jenis_clinical_pathway: pathway.jenis_clinical_pathway,
          total_checklist_items: pathway.total_items,
          completed_items: pathway.completed_items,
          completion_percentage: pathway.completion_percentage,
          total_patients: pathway.total_patients
        });
      }

      return true;
    } catch (err) {
      console.error('Error generating checklist summary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getChecklistSummaryByMonth,
    aggregateChecklistData,
    saveChecklistSummary,
    generateChecklistSummaryForMonth
  };
};