export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
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
  public: {
    Tables: {
      draft_pool: {
        Row: {
          player_id: string
          declared_at: string | null
          status: string | null
          season: string | null
          draft_rating: number | null
          draft_notes: string | null
          event_id: string | null
        }
        Insert: {
          player_id: string
          declared_at?: string | null
          status?: string | null
          season?: string | null
          draft_rating?: number | null
          draft_notes?: string | null
          event_id?: string | null
        }
        Update: {
          player_id?: string
          declared_at?: string | null
          status?: string | null
          season?: string | null
          draft_rating?: number | null
          draft_notes?: string | null
          event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draft_pool_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_pool_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          }
        ]
      },
      upcoming_matches: {
        Row: {
          id: string
          event_id: string
          team_a_id: string
          team_b_id: string
          scheduled_at: string | null
          venue: string | null
          stream_url: string | null
          notes: string | null
          status: string | null
          group_id: string | null
          round: number | null
          match_number: number | null
        }
        Insert: {
          id?: string
          event_id: string
          team_a_id: string
          team_b_id: string
          scheduled_at?: string | null
          venue?: string | null
          stream_url?: string | null
          notes?: string | null
          status?: string | null
          group_id?: string | null
          round?: number | null
          match_number?: number | null
        }
        Update: {
          id?: string
          event_id?: string
          team_a_id?: string
          team_b_id?: string
          scheduled_at?: string | null
          venue?: string | null
          stream_url?: string | null
          notes?: string | null
          status?: string | null
          group_id?: string | null
          round?: number | null
          match_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "upcoming_matches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_matches_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "event_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      },
      events: {
        Row: {
          id: string
          name: string
          type: string | null
          is_global: boolean | null
          region_id: string | null
          start_date: string | null
          end_date: string | null
          max_rp: number | null
          decay_days: number | null
          processed: boolean | null
          description: string | null
          banner_url: string | null
          rules_url: string | null
          processed_at: string | null
          status: string | null
          tier: Database["public"]["Enums"]["event_tier"] | null
        }
        Insert: {
          id?: string
          name: string
          type?: string | null
          is_global?: boolean | null
          region_id?: string | null
          start_date?: string | null
          end_date?: string | null
          max_rp?: number | null
          decay_days?: number | null
          processed?: boolean | null
          description?: string | null
          banner_url?: string | null
          rules_url?: string | null
          processed_at?: string | null
          status?: string | null
          tier?: Database["public"]["Enums"]["event_tier"] | null
        }
        Update: {
          id?: string
          name?: string
          type?: string | null
          is_global?: boolean | null
          region_id?: string | null
          start_date?: string | null
          end_date?: string | null
          max_rp?: number | null
          decay_days?: number | null
          processed?: boolean | null
          description?: string | null
          banner_url?: string | null
          rules_url?: string | null
          processed_at?: string | null
          status?: string | null
          tier?: Database["public"]["Enums"]["event_tier"] | null
        }
        Relationships: [
          {
            foreignKeyName: "events_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          }
        ]
      },
      regions: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      },
      teams: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          region_id: string | null
          current_rp: number | null
          elo_rating: number | null
          global_rank: number | null
          leaderboard_tier: string | null
          created_at: string | null
          player_rank_score: number | null
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          region_id?: string | null
          current_rp?: number | null
          elo_rating?: number | null
          global_rank?: number | null
          leaderboard_tier?: string | null
          created_at?: string | null
          player_rank_score?: number | null
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          region_id?: string | null
          current_rp?: number | null
          elo_rating?: number | null
          global_rank?: number | null
          leaderboard_tier?: string | null
          created_at?: string | null
          player_rank_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          }
        ]
      },
      event_groups: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          max_teams: number | null
          created_at: string | null
          updated_at: string | null
          status: string | null
          advancement_count: number | null
          sort_order: number | null
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          max_teams?: number | null
          created_at?: string | null
          updated_at?: string | null
          status?: string | null
          advancement_count?: number | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string | null
          max_teams?: number | null
          created_at?: string | null
          updated_at?: string | null
          status?: string | null
          advancement_count?: number | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_groups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      },
      players: {
        Row: {
          id: string
          gamertag: string
          position: Database["public"]["Enums"]["player_position"] | null
          region_id: string | null
          current_team_id: string | null
          performance_score: number | null
          player_rp: number | null
          player_rank_score: number | null
          salary_tier: Database["public"]["Enums"]["salary_tier"] | null
          monthly_value: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          gamertag: string
          position?: Database["public"]["Enums"]["player_position"] | null
          region_id?: string | null
          current_team_id?: string | null
          performance_score?: number | null
          player_rp?: number | null
          player_rank_score?: number | null
          salary_tier?: Database["public"]["Enums"]["salary_tier"] | null
          monthly_value?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          gamertag?: string
          position?: Database["public"]["Enums"]["player_position"] | null
          region_id?: string | null
          current_team_id?: string | null
          performance_score?: number | null
          player_rp?: number | null
          player_rank_score?: number | null
          salary_tier?: Database["public"]["Enums"]["salary_tier"] | null
          monthly_value?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_current_team_id_fkey"
            columns: ["current_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      upcoming_matches_view: {
        Row: {
          id: string
          event_id: string
          event_name: string
          team_a_id: string
          team_a_name: string
          team_b_id: string
          team_b_name: string
          scheduled_at: string
          venue: string | null
          stream_url: string | null
          notes: string | null
          status: string | null
          group_id: string | null
          group_name: string | null
          round: number | null
          match_number: number | null
          event_banner_url: string | null
          team_a_logo: string | null
          team_b_logo: string | null
          region_name: string | null
        }
        Insert: {
          [_ in never]: never
        }
        Update: {
          [_ in never]: never
        }
        Relationships: []
      }
      group_standings_view: {
        Row: {
          id: string
          group_id: string
          group_name: string
          event_id: string
          event_name: string
          team_id: string
          team_name: string
          logo_url: string | null
          position: number | null
          matches_played: number | null
          wins: number | null
          losses: number | null
          points_for: number | null
          points_against: number | null
          point_differential: number | null
          updated_at: string | null
        }
        Insert: {
          [_ in never]: never
        }
        Update: {
          [_ in never]: never
        }
        Relationships: []
      }
      group_matches_view: {
        Row: {
          id: string
          group_id: string
          group_name: string
          event_id: string
          event_name: string
          match_id: string
          round: number | null
          match_number: number | null
          team_a_id: string
          team_a_name: string
          team_a_score: number | null
          team_b_id: string
          team_b_name: string
          team_b_score: number | null
          scheduled_at: string | null
          status: string | null
          venue: string | null
          stream_url: string | null
          notes: string | null
          team_a_logo: string | null
          team_b_logo: string | null
          winner_id: string | null
          winner_name: string | null
          loser_id: string | null
          loser_name: string | null
          is_tie: boolean | null
        }
        Insert: {
          [_ in never]: never
        }
        Update: {
          [_ in never]: never
        }
        Relationships: []
      }
      team_performance_summary: {
        Row: {
          id: string
          name: string
          region_id: string | null
          region_name: string | null
          current_rp: number | null
          elo_rating: number | null
          global_rank: number | null
          total_matches: number | null
          matches_won: number | null
          matches_lost: number | null
          win_percentage: number | null
          leaderboard_tier: string | null
        }
        Insert: {
          [_ in never]: never
        }
        Update: {
          [_ in never]: never
        }
        Relationships: []
      }
      team_match_stats: {
        Row: {
          id: string
          match_id: string
          team_id: string
          points: number | null
          rebounds: number | null
          assists: number | null
          steals: number | null
          blocks: number | null
          turnovers: number | null
          field_goals_made: number | null
          field_goals_attempted: number | null
          three_points_made: number | null
          three_points_attempted: number | null
          free_throws_made: number | null
          free_throws_attempted: number | null
          fouls: number | null
          plus_minus: number | null
        }
        Insert: {
          [_ in never]: never
        }
        Update: {
          [_ in never]: never
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_tier: "T1" | "T2" | "T3" | "T4"
      player_position: "Point Guard" | "Shooting Guard" | "Lock" | "Power Forward" | "Center"
      salary_tier: "S" | "A" | "B" | "C" | "D"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database & 'public']

export type DefaultSchema = PublicSchema

export type DatabaseWithoutInternals = Database

export type Tables<
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
      event_tier: ["T1", "T2", "T3", "T4"],
      player_position: [
        "Point Guard",
        "Shooting Guard",
        "Lock",
        "Power Forward",
        "Center",
      ],
      salary_tier: ["S", "A", "B", "C", "D"],
    },
  },
} as const