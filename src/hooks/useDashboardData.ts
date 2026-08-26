import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRekapData, type RekapDataItem } from "@/hooks/useRekapData";

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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const EMPTY_COMPLIANCE = {
  pathwayCompliance: 0,
  losCompliance: 0,
  therapyCompliance: 0,
  supportCompliance: 0,
  totalPatients: 0,
  avgLOS: 0,
};

/** Satu pass agregasi untuk sekumpulan pasien. */
const aggregate = (items: RekapDataItem[]) => {
  const total = items.length;
  if (total === 0) return { ...EMPTY_COMPLIANCE };

  let sesuaiTarget = 0;
  let kepatuhanTerapi = 0;
  let kepatuhanPenunjang = 0;
  let cpSum = 0;
  let totalLOS = 0;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    if (item.sesuaiTarget) sesuaiTarget++;
    if (item.kepatuhanTerapi) kepatuhanTerapi++;
    if (item.kepatuhanPenunjang) kepatuhanPenunjang++;
    const checked =
      (item.sesuaiTarget ? 1 : 0) + (item.kepatuhanPenunjang ? 1 : 0) + (item.kepatuhanTerapi ? 1 : 0);
    cpSum += (checked / 3) * 100;
    totalLOS += item.los || 0;
  }

  return {
    pathwayCompliance: cpSum / total,
    losCompliance: (sesuaiTarget / total) * 100,
    therapyCompliance: (kepatuhanTerapi / total) * 100,
    supportCompliance: (kepatuhanPenunjang / total) * 100,
    totalPatients: total,
    avgLOS: totalLOS / total,
  };
};

/** Filter tanpa membuat array antara berlebih; memakai tahun/bulan yang sudah di-parse. */
const filterItems = (items: RekapDataItem[], type: string, year: string, month?: string) => {
  const yearNum = year !== "all" ? parseInt(year, 10) : null;
  const monthNum = month && month !== "all" ? parseInt(month, 10) : null;
  const byType = type !== "all";

  if (!byType && yearNum === null && monthNum === null) return items;

  return items.filter(
    (item) =>
      (!byType || item.diagnosis === type) &&
      (yearNum === null || item.tahunMasuk === yearNum) &&
      (monthNum === null || item.bulanMasuk === monthNum)
  );
};

/** Group per bulan sekali saja, urut kronologis, ambil 12 bulan terakhir. */
const groupByMonth = (items: RekapDataItem[]) => {
  const buckets = new Map<number, { month: string; sortKey: number; data: RekapDataItem[] }>();

  for (const item of items) {
    const key = item.tahunMasuk * 12 + item.bulanMasuk;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { month: MONTH_NAMES[item.bulanMasuk - 1], sortKey: key, data: [] };
      buckets.set(key, bucket);
    }
    bucket.data.push(item);
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(-12);
};

export const useDashboardData = () => {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [pathwayCompliance, setPathwayCompliance] = useState<PathwayCompliance[]>([]);
  const [losCompliance, setLOSCompliance] = useState<LOSCompliance[]>([]);
  const [therapyCompliance, setTherapyCompliance] = useState<TherapyCompliance[]>([]);
  const [supportCompliance, setSupportCompliance] = useState<SupportCompliance[]>([]);
  const [totalPatients, setTotalPatients] = useState<TotalPatients | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { data: rekapData, fetchAllData } = useRekapData();

  const fetchDashboardData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        supabase
          .from("v_monthly_stats")
          .select("*")
          .order("tahun", { ascending: false })
          .order("bulan", { ascending: false })
          .limit(12),
        supabase.from("v_pathway_compliance").select("*"),
        supabase.from("v_los_compliance").select("*"),
        supabase.from("v_therapy_compliance").select("*"),
        supabase.from("v_support_compliance").select("*"),
        supabase.from("v_total_patients").select("*").single(),
      ]);

      const [monthlyResult, pathwayResult, losResult, therapyResult, supportResult, totalResult] = results;

      setMonthlyStats(monthlyResult.status === "fulfilled" ? monthlyResult.value.data || [] : []);
      setPathwayCompliance(pathwayResult.status === "fulfilled" ? pathwayResult.value.data || [] : []);
      setLOSCompliance(losResult.status === "fulfilled" ? losResult.value.data || [] : []);
      setTherapyCompliance(therapyResult.status === "fulfilled" ? therapyResult.value.data || [] : []);
      setSupportCompliance(supportResult.status === "fulfilled" ? supportResult.value.data || [] : []);
      setTotalPatients(totalResult.status === "fulfilled" ? totalResult.value.data : null);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Info",
        description: "Menggunakan perhitungan data dari rekap data",
        variant: "default",
      });
    }
  }, [toast]);

  useEffect(() => {
    let cancelled = false;

    const initializeDashboard = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchAllData(), fetchDashboardData()]);
      } catch (error) {
        console.error("Dashboard initialization error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void initializeDashboard();
    return () => {
      cancelled = true;
    };
  }, [fetchAllData, fetchDashboardData]);

  const getComplianceByType = useCallback(
    (type: string, month: string = "all", year: string = "all") => {
      const filtered = filterItems(rekapData, type, year, month);

      if (filtered.length === 0 && type !== "all") {
        // Fallback ke view agregat jika tidak ada baris rekap
        const pathway = pathwayCompliance.find((p) => p.jenis_clinical_pathway === type);
        const los = losCompliance.find((l) => l.jenis_clinical_pathway === type);
        const therapy = therapyCompliance.find((t) => t.jenis_clinical_pathway === type);
        const support = supportCompliance.find((s) => s.jenis_clinical_pathway === type);

        return {
          pathwayCompliance: pathway?.compliance_percentage || 0,
          losCompliance: pathway?.compliance_percentage || 0,
          therapyCompliance: therapy?.compliance_percentage || 0,
          supportCompliance: support?.compliance_percentage || 0,
          avgLOS: los?.avg_los || 0,
          totalPatients: pathway?.total_pasien || 0,
        };
      }

      return aggregate(filtered);
    },
    [rekapData, pathwayCompliance, losCompliance, therapyCompliance, supportCompliance]
  );

  const getMonthlyChartData = useCallback(
    (type: string = "all", year: string = "all") => {
      if (!rekapData.length) return [];

      return groupByMonth(filterItems(rekapData, type, year)).map((bucket) => {
        const stats = aggregate(bucket.data);
        return {
          month: bucket.month,
          losCompliance: Math.round(stats.losCompliance),
          cpCompliance: Math.round(stats.pathwayCompliance),
          avgLos: parseFloat(stats.avgLOS.toFixed(1)),
        };
      });
    },
    [rekapData]
  );

  const getComponentComplianceData = useCallback(
    (type: string = "all", year: string = "all") => {
      if (!rekapData.length) return [];

      return groupByMonth(filterItems(rekapData, type, year)).map((bucket) => {
        const stats = aggregate(bucket.data);
        return {
          month: bucket.month,
          kepatuhanTerapi: Math.round(stats.therapyCompliance),
          kepatuhanPenunjang: Math.round(stats.supportCompliance),
        };
      });
    },
    [rekapData]
  );

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
    getComponentComplianceData,
  };
};
