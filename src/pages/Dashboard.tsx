import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";
import { Activity, TrendingUp, Users, FileCheck } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { yearOptions } from "@/constants/yearOptions";

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
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

      {/* Welcome Section */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Selamat Datang di Dashboard</CardTitle>
          <CardDescription>
            Monitoring sistem Clinical Pathways RS PKU Muhammadiyah Wonosobo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-6 rounded-lg bg-primary/5 border border-primary/20">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <div className="text-2xl font-bold">
                {loading ? "..." : (totalPatients?.total_patients || 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Pasien Terdaftar</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-success/5 border border-success/20">
              <Activity className="h-12 w-12 mx-auto mb-4 text-success" />
              <div className="text-2xl font-bold text-success">Aktif</div>
              <div className="text-sm text-muted-foreground">Sistem Monitoring</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-primary/5 border border-primary/20">
              <FileCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">Jenis Clinical Pathway</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full md:w-[120px]">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full md:w-[120px]">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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