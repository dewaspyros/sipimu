import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Download } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const RekapData = () => {
  const [selectedPathway, setSelectedPathway] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Fetch monthly statistics
  const { data: monthlyStats = [] } = useQuery({
    queryKey: ['monthly-stats', selectedPathway, selectedMonth],
    queryFn: async () => {
      let query = supabase.from('v_monthly_stats').select('*');
      
      if (selectedPathway !== 'all') {
        query = query.eq('pathway_type', selectedPathway as any);
      }
      
      if (selectedMonth !== 'all') {
        const [year, month] = selectedMonth.split('-');
        query = query.eq('year', parseInt(year)).eq('month', parseInt(month));
      }
      
      const { data, error } = await query.order('year', { ascending: false }).order('month', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch clinical pathways data
  const { data: clinicalPathways = [] } = useQuery({
    queryKey: ['clinical-pathways', selectedPathway],
    queryFn: async () => {
      let query = supabase.from('clinical_pathways').select('*');
      
      if (selectedPathway !== 'all') {
        query = query.eq('clinical_pathway_type', selectedPathway as any);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate kepatuhan percentage
  const calculateKepatuhanCP = (pathway: any) => {
    const total = 3; // kepatuhan_cp, kepatuhan_penunjang, kepatuhan_terapi
    const kepatuhan = [
      pathway.kepatuhan_cp,
      pathway.kepatuhan_penunjang, 
      pathway.kepatuhan_terapi
    ].filter(Boolean).length;
    return Math.round((kepatuhan / total) * 100);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export data:', monthlyStats);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Rekap Data</h1>
          <p className="text-muted-foreground">
            Rekap data Clinical Pathways bulanan
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedPathway} onValueChange={setSelectedPathway}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih Clinical Pathway" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Pathway</SelectItem>
              <SelectItem value="Sectio Caesaria">Sectio Caesaria</SelectItem>
              <SelectItem value="Stroke Hemoragik">Stroke Hemoragik</SelectItem>
              <SelectItem value="Stroke Non Hemoragik">Stroke Non Hemoragik</SelectItem>
              <SelectItem value="Pneumonia">Pneumonia</SelectItem>
              <SelectItem value="Dengue Fever">Dengue Fever</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bulan</SelectItem>
              <SelectItem value="2024-01">Januari 2024</SelectItem>
              <SelectItem value="2024-02">Februari 2024</SelectItem>
              <SelectItem value="2024-03">Maret 2024</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Monthly Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rekap Data Bulanan</CardTitle>
          <CardDescription>
            Statistik Clinical Pathways per bulan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Bulan/Tahun</th>
                  <th className="text-left p-4">Jenis CP</th>
                  <th className="text-left p-4">Total Pasien</th>
                  <th className="text-left p-4">Sesuai Target</th>
                  <th className="text-left p-4">Kepatuhan CP</th>
                  <th className="text-left p-4">Kepatuhan Penunjang</th>
                  <th className="text-left p-4">Kepatuhan Terapi</th>
                  <th className="text-left p-4">Avg LOS</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{item.month}/{item.year}</td>
                    <td className="p-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                        {item.pathway_type}
                      </span>
                    </td>
                    <td className="p-4">{item.total_patients}</td>
                    <td className="p-4">{item.sesuai_target_percentage}%</td>
                    <td className="p-4">{item.kepatuhan_cp_percentage}%</td>
                    <td className="p-4">{item.kepatuhan_penunjang_percentage}%</td>
                    <td className="p-4">{item.kepatuhan_terapi_percentage}%</td>
                    <td className="p-4">{item.avg_los}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Patient Data */}
      <Card>
        <CardHeader>
          <CardTitle>Data Detail Pasien</CardTitle>
          <CardDescription>
            Detail data pasien Clinical Pathways
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">No. RM</th>
                  <th className="text-left p-4">Nama/Umur</th>
                  <th className="text-left p-4">Jenis CP</th>
                  <th className="text-left p-4">Tanggal Masuk</th>
                  <th className="text-left p-4">Tanggal Keluar</th>
                  <th className="text-left p-4">LOS</th>
                  <th className="text-left p-4">Sesuai Target</th>
                  <th className="text-left p-4">Kepatuhan CP</th>
                </tr>
              </thead>
              <tbody>
                {clinicalPathways.map((pathway) => (
                  <tr key={pathway.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono">{pathway.no_rm}</td>
                    <td className="p-4">{pathway.patient_name_age}</td>
                    <td className="p-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                        {pathway.clinical_pathway_type}
                      </span>
                    </td>
                    <td className="p-4">{new Date(pathway.admission_date).toLocaleDateString('id-ID')}</td>
                    <td className="p-4">{pathway.discharge_date ? new Date(pathway.discharge_date).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="p-4">{pathway.length_of_stay || 0} hari</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        pathway.sesuai_target 
                          ? 'bg-success/10 text-success' 
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {pathway.sesuai_target ? 'Ya' : 'Tidak'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        calculateKepatuhanCP(pathway) >= 80 
                          ? 'bg-success/10 text-success' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {calculateKepatuhanCP(pathway)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RekapData;