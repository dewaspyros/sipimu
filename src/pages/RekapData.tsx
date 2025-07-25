
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Download } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const RekapData = () => {
  const [selectedPathway, setSelectedPathway] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Fetch monthly statistics
  const { data: monthlyStats = [] } = useQuery({
    queryKey: ['monthly_stats', selectedPathway, selectedMonth],
    queryFn: async () => {
      let query = supabase
        .from('v_monthly_stats')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (selectedPathway) {
        query = query.eq('pathway_type', selectedPathway);
      }

      if (selectedMonth) {
        query = query.eq('month', parseInt(selectedMonth));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch clinical pathways for detailed view
  const { data: clinicalPathways = [] } = useQuery({
    queryKey: ['clinical_pathways_recap', selectedPathway, selectedMonth],
    queryFn: async () => {
      let query = supabase
        .from('clinical_pathways')
        .select('*')
        .order('admission_date', { ascending: false });

      if (selectedPathway) {
        query = query.eq('clinical_pathway_type', selectedPathway);
      }

      if (selectedMonth) {
        const monthNumber = parseInt(selectedMonth);
        query = query.filter('admission_date', 'gte', `2024-${monthNumber.toString().padStart(2, '0')}-01`)
                     .filter('admission_date', 'lt', `2024-${(monthNumber + 1).toString().padStart(2, '0')}-01`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const calculateKepatuhanCP = (pathway: any) => {
    const compliance = (pathway.kepatuhan_cp ? 1 : 0) + 
                      (pathway.kepatuhan_penunjang ? 1 : 0) + 
                      (pathway.kepatuhan_terapi ? 1 : 0);
    return Math.round((compliance / 3) * 100);
  };

  // Chart data for kepatuhan terapi and penunjang
  const chartData = monthlyStats.map(item => ({
    name: `${item.pathway_type} (${item.month}/${item.year})`,
    kepatuhan_terapi: item.kepatuhan_terapi_percentage || 0,
    kepatuhan_penunjang: item.kepatuhan_penunjang_percentage || 0,
  }));

  const handleExport = () => {
    // Export functionality placeholder
    console.log('Exporting data...');
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
            <SelectTrigger className="w-48">
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
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
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
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Monthly Statistics Table */}
      <Card className="medical-card">
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
      <Card className="medical-card">
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

      {/* Grafik Kepatuhan */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Grafik Kepatuhan Terapi dan Penunjang</CardTitle>
          <CardDescription>
            Perbandingan kepatuhan terapi dan penunjang per Clinical Pathway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="kepatuhan_terapi" fill="#3b82f6" name="Kepatuhan Terapi" />
              <Bar dataKey="kepatuhan_penunjang" fill="#10b981" name="Kepatuhan Penunjang" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default RekapData;
