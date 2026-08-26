import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useComplianceData } from './useComplianceData';

export interface RekapDataItem {
  id: string;
  no: number;
  namaPasien: string;
  noRM: string;
  tanggalMasuk: string;
  jamMasuk: string;
  tanggalKeluar: string | null;
  jamKeluar: string | null;
  diagnosis: string;
  los: number | null;
  sesuaiTarget: boolean;
  kepatuhanCP: boolean;
  kepatuhanPenunjang: boolean;
  kepatuhanTerapi: boolean;
  dpjp: string;
  verifikatorPelaksana: string;
  keterangan: string | null;
  /** Pre-parsed dari tanggalMasuk agar agregasi tidak perlu new Date() berulang. */
  tahunMasuk: number;
  bulanMasuk: number;
}

const PATHWAY_SELECT = `
  id,
  nama_pasien,
  no_rm,
  tanggal_masuk,
  jam_masuk,
  tanggal_keluar,
  jam_keluar,
  jenis_clinical_pathway,
  los_hari,
  dpjp,
  verifikator_pelaksana,
  bangsal,
  keterangan,
  compliance_data (
    kepatuhan_cp,
    kepatuhan_penunjang,
    kepatuhan_terapi,
    sesuai_target
  )
`;

const MAX_ROWS = 20000;
const STALE_TIME = 5 * 60 * 1000;

const TARGET_LOS_MAP: Record<string, number> = {
  'Sectio Caesaria': 2,
  Pneumonia: 6,
  'Intracranial Hemorrhagia': 6,
  'Stroke Hemoragik': 5,
  'Stroke Non Hemoragik': 5,
  'Dengue Fever': 3,
  'Post Partum Hemorrhagia': 3,
};

export const getTargetLOS = (diagnosis: string): number => TARGET_LOS_MAP[diagnosis] ?? 2;

type PathwayRow = {
  id: string;
  nama_pasien: string;
  no_rm: string;
  tanggal_masuk: string;
  jam_masuk: string;
  tanggal_keluar: string | null;
  jam_keluar: string | null;
  jenis_clinical_pathway: string;
  los_hari: number | null;
  dpjp: string | null;
  verifikator_pelaksana: string | null;
  keterangan: string | null;
  compliance_data:
    | {
        kepatuhan_cp: boolean | null;
        kepatuhan_penunjang: boolean | null;
        kepatuhan_terapi: boolean | null;
        sesuai_target: boolean | null;
      }
    | Array<{
        kepatuhan_cp: boolean | null;
        kepatuhan_penunjang: boolean | null;
        kepatuhan_terapi: boolean | null;
        sesuai_target: boolean | null;
      }>
    | null;
};

/** Satu pass transform: parse tanggal sekali, gabungkan compliance yang sudah ikut ter-embed. */
const transformRows = (rows: PathwayRow[]): RekapDataItem[] => {
  const result: RekapDataItem[] = new Array(rows.length);

  for (let i = 0; i < rows.length; i++) {
    const pathway = rows[i];
    const embedded = pathway.compliance_data;
    const compliance = Array.isArray(embedded) ? embedded[0] : embedded;

    // tanggal_masuk selalu berformat YYYY-MM-DD -> parse manual, jauh lebih murah dari new Date()
    const tahunMasuk = Number(pathway.tanggal_masuk.slice(0, 4));
    const bulanMasuk = Number(pathway.tanggal_masuk.slice(5, 7));

    const targetLOS = getTargetLOS(pathway.jenis_clinical_pathway);
    const los = pathway.los_hari;

    result[i] = {
      id: pathway.id,
      no: i + 1,
      namaPasien: pathway.nama_pasien,
      noRM: pathway.no_rm,
      tanggalMasuk: pathway.tanggal_masuk,
      jamMasuk: pathway.jam_masuk,
      tanggalKeluar: pathway.tanggal_keluar,
      jamKeluar: pathway.jam_keluar,
      diagnosis: pathway.jenis_clinical_pathway,
      los,
      sesuaiTarget: compliance?.sesuai_target ?? (los ? los <= targetLOS : false),
      kepatuhanCP: compliance?.kepatuhan_cp ?? false,
      kepatuhanPenunjang: compliance?.kepatuhan_penunjang ?? false,
      kepatuhanTerapi: compliance?.kepatuhan_terapi ?? false,
      dpjp: pathway.dpjp || '',
      verifikatorPelaksana: pathway.verifikator_pelaksana || '',
      keterangan: pathway.keterangan || null,
      tahunMasuk,
      bulanMasuk,
    };
  }

  return result;
};

