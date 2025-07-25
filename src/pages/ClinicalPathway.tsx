
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ClinicalPathway() {
  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  // Fetch clinical pathways data
  const { data: clinicalPathways = [], isLoading } = useQuery({
    queryKey: ['clinical_pathways', selectedMonth],
    queryFn: async () => {
      let query = supabase
        .from('clinical_pathways')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedMonth) {
        const monthNumber = parseInt(selectedMonth);
        query = query.filter('admission_date', 'gte', `2024-${monthNumber.toString().padStart(2, '0')}-01`)
                     .filter('admission_date', 'lt', `2024-${(monthNumber + 1).toString().padStart(2, '0')}-01`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clinical_pathways')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const calculateKepatuhan = (item: any) => {
    const compliance = (item.kepatuhan_cp ? 1 : 0) + 
                      (item.kepatuhan_penunjang ? 1 : 0) + 
                      (item.kepatuhan_terapi ? 1 : 0);
    return Math.round((compliance / 3) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Clinical Pathway</h1>
          <p className="text-muted-foreground">
            Kelola data input Clinical Pathways RS PKU Muhammadiyah Wonosobo
          </p>
        </div>
      </div>

      <Tabs defaultValue="data-list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="data-list">Daftar Data</TabsTrigger>
          <TabsTrigger value="add-data">Tambah Data Clinical Pathways</TabsTrigger>
        </TabsList>

        <TabsContent value="data-list">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Data Clinical Pathways</CardTitle>
              <CardDescription>
                Daftar semua data Clinical Pathways yang telah diinput
              </CardDescription>
              <div className="flex items-center gap-4 mt-4">
                <div className="w-48">
                  <label className="text-sm font-medium mb-2 block">Filter Bulan:</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Semua Bulan</SelectItem>
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
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">No. RM</th>
                        <th className="text-left p-4">Nama Pasien</th>
                        <th className="text-left p-4">Tanggal Masuk</th>
                        <th className="text-left p-4">Tanggal Keluar</th>
                        <th className="text-left p-4">Diagnosis</th>
                        <th className="text-left p-4">DPJP</th>
                        <th className="text-left p-4">LOS</th>
                        <th className="text-left p-4">Kepatuhan</th>
                        <th className="text-left p-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clinicalPathways.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/50 medical-transition">
                          <td className="p-4 font-mono">{item.no_rm}</td>
                          <td className="p-4">{item.patient_name_age}</td>
                          <td className="p-4">{new Date(item.admission_date).toLocaleDateString('id-ID')}</td>
                          <td className="p-4">{item.discharge_date ? new Date(item.discharge_date).toLocaleDateString('id-ID') : '-'}</td>
                          <td className="p-4">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                              {item.clinical_pathway_type}
                            </span>
                          </td>
                          <td className="p-4 text-sm">{item.dpjp}</td>
                          <td className="p-4 text-center">{item.length_of_stay || 0} hari</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-sm ${
                              calculateKepatuhan(item) >= 80 
                                ? 'bg-success/10 text-success' 
                                : 'bg-warning/10 text-warning'
                            }`}>
                              {calculateKepatuhan(item)}%
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedData(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedData(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-data">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Petunjuk Pengisian Clinical Pathways</CardTitle>
              <CardDescription>
                Ikuti petunjuk pengisian untuk menambah data Clinical Pathways baru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    A. Petunjuk Umum
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">1. Kotak dalam form Clinical Pathways memberikan arti:</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                        <li>Bahwa ada tanda atau gejala yang harus diperiksa</li>
                        <li>Sebagai target adanya tindakan atau pengobatan yang harus dilakukan</li>
                        <li>Sebagai target keberhasilan tindakan atau pengobatan yang dilakukan</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">2. Cara pengisian:</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                        <li>Klik pada kotak sehingga muncul tanda centang (✓) bila didapatkan tanda/gejala/tindakan</li>
                        <li>Bila tidak ada tanda/gejala/tindakan maka dibiarkan saja, tidak diberi tanda apa-apa</li>
                        <li>Isi pada pertanyaan yang tersedia</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    className="medical-transition" 
                    size="lg"
                    onClick={() => navigate('/clinical-pathway-form')}
                  >
                    Mengerti, Lanjut ke Clinical Pathway Form
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
