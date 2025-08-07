import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChecklist, useClinicalPathways } from "@/hooks/useClinicalPathways";

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
  pathwayId?: string;
}

interface ChecklistItem {
  id: string;
  text: string;
}

interface ChecklistData {
  [key: string]: {
    [day: string]: boolean;
  };
}

interface VariantData {
  [key: string]: string;
}

const pathwayConfigs = {
  "Sectio Caesaria": {
    days: ["Hari ke-1", "Hari ke-2", "Hari ke-3", "Hari ke-4"],
    items: [
      "Assesmen Awal Dokter IGD",
      "Assesmen Awal Dokter Spesialis",
      "Assesmen Awal Keperawatan",
      "PENUNJANG :",
      "Darah Rutin",
      "Ureum Creatinin",
      "SGOT SGPT",
      "GDS",
      "Triple Eliminasi (HbsAg, HIV, PT aPTT)",
      "Elektrolit (sesuai indikasi)",
      "Protein urine (sesuai indikasi)",
      "Thorax AP (sesuai indikasi)",
      "EKG (sesuai indikasi)",
      "USG Obstetri (sesuai indikasi)",
      "KONSULTASI :",
      "Spesialis Anestesi",
      "Spesialis Penyakit Dalam (sesuai indikasi)",
      "ASSESMEN LANJUTAN :",
      "DPJP",
      "Dokter Bangsal",
      "Perawat Penanggung Jawab",
      "Ahli Gizi",
      "Farmasi Klinis",
      "TERAPI/ MEDIKAMENTOSA :",
      "Infus RL / NaCl 0.9% / Asering",
      "Inj cefotaxime 1 gr profilaksis, lanjut 2x1 gram",
      "Inj ampicilin (alternatif)",
      "Uterotonika ( Inj oxytocin 1 amp & Inj metergin 1 amp)",
      "Inj ketorolac",
      "Inj dexamethasone (sesuai indikasi)",
      "Inj asam tranexamat (sesuai indikasi)",
      "Infus metronidazole 3x1 gr (bila post SC AL > 20.000)",
      "Infus paracetamol 3x1 gr (sesuai indikasi)",
      "Inj furamin (jika 24 jam post SC belum flatus)",
      "Inj omeprazole (sesuai indikasi)",
      "OBAT ORAL",
      "Cefixime 2 x 200 mg",
      "Misoprostol (sesuai indikasi)",
      "Ibuprofen 2x1 (alternatif)",
      "Asam Mefenamat 3 x 500 mg (alternatif)",
      "Parasetamol 3 x 500 mg (alternatif)",
      "Ketoprofen (alternatif)",
      "Methergin 3x1 (sesuai indikasi)",
      "Asam Traneksamat (sesuai indikasi)",
      "Amoxicillin 3x1 (alternatif)",
      "Promavit / Etabion 1x1",
      "SF 1x1",
      "Metronidazole 3x1 (bila post SC AL > 20.000)",
      "TATA LAKSANA :",
      "Medis : Sectio Caesaria",
      "Keperawatan : Manajemen Nyeri"
    ],
    explanation: `Keterangan Terapi
1. Antibiotik Profilaksis. Profilaksis digunakan jika leukosit > 10.000. Diberikan 15 s/d 60 menit sebelum incisi. Dilanjutkan 2x24 jam jika AL post OP >10.000
2. Antibiotik Injeksi. Infus metronidazole diberikan, jika post SC AL > 20.000
3. Furamin injeksi, diberikan bila post SC belum flatus`
  },
  "Pneumonia": {
    days: ["Hari ke-1", "Hari ke-2", "Hari ke-3", "Hari ke-4", "Hari ke-5"],
    items: [
      "Assesmen Awal Medis Dokter IGD",
      "Assesmen Awal Medis Dokter Spesialis",
      "Assesmen Awal Keperawatan",
      "PENUNJANG :",
      "Darah Rutin",
      "Ureum Creatinin",
      "SGOT SGPT",
      "Elektrolit",
      "GDS",
      "AGD (sesuai indikasi)",
      "Sputum Gram",
      "Kultur darah (sesuai indikasi)",
      "Thorax PA",
      "EKG (sesuai indikasi)",
      "KONSULTASI",
      "Sp.JP",
      "Sp.KFR",
      "ASSESMEN LANJUTAN :",
      "DPJP",
      "Dokter Bangsal",
      "Perawat Penanggung Jawab",
      "Fisioterapi",
      "Ahli Gizi",
      "Farmasi Klinis",
      "TERAPI/ MEDIKAMENTOSA :",
      "Suplementasi Oksigen",
      "Infus NaCl 0.9%/RL/Dektrosa",
      "Inj levofloxacin 1x750 mg (Pilihan lain, sesuai PPK)",
      "Inj proton pump inhibitor (tidak wajib)",
      "Inj ondansetron (tidak wajib)",
      "Inj dexamethason (Pilihan lain, methylprednislon) (tidak wajib)",
      "Inj solvinex (sesuai indikasi)",
      "Infus paracetamol (sesuai indikasi)",
      "Inj aminofilin drip (sesuai indikasi)",
      "OBAT ORAL",
      "Mukolitik",
      "Azitromicin 1x500 mg (Pilhan lain, levofloxacin 1x750 mg)",
      "Methilpredinisolon 2x1",
      "Teofilin 1x1 tab",
      "Teosal 3x1",
      "Antihistamin",
      "Roborantia",
      "TATA LAKSANA :",
      "Nebulisasi ventolin : pulmicort",
      "Outcome terpenuhi"
    ],
    explanation: `1. Antibiotik Injeksi. Pilihan lain, Inj. β laktam (sefotaksim, seftriakson atau ampisilin sulbaktam) ditambah azitromicin atau levofloxacin. Atau, meropenem ditambah levofloxacin Atau, meropenem ditambah gentamycin dan azitromicin Atau, meropenem ditambah gentamycin dan levofloxacin Atau, jika pasien dengan faktor resiko pdeudomonas diberikan antibiotik Inj ciprofloxacin 2x200 mg atau Inj ceftazidim 2x1 gr
2. PPI/H2Blocker. Pilhan lain, Inj. Ranitidine 2x50 mg
3. Anti Emetik. Pilhan lain, Inj. metoclorpramide 3x1 amp
4. Kortikosteroid. Pilhan lain, Inj. methylprednisolon
5. Mukolitik. Pilihan, Ambroxol, Acetylsistein, Erdostein
6. Antibotik Oral. Pilihan lain, Levofloxacin 1x750 mg
7. Antihistamin. Pilihan, Cetirizine, loratadine, ciproheptadine
Outcome. Bebas demam 1x24 jam tanpa antipiretik, Frekuensi jantung < 100/menit, Frekuensi napas < 24/ menit, Tekanan darah sistolik > 90 mmHg dan < 140 mmHg, Saturasi oksigen > 90%, Bisa makan peroral`
  },
  "Stroke Non Hemoragik": {
    days: ["Hari ke-1", "Hari ke-2", "Hari ke-3", "Hari ke-4", "Hari ke-5", "Hari ke-6"],
    items: [
      "Assesmen Awal Medis Dokter IGD",
      "Assesmen Awal Medis Dokter Spesialis",
      "Assesmen Awal Keperawatan",
      "PENUNJANG :",
      "Darah Rutin",
      "Ureum Creatinin",
      "Elektrolit",
      "GDS",
      "Profil Lipid",
      "Urine Rutin (sesuai indikasi)",
      "Thorax PA",
      "EKG",
      "CT Scan Kepala Non-Kontras",
      "KONSULTASI (sesuai indikasi)",
      "Sp,PD",
      "Sp.JP",
      "Sp.P",
      "Sp.KFR",
      "ASSESMEN LANJUTAN :",
      "DPJP",
      "Dokter Bangsal",
      "Perawat Penanggung Jawab",
      "Fisioterapi",
      "Ahli Gizi",
      "Farmasi Klinis",
      "TERAPI/ MEDIKAMENTOSA :",
      "Suplementasi Oksigen",
      "Infus NaCl 0.9%/RL/Asering",
      "Resfar drip",
      "Anti hipertensi (sesuai indikasi)",
      "Inj neuroprotektor : Inj Citicolin 1x500 mg",
      "Inj proton pump inhibitor (sesuai indikasi)",
      "Inj anti konvulsi (sesuai indikasi)",
      "Inj antikoagulan (sesuai indikasi)",
      "Osmoterapi (sesuai indikasi)",
      "OBAT ORAL",
      "Antihipertensi (sesuai indikasi)",
      "Antiplatelet",
      "Anti koagulan (sesuai indikasi)",
      "Asam folat 1 mg/12 jam",
      "Anti kolesterol (sesuai indikasi)"
    ],
    explanation: `1. Antihipertensi Injeksi. Dimulai dari 5mg per jam jika TDS >200mmHg ATAU TDS >180mmHg dengan tanda peningkatan TIK. Target penurunan MAP 15%.
2. Neuroprotektor. Inj piracetam 3gr/8jam bisa diberikan jika pasien terdapat aphasia
3. PPI. Hanya jika terdapat stress ulcer
4. Anti konvulsi. Jika terdapat akut simtomatik seizure. Pilihan, Inj. Phenitoin 100mg/12 jam atau Inj. Diazepam 5mg IV bolus pelan
5. Osmoterapi. Inf Manitol 0,25-0,5gr/kgBB diulangi tiap 6 jam tappering off per hari
6. Antiplatelet. Aspirin dosis awal 160-320mg dalam 24-48 jam setelah onset dilanjutkan 80mg per hari. Clopidogrel 75mg per hari.
7. Anti koagulan oral. Pada pasien dengan riwayat fibrilasi atrium, antikoagulan oral dapat dimulai 4-14 hari setelah onset
8. Anti kolesterol. Jika didapatkan bukti dislipidemia berdasarkan laboratorium.`
  },
  "Stroke Hemoragik": {
    days: ["Hari ke-1", "Hari ke-2", "Hari ke-3", "Hari ke-4", "Hari ke-5", "Hari ke-6"],
    items: [
      "Assesmen Awal Medis Dokter IGD",
      "Assesmen Awal Medis Dokter Spesialis",
      "Assesmen Awal Keperawatan",
      "PENUNJANG :",
      "Darah Rutin",
      "Ureum Creatinin",
      "Elektrolit",
      "PT, aPTT, INR",
      "GDS",
      "Urine Rutin (sesuai indikasi)",
      "Thorax PA",
      "EKG",
      "CT Scan Kepala Non-Kontras",
      "KONSULTASI (sesuai indikasi)",
      "Sp,PD",
      "Sp.JP",
      "Sp.P",
      "Sp.KFR",
      "ASSESMEN LANJUTAN :",
      "DPJP",
      "Dokter Bangsal",
      "Perawat Penanggung Jawab",
      "Fisioterapi",
      "Ahli Gizi",
      "Farmasi Klinis",
      "TERAPI/ MEDIKAMENTOSA :",
      "Suplementasi Oksigen",
      "Infus NaCl 0.9%/RL/Asering",
      "Anti hipertensi (sesuai indikasi)",
      "Inj neuroprotektor : Inj Citicolin 1x500 mg",
      "Inj proton pump inhibitor (sesuai indikasi)",
      "Inj anti konvulsi (sesuai indikasi)",
      "Inj. Asam tranexamat 3-4 x 500 mg",
      "Osmoterapi (sesuai indikasi)",
      "OBAT ORAL",
      "Anti hipertensi tab (sesuai indikasi)",
      "Nimodipin 6x60 mg (sesuai indikasi)"
    ],
    explanation: `1. Antihipertensi Injeksi. Dimulai dari 5mg per jam jika TDS >200mmHg ATAU TDS >180mmHg dengan tanda peningkatan TIK. Target penurunan < TD: 140/90 mmHg, dosis nicardipine dapat ditingkatkan dosis bertahap 2,5 mg per jam, diberikan maksimal 15mg per jam.
2. Neuroprotektor. Inj piracetam 3gr/8jam bisa diberikan jika pasien terdapat aphasia
3. PPI. Hanya jika terdapat stress ulcer
4. Anti konvulsi. Jika terdapat akut simtomatik seizure. Pilihan, Inj. Phenitoin 100mg/12 jam atau Inj. Diazepam 5mg IV bolus pelan
5. Osmoterapi. Inf Manitol 0,25-0,5gr/kgBB diulangi tiap 6 jam tappering off per hari. Diberikan jika ureum dan kreatinin baik.
6. Nimodipine, dimulai dalam 96 jam dan diberikan selama 21 hari. Diberikan pada pasien dengan SAH.`
  }
};

