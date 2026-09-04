import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartCard, PageHeader, SelectFilter, StatCard } from "@/components/common";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";
import { Activity, TrendingUp, Users, FileCheck, LayoutDashboard } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { yearOptions } from "@/constants/yearOptions";
import { usePersistedState } from "@/hooks/usePersistedState";
import { getPathwayOptions } from "@/constants/pathwayOptions";

// Custom label function for bars
const CustomBarLabel = (props: any) => {
  const { x, y, width, height, value, payload, dataKey } = props;
  
  // Get component name mapping
  const componentNames: { [key: string]: string } = {
    losCompliance: "LOS",
    cpCompliance: "CP", 
    kepatuhanTerapi: "Terapi",
    kepatuhanPenunjang: "Penunjang"
  };

  const componentName = componentNames[dataKey] || dataKey;
  
  if (!value || value === 0) return null;
  
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="hsl(var(--foreground))"
      textAnchor="middle"
      fontSize="9"
      fontWeight="600"
      transform={`rotate(-90, ${x + width / 2}, ${y - 8})`}
    >
      {`${componentName}: ${value}%`}
    </text>
  );
};

// Removed dummy data - now using real data from Supabase

// diagnosisOptions dipindah ke dalam komponen agar dinamis berdasarkan tahun

export default function Dashboard() {
  const [selectedDiagnosis, setSelectedDiagnosis] = usePersistedState("dash:diagnosis", "Sectio Caesaria");
  const [selectedMonth, setSelectedMonth] = usePersistedState("dash:month", "1");
  const [selectedYear, setSelectedYear] = usePersistedState("dash:year", new Date().getFullYear().toString());
  const { 
    loading, 
    getComplianceByType, 
    getMonthlyChartData, 
    getComponentComplianceData,
    totalPatients 
  } = useDashboardData();

  const diagnosisOptions = React.useMemo(
    () => getPathwayOptions(selectedYear),
    [selectedYear]
  );

  // Reset selectedDiagnosis jika nilai saat ini tidak ada di opsi baru
  useEffect(() => {
    if (!diagnosisOptions.some((opt) => opt.value === selectedDiagnosis)) {
      setSelectedDiagnosis(diagnosisOptions[0]?.value ?? "Sectio Caesaria");
    }
  }, [diagnosisOptions, selectedDiagnosis]);
  
  
  // Memoize data to prevent blinking - use useMemo for better performance
  const complianceData = React.useMemo(() => {
    if (loading) return { pathwayCompliance: 0, losCompliance: 0, therapyCompliance: 0, supportCompliance: 0, totalPatients: 0, avgLOS: 0 };
    return getComplianceByType(selectedDiagnosis, selectedMonth, selectedYear);
  }, [selectedDiagnosis, selectedMonth, selectedYear, loading, getComplianceByType]);

  const monthlyChartData = React.useMemo(() => {
    if (loading) return [];
    return getMonthlyChartData(selectedDiagnosis, selectedYear);
  }, [selectedDiagnosis, selectedYear, loading, getMonthlyChartData]);

  const componentChartData = React.useMemo(() => {
    if (loading) return [];
    return getComponentComplianceData(selectedDiagnosis, selectedYear);
  }, [selectedDiagnosis, selectedYear, loading, getComponentComplianceData]);
  
  const getTargetInfo = (diagnosis: string) => {
    switch (diagnosis) {
      case "all":
        return { target: "Sesuai Target", compliance: "> 75%" };
      case "Sectio Caesaria":
        return { target: "< 2x24 jam", compliance: "> 75%" };
      case "Stroke Hemoragik":
      case "Stroke Non Hemoragik":
        return { target: "< 5x24 jam", compliance: "> 75%" };
      case "Pneumonia":
      case "Intracranial Hemorrhagia":
        return { target: "< 6x24 jam", compliance: "> 75%" };
      case "Dengue Fever":
      case "Post Partum Hemorrhagia":
        return { target: "< 3x24 jam", compliance: "> 75%" };
      default:
        return { target: "< 2x24 jam", compliance: "> 75%" };
    }
  };

  const targetInfo = getTargetInfo(selectedDiagnosis);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        eyebrow="Monitoring"
        title="Dashboard Kepatuhan"
        description="Ringkasan kepatuhan Clinical Pathways RS PKU Muhammadiyah Wonosobo."
      />

      {/* Ringkasan KPI */}
      <section
        aria-label="Ringkasan sistem"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <StatCard
          label="Total Pasien Terdaftar"
          value={(totalPatients?.total_patients || 0).toLocaleString("id-ID")}
          hint="Seluruh pasien clinical pathway"
          icon={Users}
          tone="primary"
          isLoading={loading}
        />
        <StatCard
          label="Sistem Monitoring"
          value="Aktif"
          hint="Sinkronisasi data berjalan normal"
          icon={Activity}
          tone="success"
        />
        <StatCard
          label="Jenis Clinical Pathway"
          value={diagnosisOptions.length}
          hint="Diagnosis yang dipantau tahun ini"
          icon={FileCheck}
          tone="primary"
        />
      </section>


      <ChartCard
        title="Grafik Kepatuhan LOS, CP dan Avg LOS"
        description="Presentase kepatuhan Clinical Pathways per bulan"
        isLoading={loading}
        isEmpty={monthlyChartData.length === 0}
        toolbar={
          <>
            <SelectFilter
              label="Tahun"
              value={selectedYear}
              onValueChange={setSelectedYear}
              options={yearOptions}
              placeholder="Pilih Tahun"
              widthClassName="md:w-[130px]"
            />
            <SelectFilter
              label="Diagnosis"
              value={selectedDiagnosis}
              onValueChange={setSelectedDiagnosis}
              options={diagnosisOptions}
              placeholder="Pilih Diagnosis"
              widthClassName="md:w-[250px]"
            />
            <div className="flex flex-wrap gap-2 pb-1">
              <Badge variant="outline">Target: {targetInfo.target}</Badge>
              <Badge variant="outline">Kepatuhan: {targetInfo.compliance}</Badge>
            </div>
          </>
        }
      >
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" domain={[0, 100]} label={{ value: 'Kepatuhan (%)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 6]} label={{ value: 'Rata-rata LOS (hari)', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Bar yAxisId="left" dataKey="losCompliance" fill="hsl(var(--primary))" name="LOS (%)" label={<CustomBarLabel />} />
            <Bar yAxisId="left" dataKey="cpCompliance" fill="hsl(var(--primary-light))" name="CP (%)" label={<CustomBarLabel />} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgLos"
              stroke="hsl(var(--destructive))"
              strokeWidth={3}
              name="Avg LOS (hari)"
              dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Grafik Kepatuhan Komponen CP"
        description="Presentase kepatuhan komponen Clinical Pathways per bulan"
        isLoading={loading}
        isEmpty={componentChartData.length === 0}
        toolbar={
          <>
            <SelectFilter
              label="Tahun"
              value={selectedYear}
              onValueChange={setSelectedYear}
              options={yearOptions}
              placeholder="Pilih Tahun"
              widthClassName="md:w-[130px]"
            />
            <SelectFilter
              label="Diagnosis"
              value={selectedDiagnosis}
              onValueChange={setSelectedDiagnosis}
              options={diagnosisOptions}
              placeholder="Pilih Diagnosis"
              widthClassName="md:w-[250px]"
            />
          </>
        }
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={componentChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} label={{ value: 'Kepatuhan (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="kepatuhanTerapi" fill="hsl(var(--primary))" name="Kepatuhan Terapi (%)" label={<CustomBarLabel />} />
            <Bar dataKey="kepatuhanPenunjang" fill="hsl(var(--primary-light))" name="Kepatuhan Penunjang (%)" label={<CustomBarLabel />} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}