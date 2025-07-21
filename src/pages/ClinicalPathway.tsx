import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react";

const dummyData = [
  {
    id: 1,
    noRm: "001234",
    namaPasien: "Siti Aminah / 28 th",
    tanggalMasuk: "2024-01-15",
    tanggalKeluar: "2024-01-17",
    diagnosis: "Sectio Caesaria",
    dpjp: "dr. Mira Maulina, Sp.OG",
    verifikator: "Aulia Paramedika, S.Kep, Ns",
    los: 2,
    kepatuhan: "85%"
  },
  {
    id: 2,
    noRm: "001235",
    namaPasien: "Budi Santoso / 45 th",
    tanggalMasuk: "2024-01-20",
    tanggalKeluar: "2024-01-25",
    diagnosis: "Pneumonia",
    dpjp: "dr. Dia Irawati, Sp.PD",
    verifikator: "Fita Dhiah Andari, S.Kep, Ns",
    los: 5,
    kepatuhan: "92%"
  },
  {
    id: 3,
    noRm: "001236",
    namaPasien: "Ahmad Wijaya / 55 th",
    tanggalMasuk: "2024-01-22",
    tanggalKeluar: "2024-01-27",
    diagnosis: "Stroke Non Hemoragik",
    dpjp: "dr. Waskitho Nugroho, MMR, Sp.N",
    verifikator: "Heni Indriastuti, S.Kep, Ns",
    los: 5,
    kepatuhan: "78%"
  }
];

export default function ClinicalPathway() {
  const [selectedData, setSelectedData] = useState<typeof dummyData[0] | null>(null);

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
        <Button className="medical-transition">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Data CP
        </Button>
      </div>

      <Tabs defaultValue="data-list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data-list">Daftar Data</TabsTrigger>
          <TabsTrigger value="add-data">Tambah Data</TabsTrigger>
          <TabsTrigger value="edit-data" disabled={!selectedData}>Edit Data</TabsTrigger>
        </TabsList>

        <TabsContent value="data-list">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Data Clinical Pathways</CardTitle>
              <CardDescription>
                Daftar semua data Clinical Pathways yang telah diinput
              </CardDescription>
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
                    {dummyData.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50 medical-transition">
                        <td className="p-4 font-mono">{item.noRm}</td>
                        <td className="p-4">{item.namaPasien}</td>
                        <td className="p-4">{new Date(item.tanggalMasuk).toLocaleDateString('id-ID')}</td>
                        <td className="p-4">{new Date(item.tanggalKeluar).toLocaleDateString('id-ID')}</td>
                        <td className="p-4">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                            {item.diagnosis}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{item.dpjp}</td>
                        <td className="p-4 text-center">{item.los} hari</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-sm ${
                            parseInt(item.kepatuhan) >= 80 
                              ? 'bg-success/10 text-success' 
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {item.kepatuhan}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-data">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Tambah Data Clinical Pathways</CardTitle>
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
                  <Button className="medical-transition" size="lg">
                    Mengerti, Lanjut ke Form Input
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit-data">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Edit Data Clinical Pathways</CardTitle>
              <CardDescription>
                {selectedData 
                  ? `Edit data untuk pasien ${selectedData.namaPasien} (${selectedData.noRm})`
                  : "Pilih data dari daftar untuk mengedit"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedData ? (
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Informasi Pasien:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">No. RM:</span> {selectedData.noRm}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nama Pasien:</span> {selectedData.namaPasien}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Diagnosis:</span> {selectedData.diagnosis}
                      </div>
                      <div>
                        <span className="text-muted-foreground">DPJP:</span> {selectedData.dpjp}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tanggal Masuk:</span> {new Date(selectedData.tanggalMasuk).toLocaleDateString('id-ID')}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tanggal Keluar:</span> {new Date(selectedData.tanggalKeluar).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>
                  
                  <Button className="medical-transition">
                    Buka Form Edit
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Silakan pilih data dari tab "Daftar Data" untuk mengedit
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}