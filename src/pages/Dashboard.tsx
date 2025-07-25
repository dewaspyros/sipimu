import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";
import { Activity, TrendingUp, Users, FileCheck } from "lucide-react";

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

const componentComplianceData = {
  "sectio-caesaria": [
    { month: "Jan", kepatuhanTerapi: 92, kepatuhanPenunjang: 87 },
    { month: "Feb", kepatuhanTerapi: 94, kepatuhanPenunjang: 89 },
    { month: "Mar", kepatuhanTerapi: 91, kepatuhanPenunjang: 85 },
    { month: "Apr", kepatuhanTerapi: 95, kepatuhanPenunjang: 91 },
    { month: "May", kepatuhanTerapi: 93, kepatuhanPenunjang: 88 },
    { month: "Jun", kepatuhanTerapi: 96, kepatuhanPenunjang: 90 },
    { month: "Jul", kepatuhanTerapi: 92, kepatuhanPenunjang: 86 },
    { month: "Aug", kepatuhanTerapi: 97, kepatuhanPenunjang: 92 },
    { month: "Sep", kepatuhanTerapi: 94, kepatuhanPenunjang: 88 },
    { month: "Oct", kepatuhanTerapi: 98, kepatuhanPenunjang: 94 },
    { month: "Nov", kepatuhanTerapi: 95, kepatuhanPenunjang: 89 },
    { month: "Dec", kepatuhanTerapi: 99, kepatuhanPenunjang: 95 }
  ],
  "pneumonia": [
    { month: "Jan", kepatuhanTerapi: 88, kepatuhanPenunjang: 83 },
    { month: "Feb", kepatuhanTerapi: 90, kepatuhanPenunjang: 85 },
    { month: "Mar", kepatuhanTerapi: 87, kepatuhanPenunjang: 81 },
    { month: "Apr", kepatuhanTerapi: 91, kepatuhanPenunjang: 87 },
    { month: "May", kepatuhanTerapi: 89, kepatuhanPenunjang: 84 },
    { month: "Jun", kepatuhanTerapi: 92, kepatuhanPenunjang: 86 },
    { month: "Jul", kepatuhanTerapi: 88, kepatuhanPenunjang: 82 },
    { month: "Aug", kepatuhanTerapi: 93, kepatuhanPenunjang: 88 },
    { month: "Sep", kepatuhanTerapi: 90, kepatuhanPenunjang: 84 },
    { month: "Oct", kepatuhanTerapi: 94, kepatuhanPenunjang: 90 },
    { month: "Nov", kepatuhanTerapi: 91, kepatuhanPenunjang: 85 },
    { month: "Dec", kepatuhanTerapi: 95, kepatuhanPenunjang: 91 }
  ],
  "stroke-hemoragik": [
    { month: "Jan", kepatuhanTerapi: 85, kepatuhanPenunjang: 80 },
    { month: "Feb", kepatuhanTerapi: 87, kepatuhanPenunjang: 82 },
    { month: "Mar", kepatuhanTerapi: 84, kepatuhanPenunjang: 78 },
    { month: "Apr", kepatuhanTerapi: 88, kepatuhanPenunjang: 84 },
    { month: "May", kepatuhanTerapi: 86, kepatuhanPenunjang: 81 },
    { month: "Jun", kepatuhanTerapi: 89, kepatuhanPenunjang: 83 },
    { month: "Jul", kepatuhanTerapi: 85, kepatuhanPenunjang: 79 },
    { month: "Aug", kepatuhanTerapi: 90, kepatuhanPenunjang: 85 },
    { month: "Sep", kepatuhanTerapi: 87, kepatuhanPenunjang: 81 },
    { month: "Oct", kepatuhanTerapi: 91, kepatuhanPenunjang: 87 },
    { month: "Nov", kepatuhanTerapi: 88, kepatuhanPenunjang: 82 },
    { month: "Dec", kepatuhanTerapi: 92, kepatuhanPenunjang: 88 }
  ],
  "stroke-non-hemoragik": [
    { month: "Jan", kepatuhanTerapi: 89, kepatuhanPenunjang: 84 },
    { month: "Feb", kepatuhanTerapi: 91, kepatuhanPenunjang: 86 },
    { month: "Mar", kepatuhanTerapi: 88, kepatuhanPenunjang: 82 },
    { month: "Apr", kepatuhanTerapi: 92, kepatuhanPenunjang: 88 },
    { month: "May", kepatuhanTerapi: 90, kepatuhanPenunjang: 85 },
    { month: "Jun", kepatuhanTerapi: 93, kepatuhanPenunjang: 87 },
    { month: "Jul", kepatuhanTerapi: 89, kepatuhanPenunjang: 83 },
    { month: "Aug", kepatuhanTerapi: 94, kepatuhanPenunjang: 89 },
    { month: "Sep", kepatuhanTerapi: 91, kepatuhanPenunjang: 85 },
    { month: "Oct", kepatuhanTerapi: 95, kepatuhanPenunjang: 91 },
    { month: "Nov", kepatuhanTerapi: 92, kepatuhanPenunjang: 86 },
    { month: "Dec", kepatuhanTerapi: 96, kepatuhanPenunjang: 92 }
  ],
  "dengue-fever": [
    { month: "Jan", kepatuhanTerapi: 93, kepatuhanPenunjang: 88 },
    { month: "Feb", kepatuhanTerapi: 95, kepatuhanPenunjang: 90 },
    { month: "Mar", kepatuhanTerapi: 92, kepatuhanPenunjang: 86 },
    { month: "Apr", kepatuhanTerapi: 96, kepatuhanPenunjang: 92 },
    { month: "May", kepatuhanTerapi: 94, kepatuhanPenunjang: 89 },
    { month: "Jun", kepatuhanTerapi: 97, kepatuhanPenunjang: 91 },
    { month: "Jul", kepatuhanTerapi: 93, kepatuhanPenunjang: 87 },
    { month: "Aug", kepatuhanTerapi: 98, kepatuhanPenunjang: 93 },
    { month: "Sep", kepatuhanTerapi: 95, kepatuhanPenunjang: 89 },
    { month: "Oct", kepatuhanTerapi: 99, kepatuhanPenunjang: 95 },
    { month: "Nov", kepatuhanTerapi: 96, kepatuhanPenunjang: 90 },
    { month: "Dec", kepatuhanTerapi: 100, kepatuhanPenunjang: 96 }
  ]
};

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan LOS</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedDiagnosis === "sectio-caesaria" ? "87.2%" : 
               selectedDiagnosis === "pneumonia" ? "84.5%" : 
               selectedDiagnosis === "stroke-hemoragik" ? "82.1%" : 
               selectedDiagnosis === "stroke-non-hemoragik" ? "85.8%" : 
               selectedDiagnosis === "dengue-fever" ? "89.3%" : "87.2%"}
            </div>
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
            <div className="text-2xl font-bold">
              {selectedDiagnosis === "sectio-caesaria" ? "89.5%" : 
               selectedDiagnosis === "pneumonia" ? "86.7%" : 
               selectedDiagnosis === "stroke-hemoragik" ? "83.4%" : 
               selectedDiagnosis === "stroke-non-hemoragik" ? "87.9%" : 
               selectedDiagnosis === "dengue-fever" ? "91.2%" : "89.5%"}
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="positive">+1.8%</Badge> dari bulan lalu
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
              {selectedDiagnosis === "sectio-caesaria" ? "92.3%" : 
               selectedDiagnosis === "pneumonia" ? "88.6%" : 
               selectedDiagnosis === "stroke-hemoragik" ? "85.2%" : 
               selectedDiagnosis === "stroke-non-hemoragik" ? "89.7%" : 
               selectedDiagnosis === "dengue-fever" ? "93.8%" : "92.3%"}
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="positive">+2.4%</Badge> dari bulan lalu
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
              {selectedDiagnosis === "sectio-caesaria" ? "86.9%" : 
               selectedDiagnosis === "pneumonia" ? "83.4%" : 
               selectedDiagnosis === "stroke-hemoragik" ? "80.7%" : 
               selectedDiagnosis === "stroke-non-hemoragik" ? "84.1%" : 
               selectedDiagnosis === "dengue-fever" ? "88.5%" : "86.9%"}
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="positive">+1.5%</Badge> dari bulan lalu
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
              {selectedDiagnosis === "sectio-caesaria" ? "1.6 hari" : 
               selectedDiagnosis === "pneumonia" ? "5.2 hari" : 
               selectedDiagnosis === "stroke-hemoragik" ? "4.8 hari" : 
               selectedDiagnosis === "stroke-non-hemoragik" ? "4.6 hari" : 
               selectedDiagnosis === "dengue-fever" ? "2.8 hari" : "1.6 hari"}
            </div>
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
            <div className="text-2xl font-bold">
              {selectedDiagnosis === "sectio-caesaria" ? "1,284" : 
               selectedDiagnosis === "pneumonia" ? "892" : 
               selectedDiagnosis === "stroke-hemoragik" ? "456" : 
               selectedDiagnosis === "stroke-non-hemoragik" ? "623" : 
               selectedDiagnosis === "dengue-fever" ? "234" : "1,284"}
            </div>
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
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={componentComplianceData[selectedDiagnosis as keyof typeof componentComplianceData] || componentComplianceData["sectio-caesaria"]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} label={{ value: 'Kepatuhan (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="kepatuhanTerapi" fill="hsl(var(--primary))" name="Kepatuhan Terapi" label={<CustomBarLabel />} />
              <Bar dataKey="kepatuhanPenunjang" fill="hsl(var(--secondary))" name="Kepatuhan Penunjang" label={<CustomBarLabel />} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}