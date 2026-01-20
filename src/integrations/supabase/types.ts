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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      circuit_comments: {
        Row: {
          circuit_id: string
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          circuit_id: string
          content: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          circuit_id?: string
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circuit_comments_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "shared_circuits"
            referencedColumns: ["id"]
          },
        ]
      }
      circuit_likes: {
        Row: {
          circuit_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          circuit_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          circuit_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circuit_likes_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "shared_circuits"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_analytics: {
        Row: {
          active_students: number | null
          ai_interactions: number | null
          avg_accuracy: number | null
          classroom_id: string
          community_contributions: number | null
          created_at: string
          date: string
          id: string
          missions_completed: number | null
          total_xp_earned: number | null
        }
        Insert: {
          active_students?: number | null
          ai_interactions?: number | null
          avg_accuracy?: number | null
          classroom_id: string
          community_contributions?: number | null
          created_at?: string
          date?: string
          id?: string
          missions_completed?: number | null
          total_xp_earned?: number | null
        }
        Update: {
          active_students?: number | null
          ai_interactions?: number | null
          avg_accuracy?: number | null
          classroom_id?: string
          community_contributions?: number | null
          created_at?: string
          date?: string
          id?: string
          missions_completed?: number | null
          total_xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "classroom_analytics_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_sponsorships: {
        Row: {
          amount_cents: number
          classroom_id: string
          compute_credits_granted: number | null
          created_at: string
          donor_email: string | null
          donor_name: string | null
          id: string
          is_anonymous: boolean | null
          message: string | null
          sponsor_id: string | null
          status: string | null
        }
        Insert: {
          amount_cents: number
          classroom_id: string
          compute_credits_granted?: number | null
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          sponsor_id?: string | null
          status?: string | null
        }
        Update: {
          amount_cents?: number
          classroom_id?: string
          compute_credits_granted?: number | null
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          sponsor_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classroom_sponsorships_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_sponsorships_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          created_at: string
          grade_level: string
          id: string
          join_code: string | null
          name: string
          school_district: string | null
          school_name: string | null
          student_count: number | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade_level: string
          id?: string
          join_code?: string | null
          name: string
          school_district?: string | null
          school_name?: string | null
          student_count?: number | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade_level?: string
          id?: string
          join_code?: string | null
          name?: string
          school_district?: string | null
          school_name?: string | null
          student_count?: number | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_plans: {
        Row: {
          ai_generated: boolean | null
          classroom_id: string
          created_at: string
          day_of_week: number | null
          duration_minutes: number | null
          grade_level: string
          id: string
          lesson_content: Json
          objectives: string[]
          standards: string[] | null
          status: string | null
          teacher_id: string
          title: string
          updated_at: string
          week_number: number | null
        }
        Insert: {
          ai_generated?: boolean | null
          classroom_id: string
          created_at?: string
          day_of_week?: number | null
          duration_minutes?: number | null
          grade_level: string
          id?: string
          lesson_content?: Json
          objectives?: string[]
          standards?: string[] | null
          status?: string | null
          teacher_id: string
          title: string
          updated_at?: string
          week_number?: number | null
        }
        Update: {
          ai_generated?: boolean | null
          classroom_id?: string
          created_at?: string
          day_of_week?: number | null
          duration_minutes?: number | null
          grade_level?: string
          id?: string
          lesson_content?: Json
          objectives?: string[]
          standards?: string[] | null
          status?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          circuit_id: string | null
          created_at: string
          id: string
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          circuit_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          circuit_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "shared_circuits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          circuits_shared: number | null
          created_at: string | null
          display_name: string
          github_username: string | null
          id: string
          total_likes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          circuits_shared?: number | null
          created_at?: string | null
          display_name: string
          github_username?: string | null
          id?: string
          total_likes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          circuits_shared?: number | null
          created_at?: string | null
          display_name?: string
          github_username?: string | null
          id?: string
          total_likes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_circuits: {
        Row: {
          behavior: string
          circuit_data: Json
          created_at: string | null
          description: string | null
          github_pr_url: string | null
          id: string
          is_featured: boolean | null
          likes_count: number | null
          neurons_used: string[]
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          behavior: string
          circuit_data: Json
          created_at?: string | null
          description?: string | null
          github_pr_url?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          neurons_used: string[]
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          behavior?: string
          circuit_data?: Json
          created_at?: string | null
          description?: string | null
          github_pr_url?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          neurons_used?: string[]
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          classrooms_sponsored: number | null
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          total_donated_cents: number | null
          website_url: string | null
        }
        Insert: {
          classrooms_sponsored?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          total_donated_cents?: number | null
          website_url?: string | null
        }
        Update: {
          classrooms_sponsored?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          total_donated_cents?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      student_submissions: {
        Row: {
          ai_feedback: Json | null
          classroom_id: string
          created_at: string
          graded_at: string | null
          id: string
          lesson_id: string | null
          mission_id: string | null
          score: number | null
          student_id: string
          submission_data: Json
          submission_type: string
        }
        Insert: {
          ai_feedback?: Json | null
          classroom_id: string
          created_at?: string
          graded_at?: string | null
          id?: string
          lesson_id?: string | null
          mission_id?: string | null
          score?: number | null
          student_id: string
          submission_data?: Json
          submission_type: string
        }
        Update: {
          ai_feedback?: Json | null
          classroom_id?: string
          created_at?: string
          graded_at?: string | null
          id?: string
          lesson_id?: string | null
          mission_id?: string | null
          score?: number | null
          student_id?: string
          submission_data?: Json
          submission_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_submissions_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          classroom_id: string
          created_at: string
          display_name: string
          id: string
          progress_data: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          classroom_id: string
          created_at?: string
          display_name: string
          id?: string
          progress_data?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          classroom_id?: string
          created_at?: string
          display_name?: string
          id?: string
          progress_data?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_join_code: { Args: never; Returns: string }
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
    Enums: {},
  },
} as const
