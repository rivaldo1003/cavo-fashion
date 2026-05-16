export interface Product {
  id: number;
  name: string;
  category: string;
  gelar?: string;
  theme?: string;
  price: number;
  image_url?: string;
  total_stok: number;
  stock_s: number;
  stock_m: number;
  stock_l: number;
  stock_xl: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  product_name: string;
  product_gelar?: string;
  size: string;
  quantity: number;
  total_price: number;
  status: string;
  payment_method: string;
  notes?: string;
  created_at: string;
}
