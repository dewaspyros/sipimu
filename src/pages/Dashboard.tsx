import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Activity, Users, TrendingUp, Clock, Target, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [selectedPathway, setSelectedPathway] = useState<string>("all");

  // Fetch dashboard statistics
  const { data: dashboardStats = [] } = useQuery({
    queryKey: ['dashboard_stats', selectedPathway, selectedMonth],
    queryFn: async () => {
      let query = supabase
        .from('v_monthly_stats')
        .select('*');

      if (selectedPathway !== 'all') {
        query = query.eq('pathway_type', selectedPathway as any);
      }
      if (selectedMonth) {
        query = query.eq('month', parseInt(selectedMonth));
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch pathway compliance data
  const { data: pathwayCompliance = [] } = useQuery({
    queryKey: ['pathway-compliance'],
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

  // Prepare chart data for LOS, CP and Avg LOS (using monthly stats)
  const chartData1 = dashboardStats.map(item => ({
    month: `${item.month}/${item.year}`,
    los_compliance: Number((item.sesuai_target_percentage || 0).toFixed(1)),
    cp_compliance: Number((item.kepatuhan_cp_percentage || 0).toFixed(1)),
    avg_los: Number((item.avg_los || 0).toFixed(1))
  }));

  // Prepare chart data for therapy and support compliance
  const chartData2 = dashboardStats.map(item => ({
    month: `${item.month}/${item.year}`,
    terapi_compliance: Number((item.kepatuhan_terapi_percentage || 0).toFixed(1)),
    penunjang_compliance: Number((item.kepatuhan_penunjang_percentage || 0).toFixed(1))
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang di sistem Clinical Pathways RS PKU Muhammadiyah Wonosobo
          </p>
        </div>
        <div className="space-y-4">
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
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pasien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregatedStats.totalPatients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan LOS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSesuaiTarget}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepatuhan CP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgKepatuhanCP}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata LOS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLOS} hari</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Grafik Kepatuhan LOS, CP dan Avg LOS</CardTitle>
            <p className="text-sm text-muted-foreground">
              Persentase kepatuhan dan rata-rata LOS per bulan dalam 1 tahun
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                los_compliance: {
                  label: "Kepatuhan LOS (%)",
                  color: "hsl(var(--chart-1))",
                },
                cp_compliance: {
                  label: "Kepatuhan CP (%)", 
                  color: "hsl(var(--chart-2))",
                },
                avg_los: {
                  label: "Rata-rata LOS (hari)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-80"
            >
              <ComposedChart
                data={chartData1}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" domain={[0, 100]} label={{ value: 'Persentase (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 6]} label={{ value: 'LOS (hari)', angle: 90, position: 'insideRight' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar yAxisId="left" dataKey="los_compliance" fill="var(--color-los_compliance)" />
                <Bar yAxisId="left" dataKey="cp_compliance" fill="var(--color-cp_compliance)" />
                <Line yAxisId="right" type="monotone" dataKey="avg_los" stroke="var(--color-avg_los)" strokeWidth={3} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Grafik Kepatuhan Komponen CP</CardTitle>
            <p className="text-sm text-muted-foreground">
              Persentase kepatuhan terapi dan penunjang per bulan (Target 75% ke atas)
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                terapi_compliance: {
                  label: "Kepatuhan Terapi (%)",
                  color: "hsl(var(--chart-1))",
                },
                penunjang_compliance: {
                  label: "Kepatuhan Penunjang (%)", 
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-80"
            >
              <BarChart
                data={chartData2}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[0, 100]} label={{ value: 'Persentase (%)', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="terapi_compliance" fill="var(--color-terapi_compliance)" />
                <Bar dataKey="penunjang_compliance" fill="var(--color-penunjang_compliance)" />
                <ReferenceLine y={75} stroke="red" strokeDasharray="5 5" label="Target 75%" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;