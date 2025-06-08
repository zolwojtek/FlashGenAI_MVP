export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      flashcard_sets: {
        Row: {
          created_at: string;
          id: string;
          last_updated_at: string | null;
          title: string;
          total_cards_count: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_updated_at?: string | null;
          title: string;
          total_cards_count?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_updated_at?: string | null;
          title?: string;
          total_cards_count?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      flashcards: {
        Row: {
          back_content: string;
          created_at: string;
          creation_mode: string;
          front_content: string;
          id: string;
          set_id: string;
          updated_at: string | null;
        };
        Insert: {
          back_content: string;
          created_at?: string;
          creation_mode?: string;
          front_content: string;
          id?: string;
          set_id: string;
          updated_at?: string | null;
        };
        Update: {
          back_content?: string;
          created_at?: string;
          creation_mode?: string;
          front_content?: string;
          id?: string;
          set_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_set_id_fkey";
            columns: ["set_id"];
            isOneToOne: false;
            referencedRelation: "flashcard_sets";
            referencedColumns: ["id"];
          },
        ];
      };
      generation_limits: {
        Row: {
          date: string;
          used_count: number;
          user_id: string;
        };
        Insert: {
          date: string;
          used_count?: number;
          user_id: string;
        };
        Update: {
          date?: string;
          used_count?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      generation_logs: {
        Row: {
          accepted_count: number;
          generated_at: string;
          generated_count: number;
          id: string;
          rejected_count: number;
          set_id: string;
          user_id: string;
        };
        Insert: {
          accepted_count?: number;
          generated_at?: string;
          generated_count?: number;
          id?: string;
          rejected_count?: number;
          set_id: string;
          user_id: string;
        };
        Update: {
          accepted_count?: number;
          generated_at?: string;
          generated_count?: number;
          id?: string;
          rejected_count?: number;
          set_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "generation_logs_set_id_fkey";
            columns: ["set_id"];
            isOneToOne: false;
            referencedRelation: "flashcard_sets";
            referencedColumns: ["id"];
          },
        ];
      };
      source_texts: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          set_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          set_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          set_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_texts_set_id_fkey";
            columns: ["set_id"];
            isOneToOne: true;
            referencedRelation: "flashcard_sets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      check_generation_limit: {
        Args: { p_user_id: string };
        Returns: number;
      };
      increment_generation_used: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
