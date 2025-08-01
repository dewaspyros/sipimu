import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";
import { Activity, TrendingUp, Users, FileCheck } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

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

const diagnosisOptions = [
  { value: "Sectio Caesaria", label: "Sectio Caesaria" },
  { value: "Stroke Hemoragik", label: "Stroke Hemoragik" },
  { value: "Stroke Non Hemoragik", label: "Stroke Non Hemoragik" },
  { value: "Pneumonia", label: "Pneumonia" },
  { value: "Dengue Fever", label: "Dengue Fever" }
].filter(option => option.value && option.value.trim() !== "");

export default function Dashboard() {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("Sectio Caesaria");
  const [selectedMonth, setSelectedMonth] = useState("1");
  const { 
    loading, 
    getComplianceByType, 
    getMonthlyChartData, 
    getComponentComplianceData,
    totalPatients 
  } = useDashboardData();
  
  // Memoize data to prevent blinking - use useMemo for better performance
  const complianceData = React.useMemo(() => {
    if (loading) return { pathwayCompliance: 0, losCompliance: 0, therapyCompliance: 0, supportCompliance: 0, totalPatients: 0, avgLOS: 0 };
    return getComplianceByType(selectedDiagnosis, selectedMonth);
  }, [selectedDiagnosis, selectedMonth, loading, getComplianceByType]);

  const monthlyChartData = React.useMemo(() => {
    if (loading) return [];
    return getMonthlyChartData(selectedDiagnosis);
  }, [selectedDiagnosis, loading, getMonthlyChartData]);

  const componentChartData = React.useMemo(() => {
    if (loading) return [];
    return getComponentComplianceData(selectedDiagnosis);
  }, [selectedDiagnosis, loading, getComponentComplianceData]);
  
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
        return { target: "< 6x24 jam", compliance: "> 75%" };
      case "Dengue Fever":
        return { target: "< 3x24 jam", compliance: "> 75%" };
      default:
        return { target: "< 2x24 jam", compliance: "> 75%" };
    }
  };

  const targetInfo = getTargetInfo(selectedDiagnosis);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitoring Kepatuhan Clinical Pathways RS PKU Muhammadiyah Wonosobo
        </p>
      </div>

      {/* Month Filter */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Filter Data</CardTitle>
          <CardDescription>
            Pilih bulan untuk melihat statistik spesifik
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full md:w-64">
            <label className="text-sm font-medium mb-2 block">Pilih Bulan:</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Januari</SelectItem>
                <SelectItem value="2">Februari</SelectItem>
                <SelectItem value="3">Maret</SelectItem>
                <SelectItem value="4">April</SelectItem>
                <SelectItem value="5">Mei</SelectItem>
                <SelectItem value="6">Juni</SelectItem>
                <SelectItem value="7">Juli</SelectItem>
                <SelectItem value="8">Agustus</SelectItem>
                <SelectItem value="9">September</SelectItem>
                <SelectItem value="10">Oktober</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">Desember</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan LOS</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${complianceData.losCompliance.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {targetInfo.target}
            </p>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan CP</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${complianceData.pathwayCompliance.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {targetInfo.compliance}
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan Terapi</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${complianceData.therapyCompliance.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {"> 75%"}
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan Penunjang</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${complianceData.supportCompliance.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {"> 75%"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata LOS</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${complianceData.avgLOS.toFixed(1)} hari`}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {targetInfo.target}
            </p>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pasien</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : (complianceData.totalPatients || totalPatients?.total_patients || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pasien terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafik Kepatuhan LOS, CP dan Avg LOS */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle>Grafik Kepatuhan LOS, CP dan Avg LOS</CardTitle>
              <CardDescription>
                Presentase kepatuhan Clinical Pathways per bulan
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Pilih Diagnosis" />
                </SelectTrigger>
                <SelectContent>
                  {diagnosisOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Badge variant="outline">Target: {targetInfo.target}</Badge>
                <Badge variant="outline">Kepatuhan: {targetInfo.compliance}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Grafik Kepatuhan Komponen CP */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle>Grafik Kepatuhan Komponen CP</CardTitle>
              <CardDescription>
                Presentase kepatuhan komponen Clinical Pathways per bulan
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Pilih Diagnosis" />
                </SelectTrigger>
                <SelectContent>
                  {diagnosisOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}