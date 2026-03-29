export interface ApiError {
  error: string;
  status: number;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  stock: number;
  barcode?: string;
  category_id?: number | null;
  image_url?: string;
  is_available?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  stock?: number;
  barcode?: string;
  category_id?: number | null;
  image_url?: string;
  is_available?: boolean;
}

export interface CreateSaleRequest {
  payment_method: "cash" | "transfer" | "card";
  items: CreateSaleItemRequest[];
}

export interface CreateSaleItemRequest {
  product_id: number;
  quantity: number;
}
