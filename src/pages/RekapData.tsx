import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, TrendingUp, Download, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

// Dummy data for monthly recap
const monthlyData = {
  "januari": [
    {
      no: 1,
      namaPasien: "Siti Aminah / 28 th",
      tanggalMasuk: "2024-01-15T08:30:00",
      tanggalKeluar: "2024-01-17T14:20:00",
      diagnosis: "Sectio Caesaria",
      los: 2,
      sesuaiTarget: true,
      kepatuhanCP: true,
      kepatuhanPenunjang: true,
      kepatuhanTerapi: false,
      avgLOS: 1.8
    },
    {
      no: 2,
      namaPasien: "Dewi Sartika / 32 th",
      tanggalMasuk: "2024-01-20T10:15:00",
      tanggalKeluar: "2024-01-21T16:45:00",
      diagnosis: "Sectio Caesaria",
      los: 1,
      sesuaiTarget: true,
      kepatuhanCP: true,
      kepatuhanPenunjang: true,
      kepatuhanTerapi: true,
      avgLOS: 1.6
    },
    {
      no: 3,
      namaPasien: "Budi Santoso / 45 th",
      tanggalMasuk: "2024-01-22T12:00:00",
      tanggalKeluar: "2024-01-27T09:30:00",
      diagnosis: "Pneumonia",
      los: 5,
      sesuaiTarget: true,
      kepatuhanCP: false,
      kepatuhanPenunjang: true,
      kepatuhanTerapi: true,
      avgLOS: 5.2
    },
    {
      no: 4,
      namaPasien: "Ahmad Wijaya / 55 th",
      tanggalMasuk: "2024-01-25T07:45:00",
      tanggalKeluar: "2024-01-30T13:15:00",
      diagnosis: "Stroke Non Hemoragik",
      los: 5,
      sesuaiTarget: true,
      kepatuhanCP: true,
      kepatuhanPenunjang: false,
      kepatuhanTerapi: true,
      avgLOS: 4.8
    }
  ],
  "februari": [
    {
      no: 1,
      namaPasien: "Ratna Sari / 35 th",
      tanggalMasuk: "2024-02-05T11:20:00",
      tanggalKeluar: "2024-02-07T15:30:00",
      diagnosis: "Sectio Caesaria",
      los: 2,
      sesuaiTarget: true,
      kepatuhanCP: true,
      kepatuhanPenunjang: true,
      kepatuhanTerapi: true,
      avgLOS: 1.9
    },
    {
      no: 2,
      namaPasien: "Joko Susilo / 40 th",
      tanggalMasuk: "2024-02-10T09:00:00",
      tanggalKeluar: "2024-02-14T17:00:00",
      diagnosis: "Pneumonia",
      los: 4,
      sesuaiTarget: true,
      kepatuhanCP: true,
      kepatuhanPenunjang: false,
      kepatuhanTerapi: true,
      avgLOS: 4.5
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

const pathwayOptions = [
  { value: "all", label: "Semua Clinical Pathway" },
  { value: "sectio-caesaria", label: "Sectio Caesaria" },
  { value: "stroke-hemoragik", label: "Stroke Hemoragik" },
  { value: "stroke-non-hemoragik", label: "Stroke Non Hemoragik" },
  { value: "pneumonia", label: "Pneumonia" },
  { value: "dengue-fever", label: "Dengue Fever" }
];

export default function RekapData() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedPathway, setSelectedPathway] = useState("all");
  const [data, setData] = useState<typeof monthlyData["januari"]>([]);
  const [editingRows, setEditingRows] = useState<{[key: string]: boolean}>({});

  const filterDataByPathway = (data: typeof monthlyData["januari"], pathway: string) => {
    if (pathway === "all") return data;
    
    const pathwayMap: {[key: string]: string} = {
      "sectio-caesaria": "Sectio Caesaria",
      "stroke-hemoragik": "Stroke Hemoragik", 
      "stroke-non-hemoragik": "Stroke Non Hemoragik",
      "pneumonia": "Pneumonia",
      "dengue-fever": "Dengue Fever"
    };
    
    return data.filter(item => item.diagnosis === pathwayMap[pathway]);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    const monthData = monthlyData[month as keyof typeof monthlyData] || [];
    setData(filterDataByPathway(monthData, selectedPathway));
  };

  const handlePathwayChange = (pathway: string) => {
    setSelectedPathway(pathway);
    if (selectedMonth) {
      const monthData = monthlyData[selectedMonth as keyof typeof monthlyData] || [];
      setData(filterDataByPathway(monthData, pathway));
    }
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
    const kepatuhanCP = data.filter(item => item.kepatuhanCP).length;
    const kepatuhanPenunjang = data.filter(item => item.kepatuhanPenunjang).length;
    const kepatuhanTerapi = data.filter(item => item.kepatuhanTerapi).length;
    const totalLOS = data.reduce((acc, item) => acc + item.los, 0);
    const avgLOS = totalLOS / totalPatients;

    return {
      totalPatients,
      persentaseSesuaiTarget: ((sesuaiTarget / totalPatients) * 100).toFixed(1),
      persentaseKepatuhanCP: ((kepatuhanCP / totalPatients) * 100).toFixed(1),
      persentaseKepatuhanPenunjang: ((kepatuhanPenunjang / totalPatients) * 100).toFixed(1),
      persentaseKepatuhanTerapi: ((kepatuhanTerapi / totalPatients) * 100).toFixed(1),
      avgKepatuhanCP: ((kepatuhanCP / totalPatients) * 100).toFixed(1),
      avgLOS: avgLOS.toFixed(1)
    };
  };

  const toggleEdit = (rowKey: string) => {
    setEditingRows(prev => ({
      ...prev,
      [rowKey]: !prev[rowKey]
    }));
  };

  const updateLOS = (index: number, newLOS: number) => {
    setData(prev => prev.map((item, i) => 
      i === index ? { ...item, los: newLOS } : item
    ));
  };

  const updateCheckbox = (index: number, field: string, value: boolean) => {
    setData(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
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
            
            <div className="w-full md:w-64">
              <label className="text-sm font-medium mb-2 block">Jenis Clinical Pathway:</label>
              <Select value={selectedPathway} onValueChange={handlePathwayChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {pathwayOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1">
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
                  <div className="text-2xl font-bold text-primary">{summary.persentaseKepatuhanPenunjang}%</div>
                  <div className="text-xs text-muted-foreground">Kepatuhan Penunjang</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{summary.persentaseKepatuhanTerapi}%</div>
                  <div className="text-xs text-muted-foreground">Kepatuhan Terapi</div>
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
                    <th className="text-left p-3">Kepatuhan Penunjang</th>
                    <th className="text-left p-3">Kepatuhan Terapi</th>
                    <th className="text-left p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    const targetInfo = getTargetInfo(item.diagnosis);
                    const rowKey = `${selectedMonth}-${index}`;
                    const isEditing = editingRows[rowKey];
                    
                    return (
                      <tr key={index} className="border-b hover:bg-muted/50 medical-transition">
                        <td className="p-3">{item.no}</td>
                        <td className="p-3">{item.namaPasien}</td>
                        <td className="p-3">
                          {new Date(item.tanggalMasuk).toLocaleString('id-ID', {
                            year: 'numeric',
                            month: '2-digit', 
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-3">
                          {new Date(item.tanggalKeluar).toLocaleString('id-ID', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit', 
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {item.diagnosis}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={item.los}
                              onChange={(e) => updateLOS(index, parseInt(e.target.value) || 0)}
                              className="w-20 text-center"
                              min="0"
                            />
                          ) : (
                            <span className="font-semibold">{item.los} hari</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Checkbox
                              checked={item.sesuaiTarget}
                              onCheckedChange={(checked) => updateCheckbox(index, 'sesuaiTarget', !!checked)}
                            />
                          ) : (
                            <Badge 
                              variant={item.sesuaiTarget ? "secondary" : "destructive"}
                              className={item.sesuaiTarget 
                                ? "bg-success/10 text-success border-success/20" 
                                : "bg-destructive/10 text-destructive border-destructive/20"
                              }
                            >
                              {item.sesuaiTarget ? `✓ ≤ ${targetInfo.target} ${targetInfo.unit}` : `✗ > ${targetInfo.target} ${targetInfo.unit}`}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Checkbox
                              checked={item.kepatuhanCP}
                              onCheckedChange={(checked) => updateCheckbox(index, 'kepatuhanCP', !!checked)}
                            />
                          ) : (
                            <Badge 
                              variant="outline"
                              className={item.kepatuhanCP
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-warning/10 text-warning border-warning/20"
                              }
                            >
                              {item.kepatuhanCP ? "✓ Patuh" : "✗ Tidak Patuh"}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Checkbox
                              checked={item.kepatuhanPenunjang}
                              onCheckedChange={(checked) => updateCheckbox(index, 'kepatuhanPenunjang', !!checked)}
                            />
                          ) : (
                            <Badge 
                              variant="outline"
                              className={item.kepatuhanPenunjang
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-warning/10 text-warning border-warning/20"
                              }
                            >
                              {item.kepatuhanPenunjang ? "✓ Patuh" : "✗ Tidak Patuh"}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Checkbox
                              checked={item.kepatuhanTerapi}
                              onCheckedChange={(checked) => updateCheckbox(index, 'kepatuhanTerapi', !!checked)}
                            />
                          ) : (
                            <Badge 
                              variant="outline"
                              className={item.kepatuhanTerapi
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-warning/10 text-warning border-warning/20"
                              }
                            >
                              {item.kepatuhanTerapi ? "✓ Patuh" : "✗ Tidak Patuh"}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            variant={isEditing ? "default" : "outline"}
                            onClick={() => toggleEdit(rowKey)}
                            className="medical-transition"
                          >
                            {isEditing ? (
                              <>
                                <Save className="h-4 w-4 mr-1" />
                                Simpan
                              </>
                            ) : (
                              <>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Summary Row */}
                  {summary && (
                    <tr className="border-t-2 border-primary/20 bg-muted/30 font-semibold">
                      <td className="p-3" colSpan={5}>
                        <span className="text-primary">PERSENTASE KEPATUHAN (%)</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-sm text-muted-foreground">-</span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold">
                          {summary.persentaseSesuaiTarget}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold">
                          {summary.persentaseKepatuhanCP}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold">
                          {summary.persentaseKepatuhanPenunjang}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold">
                          {summary.persentaseKepatuhanTerapi}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-sm text-muted-foreground">-</span>
                      </td>
                    </tr>
                  )}
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