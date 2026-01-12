//types\index.ts
export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  parent: number | null;
  children: Category[];
  products_count: number;
}

export interface Banner {
  id: number;
  title: string;
  description: string | null;
  image: string;
  link: string | null;
  order: number;
  is_active: boolean;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  products_count?: number;
}

export interface BrandFilters {
  search?: string;
  category?: string;
  has_products?: boolean;
  has_available?: boolean;
  price_min?: number;
  price_max?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
}
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number | null;
  is_available: boolean;
  category: number | Category;
  category_name?: string;
  main_image?: Image | null;
  images?: Image[];
  features?: ProductFeature[];
  manufacturer_sku: string | number;
  internal_sku: string | number;
  brand?: number | string | Brand | null;
  tags?: Tag[];
  tag_groups?: ProductTagGroup[];
}
export interface Image {
  id: number;
  image: string;
  is_main: boolean;
  order: number;
}
export interface ProductFeature {
  id: number;
  feature_name: string;
  feature_id?: number;
  value_id?: number;
  value_name: string | null;
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  content?: string;
  preview: string;
  image: string | null;
  pub_date: string;
}

export interface AboutContent {
  title: string;
  content: string;
  image: string | null;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  map_url: string | null;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}
export interface ProductFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  brand?: string;
  quick?: string;
  is_available?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  // опциональные поля, которые может возвращать ваш бэк
  page?: number;
  total_pages?: number;
  min_price?: number;
  max_price?: number;
}
export interface PriceRangeResponse {
  min_price: number | null;
  max_price: number | null;
}
export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, any>;
}

export interface Order {
  id?: number;
  items: { product: number; quantity: number; price?: number }[];
  total: number;
  shipping_address: any;
  status?: string;
  created_at?: string;
}

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  token?: string; // JWT хранить только в store (не в localStorage как plain)
}

export interface Review {
  id?: number;
  user?: User | number;
  product: number;
  rating: number; // 1-5
  title?: string;
  body?: string;
  created_at?: string;
}
export interface Tag {
  id: number;
  name: string;
  slug: string;
  category?: number;
}
export interface ProductTagGroup {
  id: number;
  group_name: string;
  tags: Tag[];
}
