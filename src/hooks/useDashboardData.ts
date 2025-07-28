import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRekapData } from '@/hooks/useRekapData';

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
  const { data: rekapData, fetchDataByMonth, filterDataByPathway, getTargetLOS } = useRekapData();

  // Load current month data for real-time statistics
  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    fetchDataByMonth(currentMonth);
  }, [fetchDataByMonth]);

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
    // If "all" is selected, calculate overall compliance from all data
    if (type === "all") {
      const totalPatients = rekapData.length;
      if (totalPatients === 0) {
        return {
          pathwayCompliance: 0,
          losCompliance: 0,
          therapyCompliance: 0,
          supportCompliance: 0,
          totalPatients: 0,
          avgLOS: 0
        };
      }
      
      const sesuaiTarget = rekapData.filter(item => item.sesuaiTarget).length;
      const kepatuhanCP = rekapData.filter(item => item.kepatuhanCP).length;
      const kepatuhanTerapi = rekapData.filter(item => item.kepatuhanTerapi).length;
      const kepatuhanPenunjang = rekapData.filter(item => item.kepatuhanPenunjang).length;
      const totalLOS = rekapData.reduce((acc, item) => acc + (item.los || 0), 0);
      
      return {
        pathwayCompliance: (kepatuhanCP / totalPatients) * 100,
        losCompliance: (sesuaiTarget / totalPatients) * 100,
        therapyCompliance: (kepatuhanTerapi / totalPatients) * 100,
        supportCompliance: (kepatuhanPenunjang / totalPatients) * 100,
        totalPatients,
        avgLOS: totalLOS / totalPatients
      };
    }
    
    // Filter data by pathway type
    const pathwayMap: {[key: string]: string} = {
      "Sectio Caesaria": "sectio_caesaria",
      "Stroke Hemoragik": "stroke_hemoragik", 
      "Stroke Non Hemoragik": "stroke_non_hemoragik",
      "Pneumonia": "pneumonia",
      "Dengue Fever": "dengue_fever"
    };
    
    const targetType = pathwayMap[type] || type;
    const filteredData = rekapData.filter(item => item.diagnosis === targetType);
    const totalPatients = filteredData.length;
    
    if (totalPatients === 0) {
      // Fallback to original data if no rekap data available
      const pathway = pathwayCompliance.find(p => p.jenis_clinical_pathway === type);
      const los = losCompliance.find(l => l.jenis_clinical_pathway === type);
      const therapy = therapyCompliance.find(t => t.jenis_clinical_pathway === type);
      const support = supportCompliance.find(s => s.jenis_clinical_pathway === type);
      
      return {
        pathwayCompliance: pathway?.compliance_percentage || 0,
        losCompliance: pathway?.compliance_percentage || 0,
        therapyCompliance: therapy?.compliance_percentage || 0,
        supportCompliance: support?.compliance_percentage || 0,
        avgLOS: los?.avg_los || 0,
        totalPatients: pathway?.total_pasien || 0
      };
    }
    
    const sesuaiTarget = filteredData.filter(item => item.sesuaiTarget).length;
    const kepatuhanCP = filteredData.filter(item => item.kepatuhanCP).length;
    const kepatuhanTerapi = filteredData.filter(item => item.kepatuhanTerapi).length;
    const kepatuhanPenunjang = filteredData.filter(item => item.kepatuhanPenunjang).length;
    const totalLOS = filteredData.reduce((acc, item) => acc + (item.los || 0), 0);
    
    return {
      pathwayCompliance: (kepatuhanCP / totalPatients) * 100,
      losCompliance: (sesuaiTarget / totalPatients) * 100,
      therapyCompliance: (kepatuhanTerapi / totalPatients) * 100,
      supportCompliance: (kepatuhanPenunjang / totalPatients) * 100,
      totalPatients,
      avgLOS: totalLOS / totalPatients
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

  // Get component compliance data for charts (integrated with type filtering)
  const getComponentComplianceData = (type: string) => {
    if (!monthlyStats.length) return [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // For now, return general data - could be enhanced to filter by type across months
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