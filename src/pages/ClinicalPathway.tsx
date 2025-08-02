import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react";
import { useClinicalPathways } from "@/hooks/useClinicalPathways";

export default function ClinicalPathway() {
  const navigate = useNavigate();
  const { pathways, loading, deletePathway } = useClinicalPathways();
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedPathway, setSelectedPathway] = useState<string>("");

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4">
                <div className="w-full md:w-48">
                  <label className="text-sm font-medium mb-2 block">Filter Bulan:</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Bulan</SelectItem>
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
                <div className="w-full md:w-64">
                  <label className="text-sm font-medium mb-2 block">Filter Jenis Clinical Pathway:</label>
                  <Select value={selectedPathway} onValueChange={setSelectedPathway}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Clinical Pathway</SelectItem>
                      <SelectItem value="Sectio Caesaria">Sectio Caesaria</SelectItem>
                      <SelectItem value="Pneumonia">Pneumonia</SelectItem>
                      <SelectItem value="Stroke Non Hemoragik">Stroke Non Hemoragik</SelectItem>
                      <SelectItem value="Stroke Hemoragik">Stroke Hemoragik</SelectItem>
                      <SelectItem value="Dengue Fever">Dengue Fever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="p-4 text-center">Loading...</td>
                      </tr>
                    ) : pathways.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-4 text-center text-muted-foreground">
                          Belum ada data clinical pathway
                        </td>
                      </tr>
                    ) : (
                      pathways
                        .filter(item => {
                          // Filter by month
                          if (selectedMonth && selectedMonth !== "all") {
                            const admissionMonth = new Date(item.tanggal_masuk).getMonth() + 1;
                            if (admissionMonth.toString() !== selectedMonth) return false;
                          }
                          // Filter by clinical pathway type
                          if (selectedPathway && selectedPathway !== "all") {
                            if (item.jenis_clinical_pathway !== selectedPathway) return false;
                          }
                          return true;
                        })
                        .map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/50 medical-transition">
                            <td className="p-4 font-mono">{item.no_rm}</td>
                            <td className="p-4">{item.nama_pasien}</td>
                            <td className="p-4">{new Date(item.tanggal_masuk).toLocaleDateString('id-ID')}</td>
                            <td className="p-4">
                              {item.tanggal_keluar 
                                ? new Date(item.tanggal_keluar).toLocaleDateString('id-ID')
                                : '-'
                              }
                            </td>
                            <td className="p-4">
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                                {item.jenis_clinical_pathway}
                              </span>
                            </td>
                            <td className="p-4 text-sm">{item.dpjp}</td>
                            <td className="p-4 text-center">
                              {item.los_hari ? `${item.los_hari} hari` : '-'}
                            </td>
                            <td className="p-4">
                              <span className="bg-muted px-2 py-1 rounded-md text-sm">
                                -
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  title="Lihat Detail"
                                  onClick={() => navigate(`/clinical-pathway-checklist?id=${item.id}&mode=view`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  title="Edit Data"
                                  onClick={() => navigate(`/clinical-pathway-form?id=${item.id}&mode=edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {item.tanggal_keluar && (
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    title="Lanjut ke Checklist"
                                    onClick={() => navigate(`/clinical-pathway-checklist?id=${item.id}&mode=edit`)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      title="Hapus Data"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Hapus Data Clinical Pathway</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Apakah Anda yakin ingin menghapus data clinical pathway untuk pasien {item.nama_pasien}? 
                                        Tindakan ini tidak dapat dibatalkan.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Batal</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => deletePathway(item.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Hapus
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
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