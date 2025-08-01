import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useClinicalPathways } from "@/hooks/useClinicalPathways";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PatientFormData {
  clinicalPathway: string;
  verifikator: string;
  dpjp: string;
  noRM: string;
  patientNameAge: string;
  admissionDate: string;
  admissionTime: string;
  dischargeDate?: string;
  dischargeTime?: string;
  lengthOfStay?: string;
}

const clinicalPathways = [
  "Sectio Caesaria",
  "Stroke Hemoragik", 
  "Stroke Non Hemoragik",
  "Pneumonia",
  "Dengue Fever"
];

const verifikators = [
  "dr. Ivan Jazid Adam",
  "Aulia Paramedika, S.Kep, Ns",
  "Fita Dhiah Andari, S.Kep, Ns", 
  "Heni Indriastuti, S.Kep, Ns",
  "Zayid Al Amin, S.Kep, Ns",
  "Suratman, S.Kep, Ns",
  "Ami Tri Agustin, S.Kep"
];

const dpjpOptions = [
  "dr. Dia Irawati, Sp.PD (DPJP DI)",
  "dr. Kurniawan Agung Yuwono, Sp.PD (DPJP KA)",
  "dr. Irla Yudha Saputra, Sp.PD (DPJP IY)",
  "dr. Fitria Nurul Hidayah, Sp.PD (DPJP FN)",
  "dr. Lusiana Susio Utami, Sp.P (DPJP LS)",
  "dr. Waskitho Nugroho, MMR, Sp.N (DPJP WN)",
  "dr. Ardiansyah, Sp.S (DPJP MA)",
  "dr. Raden Bayu, Sp.OG (DPJP RB)",
  "dr. Mira Maulina, Sp.OG (DPJP MM)",
  "dr. Arinil Haque, Sp.OG, M.Ked, Klin (DPJP AH)"
];

const ClinicalPathwayForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createPathway, updatePathway } = useClinicalPathways();
  const [customVerifikator, setCustomVerifikator] = useState("");
  const [customDPJP, setCustomDPJP] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const patientId = searchParams.get('id');
  const mode = searchParams.get('mode') || 'create';
  
  const form = useForm<PatientFormData>({
    defaultValues: {
      clinicalPathway: "",
      verifikator: "",
      dpjp: "",
      noRM: "",
      patientNameAge: "",
      admissionDate: "",
      admissionTime: "",
      dischargeDate: "",
      dischargeTime: "",
      lengthOfStay: ""
    }
  });

  // Load patient data for edit mode
  useEffect(() => {
    const loadPatientData = async () => {
      if (mode === 'edit' && patientId) {
        setIsLoading(true);
        try {
          const { data: patient, error } = await supabase
            .from('clinical_pathways')
            .select('*')
            .eq('id', patientId)
            .single();

          if (error) throw error;

          if (patient) {
            form.reset({
              clinicalPathway: patient.jenis_clinical_pathway,
              verifikator: patient.verifikator_pelaksana || "",
              dpjp: patient.dpjp || "",
              noRM: patient.no_rm,
              patientNameAge: patient.nama_pasien,
              admissionDate: patient.tanggal_masuk,
              admissionTime: patient.jam_masuk,
              dischargeDate: patient.tanggal_keluar || "",
              dischargeTime: patient.jam_keluar || "",
              lengthOfStay: patient.los_hari ? `${patient.los_hari} hari` : ""
            });
          }
        } catch (error) {
          console.error('Error loading patient data:', error);
          toast({
            title: "Error",
            description: "Gagal memuat data pasien",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPatientData();
  }, [mode, patientId, form]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      setIsLoading(true);
      
      // Calculate LOS if both admission and discharge dates are provided
      let losHari = null;
      if (data.dischargeDate && data.admissionDate) {
        const admissionDate = new Date(data.admissionDate);
        const dischargeDate = new Date(data.dischargeDate);
        const timeDiff = dischargeDate.getTime() - admissionDate.getTime();
        losHari = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }

      const pathwayData = {
        no_rm: data.noRM,
        nama_pasien: data.patientNameAge,
        jenis_clinical_pathway: data.clinicalPathway as any,
        verifikator_pelaksana: data.verifikator,
        dpjp: data.dpjp,
        tanggal_masuk: data.admissionDate,
        jam_masuk: data.admissionTime,
        tanggal_keluar: data.dischargeDate || null,
        jam_keluar: data.dischargeTime || null,
        los_hari: losHari
      };

      let pathway;
      if (mode === 'edit' && patientId) {
        // Update existing pathway
        pathway = await updatePathway(patientId, pathwayData);
        toast({
          title: "Berhasil",
          description: "Data pasien berhasil diperbarui",
        });
        navigate('/clinical-pathway');
      } else {
        // Create new pathway
        pathway = await createPathway(pathwayData);
        
        // Store form data and pathway ID in session storage for the checklist step
        sessionStorage.setItem('clinicalPathwayFormData', JSON.stringify({
          ...data,
          pathwayId: pathway.id
        }));
        
        navigate('/clinical-pathway-checklist');
      }
    } catch (error) {
      console.error('Error saving clinical pathway:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data pasien",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clinical-pathway')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">
            {mode === 'edit' ? 'Edit Data Pasien Clinical Pathway' : 'Form Identitas Pasien Clinical Pathway'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Pasien</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="clinicalPathway"
                    rules={{ required: "Clinical Pathway harus dipilih" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinical Pathway *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Clinical Pathway" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clinicalPathways.map((pathway) => (
                              <SelectItem key={pathway} value={pathway}>
                                {pathway}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="verifikator"
                    rules={{ required: "Verifikator Pelaksana harus dipilih" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verifikator Pelaksana *</FormLabel>
                        <Select onValueChange={(value) => {
                          if (value === "custom") {
                            field.onChange(customVerifikator);
                          } else {
                            field.onChange(value);
                            setCustomVerifikator("");
                          }
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Verifikator" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {verifikators.map((verifikator) => (
                              <SelectItem key={verifikator} value={verifikator}>
                                {verifikator}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">Lainnya (isi manual)</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.watch("verifikator") === "custom" && (
                          <Input
                            placeholder="Masukkan nama verifikator"
                            value={customVerifikator}
                            onChange={(e) => {
                              setCustomVerifikator(e.target.value);
                              field.onChange(e.target.value);
                            }}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dpjp"
                    rules={{ required: "DPJP harus dipilih" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DPJP *</FormLabel>
                        <Select onValueChange={(value) => {
                          if (value === "custom") {
                            field.onChange(customDPJP);
                          } else {
                            field.onChange(value);
                            setCustomDPJP("");
                          }
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih DPJP" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dpjpOptions.map((dpjp) => (
                              <SelectItem key={dpjp} value={dpjp}>
                                {dpjp}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">Lainnya (isi manual)</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.watch("dpjp") === "custom" && (
                          <Input
                            placeholder="Masukkan nama DPJP"
                            value={customDPJP}
                            onChange={(e) => {
                              setCustomDPJP(e.target.value);
                              field.onChange(e.target.value);
                            }}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="noRM"
                    rules={{ required: "No RM harus diisi" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No RM *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan No RM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="patientNameAge"
                    rules={{ required: "Nama Pasien/Umur harus diisi" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Pasien / Umur *</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: John Doe / 35 tahun" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admissionDate"
                    rules={{ required: "Tanggal Masuk RS harus diisi" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Masuk RS *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admissionTime"
                    rules={{ required: "Jam Masuk RS harus diisi" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jam Masuk RS *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dischargeDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Keluar RS</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dischargeTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jam Keluar RS</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lengthOfStay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length Of Stay</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: 3 hari" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                 <div className="flex justify-end gap-4">
                   <Button
                     type="button"
                     variant="outline"
                     onClick={() => navigate('/clinical-pathway')}
                   >
                     Batal
                   </Button>
                   {mode === 'edit' && (
                     <Button
                       type="button"
                       variant="secondary"
                       onClick={() => navigate(`/clinical-pathway-checklist?id=${patientId}&mode=edit`)}
                       disabled={isLoading}
                     >
                       Lanjutkan ke Checklist
                     </Button>
                   )}
                   <Button type="submit" disabled={isLoading}>
                     {isLoading ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Lanjut ke Checklist'}
                   </Button>
                 </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicalPathwayForm;