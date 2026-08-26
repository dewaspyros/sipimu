import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, TrendingUp, Download, Edit, Save, BarChart3, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AsyncButton,
  EmptyState,
  IconButton,
  LoadingState,
  PageHeader,
  SelectFilter,
} from "@/components/common";
import { useRekapData, type RekapDataItem } from "@/hooks/useRekapData";
import { useChecklistSummary, type AggregatedChecklistData } from "@/hooks/useChecklistSummary";
import { yearOptions } from "@/constants/yearOptions";
import { getPathwayOptions } from "@/constants/pathwayOptions";

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

// pathwayOptions dipindah ke dalam komponen agar dinamis berdasarkan tahun

export default function RekapData() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedPathway, setSelectedPathway] = useState("all");
  const [selectedDPJP, setSelectedDPJP] = useState("all");
  
  const [editingRows, setEditingRows] = useState<{[key: string]: boolean}>({});
  const [checklistData, setChecklistData] = useState<AggregatedChecklistData[]>([]);
  
  const { data, loading, fetchDataByMonth, fetchAllData, filterDataByPathway, updatePatientData, updateComplianceData, getTargetLOS } = useRekapData();
  const { loading: checklistLoading, aggregateChecklistData, generateChecklistSummaryForMonth } = useChecklistSummary();

  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month);
    const yearNum = parseInt(selectedYear);
    if (month && month !== "all") {
      await fetchDataByMonth(parseInt(month), yearNum);
      // Also fetch checklist data for the selected month
      const checklistSummary = await aggregateChecklistData(parseInt(month), yearNum);
      setChecklistData(checklistSummary);
    } else if (month === "all") {
      await fetchAllData();
      setChecklistData([]);
    }
  };

  const handleYearChange = async (year: string) => {
    setSelectedYear(year);
    const yearNum = parseInt(year);
    // Reset pathway filter jika nilai saat ini tidak ada di opsi tahun baru
    const newOptions = getPathwayOptions(year, { includeAll: true });
    if (!newOptions.some((opt) => opt.value === selectedPathway)) {
      setSelectedPathway("all");
    }
    if (selectedMonth && selectedMonth !== "all") {
      await fetchDataByMonth(parseInt(selectedMonth), yearNum);
      const checklistSummary = await aggregateChecklistData(parseInt(selectedMonth), yearNum);
      setChecklistData(checklistSummary);
    }
  };

  const pathwayOptions = getPathwayOptions(selectedYear, { includeAll: true });

  const handlePathwayChange = (pathway: string) => {
    setSelectedPathway(pathway);
  };

  const handleDPJPChange = (dpjp: string) => {
    setSelectedDPJP(dpjp);
  };

  // Get unique DPJP list from data
  const dpjpOptions = useMemo(
    () => [
      { value: "all", label: "Semua DPJP" },
      ...Array.from(new Set(data.map((item) => item.dpjp).filter(Boolean))).map((dpjp) => ({
        value: dpjp,
        label: dpjp,
      })),
    ],
    [data]
  );

  // Derived filter — dihitung saat render, tanpa state ganda + render ekstra
  const filteredData = useMemo(() => {
    let filtered = selectedPathway === "all" ? data : data.filter((item) => item.diagnosis === selectedPathway);
    if (selectedDPJP !== "all") {
      filtered = filtered.filter((item) => item.dpjp === selectedDPJP);
    }
    return filtered;
  }, [data, selectedPathway, selectedDPJP]);


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

    // Calculate average CP compliance percentage - average of individual patient CP percentages
    const cpPercentages = filteredData.map(item => {
      const complianceItems = [item.sesuaiTarget, item.kepatuhanPenunjang, item.kepatuhanTerapi];
      const checkedItems = complianceItems.filter(Boolean).length;
      const totalItems = complianceItems.length;
      return totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
    });
    const avgKepatuhanCP = totalPatients > 0 ? cpPercentages.reduce((sum, percentage) => sum + percentage, 0) / totalPatients : 0;

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
          kepatuhanTerapi: patient.kepatuhanTerapi,
          keterangan: patient.keterangan
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
    if (!patient) return;
    // State sumber (data) diperbarui di hook; filteredData ikut otomatis.
    await updatePatientData(patient.id, { los: newLOS });
  };

  const updateKeterangan = async (index: number, newKeterangan: string) => {
    const patient = filteredData[index];
    if (!patient) return;
    try {
      await updatePatientData(patient.id, { keterangan: newKeterangan });
    } catch (error) {
      console.error('Failed to update keterangan:', error);
    }
  };

  const updateCheckbox = async (index: number, field: string, value: boolean) => {
    const patient = filteredData[index];
    if (!patient) return;
    try {
      await updateComplianceData(patient.id, field, value);
    } catch (error) {
      console.error('Failed to update checkbox:', error);
    }
  };


  const generateSummary = async () => {
    if (selectedMonth && selectedMonth !== "all") {
      const yearNum = parseInt(selectedYear);
      await generateChecklistSummaryForMonth(parseInt(selectedMonth), yearNum);
    }
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileBarChart}
        eyebrow="Laporan"
        title="Rekap Data"
        description="Laporan dan rekap data Clinical Pathways per bulan."
        actions={
          <>
            {selectedMonth && selectedMonth !== "all" && (
              <AsyncButton
                onClick={generateSummary}
                isLoading={checklistLoading}
                loadingText="Memproses..."
                className="medical-transition"
              >
                <BarChart3 className="h-4 w-4 mr-2" aria-hidden="true" />
                Generate Checklist Summary
              </AsyncButton>
            )}
            {filteredData.length > 0 && (
              <Button className="medical-transition">
                <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                Export Excel
              </Button>
            )}
          </>
        }
      />

      {/* Month Selection */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rekap Data per Bulan
          </CardTitle>
          <CardDescription>
            Pilih bulan untuk melihat rekap data Clinical Pathways dan checklist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <SelectFilter
              label="Pilih Tahun"
              value={selectedYear}
              onValueChange={handleYearChange}
              options={yearOptions}
              placeholder="Pilih tahun"
            />
            <SelectFilter
              label="Pilih Bulan"
              value={selectedMonth}
              onValueChange={handleMonthChange}
              options={monthOptions}
              placeholder="Pilih bulan"
              widthClassName="md:w-64"
            />
            <SelectFilter
              label="Jenis Clinical Pathway"
              value={selectedPathway}
              onValueChange={handlePathwayChange}
              options={pathwayOptions}
              placeholder="Pilih jenis"
              widthClassName="md:w-64"
            />
            <SelectFilter
              label="DPJP"
              value={selectedDPJP}
              onValueChange={handleDPJPChange}
              options={dpjpOptions}
              placeholder="Pilih DPJP"
              widthClassName="md:w-64"
            />
          </div>


          {summary && (
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-5 sm:grid-cols-3 xl:grid-cols-6">
              <div className="min-w-0 text-center">
                <div className="text-xl font-bold text-primary lg:text-2xl">{summary.totalPatients}</div>
                <div className="text-xs leading-snug text-muted-foreground">Total Pasien</div>
              </div>
              <div className="min-w-0 text-center">
                <div className="text-xl font-bold text-success lg:text-2xl">{summary.persentaseSesuaiTarget}%</div>
                <div className="text-xs leading-snug text-muted-foreground">Sesuai Target</div>
              </div>
              <div className="min-w-0 text-center">
                <div className="text-xl font-bold text-primary lg:text-2xl">{summary.avgKepatuhanCP}%</div>
                <div className="text-xs leading-snug text-muted-foreground">Kepatuhan CP</div>
              </div>
              <div className="min-w-0 text-center">
                <div className="text-xl font-bold text-primary lg:text-2xl">{summary.persentaseKepatuhanPenunjang}%</div>
                <div className="text-xs leading-snug text-muted-foreground">Kepatuhan Penunjang</div>
              </div>
              <div className="min-w-0 text-center">
                <div className="text-xl font-bold text-primary lg:text-2xl">{summary.persentaseKepatuhanTerapi}%</div>
                <div className="text-xs leading-snug text-muted-foreground">Kepatuhan Terapi</div>
              </div>
              <div className="min-w-0 text-center">
                <div className="text-xl font-bold text-warning lg:text-2xl">{summary.avgLOS}</div>
                <div className="text-xs leading-snug text-muted-foreground">Rata-rata LOS</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Tabs for Data and Checklist Summary */}
      <Tabs defaultValue="patient-data" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patient-data">Data Pasien</TabsTrigger>
          <TabsTrigger value="checklist-summary">Ringkasan Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="patient-data">
          {/* Data Table */}
          {loading ? (
            <Card className="medical-card">
              <CardContent className="p-6">
                <LoadingState label="Memuat rekap data..." />
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
                        <th className="text-left p-3">DPJP</th>
                        <th className="text-left p-3">LOS</th>
                        <th className="text-left p-3">Sesuai Target</th>
                        <th className="text-left p-3">Kepatuhan Penunjang</th>
                        <th className="text-left p-3">Kepatuhan Terapi</th>
                        <th className="text-left p-3">Kepatuhan CP</th>
                        <th className="text-left p-3">Keterangan</th>
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
                            <td className="p-3">{item.dpjp || '-'}</td>
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
                                // Calculate individual patient CP compliance percentage
                                const complianceItems = [item.sesuaiTarget, item.kepatuhanPenunjang, item.kepatuhanTerapi];
                                const checkedItems = complianceItems.filter(Boolean).length;
                                const totalItems = complianceItems.length;
                                const percentage = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
                                
                                return (
                                  <Badge 
                                    variant="outline"
                                    className={percentage >= 75
                                      ? "bg-success/10 text-success border-success/20"
                                      : percentage >= 50
                                      ? "bg-warning/10 text-warning border-warning/20"
                                      : "bg-destructive/10 text-destructive border-destructive/20"
                                    }
                                  >
                                    {percentage.toFixed(0)}%
                                  </Badge>
                                );
                              })()}
                            </td>
                            <td className="p-3">
                              {isEditing ? (
                                <Input
                                  type="text"
                                  value={item.keterangan || ''}
                                  onChange={(e) => updateKeterangan(index, e.target.value)}
                                  className="w-full"
                                  placeholder="Tambahkan keterangan"
                                />
                              ) : (
                                <span className="text-sm text-muted-foreground">{item.keterangan || '-'}</span>
                              )}
                            </td>
                            <td className="p-3">
                              <IconButton
                                variant={isEditing ? "default" : "outline"}
                                label={isEditing ? `Simpan perubahan ${item.namaPasien}` : `Edit data ${item.namaPasien}`}
                                onClick={() => toggleEdit(rowKey)}
                                className="medical-transition"
                              >
                                {isEditing ? <Save className="h-4 w-4" aria-hidden="true" /> : <Edit className="h-4 w-4" aria-hidden="true" />}
                              </IconButton>
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
              <CardContent className="py-6">
                <EmptyState
                  icon={FileText}
                  title="Tidak ada data"
                  description={`Belum ada data Clinical Pathways untuk bulan ${monthOptions.find(m => m.value === selectedMonth)?.label ?? ''}`}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="medical-card">
              <CardContent className="py-6">
                <EmptyState
                  icon={Calendar}
                  title="Pilih bulan"
                  description="Silakan pilih bulan untuk melihat rekap data Clinical Pathways"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="checklist-summary">
          {selectedMonth && selectedMonth !== "all" ? (
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ringkasan Checklist Bulan {monthOptions.find(m => m.value === selectedMonth)?.label}
                </CardTitle>
                <CardDescription>
                  Ringkasan kelengkapan checklist per jenis Clinical Pathway
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checklistLoading ? (
                  <LoadingState label="Memuat data checklist..." />
                ) : checklistData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Jenis Clinical Pathway</th>
                          <th className="text-left p-3">Total Pasien</th>
                          <th className="text-left p-3">Total Item Checklist</th>
                          <th className="text-left p-3">Item Selesai</th>
                          <th className="text-left p-3">Persentase Kelengkapan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {checklistData.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50 medical-transition">
                            <td className="p-3">
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                {item.jenis_clinical_pathway}
                              </Badge>
                            </td>
                            <td className="p-3 text-center font-semibold">
                              {item.total_patients}
                            </td>
                            <td className="p-3 text-center">
                              {item.total_items}
                            </td>
                            <td className="p-3 text-center">
                              {item.completed_items}
                            </td>
                            <td className="p-3 text-center">
                              <Badge 
                                variant="outline"
                                className={item.completion_percentage >= 75
                                  ? "bg-success/10 text-success border-success/20"
                                  : item.completion_percentage >= 50
                                  ? "bg-warning/10 text-warning border-warning/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                                }
                              >
                                {item.completion_percentage.toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="Belum ada data checklist"
                    description="Belum ada ringkasan checklist untuk bulan ini."
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="medical-card">
              <CardContent className="p-6">
                <EmptyState
                  icon={Calendar}
                  title="Pilih bulan"
                  description="Pilih bulan untuk melihat ringkasan checklist."
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}