const ClinicalPathwayChecklist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { saveChecklist, loading: checklistLoading, getChecklistByPathwayId } = useChecklist();
  const { pathways, loading: pathwaysLoading } = useClinicalPathways();
  const [patientData, setPatientData] = useState<PatientFormData | null>(null);
  const [checklistData, setChecklistData] = useState<ChecklistData>({});
  const [variantData, setVariantData] = useState<VariantData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const pathwayId = searchParams.get('id');
  const mode = searchParams.get('mode') || 'edit'; // 'view' or 'edit'
  const isReadOnly = mode === 'view';

  console.log('ClinicalPathwayChecklist - Debug Info:', {
    pathwayId,
    mode,
    isReadOnly,
    pathwaysCount: pathways.length,
    pathwaysLoading,
    patientData: patientData?.noRM
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if coming from form (session storage)
        const storedData = sessionStorage.getItem('clinicalPathwayFormData');
        if (storedData && !pathwayId) {
          setPatientData(JSON.parse(storedData));
          setIsLoading(false);
          return;
        }
        
        // If no pathwayId, redirect
        if (!pathwayId) {
          navigate('/clinical-pathway');
          return;
        }
        
        // Wait for pathways to load if needed
        if (pathwaysLoading) {
          return;
        }
        
        // Find pathway data
        const pathway = pathways.find(p => p.id === pathwayId);
        if (!pathway) {
          setError(`Pathway dengan ID ${pathwayId} tidak ditemukan`);
          toast({
            title: "Error",
            description: "Data clinical pathway tidak ditemukan",
            variant: "destructive"
          });
          setTimeout(() => navigate('/clinical-pathway'), 2000);
          return;
        }
        
        const patientInfo = {
          clinicalPathway: pathway.jenis_clinical_pathway,
          verifikator: pathway.verifikator_pelaksana || '',
          dpjp: pathway.dpjp || '',
          noRM: pathway.no_rm,
          patientNameAge: pathway.nama_pasien,
          admissionDate: pathway.tanggal_masuk,
          admissionTime: pathway.jam_masuk,
          dischargeDate: pathway.tanggal_keluar || undefined,
          dischargeTime: pathway.jam_keluar || undefined,
          lengthOfStay: pathway.los_hari?.toString() || undefined,
          pathwayId: pathway.id
        };
        
        setPatientData(patientInfo);
        
        // Load existing checklist data in parallel
        try {
          const existingChecklist = await getChecklistByPathwayId(pathwayId);
          if (existingChecklist && existingChecklist.length > 0) {
            const checklistMap: ChecklistData = {};
            const variantMap: VariantData = {};
            
            existingChecklist.forEach((item, index) => {
              checklistMap[index.toString()] = {
                'Hari ke-1': item.checklist_hari_1 || false,
                'Hari ke-2': item.checklist_hari_2 || false,
                'Hari ke-3': item.checklist_hari_3 || false,
                'Hari ke-4': item.checklist_hari_4 || false,
                'Hari ke-5': item.checklist_hari_5 || false,
                'Hari ke-6': item.checklist_hari_6 || false,
              };
            });
            
            setChecklistData(checklistMap);
            setVariantData(variantMap);
          }
        } catch (error) {
          console.error('Error loading checklist:', error);
          toast({
            title: "Warning",
            description: "Gagal memuat data checklist yang ada, dimulai dengan checklist kosong",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error in loadData:', error);
        setError('Terjadi kesalahan saat memuat data');
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat memuat data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [pathwayId, pathwaysLoading, pathways.length]); // Simplified dependencies

  // Single loading state check
  if (isLoading || (pathwayId && pathwaysLoading)) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
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
            <h1 className="text-2xl font-bold">Error</h1>
          </div>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">Terjadi Kesalahan</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/clinical-pathway')}
                >
                  Kembali ke Daftar Clinical Pathway
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if we have patient data
  if (!patientData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">Data Tidak Ditemukan</h3>
                <p className="text-muted-foreground">Data pasien tidak dapat dimuat</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/clinical-pathway')}
                >
                  Kembali ke Daftar Clinical Pathway
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const config = pathwayConfigs[patientData.clinicalPathway as keyof typeof pathwayConfigs];
  if (!config) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">Clinical Pathway Tidak Ditemukan</h3>
                <p className="text-muted-foreground">
                  Konfigurasi untuk "{patientData.clinicalPathway}" tidak tersedia
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/clinical-pathway')}
                >
                  Kembali ke Daftar Clinical Pathway
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleCheckboxChange = (itemIndex: string, day: string, checked: boolean) => {
    if (isReadOnly) return; // Prevent changes in view mode
    
    setChecklistData(prev => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        [day]: checked
      }
    }));
  };

  const handleVariantChange = (itemIndex: string, value: string) => {
    setVariantData(prev => ({
      ...prev,
      [itemIndex]: value
    }));
  };

  const handleSubmit = async () => {
    if (!patientData?.pathwayId) {
      toast({
        title: "Error",
        description: "ID pathway tidak ditemukan",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare checklist items for saving
      const checklistItems = config.items.map((item, index) => ({
        text: item,
        day1: checklistData[index.toString()]?.['Hari ke-1'] || false,
        day2: checklistData[index.toString()]?.['Hari ke-2'] || false,
        day3: checklistData[index.toString()]?.['Hari ke-3'] || false,
        day4: checklistData[index.toString()]?.['Hari ke-4'] || false,
        day5: checklistData[index.toString()]?.['Hari ke-5'] || false,
        day6: checklistData[index.toString()]?.['Hari ke-6'] || false,
        variant: variantData[index.toString()] || ''
      }));

      await saveChecklist(patientData.pathwayId, checklistItems);
      
      sessionStorage.removeItem('clinicalPathwayFormData');
      navigate('/clinical-pathway');
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(pathwayId ? '/clinical-pathway' : '/clinical-pathway-form')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">
            {isReadOnly ? 'Detail' : 'Checklist'} {patientData.clinicalPathway}
          </h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informasi Pasien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><strong>No RM:</strong> {patientData.noRM}</div>
              <div><strong>Nama/Umur:</strong> {patientData.patientNameAge}</div>
              <div><strong>Verifikator:</strong> {patientData.verifikator}</div>
              <div><strong>DPJP:</strong> {patientData.dpjp}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Checklist Clinical Pathway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left min-w-[300px]">Kriteria</th>
                    {config.days.map((day) => (
                      <th key={day} className="border border-border p-3 text-center min-w-[100px]">
                        {day}
                      </th>
                    ))}
                    <th className="border border-border p-3 text-left min-w-[200px]">Keterangan (Varian)</th>
                  </tr>
                </thead>
                <tbody>
                  {config.items.map((item, index) => {
                    const itemKey = index.toString();
                    const isHeader = item.includes(':') || item === 'PENUNJANG :' || item === 'KONSULTASI' || item === 'ASSESMEN LANJUTAN :' || item === 'TERAPI/ MEDIKAMENTOSA :' || item === 'OBAT ORAL' || item === 'TATA LAKSANA :';
                    
                    return (
                      <tr key={index} className={isHeader ? "bg-muted/50" : ""}>
                        <td className={`border border-border p-3 ${isHeader ? 'font-semibold' : ''}`}>
                          {item}
                        </td>
                        {config.days.map((day) => (
                          <td key={day} className="border border-border p-3 text-center">
                            {!isHeader && (
                              <Checkbox
                                checked={checklistData[itemKey]?.[day] || false}
                                onCheckedChange={isReadOnly ? undefined : (checked) => 
                                  handleCheckboxChange(itemKey, day, checked as boolean)
                                }
                                disabled={isReadOnly}
                              />
                            )}
                          </td>
                        ))}
                        <td className="border border-border p-3">
                          {!isHeader && (
                            <Input
                              value={variantData[itemKey] || ''}
                              onChange={isReadOnly ? undefined : (e) => handleVariantChange(itemKey, e.target.value)}
                              placeholder="Keterangan varian"
                              className="text-sm"
                              readOnly={isReadOnly}
                              disabled={isReadOnly}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Keterangan</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={config.explanation}
              readOnly
              className="min-h-[200px] text-sm"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(pathwayId ? '/clinical-pathway' : '/clinical-pathway-form')}
          >
            Kembali
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSubmit} disabled={checklistLoading}>
              {checklistLoading ? "Menyimpan..." : "Kirim Data"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalPathwayChecklist;