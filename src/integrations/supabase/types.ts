export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      checklist_summary: {
        Row: {
          bulan: number
          completed_items: number
          completion_percentage: number
          created_at: string
          data_detail: Json | null
          id: string
          jenis_clinical_pathway: string
          tahun: number
          total_checklist_items: number
          total_patients: number
          updated_at: string
        }
        Insert: {
          bulan: number
          completed_items?: number
          completion_percentage?: number
          created_at?: string
          data_detail?: Json | null
          id?: string
          jenis_clinical_pathway: string
          tahun: number
          total_checklist_items?: number
          total_patients?: number
          updated_at?: string
        }
        Update: {
          bulan?: number
          completed_items?: number
          completion_percentage?: number
          created_at?: string
          data_detail?: Json | null
          id?: string
          jenis_clinical_pathway?: string
          tahun?: number
          total_checklist_items?: number
          total_patients?: number
          updated_at?: string
        }
        Relationships: []
      }
      clinical_pathway_checklist: {
        Row: {
          checklist_hari_1: boolean | null
          checklist_hari_2: boolean | null
          checklist_hari_3: boolean | null
          checklist_hari_4: boolean | null
          checklist_hari_5: boolean | null
          checklist_hari_6: boolean | null
          clinical_pathway_id: string | null
          created_at: string
          id: string
          item_index: number
          item_text: string
          updated_at: string
        }
        Insert: {
          checklist_hari_1?: boolean | null
          checklist_hari_2?: boolean | null
          checklist_hari_3?: boolean | null
          checklist_hari_4?: boolean | null
          checklist_hari_5?: boolean | null
          checklist_hari_6?: boolean | null
          clinical_pathway_id?: string | null
          created_at?: string
          id?: string
          item_index: number
          item_text: string
          updated_at?: string
        }
        Update: {
          checklist_hari_1?: boolean | null
          checklist_hari_2?: boolean | null
          checklist_hari_3?: boolean | null
          checklist_hari_4?: boolean | null
          checklist_hari_5?: boolean | null
          checklist_hari_6?: boolean | null
          clinical_pathway_id?: string | null
          created_at?: string
          id?: string
          item_index?: number
          item_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_pathway_checklist_clinical_pathway_id_fkey"
            columns: ["clinical_pathway_id"]
            isOneToOne: false
            referencedRelation: "clinical_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_pathways: {
        Row: {
          bangsal: Database["public"]["Enums"]["ward_type"] | null
          created_at: string
          dpjp: string | null
          id: string
          jam_keluar: string | null
          jam_masuk: string
          jenis_clinical_pathway: Database["public"]["Enums"]["clinical_pathway_type"]
          los_hari: number | null
          nama_pasien: string
          no_rm: string
          tanggal_keluar: string | null
          tanggal_masuk: string
          updated_at: string
          verifikator_pelaksana: string | null
        }
        Insert: {
          bangsal?: Database["public"]["Enums"]["ward_type"] | null
          created_at?: string
          dpjp?: string | null
          id?: string
          jam_keluar?: string | null
          jam_masuk: string
          jenis_clinical_pathway: Database["public"]["Enums"]["clinical_pathway_type"]
          los_hari?: number | null
          nama_pasien: string
          no_rm: string
          tanggal_keluar?: string | null
          tanggal_masuk: string
          updated_at?: string
          verifikator_pelaksana?: string | null
        }
        Update: {
          bangsal?: Database["public"]["Enums"]["ward_type"] | null
          created_at?: string
          dpjp?: string | null
          id?: string
          jam_keluar?: string | null
          jam_masuk?: string
          jenis_clinical_pathway?: Database["public"]["Enums"]["clinical_pathway_type"]
          los_hari?: number | null
          nama_pasien?: string
          no_rm?: string
          tanggal_keluar?: string | null
          tanggal_masuk?: string
          updated_at?: string
          verifikator_pelaksana?: string | null
        }
        Relationships: []
      }
      compliance_data: {
        Row: {
          created_at: string
          id: string
          kepatuhan_cp: boolean | null
          kepatuhan_penunjang: boolean | null
          kepatuhan_terapi: boolean | null
          patient_id: string
          sesuai_target: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kepatuhan_cp?: boolean | null
          kepatuhan_penunjang?: boolean | null
          kepatuhan_terapi?: boolean | null
          patient_id: string
          sesuai_target?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kepatuhan_cp?: boolean | null
          kepatuhan_penunjang?: boolean | null
          kepatuhan_terapi?: boolean | null
          patient_id?: string
          sesuai_target?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_data_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "clinical_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_overrides: {
        Row: {
          created_at: string
          id: string
          kepatuhan_cp: boolean | null
          kepatuhan_penunjang: boolean | null
          kepatuhan_terapi: boolean | null
          los_hari: number | null
          patient_id: string
          sesuai_target: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kepatuhan_cp?: boolean | null
          kepatuhan_penunjang?: boolean | null
          kepatuhan_terapi?: boolean | null
          los_hari?: number | null
          patient_id: string
          sesuai_target?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kepatuhan_cp?: boolean | null
          kepatuhan_penunjang?: boolean | null
          kepatuhan_terapi?: boolean | null
          los_hari?: number | null
          patient_id?: string
          sesuai_target?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_overrides_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "clinical_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      daftar_cp: {
        Row: {
          id: number
          jenis_cp: string
          "Terget Los": number | null
        }
        Insert: {
          id?: number
          jenis_cp: string
          "Terget Los"?: number | null
        }
        Update: {
          id?: number
          jenis_cp?: string
          "Terget Los"?: number | null
        }
        Relationships: []
      }
      monthly_summary: {
        Row: {
          bulan: number
          created_at: string
          id: string
          jumlah_kepatuhan_cp: number | null
          jumlah_kepatuhan_penunjang: number | null
          jumlah_kepatuhan_terapi: number | null
          jumlah_sesuai_target: number | null
          kepatuhan_cp: number | null
          kepatuhan_penunjang: number | null
          kepatuhan_terapi: number | null
          keterangan_varian: string | null
          rata_rata_los: number | null
          sesuai_target: boolean | null
          tahun: number
          total_pasien_input: number | null
          updated_at: string
        }
        Insert: {
          bulan: number
          created_at?: string
          id?: string
          jumlah_kepatuhan_cp?: number | null
          jumlah_kepatuhan_penunjang?: number | null
          jumlah_kepatuhan_terapi?: number | null
          jumlah_sesuai_target?: number | null
          kepatuhan_cp?: number | null
          kepatuhan_penunjang?: number | null
          kepatuhan_terapi?: number | null
          keterangan_varian?: string | null
          rata_rata_los?: number | null
          sesuai_target?: boolean | null
          tahun: number
          total_pasien_input?: number | null
          updated_at?: string
        }
        Update: {
          bulan?: number
          created_at?: string
          id?: string
          jumlah_kepatuhan_cp?: number | null
          jumlah_kepatuhan_penunjang?: number | null
          jumlah_kepatuhan_terapi?: number | null
          jumlah_sesuai_target?: number | null
          kepatuhan_cp?: number | null
          kepatuhan_penunjang?: number | null
          kepatuhan_terapi?: number | null
          keterangan_varian?: string | null
          rata_rata_los?: number | null
          sesuai_target?: boolean | null
          tahun?: number
          total_pasien_input?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          nik: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          nik: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          nik?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_settings: {
        Row: {
          api_key: string | null
          created_at: string
          group_list: Json | null
          id: string
          last_group_update: string | null
          message_template: string | null
          notification_phones: string[] | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          group_list?: Json | null
          id?: string
          last_group_update?: string | null
          message_template?: string | null
          notification_phones?: string[] | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          group_list?: Json | null
          id?: string
          last_group_update?: string | null
          message_template?: string | null
          notification_phones?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_avg_los_compliance: {
        Row: {
          avg_los: number | null
          jenis_clinical_pathway:
            | Database["public"]["Enums"]["clinical_pathway_type"]
            | null
          meets_target: boolean | null
          target_los: number | null
        }
        Relationships: []
      }
      v_los_compliance: {
        Row: {
          avg_los: number | null
          jenis_clinical_pathway:
            | Database["public"]["Enums"]["clinical_pathway_type"]
            | null
          max_los: number | null
          min_los: number | null
          total_cases: number | null
        }
        Relationships: []
      }
      v_monthly_stats: {
        Row: {
          bulan: number | null
          jumlah_sesuai_target: number | null
          kepatuhan_cp: number | null
          kepatuhan_penunjang: number | null
          kepatuhan_terapi: number | null
          rata_rata_los: number | null
          tahun: number | null
          total_pasien_input: number | null
        }
        Relationships: []
      }
      v_pathway_compliance: {
        Row: {
          compliance_percentage: number | null
          jenis_clinical_pathway:
            | Database["public"]["Enums"]["clinical_pathway_type"]
            | null
          total_pasien: number | null
        }
        Relationships: []
      }
      v_support_compliance: {
        Row: {
          compliance_percentage: number | null
          compliant_patients: number | null
          jenis_clinical_pathway:
            | Database["public"]["Enums"]["clinical_pathway_type"]
            | null
          total_patients: number | null
        }
        Relationships: []
      }
      v_therapy_compliance: {
        Row: {
          compliance_percentage: number | null
          compliant_patients: number | null
          jenis_clinical_pathway:
            | Database["public"]["Enums"]["clinical_pathway_type"]
            | null
          total_patients: number | null
        }
        Relationships: []
      }
      v_total_patients: {
        Row: {
          active_patients: number | null
          discharged_patients: number | null
          total_patients: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      aggregate_checklist_data: {
        Args: {
          pathway_type?: string
          target_month: number
          target_year: number
        }
        Returns: {
          completed_items: number
          completion_percentage: number
          jenis_clinical_pathway: string
          total_items: number
          total_patients: number
        }[]
      }
      calculate_compliance_function: {
        Args: { cp_type: Database["public"]["Enums"]["clinical_pathway_type"] }
        Returns: number
      }
    }
    Enums: {
      clinical_pathway_type:
        | "Sectio Caesaria"
        | "Stroke Hemoragik"
        | "Stroke Non Hemoragik"
        | "Pneumonia"
        | "Dengue Fever"
      daftar_cps:
        | "Sectio Caesaria"
        | "Stroke Hemoragik"
        | "Stroke Non Hemoragik"
        | "Pneumonia"
        | "Dengue Fever"
      ward_type:
        | "Perinatal"
        | "Khadijah 2"
        | "Khadijah 3"
        | "Aisyah 3"
        | "Hafshoh 3"
        | "Hafshoh 4"
        | "ICU"
        | "Multazam"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      clinical_pathway_type: [
        "Sectio Caesaria",
        "Stroke Hemoragik",
        "Stroke Non Hemoragik",
        "Pneumonia",
        "Dengue Fever",
      ],
      daftar_cps: [
        "Sectio Caesaria",
        "Stroke Hemoragik",
        "Stroke Non Hemoragik",
        "Pneumonia",
        "Dengue Fever",
      ],
      ward_type: [
        "Perinatal",
        "Khadijah 2",
        "Khadijah 3",
        "Aisyah 3",
        "Hafshoh 3",
        "Hafshoh 4",
        "ICU",
        "Multazam",
      ],
    },
  },
} as const
