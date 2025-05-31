// Database type definitions for ScanFolio
// Auto-generated from database schema

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<UserProfile, "id" | "created_at">>;
      };
      portfolios: {
        Row: Portfolio;
        Insert: Omit<Portfolio, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Portfolio, "id" | "created_at">>;
      };
      portfolio_contacts: {
        Row: PortfolioContact;
        Insert: Omit<PortfolioContact, "id" | "created_at">;
        Update: Partial<Omit<PortfolioContact, "id" | "created_at">>;
      };
      portfolio_socials: {
        Row: PortfolioSocial;
        Insert: Omit<PortfolioSocial, "id" | "created_at">;
        Update: Partial<Omit<PortfolioSocial, "id" | "created_at">>;
      };
      portfolio_services: {
        Row: PortfolioService;
        Insert: Omit<PortfolioService, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<PortfolioService, "id" | "created_at">>;
      };
      portfolio_media: {
        Row: PortfolioMedia;
        Insert: Omit<PortfolioMedia, "id" | "created_at">;
        Update: Partial<Omit<PortfolioMedia, "id" | "created_at">>;
      };
      portfolio_testimonials: {
        Row: PortfolioTestimonial;
        Insert: Omit<PortfolioTestimonial, "id" | "created_at">;
        Update: Partial<Omit<PortfolioTestimonial, "id" | "created_at">>;
      };
      portfolio_ctas: {
        Row: PortfolioCTA;
        Insert: Omit<PortfolioCTA, "id" | "created_at">;
        Update: Partial<Omit<PortfolioCTA, "id" | "created_at">>;
      };
      qr_codes: {
        Row: QRCode;
        Insert: Omit<QRCode, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<QRCode, "id" | "created_at">>;
      };
      short_urls: {
        Row: ShortURL;
        Insert: Omit<ShortURL, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ShortURL, "id" | "created_at">>;
      };
      portfolio_views: {
        Row: PortfolioView;
        Insert: Omit<PortfolioView, "id" | "created_at">;
        Update: Partial<Omit<PortfolioView, "id" | "created_at">>;
      };
      qr_scans: {
        Row: QRScan;
        Insert: Omit<QRScan, "id" | "created_at">;
        Update: Partial<Omit<QRScan, "id" | "created_at">>;
      };
      link_clicks: {
        Row: LinkClick;
        Insert: Omit<LinkClick, "id" | "created_at">;
        Update: Partial<Omit<LinkClick, "id" | "created_at">>;
      };
      portfolio_templates: {
        Row: PortfolioTemplate;
        Insert: Omit<PortfolioTemplate, "created_at">;
        Update: Partial<Omit<PortfolioTemplate, "id" | "created_at">>;
      };
    };
  };
}

