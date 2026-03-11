// Hand-written to match schema. Replace with:
// supabase gen types typescript --local > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: "member" | "librarian" | "admin";
          avatar_url: string | null;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email: string;
          role?: "member" | "librarian" | "admin";
          avatar_url?: string | null;
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: "member" | "librarian" | "admin";
          avatar_url?: string | null;
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          isbn: string | null;
          genre: string;
          year: number | null;
          description: string;
          cover_url: string | null;
          rating: number;
          ai_summary: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          isbn?: string | null;
          genre?: string;
          year?: number | null;
          description?: string;
          cover_url?: string | null;
          rating?: number;
          ai_summary?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          isbn?: string | null;
          genre?: string;
          year?: number | null;
          description?: string;
          cover_url?: string | null;
          rating?: number;
          ai_summary?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      book_copies: {
        Row: {
          id: string;
          book_id: string;
          condition: "new" | "good" | "fair" | "poor";
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          condition?: "new" | "good" | "fair" | "poor";
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          condition?: "new" | "good" | "fair" | "poor";
          is_available?: boolean;
          created_at?: string;
        };
      };
      loans: {
        Row: {
          id: string;
          copy_id: string;
          member_id: string;
          borrowed_at: string;
          due_at: string;
          returned_at: string | null;
          status: "active" | "overdue" | "returned";
          created_at: string;
        };
        Insert: {
          id?: string;
          copy_id: string;
          member_id: string;
          borrowed_at?: string;
          due_at: string;
          returned_at?: string | null;
          status?: "active" | "overdue" | "returned";
          created_at?: string;
        };
        Update: {
          id?: string;
          copy_id?: string;
          member_id?: string;
          borrowed_at?: string;
          due_at?: string;
          returned_at?: string | null;
          status?: "active" | "overdue" | "returned";
          created_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          book_id: string;
          member_id: string;
          position: number;
          status:
            | "waiting"
            | "ready"
            | "fulfilled"
            | "cancelled"
            | "expired";
          reserved_at: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          member_id: string;
          position: number;
          status?:
            | "waiting"
            | "ready"
            | "fulfilled"
            | "cancelled"
            | "expired";
          reserved_at?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          member_id?: string;
          position?: number;
          status?:
            | "waiting"
            | "ready"
            | "fulfilled"
            | "cancelled"
            | "expired";
          reserved_at?: string;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      book_ai_insights: {
        Row: {
          book_id: string;
          quick_summary: string;
          best_for: string[];
          tone: string[];
          themes: string[];
          why_read_it: string;
          model_version: string;
          prompt_hash: string;
          generated_at: string;
        };
        Insert: {
          book_id: string;
          quick_summary: string;
          best_for: string[];
          tone: string[];
          themes: string[];
          why_read_it: string;
          model_version: string;
          prompt_hash: string;
          generated_at?: string;
        };
        Update: {
          book_id?: string;
          quick_summary?: string;
          best_for?: string[];
          tone?: string[];
          themes?: string[];
          why_read_it?: string;
          model_version?: string;
          prompt_hash?: string;
          generated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
