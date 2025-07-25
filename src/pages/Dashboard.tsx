
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, TrendingUp, Clock, Target, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [selectedPathway, setSelectedPathway] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Fetch dashboard statistics
  const { data: dashboardStats = [] } = useQuery({
    queryKey: ['dashboard_stats', selectedPathway, selectedMonth],
    queryFn: async () => {
      let query = supabase
        .from('v_monthly_stats')
        .select('*');

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

  // Fetch pathway compliance data
  const { data: pathwayCompliance = [] } = useQuery({
    queryKey: ['pathway_compliance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_pathway_compliance')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate aggregated statistics
  const aggregatedStats = dashboardStats.reduce((acc, curr) => {
    acc.totalPatients += curr.total_patients || 0;
    acc.totalSesuaiTarget += ((curr.sesuai_target_percentage || 0) * curr.total_patients) / 100;
    acc.totalKepatuhanCP += ((curr.kepatuhan_cp_percentage || 0) * curr.total_patients) / 100;
    acc.totalKepatuhanPenunjang += ((curr.kepatuhan_penunjang_percentage || 0) * curr.total_patients) / 100;
    acc.totalKepatuhanTerapi += ((curr.kepatuhan_terapi_percentage || 0) * curr.total_patients) / 100;
    acc.totalAvgLOS += (curr.avg_los || 0) * curr.total_patients;
    return acc;
  }, {
    totalPatients: 0,
    totalSesuaiTarget: 0,
    totalKepatuhanCP: 0,
    totalKepatuhanPenunjang: 0,
    totalKepatuhanTerapi: 0,
    totalAvgLOS: 0
  });

  const avgSesuaiTarget = aggregatedStats.totalPatients > 0 ? (aggregatedStats.totalSesuaiTarget / aggregatedStats.totalPatients * 100).toFixed(1) : '0';
  const avgKepatuhanCP = aggregatedStats.totalPatients > 0 ? (aggregatedStats.totalKepatuhanCP / aggregatedStats.totalPatients * 100).toFixed(1) : '0';
  const avgKepatuhanPenunjang = aggregatedStats.totalPatients > 0 ? (aggregatedStats.totalKepatuhanPenunjang / aggregatedStats.totalPatients * 100).toFixed(1) : '0';
  const avgKepatuhanTerapi = aggregatedStats.totalPatients > 0 ? (aggregatedStats.totalKepatuhanTerapi / aggregatedStats.totalPatients * 100).toFixed(1) : '0';
  const avgLOS = aggregatedStats.totalPatients > 0 ? (aggregatedStats.totalAvgLOS / aggregatedStats.totalPatients).toFixed(1) : '0';

  // Chart data for kepatuhan
  const kepatuhanData = pathwayCompliance.map(item => ({
    name: item.clinical_pathway_type,
    kepatuhan_terapi: item.kepatuhan_terapi_count ? ((item.kepatuhan_terapi_count / item.total_patients) * 100).toFixed(1) : 0,
    kepatuhan_penunjang: item.kepatuhan_penunjang_count ? ((item.kepatuhan_penunjang_count / item.total_patients) * 100).toFixed(1) : 0,
  }));

  // Pie chart data for compliance
  const complianceData = [
    { name: 'Kepatuhan CP', value: parseFloat(avgKepatuhanCP), color: '#3b82f6' },
    { name: 'Kepatuhan Penunjang', value: parseFloat(avgKepatuhanPenunjang), color: '#10b981' },
    { name: 'Kepatuhan Terapi', value: parseFloat(avgKepatuhanTerapi), color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang di sistem Clinical Pathways RS PKU Muhammadiyah Wonosobo
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedPathway} onValueChange={setSelectedPathway}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih Clinical Pathway" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Pathway</SelectItem>
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
              <SelectItem value="">Semua</SelectItem>
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
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pasien</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregatedStats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Total pasien Clinical Pathway
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesuai Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSesuaiTarget}%</div>
            <p className="text-xs text-muted-foreground">
              Persentase sesuai target LOS
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan CP</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgKepatuhanCP}%</div>
            <p className="text-xs text-muted-foreground">
              Persentase kepatuhan Clinical Pathway
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan Penunjang</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgKepatuhanPenunjang}%</div>
            <p className="text-xs text-muted-foreground">
              Persentase kepatuhan penunjang
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan Terapi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgKepatuhanTerapi}%</div>
            <p className="text-xs text-muted-foreground">
              Persentase kepatuhan terapi
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg LOS</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLOS}</div>
            <p className="text-xs text-muted-foreground">
              Rata-rata Length of Stay (hari)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Grafik Kepatuhan Terapi dan Penunjang</CardTitle>
            <CardDescription>
              Perbandingan kepatuhan terapi dan penunjang per Clinical Pathway
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kepatuhanData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kepatuhan_terapi" fill="#3b82f6" name="Kepatuhan Terapi" />
                <Bar dataKey="kepatuhan_penunjang" fill="#10b981" name="Kepatuhan Penunjang" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Distribusi Kepatuhan</CardTitle>
            <CardDescription>
              Persentase kepatuhan secara keseluruhan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
