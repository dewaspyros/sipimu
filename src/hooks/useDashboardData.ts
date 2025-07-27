import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MonthlyStats {
  bulan: number;
  tahun: number;
  total_pasien_input: number;
  jumlah_sesuai_target: number;
  kepatuhan_cp: number;
  kepatuhan_penunjang: number;
  kepatuhan_terapi: number;
  rata_rata_los: number;
}

export interface PathwayCompliance {
  jenis_clinical_pathway: string;
  total_pasien: number;
  compliance_percentage: number;
}

export interface LOSCompliance {
  jenis_clinical_pathway: string;
  avg_los: number;
  min_los: number;
  max_los: number;
  total_cases: number;
}

export interface TherapyCompliance {
  jenis_clinical_pathway: string;
  total_patients: number;
  compliant_patients: number;
  compliance_percentage: number;
}

export interface SupportCompliance {
  jenis_clinical_pathway: string;
  total_patients: number;
  compliant_patients: number;
  compliance_percentage: number;
}

export interface TotalPatients {
  total_patients: number;
  discharged_patients: number;
  active_patients: number;
}

export const useDashboardData = () => {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [pathwayCompliance, setPathwayCompliance] = useState<PathwayCompliance[]>([]);
  const [losCompliance, setLOSCompliance] = useState<LOSCompliance[]>([]);
  const [therapyCompliance, setTherapyCompliance] = useState<TherapyCompliance[]>([]);
  const [supportCompliance, setSupportCompliance] = useState<SupportCompliance[]>([]);
  const [totalPatients, setTotalPatients] = useState<TotalPatients | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch monthly statistics
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('v_monthly_stats')
        .select('*')
        .order('tahun', { ascending: false })
        .order('bulan', { ascending: false })
        .limit(12);

      if (monthlyError) throw monthlyError;

      // Fetch pathway compliance
      const { data: pathwayData, error: pathwayError } = await supabase
        .from('v_pathway_compliance')
        .select('*');

      if (pathwayError) throw pathwayError;

      // Fetch LOS compliance
      const { data: losData, error: losError } = await supabase
        .from('v_los_compliance')
        .select('*');

      if (losError) throw losError;

      // Fetch therapy compliance
      const { data: therapyData, error: therapyError } = await supabase
        .from('v_therapy_compliance')
        .select('*');

      if (therapyError) throw therapyError;

      // Fetch support compliance
      const { data: supportData, error: supportError } = await supabase
        .from('v_support_compliance')
        .select('*');

      if (supportError) throw supportError;

      // Fetch total patients
      const { data: totalData, error: totalError } = await supabase
        .from('v_total_patients')
        .select('*')
        .single();

      if (totalError) throw totalError;

      setMonthlyStats(monthlyData || []);
      setPathwayCompliance(pathwayData || []);
      setLOSCompliance(losData || []);
      setTherapyCompliance(therapyData || []);
      setSupportCompliance(supportData || []);
      setTotalPatients(totalData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get compliance data by clinical pathway type
  const getComplianceByType = (type: string) => {
    const pathway = pathwayCompliance.find(p => p.jenis_clinical_pathway === type);
    const los = losCompliance.find(l => l.jenis_clinical_pathway === type);
    const therapy = therapyCompliance.find(t => t.jenis_clinical_pathway === type);
    const support = supportCompliance.find(s => s.jenis_clinical_pathway === type);

    console.log('getComplianceByType for:', type, { pathway, los, therapy, support });

    return {
      pathwayCompliance: pathway?.compliance_percentage || 0,
      losCompliance: pathway?.compliance_percentage || 0,
      therapyCompliance: therapy?.compliance_percentage || 0,
      supportCompliance: support?.compliance_percentage || 0,
      avgLOS: los?.avg_los || 0,
      totalPatients: pathway?.total_pasien || 0
    };
  };

  // Transform monthly data for charts
  const getMonthlyChartData = () => {
    if (!monthlyStats.length) return [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return monthlyStats.slice(0, 12).reverse().map(stat => ({
      month: monthNames[stat.bulan - 1],
      losCompliance: Math.round(stat.kepatuhan_cp || 0),
      cpCompliance: Math.round(stat.kepatuhan_cp || 0),
      avgLos: parseFloat((stat.rata_rata_los || 0).toFixed(1))
    }));
  };

  // Get component compliance data for charts
  const getComponentComplianceData = (type: string) => {
    if (!monthlyStats.length) return [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return monthlyStats.slice(0, 12).reverse().map(stat => ({
      month: monthNames[stat.bulan - 1],
      kepatuhanTerapi: Math.round(stat.kepatuhan_terapi || 0),
      kepatuhanPenunjang: Math.round(stat.kepatuhan_penunjang || 0)
    }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    monthlyStats,
    pathwayCompliance,
    losCompliance,
    therapyCompliance,
    supportCompliance,
    totalPatients,
    loading,
    fetchDashboardData,
    getComplianceByType,
    getMonthlyChartData,
    getComponentComplianceData
  };
};