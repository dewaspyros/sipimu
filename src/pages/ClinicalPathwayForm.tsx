import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientFormSchema } from "@/lib/validation";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useClinicalPathways } from "@/hooks/useClinicalPathways";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getPathwayOptions } from "@/constants/pathwayOptions";
import { useNotifications } from "@/hooks/useNotifications";


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
  bangsal: string;
}

// Daftar pathway dipilih dinamis berdasarkan tahun tanggal masuk

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

const wardOptions = [
  "Perinatal",
  "Khadijah 2", 
  "Khadijah 3",
  "Aisyah 3",
  "Hafshoh 3",
  "Hafshoh 4",
  "ICU",
  "Multazam"
];

const ClinicalPathwayForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createPathway, updatePathway } = useClinicalPathways();
  const { logActivity } = useNotifications();

  const [customVerifikator, setCustomVerifikator] = useState("");
  const [customDPJP, setCustomDPJP] = useState("");
  const [useCustomVerifikator, setUseCustomVerifikator] = useState(false);
  const [useCustomDPJP, setUseCustomDPJP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const patientId = searchParams.get('id');
  const mode = searchParams.get('mode') || 'create';
  
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema) as never,
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
      lengthOfStay: "",
      bangsal: ""
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
              lengthOfStay: patient.los_hari ? `${patient.los_hari} hari` : "",
              bangsal: patient.bangsal || ""
            });

            if (patient.verifikator_pelaksana && !verifikators.includes(patient.verifikator_pelaksana)) {
              setUseCustomVerifikator(true);
              setCustomVerifikator(patient.verifikator_pelaksana);
            }
            if (patient.dpjp && !dpjpOptions.includes(patient.dpjp)) {
              setUseCustomDPJP(true);
              setCustomDPJP(patient.dpjp);
            }
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

  // --- Draft autosave: jaga data tetap ada saat pindah tab/window ---
  const draftKey = `clinicalPathwayFormDraft:${mode}:${patientId ?? 'new'}`;
  const [draftRestored, setDraftRestored] = useState(false);

  // Restore draft (khusus mode create; mode edit menunggu data server selesai dimuat)
  useEffect(() => {
    if (mode === 'edit') {
      setDraftRestored(true);
      return;
    }
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const isFresh =
          typeof parsed?.savedAt === 'number' && Date.now() - parsed.savedAt < 2 * 60 * 60 * 1000;
        if (!isFresh) {
          sessionStorage.removeItem(draftKey);
          setDraftRestored(true);
          return;
        }
        if (parsed?.values) form.reset(parsed.values);
        if (parsed?.customVerifikator) setCustomVerifikator(parsed.customVerifikator);
        if (parsed?.customDPJP) setCustomDPJP(parsed.customDPJP);
        if (parsed?.useCustomVerifikator) setUseCustomVerifikator(true);
        if (parsed?.useCustomDPJP) setUseCustomDPJP(true);
      }
    } catch (e) {
      console.error('Gagal memulihkan draft form:', e);
    }
    setDraftRestored(true);
  }, [draftKey, mode, form]);

  // Simpan perubahan ke localStorage (debounce agar tidak menulis tiap keystroke)
  useEffect(() => {
    if (!draftRestored) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const subscription = form.watch((values) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          sessionStorage.setItem(
            draftKey,
            JSON.stringify({
              savedAt: Date.now(),
              values,
              customVerifikator,
              customDPJP,
              useCustomVerifikator,
              useCustomDPJP,
            })
          );
        } catch (e) {
          console.error('Gagal menyimpan draft form:', e);
        }
      }, 400);
    });

    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [
    form,
    draftKey,
    draftRestored,
    customVerifikator,
    customDPJP,
    useCustomVerifikator,
    useCustomDPJP,
  ]);

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(draftKey);
    } catch (e) {
      console.error('Gagal menghapus draft form:', e);
    }
  };



  // Pathway options dinamis: pakai tahun dari tanggal_masuk (default tahun berjalan)
  const admissionDateValue = form.watch("admissionDate");
  const admissionYear = admissionDateValue
    ? new Date(admissionDateValue).getFullYear()
    : new Date().getFullYear();
  const clinicalPathways = getPathwayOptions(admissionYear).map((opt) => opt.value);

  // Reset clinicalPathway jika nilainya tidak valid untuk tahun terpilih
  useEffect(() => {
    const current = form.getValues("clinicalPathway");
    if (current && !clinicalPathways.includes(current)) {
      form.setValue("clinicalPathway", "");
    }
  }, [admissionYear]);

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
        los_hari: losHari,
        bangsal: data.bangsal as any
      };

      let pathway;
      if (mode === 'edit' && patientId) {
        // Update existing pathway
        pathway = await updatePathway(patientId, pathwayData);
        toast({
          title: "Berhasil",
          description: "Data pasien berhasil diperbarui",
        });
        clearDraft();
        navigate('/clinical-pathway');
      } else {
        // Create new pathway
        pathway = await createPathway(pathwayData);
        
        // Store form data and pathway ID in session storage for the checklist step
        sessionStorage.setItem('clinicalPathwayFormData', JSON.stringify({
          ...data,
          pathwayId: pathway.id
        }));
        
        toast({
          title: "Berhasil",
          description: "Data pasien berhasil disimpan",
        });
        
        clearDraft();
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
            onClick={() => { clearDraft(); navigate('/clinical-pathway'); }}
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinical Pathway</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verifikator Pelaksana</FormLabel>
                        <Select
                          value={useCustomVerifikator ? "custom" : field.value}
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setUseCustomVerifikator(true);
                              field.onChange(customVerifikator);
                            } else {
                              setUseCustomVerifikator(false);
                              field.onChange(value);
                              setCustomVerifikator("");
                            }
                          }}
                        >
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
                        {useCustomVerifikator && (
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DPJP</FormLabel>
                        <Select
                          value={useCustomDPJP ? "custom" : field.value}
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setUseCustomDPJP(true);
                              field.onChange(customDPJP);
                            } else {
                              setUseCustomDPJP(false);
                              field.onChange(value);
                              setCustomDPJP("");
                            }
                          }}
                        >
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
                        {useCustomDPJP && (
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No RM</FormLabel>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Pasien / Umur</FormLabel>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Masuk RS</FormLabel>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jam Masuk RS</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="bangsal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bangsal</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Bangsal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wardOptions.map((ward) => (
                              <SelectItem key={ward} value={ward}>
                                {ward}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                 <div className="flex justify-end gap-4">
                   <Button
                     type="button"
                     variant="outline"
                     onClick={() => { clearDraft(); navigate('/clinical-pathway'); }}
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
                   <AsyncButton type="submit" isLoading={isLoading} loadingText="Menyimpan...">
                     {mode === 'edit' ? 'Simpan Perubahan' : 'Lanjut ke Checklist'}
                   </AsyncButton>
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