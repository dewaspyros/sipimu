import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Eye, FileText, Trash2, ClipboardPlus } from "lucide-react";
import {
  ALL_VALUE,
  DataTable,
  FilterBar,
  IconButton,
  MONTH_OPTIONS,
  PageHeader,
  SearchFilter,
  SelectFilter,
  WARD_OPTIONS,
  type DataTableColumn,
} from "@/components/common";
import { useClinicalPathways, type ClinicalPathway as Pathway } from "@/hooks/useClinicalPathways";
import { yearOptions } from "@/constants/yearOptions";
import { getPathwayOptions } from "@/constants/pathwayOptions";

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("id-ID") : "-";

export default function ClinicalPathway() {
  const navigate = useNavigate();
  const { pathways, loading, deletePathway } = useClinicalPathways();
  const [selectedMonth, setSelectedMonth] = useState<string>(ALL_VALUE);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedPathway, setSelectedPathway] = useState<string>(ALL_VALUE);
  const [selectedWard, setSelectedWard] = useState<string>(ALL_VALUE);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const pathwayOptions = useMemo(
    () => getPathwayOptions(selectedYear, { includeAll: true }),
    [selectedYear]
  );

  // Reset filter pathway jika nilai saat ini tidak ada di opsi tahun terpilih
  useEffect(() => {
    const valid = pathwayOptions.some((opt) => opt.value === selectedPathway);
    if (selectedPathway && !valid) {
      setSelectedPathway(ALL_VALUE);
    }
  }, [pathwayOptions, selectedPathway]);

  const yearFilterOptions = useMemo(
    () => [{ value: ALL_VALUE, label: "Semua Tahun" }, ...yearOptions],
    []
  );

  const filteredPathways = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return pathways.filter((item) => {
      if (query) {
        const matches =
          item.nama_pasien.toLowerCase().includes(query) ||
          item.no_rm.toLowerCase().includes(query);
        if (!matches) return false;
      }
      if (selectedYear && selectedYear !== ALL_VALUE) {
        if (item.tanggal_masuk?.slice(0, 4) !== selectedYear) return false;
      }
      if (selectedMonth && selectedMonth !== ALL_VALUE) {
        const month = Number(item.tanggal_masuk?.slice(5, 7));
        if (String(month) !== selectedMonth) return false;
      }
      if (selectedPathway && selectedPathway !== ALL_VALUE) {
        if (item.jenis_clinical_pathway !== selectedPathway) return false;
      }
      if (selectedWard && selectedWard !== ALL_VALUE) {
        if ((item as Pathway & { bangsal?: string }).bangsal !== selectedWard) return false;
      }
      return true;
    });
  }, [pathways, searchQuery, selectedYear, selectedMonth, selectedPathway, selectedWard]);

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    [selectedMonth, selectedPathway, selectedWard].some((v) => v && v !== ALL_VALUE) ||
    (selectedYear !== ALL_VALUE && pathways.length > 0);

  const columns = useMemo<DataTableColumn<Pathway>[]>(
    () => [
      {
        id: "no_rm",
        header: "No. RM",
        sortValue: (row) => row.no_rm,
        cell: (row) => <span className="font-mono">{row.no_rm}</span>,
      },
      {
        id: "nama_pasien",
        header: "Nama Pasien",
        sortValue: (row) => row.nama_pasien,
        cell: (row) => <span className="font-medium">{row.nama_pasien}</span>,
      },
      {
        id: "tanggal_masuk",
        header: "Tanggal Masuk",
        sortValue: (row) => row.tanggal_masuk,
        cell: (row) => formatDate(row.tanggal_masuk),
      },
      {
        id: "tanggal_keluar",
        header: "Tanggal Keluar",
        hideBelowMd: true,
        sortValue: (row) => row.tanggal_keluar ?? "",
        cell: (row) => formatDate(row.tanggal_keluar),
      },
      {
        id: "diagnosis",
        header: "Diagnosis",
        sortValue: (row) => row.jenis_clinical_pathway,
        cell: (row) => (
          <span className="inline-block rounded-md bg-primary/10 px-2 py-1 text-sm text-primary">
            {row.jenis_clinical_pathway}
          </span>
        ),
      },
      {
        id: "dpjp",
        header: "DPJP",
        hideBelowMd: true,
        sortValue: (row) => row.dpjp,
        cell: (row) => <span className="text-sm">{row.dpjp}</span>,
      },
      {
        id: "los",
        header: "LOS",
        align: "center",
        sortValue: (row) => row.los_hari ?? null,
        cell: (row) => (row.los_hari ? `${row.los_hari} hari` : "-"),
      },
      {
        id: "aksi",
        header: "Aksi",
        srLabel: "Aksi",
        cell: (row) => (
          <div className="flex flex-wrap gap-2">
            <IconButton
              variant="outline"
              label={`Lihat detail ${row.nama_pasien}`}
              onClick={() => navigate(`/clinical-pathway-checklist?id=${row.id}&mode=view`)}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <IconButton
              variant="outline"
              label={`Edit data ${row.nama_pasien}`}
              onClick={() => navigate(`/clinical-pathway-form?id=${row.id}&mode=edit`)}
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <IconButton
              label={`Lanjut ke checklist ${row.nama_pasien}`}
              onClick={() => navigate(`/clinical-pathway-checklist?id=${row.id}`)}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <IconButton variant="destructive" label={`Hapus data ${row.nama_pasien}`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Data Clinical Pathway</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus data clinical pathway untuk pasien{" "}
                    {row.nama_pasien}? Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deletePathway(row.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ),
      },
    ],
    [navigate, deletePathway]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardPlus}
        eyebrow="Data Pasien"
        title="Clinical Pathway"
        description="Kelola data input Clinical Pathways RS PKU Muhammadiyah Wonosobo."
      />

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
              <FilterBar className="mt-4" label="Filter data clinical pathway">
                <SearchFilter
                  label="Cari Data"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  placeholder="Nama pasien atau No. RM"
                />
                <SelectFilter
                  label="Filter Tahun"
                  value={selectedYear}
                  onValueChange={setSelectedYear}
                  options={yearFilterOptions}
                  placeholder="Pilih tahun"
                />
                <SelectFilter
                  label="Filter Bulan"
                  value={selectedMonth}
                  onValueChange={setSelectedMonth}
                  options={MONTH_OPTIONS}
                  placeholder="Pilih bulan"
                />
                <SelectFilter
                  label="Filter Jenis Clinical Pathway"
                  value={selectedPathway}
                  onValueChange={setSelectedPathway}
                  options={pathwayOptions}
                  placeholder="Pilih jenis"
                  widthClassName="md:w-64"
                />
                <SelectFilter
                  label="Filter Bangsal"
                  value={selectedWard}
                  onValueChange={setSelectedWard}
                  options={WARD_OPTIONS}
                  placeholder="Pilih bangsal"
                />
              </FilterBar>
            </CardHeader>
            <CardContent>
              <DataTable
                caption="Daftar data clinical pathway pasien beserta aksi kelola data"
                data={filteredPathways}
                columns={columns}
                getRowId={(row) => row.id}
                isLoading={loading}
                emptyTitle={isFiltered ? "Tidak ada data yang cocok" : "Belum ada data clinical pathway"}
                emptyDescription={
                  isFiltered
                    ? "Coba ubah kata kunci pencarian atau atur ulang filter."
                    : "Tambahkan data pertama melalui tab \u201cTambah Data Clinical Pathways\u201d."
                }
                emptyAction={
                  !isFiltered ? (
                    <Button onClick={() => navigate("/clinical-pathway-form")}>Tambah Data</Button>
                  ) : undefined
                }
              />
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