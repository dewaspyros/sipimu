import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dummy data for monthly recap
const monthlyData = {
  "januari": [
    {
      no: 1,
      namaPasien: "Siti Aminah / 28 th",
      tanggalMasuk: "2024-01-15",
      tanggalKeluar: "2024-01-17",
      diagnosis: "Sectio Caesaria",
      los: 2,
      sesuaiTarget: true,
      kepatuhanCP: "85%",
      avgLOS: 1.8,
      kepatuhanDPJP: "90%"
    },
    {
      no: 2,
      namaPasien: "Dewi Sartika / 32 th",
      tanggalMasuk: "2024-01-20",
      tanggalKeluar: "2024-01-21",
      diagnosis: "Sectio Caesaria",
      los: 1,
      sesuaiTarget: true,
      kepatuhanCP: "92%",
      avgLOS: 1.6,
      kepatuhanDPJP: "88%"
    },
    {
      no: 3,
      namaPasien: "Budi Santoso / 45 th",
      tanggalMasuk: "2024-01-22",
      tanggalKeluar: "2024-01-27",
      diagnosis: "Pneumonia",
      los: 5,
      sesuaiTarget: true,
      kepatuhanCP: "78%",
      avgLOS: 5.2,
      kepatuhanDPJP: "82%"
    },
    {
      no: 4,
      namaPasien: "Ahmad Wijaya / 55 th",
      tanggalMasuk: "2024-01-25",
      tanggalKeluar: "2024-01-30",
      diagnosis: "Stroke Non Hemoragik",
      los: 5,
      sesuaiTarget: true,
      kepatuhanCP: "89%",
      avgLOS: 4.8,
      kepatuhanDPJP: "94%"
    }
  ],
  "februari": [
    {
      no: 1,
      namaPasien: "Ratna Sari / 35 th",
      tanggalMasuk: "2024-02-05",
      tanggalKeluar: "2024-02-07",
      diagnosis: "Sectio Caesaria",
      los: 2,
      sesuaiTarget: true,
      kepatuhanCP: "88%",
      avgLOS: 1.9,
      kepatuhanDPJP: "91%"
    },
    {
      no: 2,
      namaPasien: "Joko Susilo / 40 th",
      tanggalMasuk: "2024-02-10",
      tanggalKeluar: "2024-02-14",
      diagnosis: "Pneumonia",
      los: 4,
      sesuaiTarget: true,
      kepatuhanCP: "85%",
      avgLOS: 4.5,
      kepatuhanDPJP: "87%"
    }
  ]
};

const monthOptions = [
  { value: "januari", label: "Januari" },
  { value: "februari", label: "Februari" },
  { value: "maret", label: "Maret" },
  { value: "april", label: "April" },
  { value: "mei", label: "Mei" },
  { value: "juni", label: "Juni" },
  { value: "juli", label: "Juli" },
  { value: "agustus", label: "Agustus" },
  { value: "september", label: "September" },
  { value: "oktober", label: "Oktober" },
  { value: "november", label: "November" },
  { value: "desember", label: "Desember" }
];

