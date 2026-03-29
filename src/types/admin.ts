export interface AdminOverview {
  total_tenants: number;
  active_today: number;
  offline_now: number;
  total_sales_today: number;
  sync_queue_pending: number;
  tenants_by_type: Record<string, number>;
  sales_trend_7d: { date: string; total: number }[];
}

export interface AdminTenant {
  id: string;
  business_name: string;
  business_type: string;
  owner_name: string;
  phone: string;
  last_sync_at: string;
  is_online: boolean;
  subscription_status: "trial" | "active" | "suspended" | "cancelled";
  subscription_ends_at: string | null;
  total_sales_month: number;
  pending_sync_ops: number;
  created_at: string;
  nit?: string;
  address?: string;
  charge_mode?: "pre_payment" | "post_payment";
  nequi_phone?: string;
  daviplata_phone?: string;
}

export interface AdminTenantDetail extends AdminTenant {
  sales_30d: { date: string; total: number }[];
}

export interface AnalyticsData {
  sales_trend: { date: string; total: number; transactions: number }[];
  payment_methods: { method: string; count: number; total: number }[];
  sales_by_business_type: { type: string; total: number }[];
  online_vs_offline: { online: number; offline: number };
  top_products: { name: string; quantity: number }[];
  activity_heatmap: { hour: number; day: number; count: number }[];
}

export interface CreditAccount {
  id: string;
  tenant_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  sale_id: string;
  total_amount: number;
  paid_amount: number;
  status: "open" | "partial" | "paid";
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TableItem {
  id: string;
  tenant_id: string;
  label: string;
  is_active: boolean;
  current_tab_total: number | null;
  current_tab_status: "open" | "closed" | null;
  created_at: string;
}
