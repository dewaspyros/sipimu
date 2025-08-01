import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, TrendingUp, Download, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useRekapData, type RekapDataItem } from "@/hooks/useRekapData";

// Remove dummy data - now using real Supabase data

const monthOptions = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" }
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
  const [filteredData, setFilteredData] = useState<RekapDataItem[]>([]);
  const [editingRows, setEditingRows] = useState<{[key: string]: boolean}>({});
  
  const { data, loading, fetchDataByMonth, fetchAllData, filterDataByPathway, updatePatientData, updateComplianceData, getTargetLOS } = useRekapData();

  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month);
    if (month && month !== "all") {
      await fetchDataByMonth(parseInt(month));
    } else if (month === "all") {
      await fetchAllData();
    }
  };

  const handlePathwayChange = (pathway: string) => {
    setSelectedPathway(pathway);
    if (selectedMonth && data.length > 0) {
      setFilteredData(filterDataByPathway(pathway));
    }
  };

  // Update filtered data when main data changes
  useEffect(() => {
    if (data.length > 0) {
      setFilteredData(filterDataByPathway(selectedPathway));
    }
  }, [data, selectedPathway, filterDataByPathway]);

  const getTargetInfo = (diagnosis: string) => {
    const target = getTargetLOS(diagnosis);
    return { target, unit: "hari" };
  };

  const calculateSummary = () => {
    if (filteredData.length === 0) return null;
    
    const totalPatients = filteredData.length;
    const sesuaiTarget = filteredData.filter(item => item.sesuaiTarget).length;
    const kepatuhanCP = filteredData.filter(item => item.kepatuhanCP).length;
    const kepatuhanPenunjang = filteredData.filter(item => item.kepatuhanPenunjang).length;
    const kepatuhanTerapi = filteredData.filter(item => item.kepatuhanTerapi).length;
    const totalLOS = filteredData.reduce((acc, item) => acc + (item.los || 0), 0);
    const avgLOS = totalPatients > 0 ? totalLOS / totalPatients : 0;

    // Calculate average CP compliance - this should be the average of kepatuhanCP column
    const avgKepatuhanCP = totalPatients > 0 ? (kepatuhanCP / totalPatients) * 100 : 0;

    return {
      totalPatients,
      persentaseSesuaiTarget: ((sesuaiTarget / totalPatients) * 100).toFixed(1),
      persentaseKepatuhanCP: ((kepatuhanCP / totalPatients) * 100).toFixed(1),
      persentaseKepatuhanPenunjang: ((kepatuhanPenunjang / totalPatients) * 100).toFixed(1),
      persentaseKepatuhanTerapi: ((kepatuhanTerapi / totalPatients) * 100).toFixed(1),
      avgKepatuhanCP: avgKepatuhanCP.toFixed(1),
      avgLOS: avgLOS.toFixed(1)
    };
  };

  const toggleEdit = async (rowKey: string) => {
    const isCurrentlyEditing = editingRows[rowKey];
    
    if (isCurrentlyEditing) {
      // Save the data when toggling from edit to view mode
      const rowIndex = parseInt(rowKey.split('-')[1]);
      const patient = filteredData[rowIndex];
      if (patient) {
        await updatePatientData(patient.id, {
          los: patient.los,
          sesuaiTarget: patient.sesuaiTarget,
          kepatuhanPenunjang: patient.kepatuhanPenunjang,
          kepatuhanTerapi: patient.kepatuhanTerapi
        });
      }
    }
    
    setEditingRows(prev => ({
      ...prev,
      [rowKey]: !prev[rowKey]
    }));
  };

  const updateLOS = async (index: number, newLOS: number) => {
    const patient = filteredData[index];
    if (patient) {
      const updatedData = [...filteredData];
      updatedData[index] = { ...patient, los: newLOS, sesuaiTarget: newLOS <= getTargetLOS(patient.diagnosis) };
      setFilteredData(updatedData);
      
      // Update in database
      await updatePatientData(patient.id, { los: newLOS });
    }
  };

  const updateCheckbox = async (index: number, field: string, value: boolean) => {
    const updatedData = [...filteredData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setFilteredData(updatedData);
    
    // Update the compliance data
    const patient = filteredData[index];
    if (patient) {
      await updateComplianceData(patient.id, field, value);
    }
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
        {filteredData.length > 0 && (
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
                   {pathwayOptions.filter(option => option.value !== "all").map((option) => (
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
      {loading ? (
        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="text-center">Loading data...</div>
          </CardContent>
        </Card>
      ) : filteredData.length > 0 ? (
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
                    <th className="text-left p-3">Kepatuhan Penunjang</th>
                    <th className="text-left p-3">Kepatuhan Terapi</th>
                    <th className="text-left p-3">Kepatuhan CP</th>
                    <th className="text-left p-3">Aksi</th>
                  </tr>
                </thead>
                 <tbody>
                   {filteredData.map((item, index) => {
                    const targetInfo = getTargetInfo(item.diagnosis);
                    const rowKey = `${selectedMonth}-${index}`;
                    const isEditing = editingRows[rowKey];
                    
                    return (
                      <tr key={index} className="border-b hover:bg-muted/50 medical-transition">
                         <td className="p-3">{item.no}</td>
                         <td className="p-3">{item.namaPasien} / {item.noRM}</td>
                         <td className="p-3">
                           {new Date(item.tanggalMasuk).toLocaleDateString('id-ID')} {item.jamMasuk}
                         </td>
                         <td className="p-3">
                           {item.tanggalKeluar && item.jamKeluar 
                             ? `${new Date(item.tanggalKeluar).toLocaleDateString('id-ID')} ${item.jamKeluar}`
                             : '-'
                           }
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
                             <span className="font-semibold">{item.los || '-'} {item.los ? 'hari' : ''}</span>
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
                           {(() => {
                             // Calculate automatic percentage based on checked compliance items including sesuaiTarget
                             const complianceItems = [item.sesuaiTarget, item.kepatuhanPenunjang, item.kepatuhanTerapi];
                             const checkedItems = complianceItems.filter(Boolean).length;
                             const totalItems = complianceItems.length;
                             const percentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
                            
                            return (
                              <Badge 
                                variant="outline"
                                className={percentage >= 75
                                  ? "bg-success/10 text-success border-success/20 font-bold"
                                  : "bg-warning/10 text-warning border-warning/20 font-bold"
                                }
                              >
                                {percentage}%
                              </Badge>
                            );
                          })()}
                        </td>
                         <td className="p-3">
                           <div className="flex gap-2">
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
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => window.location.href = `/clinical-pathway-checklist?id=${item.id}&mode=view`}
                             className="medical-transition"
                             title="Lihat Checklist"
                           >
                             <FileText className="h-4 w-4" />
                           </Button>
                         </div>
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
                          {summary.persentaseKepatuhanPenunjang}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold">
                          {summary.persentaseKepatuhanTerapi}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                         <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold">
                           {summary.persentaseKepatuhanCP}%
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