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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          anon_id: string
          created_at: string
          event: string
          id: string
          props: Json
          source: string
          user_id: string | null
        }
        Insert: {
          anon_id: string
          created_at?: string
          event: string
          id?: string
          props?: Json
          source?: string
          user_id?: string | null
        }
        Update: {
          anon_id?: string
          created_at?: string
          event?: string
          id?: string
          props?: Json
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          helped: string
          id: string
          in_scope: string | null
          pid: string | null
          safety_category: string | null
          sample_id: string | null
          source: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helped: string
          id?: string
          in_scope?: string | null
          pid?: string | null
          safety_category?: string | null
          sample_id?: string | null
          source?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helped?: string
          id?: string
          in_scope?: string | null
          pid?: string | null
          safety_category?: string | null
          sample_id?: string | null
          source?: string
        }
        Relationships: []
      }
      monthly_briefing_cache: {
        Row: {
          age_group: string
          bullets: Json
          created_at: string
          id: string
          month_key: string
          protective_factor_note: string
          user_id: string
        }
        Insert: {
          age_group: string
          bullets: Json
          created_at?: string
          id?: string
          month_key: string
          protective_factor_note: string
          user_id: string
        }
        Update: {
          age_group?: string
          bullets?: Json
          created_at?: string
          id?: string
          month_key?: string
          protective_factor_note?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          digest_age_group: string | null
          digest_enabled: boolean
          email: string
          id: string
          is_subscribed: boolean
          scan_count: number
          stripe_customer_id: string | null
        }
        Insert: {
          created_at?: string
          digest_age_group?: string | null
          digest_enabled?: boolean
          email: string
          id: string
          is_subscribed?: boolean
          scan_count?: number
          stripe_customer_id?: string | null
        }
        Update: {
          created_at?: string
          digest_age_group?: string | null
          digest_enabled?: boolean
          email?: string
          id?: string
          is_subscribed?: boolean
          scan_count?: number
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      protective_factors: {
        Row: {
          come_without_judgment: string
          created_at: string
          id: string
          offline_friendships: string
          open_conversations: string
          question_and_pushback: string
          stable_identity: string
          updated_at: string
          user_id: string
        }
        Insert: {
          come_without_judgment?: string
          created_at?: string
          id?: string
          offline_friendships?: string
          open_conversations?: string
          question_and_pushback?: string
          stable_identity?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          come_without_judgment?: string
          created_at?: string
          id?: string
          offline_friendships?: string
          open_conversations?: string
          question_and_pushback?: string
          stable_identity?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scan_notes: {
        Row: {
          created_at: string
          id: string
          linked_situation_id: string | null
          note_text: string
          scan_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_situation_id?: string | null
          note_text: string
          scan_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_situation_id?: string | null
          note_text?: string
          scan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_notes_linked_situation_id_fkey"
            columns: ["linked_situation_id"]
            isOneToOne: false
            referencedRelation: "situation_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_notes_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_rate_events: {
        Row: {
          created_at: string
          id: number
          ip_hash: string
        }
        Insert: {
          created_at?: string
          id?: never
          ip_hash: string
        }
        Update: {
          created_at?: string
          id?: never
          ip_hash?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          age_context: string | null
          concern_areas: string[] | null
          confidence: string | null
          created_at: string
          domain_category: string | null
          escalated: boolean
          escalation_category: string | null
          guidance: string
          id: string
          input_content: string
          input_type: string
          note: string | null
          result_json: Json | null
          risk_level: string
          spectrum_label: string | null
          status: string
          status_updated_at: string | null
          summary: string
          summary_verdict: string | null
          user_id: string | null
        }
        Insert: {
          age_context?: string | null
          concern_areas?: string[] | null
          confidence?: string | null
          created_at?: string
          domain_category?: string | null
          escalated?: boolean
          escalation_category?: string | null
          guidance: string
          id?: string
          input_content: string
          input_type: string
          note?: string | null
          result_json?: Json | null
          risk_level: string
          spectrum_label?: string | null
          status?: string
          status_updated_at?: string | null
          summary: string
          summary_verdict?: string | null
          user_id?: string | null
        }
        Update: {
          age_context?: string | null
          concern_areas?: string[] | null
          confidence?: string | null
          created_at?: string
          domain_category?: string | null
          escalated?: boolean
          escalation_category?: string | null
          guidance?: string
          id?: string
          input_content?: string
          input_type?: string
          note?: string | null
          result_json?: Json | null
          risk_level?: string
          spectrum_label?: string | null
          status?: string
          status_updated_at?: string | null
          summary?: string
          summary_verdict?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      situation_log: {
        Row: {
          category: string | null
          created_at: string
          id: string
          logged_date: string
          note_text: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          logged_date?: string
          note_text: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          logged_date?: string
          note_text?: string
          user_id?: string
        }
        Relationships: []
      }
      study_answers: {
        Row: {
          anon_id: string | null
          answers: Json
          created_at: string
          id: string
          page_key: string
          pid: string | null
        }
        Insert: {
          anon_id?: string | null
          answers?: Json
          created_at?: string
          id?: string
          page_key: string
          pid?: string | null
        }
        Update: {
          anon_id?: string | null
          answers?: Json
          created_at?: string
          id?: string
          page_key?: string
          pid?: string | null
        }
        Relationships: []
      }
      study_responses: {
        Row: {
          anon_id: string | null
          attention_check: string | null
          could_not_tell: string | null
          created_at: string
          follow_up_ok: string | null
          helped_decide: string | null
          id: string
          is_parent_11_18: string | null
          mockup_picks: string[] | null
          pid: string | null
          problem_wording: string | null
          tone_rating: number | null
          tool_purpose: string | null
          vs_google_chatgpt: string | null
          would_use_words: string | null
          would_use_words_why: string | null
        }
        Insert: {
          anon_id?: string | null
          attention_check?: string | null
          could_not_tell?: string | null
          created_at?: string
          follow_up_ok?: string | null
          helped_decide?: string | null
          id?: string
          is_parent_11_18?: string | null
          mockup_picks?: string[] | null
          pid?: string | null
          problem_wording?: string | null
          tone_rating?: number | null
          tool_purpose?: string | null
          vs_google_chatgpt?: string | null
          would_use_words?: string | null
          would_use_words_why?: string | null
        }
        Update: {
          anon_id?: string | null
          attention_check?: string | null
          could_not_tell?: string | null
          created_at?: string
          follow_up_ok?: string | null
          helped_decide?: string | null
          id?: string
          is_parent_11_18?: string | null
          mockup_picks?: string[] | null
          pid?: string | null
          problem_wording?: string | null
          tone_rating?: number | null
          tool_purpose?: string | null
          vs_google_chatgpt?: string | null
          would_use_words?: string | null
          would_use_words_why?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          landing_path: string | null
          name: string | null
          referrer: string | null
          role: string | null
          roles: string[] | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          landing_path?: string | null
          name?: string | null
          referrer?: string | null
          role?: string | null
          roles?: string[] | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          landing_path?: string | null
          name?: string | null
          referrer?: string | null
          role?: string | null
          roles?: string[] | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_scan_rate_limit: { Args: { _ip_hash: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
