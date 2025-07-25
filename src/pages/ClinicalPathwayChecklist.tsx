
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FormData {
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

interface ChecklistItem {
  id: number;
  text: string;
  days: { [key: string]: boolean };
  variantNotes: string;
}

const ClinicalPathwayChecklist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [daysConfig, setDaysConfig] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch clinical pathway template
  const { data: template } = useQuery({
    queryKey: ['clinical_pathway_template', formData?.clinicalPathway],
    queryFn: async () => {
      if (!formData?.clinicalPathway) return null;
      
      const { data, error } = await supabase
        .from('clinical_pathway_templates')
        .select('*')
        .eq('pathway_type', formData.clinicalPathway)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!formData?.clinicalPathway
  });

  useEffect(() => {
    // Load form data from session storage
    const savedFormData = sessionStorage.getItem('clinicalPathwayFormData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    } else {
      // If no form data, redirect back to form
      navigate('/clinical-pathway-form');
    }
  }, [navigate]);

  useEffect(() => {
    if (template) {
      // Parse days config
      const days = Array.isArray(template.days_config) ? template.days_config : [];
      setDaysConfig(days);
      
      // Parse items config and initialize checklist
      const items = Array.isArray(template.items_config) ? template.items_config : [];
      const initialItems: ChecklistItem[] = items.map((item: string, index: number) => ({
        id: index,
        text: item,
        days: days.reduce((acc, day) => ({ ...acc, [day]: false }), {}),
        variantNotes: ''
      }));
      setChecklistItems(initialItems);
    }
  }, [template]);

  const handleCheckboxChange = (itemId: number, day: string, checked: boolean) => {
    setChecklistItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, days: { ...item.days, [day]: checked } }
          : item
      )
    );
  };

  const handleNotesChange = (itemId: number, notes: string) => {
    setChecklistItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, variantNotes: notes }
          : item
      )
    );
  };

  const calculateCompliance = () => {
    if (checklistItems.length === 0) return { cp: false, penunjang: false, terapi: false };
    
    const totalItems = checklistItems.length;
    const totalDays = daysConfig.length;
    
    // Calculate compliance based on checked items
    const checkedCount = checklistItems.reduce((acc, item) => {
      const dayCheckedCount = Object.values(item.days).filter(Boolean).length;
      return acc + (dayCheckedCount > 0 ? 1 : 0);
    }, 0);
    
    const compliancePercentage = (checkedCount / totalItems) * 100;
    
    return {
      cp: compliancePercentage >= 80,
      penunjang: compliancePercentage >= 70,
      terapi: compliancePercentage >= 75
    };
  };

  const handleSubmit = async () => {
    if (!formData || !template) return;
    
    setIsSubmitting(true);
    
    try {
      const compliance = calculateCompliance();
      const lengthOfStay = formData.lengthOfStay ? parseInt(formData.lengthOfStay) : null;
      const targetLOS = template.target_los;
      
      // Insert clinical pathway record
      const { data: clinicalPathwayData, error: cpError } = await supabase
        .from('clinical_pathways')
        .insert({
          no_rm: formData.noRM,
          patient_name_age: formData.patientNameAge,
          clinical_pathway_type: formData.clinicalPathway as "Sectio Caesaria" | "Stroke Hemoragik" | "Stroke Non Hemoragik" | "Pneumonia" | "Dengue Fever",
          verifikator: formData.verifikator,
          dpjp: formData.dpjp,
          admission_date: formData.admissionDate,
          admission_time: formData.admissionTime,
          discharge_date: formData.dischargeDate || null,
          discharge_time: formData.dischargeTime || null,
          length_of_stay: lengthOfStay,
          sesuai_target: lengthOfStay ? lengthOfStay <= targetLOS : false,
          kepatuhan_cp: compliance.cp,
          kepatuhan_penunjang: compliance.penunjang,
          kepatuhan_terapi: compliance.terapi
        })
        .select()
        .single();
      
      if (cpError) throw cpError;
      
      // Insert checklist items
      const checklistData = checklistItems.map(item => ({
        clinical_pathway_id: clinicalPathwayData.id,
        item_index: item.id,
        item_text: item.text,
        day_1: item.days['Hari ke-1'] || false,
        day_2: item.days['Hari ke-2'] || false,
        day_3: item.days['Hari ke-3'] || false,
        day_4: item.days['Hari ke-4'] || false,
        day_5: item.days['Hari ke-5'] || false,
        day_6: item.days['Hari ke-6'] || false,
        variant_notes: item.variantNotes || null
      }));
      
      const { error: checklistError } = await supabase
        .from('checklist_items')
        .insert(checklistData);
      
      if (checklistError) throw checklistError;
      
      // Clear session storage
      sessionStorage.removeItem('clinicalPathwayFormData');
      
      toast({
        title: "Berhasil!",
        description: "Data Clinical Pathway telah disimpan."
      });
      
      navigate('/clinical-pathway');
      
    } catch (error) {
      console.error('Error saving clinical pathway:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clinical-pathway-form')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Checklist Clinical Pathway: {formData.clinicalPathway}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Pasien</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No. RM</p>
                  <p className="font-mono">{formData.noRM}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama/Umur</p>
                  <p>{formData.patientNameAge}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">DPJP</p>
                  <p className="text-sm">{formData.dpjp}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verifikator</p>
                  <p className="text-sm">{formData.verifikator}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal Masuk</p>
                  <p className="text-sm">{new Date(formData.admissionDate).toLocaleDateString('id-ID')}</p>
                </div>
                {formData.dischargeDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tanggal Keluar</p>
                    <p className="text-sm">{new Date(formData.dischargeDate).toLocaleDateString('id-ID')}</p>
                  </div>
                )}
                {formData.lengthOfStay && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">LOS</p>
                    <p className="text-sm">{formData.lengthOfStay} hari</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Checklist */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Checklist Clinical Pathway</CardTitle>
              </CardHeader>
              <CardContent>
                {checklistItems.length > 0 ? (
                  <div className="space-y-6">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="border-b pb-4">
                        <h3 className="font-medium mb-3">{item.text}</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                          {daysConfig.map((day) => (
                            <div key={day} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${item.id}-${day}`}
                                checked={item.days[day] || false}
                                onCheckedChange={(checked) => 
                                  handleCheckboxChange(item.id, day, checked === true)
                                }
                              />
                              <label 
                                htmlFor={`${item.id}-${day}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {day}
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        <Textarea
                          placeholder="Keterangan varian (opsional)"
                          value={item.variantNotes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          className="mt-2"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading checklist items...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/clinical-pathway-form')}
            disabled={isSubmitting}
          >
            Kembali ke Form
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClinicalPathwayChecklist;
