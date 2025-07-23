import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";
import { Activity, TrendingUp, Users, FileCheck } from "lucide-react";

// Dummy data for charts
const monthlyComplianceData = [
  { month: "Jan", losCompliance: 78, cpCompliance: 82, avgLos: 1.8 },
  { month: "Feb", losCompliance: 85, cpCompliance: 79, avgLos: 1.6 },
  { month: "Mar", losCompliance: 76, cpCompliance: 88, avgLos: 2.1 },
  { month: "Apr", losCompliance: 92, cpCompliance: 85, avgLos: 1.4 },
  { month: "May", losCompliance: 88, cpCompliance: 91, avgLos: 1.7 },
  { month: "Jun", losCompliance: 83, cpCompliance: 86, avgLos: 1.9 },
  { month: "Jul", losCompliance: 91, cpCompliance: 89, avgLos: 1.5 },
  { month: "Aug", losCompliance: 87, cpCompliance: 94, avgLos: 1.6 },
  { month: "Sep", losCompliance: 89, cpCompliance: 87, avgLos: 1.8 },
  { month: "Oct", losCompliance: 94, cpCompliance: 92, avgLos: 1.3 },
  { month: "Nov", losCompliance: 86, cpCompliance: 90, avgLos: 1.7 },
  { month: "Dec", losCompliance: 91, cpCompliance: 88, avgLos: 1.5 }
];

const componentComplianceData = [
  { month: "Jan", dokter: 85, perawat: 82, penunjang: 78, laboratorium: 90, obat: 88, nutrisi: 75, fisioterapi: 80, edukasi: 77 },
  { month: "Feb", dokter: 88, perawat: 85, penunjang: 82, laboratorium: 92, obat: 90, nutrisi: 78, fisioterapi: 83, edukasi: 80 },
  { month: "Mar", dokter: 90, perawat: 88, penunjang: 85, laboratorium: 94, obat: 89, nutrisi: 80, fisioterapi: 85, edukasi: 82 },
  { month: "Apr", dokter: 92, perawat: 90, penunjang: 88, laboratorium: 96, obat: 91, nutrisi: 83, fisioterapi: 88, edukasi: 85 },
  { month: "May", dokter: 89, perawat: 87, penunjang: 90, laboratorium: 93, obat: 93, nutrisi: 85, fisioterapi: 90, edukasi: 87 },
  { month: "Jun", dokter: 91, perawat: 89, penunjang: 87, laboratorium: 95, obat: 88, nutrisi: 82, fisioterapi: 87, edukasi: 84 }
];

const dpjpComplianceData = {
  "Sectio Caesaria": [
    { month: "Jan", "DPJP MM": 85, "DPJP AH": 88, "DPJP RB": 82 },
    { month: "Feb", "DPJP MM": 88, "DPJP AH": 90, "DPJP RB": 85 },
    { month: "Mar", "DPJP MM": 90, "DPJP AH": 92, "DPJP RB": 88 },
    { month: "Apr", "DPJP MM": 92, "DPJP AH": 89, "DPJP RB": 90 },
    { month: "May", "DPJP MM": 89, "DPJP AH": 91, "DPJP RB": 87 },
    { month: "Jun", "DPJP MM": 91, "DPJP AH": 93, "DPJP RB": 89 }
  ],
  "Pneumonia": [
    { month: "Jan", "DPJP DI": 82, "DPJP KA": 85, "DPJP IY": 78, "DPJP FN": 88, "DPJP LS": 80 },
    { month: "Feb", "DPJP DI": 85, "DPJP KA": 88, "DPJP IY": 82, "DPJP FN": 90, "DPJP LS": 83 },
    { month: "Mar", "DPJP DI": 88, "DPJP KA": 90, "DPJP IY": 85, "DPJP FN": 92, "DPJP LS": 86 },
    { month: "Apr", "DPJP DI": 90, "DPJP KA": 89, "DPJP IY": 88, "DPJP FN": 89, "DPJP LS": 88 },
    { month: "May", "DPJP DI": 87, "DPJP KA": 91, "DPJP IY": 90, "DPJP FN": 91, "DPJP LS": 90 },
    { month: "Jun", "DPJP DI": 89, "DPJP KA": 93, "DPJP IY": 87, "DPJP FN": 93, "DPJP LS": 89 }
  ]
};

const diagnosisOptions = [
  { value: "sectio-caesaria", label: "Sectio Caesaria" },
  { value: "stroke-hemoragik", label: "Stroke Hemoragik" },
  { value: "stroke-non-hemoragik", label: "Stroke Non Hemoragik" },
  { value: "pneumonia", label: "Pneumonia" },
  { value: "dengue-fever", label: "Dengue Fever" }
];

export default function Dashboard() {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("sectio-caesaria");
  
  const getTargetInfo = (diagnosis: string) => {
    switch (diagnosis) {
      case "sectio-caesaria":
        return { target: "< 2x24 jam", compliance: "> 75%" };
      case "stroke-hemoragik":
      case "stroke-non-hemoragik":
        return { target: "< 5x24 jam", compliance: "> 75%" };
      case "pneumonia":
        return { target: "< 6x24 jam", compliance: "> 75%" };
      case "dengue-fever":
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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan LOS</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.2%</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="positive">+2.1%</Badge> dari bulan lalu
            </p>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan CP</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.5%</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="positive">+1.8%</Badge> dari bulan lalu
            </p>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata LOS</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.6 hari</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="positive">-0.3</Badge> dari bulan lalu
            </p>
          </CardContent>
        </Card>
        
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pasien</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="positive">+5.2%</Badge> dari bulan lalu
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
            <ComposedChart data={monthlyComplianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" domain={[0, 100]} label={{ value: 'Kepatuhan (%)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 6]} label={{ value: 'Rata-rata LOS (hari)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="losCompliance" fill="hsl(var(--primary))" name="LOS (%)" />
              <Bar yAxisId="left" dataKey="cpCompliance" fill="hsl(var(--primary-light))" name="CP (%)" />
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
          <CardTitle>Grafik Kepatuhan Komponen CP</CardTitle>
          <CardDescription>
            Presentase kepatuhan komponen Clinical Pathways per bulan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={componentComplianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} label={{ value: 'Kepatuhan (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="dokter" fill="hsl(var(--primary))" name="Dokter" />
              <Bar dataKey="perawat" fill="hsl(var(--secondary))" name="Perawat" />
              <Bar dataKey="penunjang" fill="hsl(var(--accent))" name="Penunjang" />
              <Bar dataKey="laboratorium" fill="hsl(var(--success))" name="Lab" />
              <Bar dataKey="obat" fill="hsl(var(--warning))" name="Obat" />
              <Bar dataKey="nutrisi" fill="hsl(var(--destructive))" name="Nutrisi" />
              <Bar dataKey="fisioterapi" fill="#8B5CF6" name="Fisioterapi" />
              <Bar dataKey="edukasi" fill="#F59E0B" name="Edukasi" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}