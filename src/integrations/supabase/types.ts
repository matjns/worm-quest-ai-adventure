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
      annotation_reactions: {
        Row: {
          annotation_id: string
          created_at: string
          emoji: string
          id: string
          user_id: string
        }
        Insert: {
          annotation_id: string
          created_at?: string
          emoji: string
          id?: string
          user_id: string
        }
        Update: {
          annotation_id?: string
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotation_reactions_annotation_id_fkey"
            columns: ["annotation_id"]
            isOneToOne: false
            referencedRelation: "circuit_annotations"
            referencedColumns: ["id"]
          },
        ]
      }
      circuit_annotations: {
        Row: {
          circuit_id: string
          color: string | null
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          is_resolved: boolean | null
          neuron_id: string
          parent_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
          user_id: string
          x_offset: number | null
          y_offset: number | null
        }
        Insert: {
          circuit_id: string
          color?: string | null
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          neuron_id: string
          parent_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
          user_id: string
          x_offset?: number | null
          y_offset?: number | null
        }
        Update: {
          circuit_id?: string
          color?: string | null
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          neuron_id?: string
          parent_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
          user_id?: string
          x_offset?: number | null
          y_offset?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "circuit_annotations_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "shared_circuits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circuit_annotations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "circuit_annotations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      circuit_versions: {
        Row: {
          behavior: string
          change_summary: string | null
          circuit_data: Json
          circuit_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          neurons_used: string[]
          title: string
          version_number: number
        }
        Insert: {
          behavior: string
          change_summary?: string | null
          circuit_data: Json
          circuit_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          neurons_used: string[]
          title: string
          version_number?: number
        }
        Update: {
          behavior?: string
          change_summary?: string | null
          circuit_data?: Json
          circuit_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          neurons_used?: string[]
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "circuit_versions_circuit_id_fkey"
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
      engagement_metrics: {
        Row: {
          created_at: string
          duration_ms: number | null
          event_data: Json | null
          event_type: string
          grade_level: string | null
          id: string
          page_path: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          event_data?: Json | null
          event_type: string
          grade_level?: string | null
          id?: string
          page_path?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          event_data?: Json | null
          event_type?: string
          grade_level?: string | null
          id?: string
          page_path?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      global_stats: {
        Row: {
          countries_represented: number
          id: string
          openworm_citations: number
          total_active_researchers: number
          total_circuits_shared: number
          total_simulations_run: number
          updated_at: string
        }
        Insert: {
          countries_represented?: number
          id?: string
          openworm_citations?: number
          total_active_researchers?: number
          total_circuits_shared?: number
          total_simulations_run?: number
          updated_at?: string
        }
        Update: {
          countries_represented?: number
          id?: string
          openworm_citations?: number
          total_active_researchers?: number
          total_circuits_shared?: number
          total_simulations_run?: number
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
      module_assignments: {
        Row: {
          assigned_by: string
          classroom_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          module_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by: string
          classroom_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          module_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          classroom_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          module_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_assignments_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      module_progress: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          module_id: string
          score: number | null
          steps_completed: number | null
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          module_id: string
          score?: number | null
          steps_completed?: number | null
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          module_id?: string
          score?: number | null
          steps_completed?: number | null
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: []
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
      pilot_feedback: {
        Row: {
          additional_notes: string | null
          bug_reports: string | null
          categories: string[] | null
          created_at: string
          did_achieve_goal: boolean | null
          ease_of_use: string | null
          engagement_level: number | null
          experiment_name: string
          feature_requests: string | null
          id: string
          overall_rating: number
          scientific_accuracy: number | null
          session_duration_seconds: number | null
          user_id: string | null
          what_could_improve: string | null
          what_worked_well: string | null
          would_recommend: boolean | null
        }
        Insert: {
          additional_notes?: string | null
          bug_reports?: string | null
          categories?: string[] | null
          created_at?: string
          did_achieve_goal?: boolean | null
          ease_of_use?: string | null
          engagement_level?: number | null
          experiment_name: string
          feature_requests?: string | null
          id?: string
          overall_rating: number
          scientific_accuracy?: number | null
          session_duration_seconds?: number | null
          user_id?: string | null
          what_could_improve?: string | null
          what_worked_well?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          additional_notes?: string | null
          bug_reports?: string | null
          categories?: string[] | null
          created_at?: string
          did_achieve_goal?: boolean | null
          ease_of_use?: string | null
          engagement_level?: number | null
          experiment_name?: string
          feature_requests?: string | null
          id?: string
          overall_rating?: number
          scientific_accuracy?: number | null
          session_duration_seconds?: number | null
          user_id?: string | null
          what_could_improve?: string | null
          what_worked_well?: string | null
          would_recommend?: boolean | null
        }
        Relationships: []
      }
      player_ratings: {
        Row: {
          best_streak: number
          created_at: string
          elo_rating: number
          id: string
          last_race_at: string | null
          losses: number
          rating_deviation: number
          tier: string
          total_races: number
          updated_at: string
          user_id: string
          win_streak: number
          wins: number
        }
        Insert: {
          best_streak?: number
          created_at?: string
          elo_rating?: number
          id?: string
          last_race_at?: string | null
          losses?: number
          rating_deviation?: number
          tier?: string
          total_races?: number
          updated_at?: string
          user_id: string
          win_streak?: number
          wins?: number
        }
        Update: {
          best_streak?: number
          created_at?: string
          elo_rating?: number
          id?: string
          last_race_at?: string | null
          losses?: number
          rating_deviation?: number
          tier?: string
          total_races?: number
          updated_at?: string
          user_id?: string
          win_streak?: number
          wins?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          circuits_shared: number | null
          created_at: string | null
          display_name: string
          email_notifications: boolean | null
          github_username: string | null
          id: string
          notify_on_comments: boolean | null
          notify_on_forks: boolean | null
          notify_on_likes: boolean | null
          notify_weekly_digest: boolean | null
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
          email_notifications?: boolean | null
          github_username?: string | null
          id?: string
          notify_on_comments?: boolean | null
          notify_on_forks?: boolean | null
          notify_on_likes?: boolean | null
          notify_weekly_digest?: boolean | null
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
          email_notifications?: boolean | null
          github_username?: string | null
          id?: string
          notify_on_comments?: boolean | null
          notify_on_forks?: boolean | null
          notify_on_likes?: boolean | null
          notify_weekly_digest?: boolean | null
          total_likes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      race_participants: {
        Row: {
          circuit_data: Json
          created_at: string
          finish_rank: number | null
          finished_at: string | null
          id: string
          position: number
          race_id: string
          user_id: string
          worm_name: string
        }
        Insert: {
          circuit_data: Json
          created_at?: string
          finish_rank?: number | null
          finished_at?: string | null
          id?: string
          position?: number
          race_id: string
          user_id: string
          worm_name?: string
        }
        Update: {
          circuit_data?: Json
          created_at?: string
          finish_rank?: number | null
          finished_at?: string | null
          id?: string
          position?: number
          race_id?: string
          user_id?: string
          worm_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_participants_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "race_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      race_sessions: {
        Row: {
          created_at: string
          finished_at: string | null
          host_id: string
          id: string
          is_ranked: boolean | null
          max_elo: number | null
          max_players: number
          min_elo: number | null
          name: string
          race_distance: number
          skill_tier: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          host_id: string
          id?: string
          is_ranked?: boolean | null
          max_elo?: number | null
          max_players?: number
          min_elo?: number | null
          name: string
          race_distance?: number
          skill_tier?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          host_id?: string
          id?: string
          is_ranked?: boolean | null
          max_elo?: number | null
          max_players?: number
          min_elo?: number | null
          name?: string
          race_distance?: number
          skill_tier?: string | null
          started_at?: string | null
          status?: string
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
      student_assignment_progress: {
        Row: {
          assignment_id: string
          completed_at: string | null
          created_at: string
          id: string
          score: number | null
          started_at: string | null
          status: string
          student_id: string
          time_spent_seconds: number | null
          updated_at: string
        }
        Insert: {
          assignment_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          started_at?: string | null
          status?: string
          student_id: string
          time_spent_seconds?: number | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          started_at?: string | null
          status?: string
          student_id?: string
          time_spent_seconds?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_assignment_progress_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "module_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assignment_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_elo_change: {
        Args: { k_factor?: number; loser_elo: number; winner_elo: number }
        Returns: number
      }
      create_system_notification: {
        Args: {
          p_actor_id?: string
          p_circuit_id?: string
          p_message?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      generate_join_code: { Args: never; Returns: string }
      get_tier_from_elo: { Args: { elo_rating: number }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_simulation_count: { Args: never; Returns: undefined }
      upsert_classroom_analytics: {
        Args: {
          p_active_students?: number
          p_ai_interactions?: number
          p_avg_accuracy?: number
          p_classroom_id: string
          p_community_contributions?: number
          p_missions_completed?: number
          p_total_xp_earned?: number
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
