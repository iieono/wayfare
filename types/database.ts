export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserType = "student" | "tourist" | "other"

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          bio: string | null
          user_type: UserType | null
          created_at: string | null
          last_active_at: string | null
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          user_type?: UserType | null
          created_at?: string | null
          last_active_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          user_type?: UserType | null
          created_at?: string | null
          last_active_at?: string | null
        }
      }
      countries: {
        Row: {
          id: number
          code: string
          name: string
          flag_url: string | null
          region: string | null
          official_languages: string[] | null
          risk_score: number | null
        }
        Insert: {
          id?: number
          code: string
          name: string
          flag_url?: string | null
          region?: string | null
          official_languages?: string[] | null
          risk_score?: number | null
        }
        Update: {
          id?: number
          code?: string
          name?: string
          flag_url?: string | null
          region?: string | null
          official_languages?: string[] | null
          risk_score?: number | null
        }
      }
      routes: {
        Row: {
          id: number
          from_country_code: string
          to_country_code: string
          description: string | null
          risk_score: number | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          from_country_code: string
          to_country_code: string
          description?: string | null
          risk_score?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          from_country_code?: string
          to_country_code?: string
          description?: string | null
          risk_score?: number | null
          updated_at?: string | null
        }
      }
      checklists: {
        Row: {
          id: number
          country: number // References countries(id)
          user_type: UserType | null
          required_items: Json
          restricted_items: Json | null
          preparation_steps: Json | null
          official_links: Json | null
          is_template: boolean | null
        }
        Insert: {
          id?: number
          country: number // References countries(id)
          user_type?: UserType | null
          required_items: Json
          restricted_items?: Json | null
          preparation_steps?: Json | null
          official_links?: Json | null
          is_template?: boolean | null
        }
        Update: {
          id?: number
          country?: number // References countries(id)
          user_type?: UserType | null
          required_items?: Json
          restricted_items?: Json | null
          preparation_steps?: Json | null
          official_links?: Json | null
          is_template?: boolean | null
        }
      }
      user_checklists: {
        Row: {
          id: number
          user_id: string
          checklist_id: number
          custom_items: Json | null
          completed_items: string[] | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          checklist_id: number
          custom_items?: Json | null
          completed_items?: string[] | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          checklist_id?: number
          custom_items?: Json | null
          completed_items?: string[] | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      stories: {
        Row: {
          id: number
          user_id: string | null
          place_id: number | null
          from_country_code: string | null
          to_country_code: string | null
          user_type: UserType | null
          title: string
          content: string
          images: string[] | null
          category: string | null
          likes_count: number | null
          comments_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          place_id?: number | null
          from_country_code?: string | null
          to_country_code?: string | null
          user_type?: UserType | null
          title: string
          content: string
          images?: string[] | null
          category?: string | null
          likes_count?: number | null
          comments_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          place_id?: number | null
          from_country_code?: string | null
          to_country_code?: string | null
          user_type?: UserType | null
          title?: string
          content?: string
          images?: string[] | null
          category?: string | null
          likes_count?: number | null
          comments_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      places: {
        Row: {
          id: number
          country_code: string | null
          google_place_id: string | null
          mapbox_place_id: string | null
          name: string
          description: string | null
          latitude: number | null
          longitude: number | null
          category: string | null
          phone: string | null
          website: string | null
          images: string[] | null
          address: string | null
          is_user_added: boolean | null
        }
        Insert: {
          id?: number
          country_code?: string | null
          google_place_id?: string | null
          mapbox_place_id?: string | null
          name: string
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          category?: string | null
          phone?: string | null
          website?: string | null
          images?: string[] | null
          address?: string | null
          is_user_added?: boolean | null
        }
        Update: {
          id?: number
          country_code?: string | null
          google_place_id?: string | null
          mapbox_place_id?: string | null
          name?: string
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          category?: string | null
          phone?: string | null
          website?: string | null
          images?: string[] | null
          address?: string | null
          is_user_added?: boolean | null
        }
      }
      place_reviews: {
        Row: {
          id: number
          user_id: string | null
          place_id: number
          rating: number
          comment: string | null
          images: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          place_id: number
          rating: number
          comment?: string | null
          images?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          place_id?: number
          rating?: number
          comment?: string | null
          images?: string[] | null
          created_at?: string | null
        }
      }
      safety_reports: {
        Row: {
          id: number
          user_id: string | null
          place_id: number | null
          geometry: any // PostGIS geometry type
          rating: number
          tags: string[] | null
          comment: string | null
          images: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          place_id?: number | null
          geometry: any
          rating: number
          tags?: string[] | null
          comment?: string | null
          images?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          place_id?: number | null
          geometry?: any
          rating?: number
          tags?: string[] | null
          comment?: string | null
          images?: string[] | null
          created_at?: string | null
        }
      }
      scam_alerts: {
        Row: {
          id: number
          route: number
          place_id: number | null
          alert_text: string
          severity: number | null
          location: string | null
          image_url: string | null
          reported_at: string | null
        }
        Insert: {
          id?: number
          route: number
          place_id?: number | null
          alert_text: string
          severity?: number | null
          location?: string | null
          image_url?: string | null
          reported_at?: string | null
        }
        Update: {
          id?: number
          route?: number
          place_id?: number | null
          alert_text?: string
          severity?: number | null
          location?: string | null
          image_url?: string | null
          reported_at?: string | null
        }
      }
      tips: {
        Row: {
          id: number
          user_id: string | null
          place_id: number | null
          from_country_code: string | null
          to_country_code: string | null
          user_type: UserType | null
          content: string
          images: string[] | null
          travel_season: string | null
          likes_count: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          place_id?: number | null
          from_country_code?: string | null
          to_country_code?: string | null
          user_type?: UserType | null
          content: string
          images?: string[] | null
          travel_season?: string | null
          likes_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          place_id?: number | null
          from_country_code?: string | null
          to_country_code?: string | null
          user_type?: UserType | null
          content?: string
          images?: string[] | null
          travel_season?: string | null
          likes_count?: number | null
          created_at?: string | null
        }
      }
      tip_likes: {
        Row: {
          id: number
          user_id: string
          tip_id: number
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          tip_id: number
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          tip_id?: number
          created_at?: string | null
        }
      }
      story_likes: {
        Row: {
          id: number
          user_id: string
          story_id: number
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          story_id: number
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          story_id?: number
          created_at?: string | null
        }
      }
    }
  }
}
