export interface Product {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  tenant_id: number;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  category_id: number | null;
  image_url: string;
  is_available: boolean;
}

export interface Sale {
  ID: number;
  CreatedAt: string;
  tenant_id: number;
  total: number;
  payment_method: "cash" | "transfer" | "card";
  Items: SaleItem[];
}

export interface SaleItem {
  ID: number;
  sale_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface DashboardStats {
  total_sales_today: number;
  transaction_count: number;
  top_product: string;
  trend: string;
}
