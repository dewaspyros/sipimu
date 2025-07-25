
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const ClinicalPathwayForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customVerifikator, setCustomVerifikator] = useState("");
  const [customDPJP, setCustomDPJP] = useState("");
  
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

  // Fetch verifikators from database
  const { data: verifikators = [] } = useQuery({
    queryKey: ['verifikators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verifikators')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch DPJP doctors from database
  const { data: dpjpDoctors = [] } = useQuery({
    queryKey: ['dpjp_doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dpjp_doctors')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch clinical pathway templates
  const { data: clinicalPathways = [] } = useQuery({
    queryKey: ['clinical_pathway_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinical_pathway_templates')
        .select('*')
        .order('pathway_type');
      
      if (error) throw error;
      return data;
    }
  });

  const onSubmit = (data: PatientFormData) => {
    // Store form data in session storage for the next step
    sessionStorage.setItem('clinicalPathwayFormData', JSON.stringify(data));
    navigate('/clinical-pathway-checklist');
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
          <h1 className="text-2xl font-bold">Form Identitas Pasien Clinical Pathway</h1>
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
                              <SelectItem key={pathway.id} value={pathway.pathway_type}>
                                {pathway.pathway_type}
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
                              <SelectItem key={verifikator.id} value={verifikator.name}>
                                {verifikator.name}
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
                            {dpjpDoctors.map((dpjp) => (
                              <SelectItem key={dpjp.id} value={dpjp.name}>
                                {dpjp.name}
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
                  <Button type="submit">
                    Lanjut ke Checklist
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
