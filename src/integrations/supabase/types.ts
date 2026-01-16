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
      exchange_orders: {
        Row: {
          avg_fill_price: number | null
          created_at: string
          exchange_order_id: string | null
          filled_quantity: number | null
          id: string
          intent_id: string
          raw_response: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          avg_fill_price?: number | null
          created_at?: string
          exchange_order_id?: string | null
          filled_quantity?: number | null
          id?: string
          intent_id: string
          raw_response?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          avg_fill_price?: number | null
          created_at?: string
          exchange_order_id?: string | null
          filled_quantity?: number | null
          id?: string
          intent_id?: string
          raw_response?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_orders_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "execution_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_intents: {
        Row: {
          created_at: string
          id: string
          leverage: number | null
          mode: string
          notes: string | null
          order_type: string
          price: number | null
          quantity: number
          side: string
          signal_id: string | null
          status: string
          strategy_id: string | null
          symbol: string
          time_in_force: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leverage?: number | null
          mode?: string
          notes?: string | null
          order_type: string
          price?: number | null
          quantity: number
          side: string
          signal_id?: string | null
          status?: string
          strategy_id?: string | null
          symbol: string
          time_in_force?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leverage?: number | null
          mode?: string
          notes?: string | null
          order_type?: string
          price?: number | null
          quantity?: number
          side?: string
          signal_id?: string | null
          status?: string
          strategy_id?: string | null
          symbol?: string
          time_in_force?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      holdings: {
        Row: {
          avg_buy_price: number
          created_at: string
          id: string
          name: string
          portfolio_id: string
          quantity: number
          symbol: string
          updated_at: string
        }
        Insert: {
          avg_buy_price?: number
          created_at?: string
          id?: string
          name: string
          portfolio_id: string
          quantity?: number
          symbol: string
          updated_at?: string
        }
        Update: {
          avg_buy_price?: number
          created_at?: string
          id?: string
          name?: string
          portfolio_id?: string
          quantity?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          current_balance: number
          id: string
          name: string
          starting_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          id?: string
          name?: string
          starting_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          id?: string
          name?: string
          starting_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          condition: string
          created_at: string
          id: string
          is_active: boolean
          symbol: string
          target_price: number
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          id?: string
          is_active?: boolean
          symbol: string
          target_price: number
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          id?: string
          is_active?: boolean
          symbol?: string
          target_price?: number
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      risk_events: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          intent_id: string | null
          passed: boolean
          reason: string | null
          rule: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          intent_id?: string | null
          passed: boolean
          reason?: string | null
          rule: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          intent_id?: string | null
          passed?: boolean
          reason?: string | null
          rule?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_events_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "execution_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health: {
        Row: {
          api_error_count: number
          created_at: string
          daily_pnl: number | null
          failed_order_count: number
          id: string
          kill_switch_active: boolean
          kill_switch_reason: string | null
          last_health_check: string | null
          realized_pnl: number | null
          unrealized_pnl: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_error_count?: number
          created_at?: string
          daily_pnl?: number | null
          failed_order_count?: number
          id?: string
          kill_switch_active?: boolean
          kill_switch_reason?: string | null
          last_health_check?: string | null
          realized_pnl?: number | null
          unrealized_pnl?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_error_count?: number
          created_at?: string
          daily_pnl?: number | null
          failed_order_count?: number
          id?: string
          kill_switch_active?: boolean
          kill_switch_reason?: string | null
          last_health_check?: string | null
          realized_pnl?: number | null
          unrealized_pnl?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          closed_at: string | null
          created_at: string
          entry_price: number
          exit_price: number | null
          id: string
          pnl: number | null
          portfolio_id: string
          quantity: number
          risk_score: number | null
          side: string
          signal_confidence: number | null
          status: string
          symbol: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          entry_price: number
          exit_price?: number | null
          id?: string
          pnl?: number | null
          portfolio_id: string
          quantity: number
          risk_score?: number | null
          side: string
          signal_confidence?: number | null
          status?: string
          symbol: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          entry_price?: number
          exit_price?: number | null
          id?: string
          pnl?: number | null
          portfolio_id?: string
          quantity?: number
          risk_score?: number | null
          side?: string
          signal_confidence?: number | null
          status?: string
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_config: {
        Row: {
          base_capital: number
          created_at: string
          exchange: string
          id: string
          kill_switch_max_api_errors: number
          kill_switch_max_failed_orders: number
          max_daily_loss: number
          max_leverage: number
          max_risk_per_trade: number
          max_slippage: number
          network: string
          profit_withdrawal_threshold: number
          trading_mode: string
          updated_at: string
          user_id: string
          volatility_limit: number
          withdraw_address: string | null
          withdraw_asset: string | null
        }
        Insert: {
          base_capital?: number
          created_at?: string
          exchange?: string
          id?: string
          kill_switch_max_api_errors?: number
          kill_switch_max_failed_orders?: number
          max_daily_loss?: number
          max_leverage?: number
          max_risk_per_trade?: number
          max_slippage?: number
          network?: string
          profit_withdrawal_threshold?: number
          trading_mode?: string
          updated_at?: string
          user_id: string
          volatility_limit?: number
          withdraw_address?: string | null
          withdraw_asset?: string | null
        }
        Update: {
          base_capital?: number
          created_at?: string
          exchange?: string
          id?: string
          kill_switch_max_api_errors?: number
          kill_switch_max_failed_orders?: number
          max_daily_loss?: number
          max_leverage?: number
          max_risk_per_trade?: number
          max_slippage?: number
          network?: string
          profit_withdrawal_threshold?: number
          trading_mode?: string
          updated_at?: string
          user_id?: string
          volatility_limit?: number
          withdraw_address?: string | null
          withdraw_asset?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_trade_enabled: boolean
          created_at: string
          id: string
          position_size_fraction: number
          risk_tolerance: number
          sound_alerts_enabled: boolean
          spread_stress_threshold: number
          updated_at: string
          user_id: string
          volatility_sensitivity: number
        }
        Insert: {
          auto_trade_enabled?: boolean
          created_at?: string
          id?: string
          position_size_fraction?: number
          risk_tolerance?: number
          sound_alerts_enabled?: boolean
          spread_stress_threshold?: number
          updated_at?: string
          user_id: string
          volatility_sensitivity?: number
        }
        Update: {
          auto_trade_enabled?: boolean
          created_at?: string
          id?: string
          position_size_fraction?: number
          risk_tolerance?: number
          sound_alerts_enabled?: boolean
          spread_stress_threshold?: number
          updated_at?: string
          user_id?: string
          volatility_sensitivity?: number
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          created_at: string
          id: string
          name: string
          symbol: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          symbol: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          address: string
          amount: number
          asset: string
          created_at: string
          id: string
          raw_response: Json | null
          status: string
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          address: string
          amount: number
          asset: string
          created_at?: string
          id?: string
          raw_response?: Json | null
          status?: string
          tx_hash?: string | null
          user_id: string
        }
        Update: {
          address?: string
          amount?: number
          asset?: string
          created_at?: string
          id?: string
          raw_response?: Json | null
          status?: string
          tx_hash?: string | null
          user_id?: string
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
