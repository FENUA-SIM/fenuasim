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
      promo_code_usage: {
        Row: {
          id: number
          promo_code_id: number
          order_id: string
          user_email: string
          used_at: string
        }
        Insert: {
          id?: number
          promo_code_id: number
          order_id: string
          user_email: string
          used_at?: string
        }
        Update: {
          id?: number
          promo_code_id?: number
          order_id?: string
          user_email?: string
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_promo_code_id_fkey"
            columns: ["promo_code_id"]
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          }
        ]
      }
      promo_codes: {
        Row: {
          id: number
          code: string
          discount_percentage: number | null
          discount_amount: number | null
          is_active: boolean
          valid_from: string
          valid_until: string
          usage_limit: number
          times_used: number
          created_at: string
        }
        Insert: {
          id?: number
          code: string
          discount_percentage?: number | null
          discount_amount?: number | null
          is_active?: boolean
          valid_from: string
          valid_until: string
          usage_limit: number
          times_used?: number
          created_at?: string
        }
        Update: {
          id?: number
          code?: string
          discount_percentage?: number | null
          discount_amount?: number | null
          is_active?: boolean
          valid_from?: string
          valid_until?: string
          usage_limit?: number
          times_used?: number
          created_at?: string
        }
        Relationships: []
      }
      airalo_errors: {
        Row: {
          created_at: string
          data: Json | null
          error_code: number | null
          id: string
          message: string
          order_id: string | null
          package_id: string | null
          resolution_notes: string | null
          resolved: boolean | null
          status_code: number | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          error_code?: number | null
          id?: string
          message: string
          order_id?: string | null
          package_id?: string | null
          resolution_notes?: string | null
          resolved?: boolean | null
          status_code?: number | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          error_code?: number | null
          id?: string
          message?: string
          order_id?: string | null
          package_id?: string | null
          resolution_notes?: string | null
          resolved?: boolean | null
          status_code?: number | null
        }
        Relationships: []
      }
      airalo_orders: {
        Row: {
          activated_at: string | null
          apple_installation_url: string | null
          created_at: string | null
          data_balance: string | null
          email: string
          expires_at: string | null
          id: string
          order_id: string
          package_id: string
          qr_code_url: string | null
          sim_iccid: string | null
          status: string | null
        }
        Insert: {
          activated_at?: string | null
          apple_installation_url?: string | null
          created_at?: string | null
          data_balance?: string | null
          email: string
          expires_at?: string | null
          id?: string
          order_id: string
          package_id: string
          qr_code_url?: string | null
          sim_iccid?: string | null
          status?: string | null
        }
        Update: {
          activated_at?: string | null
          apple_installation_url?: string | null
          created_at?: string | null
          data_balance?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          order_id?: string
          package_id?: string
          qr_code_url?: string | null
          sim_iccid?: string | null
          status?: string | null
        }
        Relationships: []
      }
      airalo_packages: {
        Row: {
          airalo_id: string | null
          available_topup: boolean | null
          country: string | null
          created_at: string | null
          currency: string | null
          data_amount: number | null
          data_unit: string | null
          description: string | null
          duration: number | null
          duration_unit: string | null
          final_price_eur: number | null
          final_price_usd: number | null
          final_price_xpf: number | null
          id: string
          includes_sms: boolean | null
          includes_voice: boolean | null
          last_synced_at: string | null
          name: string | null
          operator_logo_url: string | null
          flag_url: string | null
          operator_name: string | null
          price: number | null
          price_eur: number | null
          price_usd: number | null
          price_xpf: number | null
          recommended_retail_price: Json | null
          region: string | null
          region_description: string | null
          region_fr: string | null
          region_image_url: string | null
          region_slug: string | null
          slug: string | null
          type: string | null
          updated_at: string | null
          validity: number | null
        }
        Insert: {
          airalo_id?: string | null
          available_topup?: boolean | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          data_amount?: number | null
          data_unit?: string | null
          description?: string | null
          duration?: number | null
          duration_unit?: string | null
          final_price_eur?: number | null
          final_price_usd?: number | null
          final_price_xpf?: number | null
          id?: string
          includes_sms?: boolean | null
          includes_voice?: boolean | null
          last_synced_at?: string | null
          name?: string | null
          operator_logo_url?: string | null
          operator_name?: string | null
          price?: number | null
          price_eur?: number | null
          price_usd?: number | null
          price_xpf?: number | null
          recommended_retail_price?: Json | null
          region?: string | null
          region_description?: string | null
          region_fr?: string | null
          region_image_url?: string | null
          region_slug?: string | null
          slug?: string | null
          type?: string | null
          updated_at?: string | null
          validity?: number | null
        }
        Update: {
          airalo_id?: string | null
          available_topup?: boolean | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          data_amount?: number | null
          data_unit?: string | null
          description?: string | null
          duration?: number | null
          duration_unit?: string | null
          final_price_eur?: number | null
          final_price_usd?: number | null
          final_price_xpf?: number | null
          id?: string
          includes_sms?: boolean | null
          includes_voice?: boolean | null
          last_synced_at?: string | null
          name?: string | null
          operator_logo_url?: string | null
          operator_name?: string | null
          price?: number | null
          price_eur?: number | null
          price_usd?: number | null
          price_xpf?: number | null
          recommended_retail_price?: Json | null
          region?: string | null
          region_description?: string | null
          region_fr?: string | null
          region_image_url?: string | null
          region_slug?: string | null
          slug?: string | null
          type?: string | null
          updated_at?: string | null
          validity?: number | null
        }
        Relationships: []
      }
      airalo_token: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      airalo_topups: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          email: string | null
          id: string
          order_id: string
          package_id: string | null
          topup_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          order_id: string
          package_id?: string | null
          topup_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          order_id?: string
          package_id?: string | null
          topup_id?: string
        }
        Relationships: []
      }
      "airalo-packages": {
        Row: {
          country_code: string | null
          country_name: string | null
          created_at: string | null
          currency: string | null
          data_amount: string | null
          esim_id: string | null
          id: string
          last_synced_at: string | null
          name: string | null
          price: number | null
          provider_name: string | null
          updated_at: string | null
          validity: number | null
        }
        Insert: {
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          currency?: string | null
          data_amount?: string | null
          esim_id?: string | null
          id?: string
          last_synced_at?: string | null
          name?: string | null
          price?: number | null
          provider_name?: string | null
          updated_at?: string | null
          validity?: number | null
        }
        Update: {
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          currency?: string | null
          data_amount?: string | null
          esim_id?: string | null
          id?: string
          last_synced_at?: string | null
          name?: string | null
          price?: number | null
          provider_name?: string | null
          updated_at?: string | null
          validity?: number | null
        }
        Relationships: []
      }
      customer_esims: {
        Row: {
          activated_at: string | null
          activation_code: string | null
          airalo_order_id: string
          apple_installation_url: string | null
          created_at: string | null
          customer_email: string
          data_amount: string | null
          expires_at: string | null
          id: string
          package_details: Json | null
          package_id: string
          qr_code_url: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          activation_code?: string | null
          airalo_order_id: string
          apple_installation_url?: string | null
          created_at?: string | null
          customer_email: string
          data_amount?: string | null
          expires_at?: string | null
          id?: string
          package_details?: Json | null
          package_id: string
          qr_code_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          activation_code?: string | null
          airalo_order_id?: string
          apple_installation_url?: string | null
          created_at?: string | null
          customer_email?: string
          data_amount?: string | null
          expires_at?: string | null
          id?: string
          package_details?: Json | null
          package_id?: string
          qr_code_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      destination_info: {
        Row: {
          description: string | null
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      pre_launch_notifications: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          notification_sent: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          notification_sent?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notification_sent?: boolean | null
        }
        Relationships: []
      }
      product: {
        Row: {
          created_at: string
          currency: string
          data_amount: number
          description: string | null
          id: string
          name: string
          price: number
          short_description: string | null
          sku: string
          updated_at: string
          validity: number
        }
        Insert: {
          created_at?: string
          currency?: string
          data_amount: number
          description?: string | null
          id?: string
          name: string
          price: number
          short_description?: string | null
          sku: string
          updated_at?: string
          validity: number
        }
        Update: {
          created_at?: string
          currency?: string
          data_amount?: number
          description?: string | null
          id?: string
          name?: string
          price?: number
          short_description?: string | null
          sku?: string
          updated_at?: string
          validity?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          stripe_session_id: string
          package_id: string
          email: string
          airalo_order_id: string | null
          status: string
          amount: number
          created_at: string
          promo_code: string | null
          partner_code: string | null
        }
        Insert: {
          id?: string
          stripe_session_id: string
          package_id: string
          email: string
          airalo_order_id?: string | null
          status: string
          amount: number
          created_at?: string
          promo_code?: string | null
          partner_code?: string | null
        }
        Update: {
          id?: string
          stripe_session_id?: string
          package_id?: string
          email?: string
          airalo_order_id?: string | null
          status?: string
          amount?: number
          created_at?: string
          promo_code?: string | null
          partner_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            referencedRelation: "airalo_packages"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      public_airalo_packages: {
        Row: {
          country_code: string | null
          country_name: string | null
          currency: string | null
          data_amount: string | null
          id: string | null
          name: string | null
          price: number | null
          provider_name: string | null
          validity: number | null
        }
        Insert: {
          country_code?: string | null
          country_name?: string | null
          currency?: string | null
          data_amount?: string | null
          id?: string | null
          name?: string | null
          price?: number | null
          provider_name?: string | null
          validity?: number | null
        }
        Update: {
          country_code?: string | null
          country_name?: string | null
          currency?: string | null
          data_amount?: string | null
          id?: string | null
          name?: string | null
          price?: number | null
          provider_name?: string | null
          validity?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      get_last_http_response: {
        Args: Record<PropertyKey, never>
        Returns: {
          status_code: number
          content_type: string
          headers: Json
          body: string
        }[]
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: unknown
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: unknown
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: unknown
      }
      http_head: {
        Args: { uri: string }
        Returns: unknown
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: unknown
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: unknown
      }
      http_post_simple: {
        Args: { url: string; auth_token: string; body?: string }
        Returns: {
          status: number
          response_headers: string
          content: string
        }[]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: unknown
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      sync_airalo: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
