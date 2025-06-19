export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      financial_years: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          year: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          year: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      funding_agencies: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      principal_investigators: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          id: string
          name: string
          project_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name: string
          project_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name?: string
          project_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      schemes: {
        Row: {
          created_at: string
          description: string | null
          funding_agency_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          funding_agency_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          funding_agency_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schemes_funding_agency_id_fkey"
            columns: ["funding_agency_id"]
            isOneToOne: false
            referencedRelation: "funding_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      uc_entries: {
        Row: {
          created_at: string
          created_by: string | null
          current_status: string | null
          date_given: string | null
          date_received: string | null
          financial_year_id: string
          funding_agency_id: string
          id: string
          pi_id: string
          project_code: string
          project_type: string | null
          sanction_letter_file_name: string
          sanction_letter_file_path: string
          scheme_id: string | null
          scheme_name: string | null
          status: string
          uc_checked_ar_finance_date: string | null
          uc_entry_no: string | null
          uc_file_name: string
          uc_file_path: string
          uc_handed_over_pi_date: string | null
          uc_received_date: string | null
          uc_returned_registrar_date: string | null
          uc_sent_deputy_comptroller_date: string | null
          uc_sent_registrar_date: string | null
          uc_verified_date: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_status?: string | null
          date_given?: string | null
          date_received?: string | null
          financial_year_id: string
          funding_agency_id: string
          id?: string
          pi_id: string
          project_code: string
          project_type?: string | null
          sanction_letter_file_name: string
          sanction_letter_file_path: string
          scheme_id?: string | null
          scheme_name?: string | null
          status?: string
          uc_checked_ar_finance_date?: string | null
          uc_entry_no?: string | null
          uc_file_name: string
          uc_file_path: string
          uc_handed_over_pi_date?: string | null
          uc_received_date?: string | null
          uc_returned_registrar_date?: string | null
          uc_sent_deputy_comptroller_date?: string | null
          uc_sent_registrar_date?: string | null
          uc_verified_date?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_status?: string | null
          date_given?: string | null
          date_received?: string | null
          financial_year_id?: string
          funding_agency_id?: string
          id?: string
          pi_id?: string
          project_code?: string
          project_type?: string | null
          sanction_letter_file_name?: string
          sanction_letter_file_path?: string
          scheme_id?: string | null
          scheme_name?: string | null
          status?: string
          uc_checked_ar_finance_date?: string | null
          uc_entry_no?: string | null
          uc_file_name?: string
          uc_file_path?: string
          uc_handed_over_pi_date?: string | null
          uc_received_date?: string | null
          uc_returned_registrar_date?: string | null
          uc_sent_deputy_comptroller_date?: string | null
          uc_sent_registrar_date?: string | null
          uc_verified_date?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uc_entries_financial_year_id_fkey"
            columns: ["financial_year_id"]
            isOneToOne: false
            referencedRelation: "financial_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uc_entries_funding_agency_id_fkey"
            columns: ["funding_agency_id"]
            isOneToOne: false
            referencedRelation: "funding_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uc_entries_pi_id_fkey"
            columns: ["pi_id"]
            isOneToOne: false
            referencedRelation: "principal_investigators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uc_entries_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
