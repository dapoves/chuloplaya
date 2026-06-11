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
      categories: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          orden: number
          slug: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          orden?: number
          slug: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          orden?: number
          slug?: string
        }
        Relationships: []
      }
      config: {
        Row: {
          clave: string
          updated_at: string
          valor: Json
        }
        Insert: {
          clave: string
          updated_at?: string
          valor: Json
        }
        Update: {
          clave?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: []
      }
      order_items: {
        Row: {
          cantidad: number
          colaborador_asignado_id: string | null
          created_at: string
          estado: Database["public"]["Enums"]["item_status"]
          hora_devolucion: string | null
          id: string
          order_id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          cantidad: number
          colaborador_asignado_id?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["item_status"]
          hora_devolucion?: string | null
          id?: string
          order_id: string
          product_id: string
          updated_at?: string
        }
        Update: {
          cantidad?: number
          colaborador_asignado_id?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["item_status"]
          hora_devolucion?: string | null
          id?: string
          order_id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_colaborador_asignado_id_fkey"
            columns: ["colaborador_asignado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cliente_id: string
          created_at: string
          estado: Database["public"]["Enums"]["order_status"]
          id: string
          motivo_cancelacion: string | null
          ubicacion_lat: number | null
          ubicacion_lng: number | null
          ubicacion_texto: string | null
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          estado?: Database["public"]["Enums"]["order_status"]
          id?: string
          motivo_cancelacion?: string | null
          ubicacion_lat?: number | null
          ubicacion_lng?: number | null
          ubicacion_texto?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["order_status"]
          id?: string
          motivo_cancelacion?: string | null
          ubicacion_lat?: number | null
          ubicacion_lng?: number | null
          ubicacion_texto?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          activo: boolean
          categoria: string | null
          category_id: string | null
          creado_por: string | null
          created_at: string
          descripcion: string | null
          id: string
          imagen_url: string | null
          nombre: string
          precio: number
          slug: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria?: string | null
          category_id?: string | null
          creado_por?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre: string
          precio?: number
          slug?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: string | null
          category_id?: string | null
          creado_por?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          precio?: number
          slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_fraudulent: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          is_fraudulent?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_fraudulent?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription_json: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_json: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_json?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_participants: {
        Row: {
          colaborador_id: string
          joined_at: string
          last_seen_at: string
          left_at: string | null
          shift_id: string
        }
        Insert: {
          colaborador_id: string
          joined_at?: string
          last_seen_at?: string
          left_at?: string | null
          shift_id: string
        }
        Update: {
          colaborador_id?: string
          joined_at?: string
          last_seen_at?: string
          left_at?: string | null
          shift_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_participants_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_participants_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_stock: {
        Row: {
          cantidad: number
          id: string
          product_id: string
          shift_id: string
        }
        Insert: {
          cantidad: number
          id?: string
          product_id: string
          shift_id: string
        }
        Update: {
          cantidad?: number
          id?: string
          product_id?: string
          shift_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_stock_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          abierta_por: string | null
          activo: boolean
          fecha: string
          hora_cierre: string | null
          hora_inicio: string
          id: string
        }
        Insert: {
          abierta_por?: string | null
          activo?: boolean
          fecha?: string
          hora_cierre?: string | null
          hora_inicio?: string
          id?: string
        }
        Update: {
          abierta_por?: string | null
          activo?: boolean
          fecha?: string
          hora_cierre?: string | null
          hora_inicio?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_colaborador_id_fkey"
            columns: ["abierta_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_staff_role_by_email: {
        Args: { lookup_email: string }
        Returns: string | null
      }
      accept_order: { Args: { p_order_id: string }; Returns: number }
      accept_order_item: { Args: { p_item_id: string }; Returns: boolean }
      list_clients_with_email: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: {
          created_at: string
          display_name: string
          email: string
          id: string
          is_fraudulent: boolean
          phone: string
          total_count: number
        }[]
      }
      admin_list_users: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_role?: Database["public"]["Enums"]["user_role"]
          p_search?: string
        }
        Returns: {
          created_at: string
          display_name: string
          email: string
          id: string
          is_fraudulent: boolean
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          total_count: number
        }[]
      }
      admin_update_profile: {
        Args: {
          p_display_name?: string
          p_is_fraudulent?: boolean
          p_phone?: string
          p_role?: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      am_i_fraudulent: { Args: never; Returns: boolean }
      close_shift: { Args: { p_shift_id: string }; Returns: undefined }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      heartbeat_shift: { Args: never; Returns: undefined }
      join_shift: { Args: never; Returns: string }
      leave_shift: { Args: never; Returns: undefined }
      open_shift: { Args: { items: Json }; Returns: Json }
      order_client_email: { Args: { p_order_id: string }; Returns: string }
      order_client_emails: {
        Args: { p_order_ids: string[] }
        Returns: {
          display_name: string
          email: string
          order_id: string
        }[]
      }
      reject_order: {
        Args: { p_motivo: string; p_order_id: string }
        Returns: number
      }
      set_item_status: {
        Args: {
          p_item_id: string
          p_new_status: Database["public"]["Enums"]["item_status"]
        }
        Returns: undefined
      }
      stock_disponible: {
        Args: never
        Returns: {
          disponible: number
          nombre: string
          product_id: string
          total_alquilado: number
          total_cargado: number
        }[]
      }
      update_shift_stock: { Args: { items: Json }; Returns: undefined }
    }
    Enums: {
      item_status:
        | "enviado"
        | "aceptado"
        | "en_camino"
        | "entregado"
        | "pendiente_devolucion"
        | "devuelto"
        | "cancelado"
      order_status: "activo" | "completado" | "cancelado"
      user_role: "cliente" | "colaborador" | "admin"
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
      item_status: [
        "enviado",
        "aceptado",
        "en_camino",
        "entregado",
        "pendiente_devolucion",
        "devuelto",
        "cancelado",
      ],
      order_status: ["activo", "completado", "cancelado"],
      user_role: ["cliente", "colaborador", "admin"],
    },
  },
} as const