// =====================================================
// CORE ENTITY TYPES
// =====================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
  subscription_tier: "free" | "premium" | "enterprise";
  subscription_expires_at: string | null;
  is_active: boolean;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  brand_color: string;
  template_id: string;
  is_published: boolean;
  is_public: boolean;
  custom_domain: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioContact {
  id: string;
  portfolio_id: string;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface PortfolioSocial {
  id: string;
  portfolio_id: string;
  platform: string;
  url: string;
  display_text: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PortfolioService {
  id: string;
  portfolio_id: string;
  title: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioMedia {
  id: string;
  portfolio_id: string;
  type: "image" | "video" | "document";
  url: string;
  title: string | null;
  description: string | null;
  alt_text: string | null;
  file_size: number | null;
  mime_type: string | null;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
}

export interface PortfolioTestimonial {
  id: string;
  portfolio_id: string;
  client_name: string;
  client_title: string | null;
  client_company: string | null;
  client_avatar_url: string | null;
  testimonial_text: string;
  rating: number | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface PortfolioCTA {
  id: string;
  portfolio_id: string;
  title: string;
  url: string;
  button_text: string;
  button_style: "primary" | "secondary" | "outline";
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface QRCode {
  id: string;
  user_id: string;
  portfolio_id: string;
  name: string;
  target_url: string;
  qr_data: string;
  foreground_color: string;
  background_color: string;
  logo_url: string | null;
  logo_size: number;
  style: "square" | "dots" | "rounded";
  frame_style: string | null;
  frame_text: string | null;
  file_format: "png" | "svg" | "pdf";
  file_size: number | null;
  file_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShortURL {
  id: string;
  user_id: string;
  portfolio_id: string;
  short_code: string;
  original_url: string;
  custom_alias: string | null;
  title: string | null;
  description: string | null;
  is_active: boolean;
  expires_at: string | null;
  password_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioView {
  id: string;
  portfolio_id: string;
  short_url_id: string | null;
  qr_code_id: string | null;
  visitor_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  session_duration: number | null;
  pages_viewed: number;
  created_at: string;
}

export interface QRScan {
  id: string;
  qr_code_id: string;
  portfolio_view_id: string | null;
  scan_method: string | null;
  ip_address: string | null;
  user_agent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  created_at: string;
}

export interface LinkClick {
  id: string;
  portfolio_id: string;
  portfolio_view_id: string | null;
  link_type: string;
  link_url: string;
  link_text: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string | null;
  preview_image_url: string | null;
  category: string | null;
  is_premium: boolean;
  config_schema: Record<string, any> | null;
  created_at: string;
}

// =====================================================
// EXTENDED TYPES WITH RELATIONS
// =====================================================

export interface PortfolioWithRelations extends Portfolio {
  contact?: PortfolioContact;
  socials?: PortfolioSocial[];
  services?: PortfolioService[];
  media?: PortfolioMedia[];
  testimonials?: PortfolioTestimonial[];
  ctas?: PortfolioCTA[];
  user_profile?: UserProfile;
  template?: PortfolioTemplate;
}

export interface QRCodeWithAnalytics extends QRCode {
  total_scans?: number;
  unique_scans?: number;
  recent_scans?: QRScan[];
}

export interface ShortURLWithAnalytics extends ShortURL {
  total_clicks?: number;
  unique_clicks?: number;
  recent_views?: PortfolioView[];
}

// =====================================================
// FORM INPUT TYPES
// =====================================================

export interface PortfolioFormData {
  name: string;
  tagline?: string;
  description?: string;
  brand_color?: string;
  template_id?: string;
  is_published?: boolean;
  is_public?: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface PortfolioContactFormData {
  email?: string;
  phone?: string;
  website_url?: string;
  address?: string;
}

export interface PortfolioServiceFormData {
  title: string;
  description?: string;
  price?: string;
  image_url?: string;
  is_featured?: boolean;
}

export interface PortfolioTestimonialFormData {
  client_name: string;
  client_title?: string;
  client_company?: string;
  client_avatar_url?: string;
  testimonial_text: string;
  rating?: number;
  is_featured?: boolean;
}

export interface QRCodeFormData {
  name: string;
  portfolio_id: string;
  foreground_color?: string;
  background_color?: string;
  logo_url?: string;
  logo_size?: number;
  style?: "square" | "dots" | "rounded";
  frame_style?: string;
  frame_text?: string;
  file_format?: "png" | "svg" | "pdf";
}

// =====================================================
// ANALYTICS TYPES
// =====================================================

export interface AnalyticsSummary {
  total_views: number;
  unique_views: number;
  total_scans: number;
  unique_scans: number;
  total_clicks: number;
  growth_rate: number;
  top_countries: Array<{
    country: string;
    count: number;
  }>;
  top_devices: Array<{
    device_type: string;
    count: number;
  }>;
}

export interface TimeSeriesData {
  date: string;
  views: number;
  scans: number;
  clicks: number;
}

export interface GeographicData {
  country: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  count: number;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type SortOrder = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortOrder;
}

export interface FilterConfig {
  [key: string]: string | number | boolean | null;
}

export interface SearchParams {
  q?: string;
  sort?: string;
  order?: SortOrder;
  page?: number;
  limit?: number;
  filters?: FilterConfig;
}

// Social media platform enum
export const SOCIAL_PLATFORMS = {
  FACEBOOK: "facebook",
  INSTAGRAM: "instagram",
  TWITTER: "twitter",
  LINKEDIN: "linkedin",
  YOUTUBE: "youtube",
  TIKTOK: "tiktok",
  GITHUB: "github",
  BEHANCE: "behance",
  DRIBBBLE: "dribbble",
  PINTEREST: "pinterest",
  DISCORD: "discord",
  TELEGRAM: "telegram",
  WHATSAPP: "whatsapp",
} as const;

export type SocialPlatform =
  (typeof SOCIAL_PLATFORMS)[keyof typeof SOCIAL_PLATFORMS];

// Template categories
export const TEMPLATE_CATEGORIES = {
  BUSINESS: "business",
  CREATIVE: "creative",
  MINIMAL: "minimal",
  PORTFOLIO: "portfolio",
  RESTAURANT: "restaurant",
  PHOTOGRAPHY: "photography",
} as const;

export type TemplateCategory =
  (typeof TEMPLATE_CATEGORIES)[keyof typeof TEMPLATE_CATEGORIES];

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PREMIUM: "premium",
  ENTERPRISE: "enterprise",
} as const;

export type SubscriptionTier =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

// Device types
export const DEVICE_TYPES = {
  MOBILE: "mobile",
  TABLET: "tablet",
  DESKTOP: "desktop",
} as const;

export type DeviceType = (typeof DEVICE_TYPES)[keyof typeof DEVICE_TYPES];