export default function RekapData() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [data, setData] = useState<typeof monthlyData["januari"]>([]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setData(monthlyData[month as keyof typeof monthlyData] || []);
  };

  const getTargetInfo = (diagnosis: string) => {
    switch (diagnosis.toLowerCase()) {
      case "sectio caesaria":
        return { target: 2, unit: "hari" };
      case "pneumonia":
        return { target: 6, unit: "hari" };
      case "stroke hemoragik":
      case "stroke non hemoragik":
        return { target: 5, unit: "hari" };
      case "dengue fever":
        return { target: 3, unit: "hari" };
      default:
        return { target: 2, unit: "hari" };
    }
  };

  const calculateSummary = () => {
    if (data.length === 0) return null;
    
    const totalPatients = data.length;
    const sesuaiTarget = data.filter(item => item.sesuaiTarget).length;
    const avgKepatuhanCP = data.reduce((acc, item) => acc + parseInt(item.kepatuhanCP), 0) / totalPatients;
    const totalLOS = data.reduce((acc, item) => acc + item.los, 0);
    const avgLOS = totalLOS / totalPatients;

    return {
      totalPatients,
      persentaseSesuaiTarget: ((sesuaiTarget / totalPatients) * 100).toFixed(1),
      avgKepatuhanCP: avgKepatuhanCP.toFixed(1),
      avgLOS: avgLOS.toFixed(1)
    };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Rekap Data</h1>
          <p className="text-muted-foreground">
            Laporan dan rekap data Clinical Pathways per bulan
          </p>
        </div>
        {data.length > 0 && (
          <Button className="medical-transition">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        )}
      </div>

      {/* Month Selection */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rekap Data per Bulan
          </CardTitle>
          <CardDescription>
            Pilih bulan untuk melihat rekap data Clinical Pathways
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="w-full md:w-64">
              <label className="text-sm font-medium mb-2 block">Pilih Bulan:</label>
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{summary.totalPatients}</div>
                  <div className="text-xs text-muted-foreground">Total Pasien</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{summary.persentaseSesuaiTarget}%</div>
                  <div className="text-xs text-muted-foreground">Sesuai Target</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{summary.avgKepatuhanCP}%</div>
                  <div className="text-xs text-muted-foreground">Kepatuhan CP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{summary.avgLOS}</div>
                  <div className="text-xs text-muted-foreground">Rata-rata LOS</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {data.length > 0 ? (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data Bulan {monthOptions.find(m => m.value === selectedMonth)?.label}
            </CardTitle>
            <CardDescription>
              Daftar pasien dan statistik kepatuhan Clinical Pathways
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">No</th>
                    <th className="text-left p-3">Nama Pasien</th>
                    <th className="text-left p-3">Tanggal Masuk RS</th>
                    <th className="text-left p-3">Tanggal Keluar RS</th>
                    <th className="text-left p-3">Diagnosis Pasien</th>
                    <th className="text-left p-3">LOS</th>
                    <th className="text-left p-3">Sesuai Target</th>
                    <th className="text-left p-3">Kepatuhan CP</th>
                    <th className="text-left p-3">Kepatuhan Avg LOS</th>
                    <th className="text-left p-3">Kepatuhan DPJP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    const targetInfo = getTargetInfo(item.diagnosis);
                    return (
                      <tr key={index} className="border-b hover:bg-muted/50 medical-transition">
                        <td className="p-3">{item.no}</td>
                        <td className="p-3">{item.namaPasien}</td>
                        <td className="p-3">{new Date(item.tanggalMasuk).toLocaleDateString('id-ID')}</td>
                        <td className="p-3">{new Date(item.tanggalKeluar).toLocaleDateString('id-ID')}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {item.diagnosis}
                          </Badge>
                        </td>
                        <td className="p-3 text-center font-semibold">
                          {item.los} hari
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={item.sesuaiTarget ? "secondary" : "destructive"}
                            className={item.sesuaiTarget 
                              ? "bg-success/10 text-success border-success/20" 
                              : "bg-destructive/10 text-destructive border-destructive/20"
                            }
                          >
                            {item.sesuaiTarget ? `✓ ≤ ${targetInfo.target} ${targetInfo.unit}` : `✗ > ${targetInfo.target} ${targetInfo.unit}`}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant="outline"
                            className={parseInt(item.kepatuhanCP) >= 75
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-warning/10 text-warning border-warning/20"
                            }
                          >
                            {item.kepatuhanCP}
                          </Badge>
                        </td>
                        <td className="p-3 text-center font-medium">
                          {item.avgLOS} hari
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant="outline"
                            className={parseInt(item.kepatuhanDPJP) >= 75
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-warning/10 text-warning border-warning/20"
                            }
                          >
                            {item.kepatuhanDPJP}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : selectedMonth ? (
        <Card className="medical-card">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Tidak Ada Data</h3>
              <p>Belum ada data Clinical Pathways untuk bulan {monthOptions.find(m => m.value === selectedMonth)?.label}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="medical-card">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Pilih Bulan</h3>
              <p>Silakan pilih bulan untuk melihat rekap data Clinical Pathways</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}