export const useRekapData = () => {
  const [data, setData] = useState<RekapDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { updateComplianceData: updateComplianceInDB } = useComplianceData();

  /** Fetch terpusat dengan cache React Query, sehingga pindah menu tidak memicu request ulang. */
  const loadPathways = useCallback(
    async (queryKey: unknown[], build: () => PromiseLike<{ data: unknown; error: unknown }>) =>
      queryClient.fetchQuery({
        queryKey,
        staleTime: STALE_TIME,
        queryFn: async () => {
          const { data: rows, error: queryError } = await build();
          if (queryError) throw queryError;
          return transformRows((rows as PathwayRow[]) ?? []);
        },
      }),
    [queryClient]
  );

  const fetchDataByMonth = useCallback(
    async (month: number, year: number = new Date().getFullYear()) => {
      setLoading(true);
      setError(null);

      try {
        const from = `${year}-${month.toString().padStart(2, '0')}-01`;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const to = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;

        const transformedData = await loadPathways(['rekap-data', 'month', year, month], () =>
          supabase
            .from('clinical_pathways')
            .select(PATHWAY_SELECT)
            .gte('tanggal_masuk', from)
            .lt('tanggal_masuk', to)
            .order('tanggal_masuk', { ascending: true })
            .range(0, MAX_ROWS - 1)
        );

        setData(transformedData);
        return transformedData;
      } catch (err) {
        console.error('Error fetching rekap data:', err);
        setError('Gagal mengambil data rekap');
        toast({
          title: 'Error',
          description: 'Gagal mengambil data rekap',
          variant: 'destructive',
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [loadPathways]
  );

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const transformedData = await loadPathways(['rekap-data', 'all'], () =>
        supabase
          .from('clinical_pathways')
          .select(PATHWAY_SELECT)
          .order('tanggal_masuk', { ascending: true })
          .range(0, MAX_ROWS - 1)
      );

      setData(transformedData);
      return transformedData;
    } catch (err) {
      console.error('Error fetching all rekap data:', err);
      setError('Gagal mengambil data rekap');
      toast({
        title: 'Error',
        description: 'Gagal mengambil data rekap',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [loadPathways]);

  const filterDataByPathway = useCallback(
    (pathway: string): RekapDataItem[] => {
      if (pathway === 'all') return data;
      return data.filter((item) => item.diagnosis === pathway);
    },
    [data]
  );

  const invalidateRekap = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['rekap-data'] });
  }, [queryClient]);

  const updatePatientData = useCallback(
    async (patientId: string, updates: Partial<RekapDataItem>) => {
      try {
        const dbUpdates: Record<string, unknown> = {};

        if (updates.los !== undefined) dbUpdates.los_hari = updates.los;
        if (updates.tanggalKeluar !== undefined) dbUpdates.tanggal_keluar = updates.tanggalKeluar;
        if (updates.jamKeluar !== undefined) dbUpdates.jam_keluar = updates.jamKeluar;
        if (updates.keterangan !== undefined) dbUpdates.keterangan = updates.keterangan;

        const { error: updateError } = await supabase
          .from('clinical_pathways')
          .update(dbUpdates)
          .eq('id', patientId);

        if (updateError) throw updateError;

        setData((prev) =>
          prev.map((item) =>
            item.id === patientId
              ? {
                  ...item,
                  ...updates,
                  sesuaiTarget: updates.los ? updates.los <= getTargetLOS(item.diagnosis) : item.sesuaiTarget,
                }
              : item
          )
        );
        invalidateRekap();

        toast({
          title: 'Berhasil',
          description: 'Data pasien berhasil diperbarui',
        });
      } catch (err) {
        console.error('Error updating patient data:', err);
        toast({
          title: 'Error',
          description: 'Gagal memperbarui data pasien',
          variant: 'destructive',
        });
      }
    },
    [invalidateRekap]
  );

  const updateComplianceData = useCallback(
    async (patientId: string, field: string, value: boolean) => {
      const updates: Record<string, boolean> = {};

      switch (field) {
        case 'kepatuhanPenunjang':
          updates.kepatuhan_penunjang = value;
          break;
        case 'kepatuhanTerapi':
          updates.kepatuhan_terapi = value;
          break;
        case 'kepatuhanCP':
          updates.kepatuhan_cp = value;
          break;
        case 'sesuaiTarget':
          updates.sesuai_target = value;
          break;
        default:
          throw new Error(`Unknown field: ${field}`);
      }

      const success = await updateComplianceInDB(patientId, updates);
      if (!success) throw new Error('Failed to update compliance data');

      setData((prev) => prev.map((item) => (item.id === patientId ? { ...item, [field]: value } : item)));
      invalidateRekap();
    },
    [updateComplianceInDB, invalidateRekap]
  );

  return {
    data,
    loading,
    error,
    fetchDataByMonth,
    fetchAllData,
    filterDataByPathway,
    updatePatientData,
    updateComplianceData,
    getTargetLOS,
  };
};
