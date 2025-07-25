export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      checklist_items: {
        Row: {
          clinical_pathway_id: string
          created_at: string | null
          day_1: boolean | null
          day_2: boolean | null
          day_3: boolean | null
          day_4: boolean | null
          day_5: boolean | null
          day_6: boolean | null
          id: string
          item_index: number
          item_text: string
          variant_notes: string | null
        }
        Insert: {
          clinical_pathway_id: string
          created_at?: string | null
          day_1?: boolean | null
          day_2?: boolean | null
          day_3?: boolean | null
          day_4?: boolean | null
          day_5?: boolean | null
          day_6?: boolean | null
          id?: string
          item_index: number
          item_text: string
          variant_notes?: string | null
        }
        Update: {
          clinical_pathway_id?: string
          created_at?: string | null
          day_1?: boolean | null
          day_2?: boolean | null
          day_3?: boolean | null
          day_4?: boolean | null
          day_5?: boolean | null
          day_6?: boolean | null
          id?: string
          item_index?: number
          item_text?: string
          variant_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_clinical_pathway_id_fkey"
            columns: ["clinical_pathway_id"]
            isOneToOne: false
            referencedRelation: "clinical_pathways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_clinical_pathway_id_fkey"
            columns: ["clinical_pathway_id"]
            isOneToOne: false
            referencedRelation: "v_recent_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_pathway_templates: {
        Row: {
          created_at: string | null
          days_config: Json
          explanation: string | null
          id: string
          items_config: Json
          pathway_type: Database["public"]["Enums"]["clinical_pathway_type"]
          target_los: number
        }
        Insert: {
          created_at?: string | null
          days_config: Json
          explanation?: string | null
          id?: string
          items_config: Json
          pathway_type: Database["public"]["Enums"]["clinical_pathway_type"]
          target_los: number
        }
        Update: {
          created_at?: string | null
          days_config?: Json
          explanation?: string | null
          id?: string
          items_config?: Json
          pathway_type?: Database["public"]["Enums"]["clinical_pathway_type"]
          target_los?: number
        }
        Relationships: []
      }
      clinical_pathways: {
        Row: {
          admission_date: string
          admission_time: string
          clinical_pathway_type: Database["public"]["Enums"]["clinical_pathway_type"]
          created_at: string | null
          discharge_date: string | null
          discharge_time: string | null
          dpjp: string
          id: string
          kepatuhan_cp: boolean | null
          kepatuhan_penunjang: boolean | null
          kepatuhan_terapi: boolean | null
          length_of_stay: number | null
          no_rm: string
          patient_name_age: string
          sesuai_target: boolean | null
          updated_at: string | null
          verifikator: string
        }
        Insert: {
          admission_date: string
          admission_time: string
          clinical_pathway_type: Database["public"]["Enums"]["clinical_pathway_type"]
          created_at?: string | null
          discharge_date?: string | null
          discharge_time?: string | null
          dpjp: string
          id?: string
          kepatuhan_cp?: boolean | null
          kepatuhan_penunjang?: boolean | null
          kepatuhan_terapi?: boolean | null
          length_of_stay?: number | null
          no_rm: string
          patient_name_age: string
          sesuai_target?: boolean | null
          updated_at?: string | null
          verifikator: string
        }
        Update: {
          admission_date?: string
          admission_time?: string
          clinical_pathway_type?: Database["public"]["Enums"]["clinical_pathway_type"]
          created_at?: string | null
          discharge_date?: string | null
          discharge_time?: string | null
          dpjp?: string
          id?: string
          kepatuhan_cp?: boolean | null
          kepatuhan_penunjang?: boolean | null
          kepatuhan_terapi?: boolean | null
          length_of_stay?: number | null
          no_rm?: string
          patient_name_age?: string
          sesuai_target?: boolean | null
          updated_at?: string | null
          verifikator?: string
        }
        Relationships: []
      }
      dpjp_doctors: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          specialization: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          specialization?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          specialization?: string | null
        }
        Relationships: []
      }
      monthly_summaries: {
        Row: {
          avg_los: number | null
          created_at: string | null
          id: string
          kepatuhan_cp_count: number | null
          kepatuhan_penunjang_count: number | null
          kepatuhan_terapi_count: number | null
          month: number
          pathway_type: Database["public"]["Enums"]["clinical_pathway_type"]
          sesuai_target_count: number | null
          total_patients: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          avg_los?: number | null
          created_at?: string | null
          id?: string
          kepatuhan_cp_count?: number | null
          kepatuhan_penunjang_count?: number | null
          kepatuhan_terapi_count?: number | null
          month: number
          pathway_type: Database["public"]["Enums"]["clinical_pathway_type"]
          sesuai_target_count?: number | null
          total_patients?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          avg_los?: number | null
          created_at?: string | null
          id?: string
          kepatuhan_cp_count?: number | null
          kepatuhan_penunjang_count?: number | null
          kepatuhan_terapi_count?: number | null
          month?: number
          pathway_type?: Database["public"]["Enums"]["clinical_pathway_type"]
          sesuai_target_count?: number | null
          total_patients?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      verifikators: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_monthly_stats: {
        Row: {
          avg_los: number | null
          kepatuhan_cp_percentage: number | null
          kepatuhan_penunjang_percentage: number | null
          kepatuhan_terapi_percentage: number | null
          month: number | null
          pathway_type:
            | Database["public"]["Enums"]["clinical_pathway_type"]
            | null
          sesuai_target_percentage: number | null
          total_patients: number | null
          year: number | null
        }
        Insert: {
          avg_los?: number | null
          kepatuhan_cp_percentage?: never
          kepatuhan_penunjang_percentage?: never
          kepatuhan_terapi_percentage?: never
          month?: number | null
          pathway_type?:
            | Database["public"]["Enums"]["clinical_pathway_type"]
            | null
          sesuai_target_percentage?: never
          total_patients?: number | null
          year?: number | null
        }
        Update: {
          avg_los?: number | null
          kepatuhan_cp_percentage?: never
          kepatuhan_penunjang_percentage?: never
          kepatuhan_terapi_percentage?: never
          month?: number | null
          pathway_type?:
            | Database["public"]["Enums"]["clinical_pathway_type"]
            | null
          sesuai_target_percentage?: never
          total_patients?: number | null
          year?: number | null
        }
        Relationships: []
      }
      v_pathway_compliance: {
        Row: {
          avg_los: number | null
          clinical_pathway_type:
            | Database["public"]["Enums"]["clinical_pathway_type"]
            | null
          kepatuhan_cp_count: number | null
          kepatuhan_penunjang_count: number | null
          kepatuhan_terapi_count: number | null
          sesuai_target_count: number | null
          total_patients: number | null
        }
        Relationships: []
      }
      v_recent_patients: {
        Row: {
          admission_date: string | null
          clinical_pathway_type:
            | Database["public"]["Enums"]["clinical_pathway_type"]
            | null
          discharge_date: string | null
          id: string | null
          kepatuhan_cp: boolean | null
          kepatuhan_penunjang: boolean | null
          kepatuhan_terapi: boolean | null
          length_of_stay: number | null
          no_rm: string | null
          patient_name_age: string | null
          sesuai_target: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user"
      clinical_pathway_type:
        | "Sectio Caesaria"
        | "Stroke Hemoragik"
        | "Stroke Non Hemoragik"
        | "Pneumonia"
        | "Dengue Fever"
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
      app_role: ["admin", "user"],
      clinical_pathway_type: [
        "Sectio Caesaria",
        "Stroke Hemoragik",
        "Stroke Non Hemoragik",
        "Pneumonia",
        "Dengue Fever",
      ],
    },
  },
} as const
