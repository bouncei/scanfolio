-- ScanFolio Database Schema
-- This file contains all table definitions for the ScanFolio application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    company_name VARCHAR(255),
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- BUSINESS PORTFOLIOS
-- =====================================================

-- Portfolio main table
CREATE TABLE portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE, -- For custom URLs
    tagline VARCHAR(500),
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    brand_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    template_id VARCHAR(50) DEFAULT 'modern',
    is_published BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    custom_domain VARCHAR(255),
    seo_title VARCHAR(60),
    seo_description VARCHAR(160),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio contact information
CREATE TABLE portfolio_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    email VARCHAR(255),
    phone VARCHAR(20),
    website_url TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio social media links
CREATE TABLE portfolio_socials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'facebook', 'instagram', 'linkedin', etc.
    url TEXT NOT NULL,
    display_text VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio services/products
CREATE TABLE portfolio_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price VARCHAR(100), -- Flexible pricing format
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio gallery/media
CREATE TABLE portfolio_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video', 'document')),
    url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    alt_text VARCHAR(255),
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio testimonials
CREATE TABLE portfolio_testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    client_title VARCHAR(255),
    client_company VARCHAR(255),
    client_avatar_url TEXT,
    testimonial_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio call-to-action buttons
CREATE TABLE portfolio_ctas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    button_text VARCHAR(50) NOT NULL,
    button_style VARCHAR(20) DEFAULT 'primary', -- 'primary', 'secondary', 'outline'
    icon VARCHAR(50), -- Lucide icon name
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- QR CODES
-- =====================================================

-- QR Code configurations
CREATE TABLE qr_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_url TEXT NOT NULL, -- The URL the QR code points to
    qr_data TEXT NOT NULL, -- The actual data encoded in the QR code
    
    -- Customization options
    foreground_color VARCHAR(7) DEFAULT '#000000',
    background_color VARCHAR(7) DEFAULT '#FFFFFF',
    logo_url TEXT,
    logo_size INTEGER DEFAULT 20, -- Percentage of QR code size
    style VARCHAR(20) DEFAULT 'square', -- 'square', 'dots', 'rounded'
    frame_style VARCHAR(20), -- 'none', 'square', 'rounded'
    frame_text VARCHAR(100),
    
    -- File information
    file_format VARCHAR(10) DEFAULT 'png', -- 'png', 'svg', 'pdf'
    file_size INTEGER, -- Generated file size in bytes
    file_url TEXT, -- URL to generated QR code file
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SHORT URLs
-- =====================================================

-- Short URL management
CREATE TABLE short_urls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    short_code VARCHAR(20) NOT NULL UNIQUE, -- The short identifier
    original_url TEXT NOT NULL,
    custom_alias VARCHAR(50), -- Optional custom alias
    title VARCHAR(255),
    description TEXT,
    
    -- Configuration
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    password_hash TEXT, -- Optional password protection
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, custom_alias)
);

-- =====================================================
-- ANALYTICS & TRACKING
-- =====================================================

-- Portfolio view tracking
CREATE TABLE portfolio_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    short_url_id UUID REFERENCES short_urls(id) ON DELETE SET NULL,
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
    
    -- Visitor information
    visitor_id UUID, -- Anonymous visitor identifier
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Geographic data
    country VARCHAR(2), -- ISO country code
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Device information
    device_type VARCHAR(20), -- 'mobile', 'tablet', 'desktop'
    browser VARCHAR(50),
    os VARCHAR(50),
    
    -- Timing
    session_duration INTEGER, -- in seconds
    pages_viewed INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Code scan tracking
CREATE TABLE qr_scans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
    portfolio_view_id UUID REFERENCES portfolio_views(id) ON DELETE SET NULL,
    
    -- Scan metadata
    scan_method VARCHAR(20), -- 'camera', 'upload', 'api'
    ip_address INET,
    user_agent TEXT,
    
    -- Geographic data
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Device information
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link click tracking (for links within portfolios)
CREATE TABLE link_clicks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    portfolio_view_id UUID REFERENCES portfolio_views(id) ON DELETE SET NULL,
    
    -- Link information
    link_type VARCHAR(20), -- 'social', 'cta', 'contact', 'media'
    link_url TEXT NOT NULL,
    link_text VARCHAR(255),
    
    -- Click metadata
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEMPLATES & CUSTOMIZATION
-- =====================================================

-- Portfolio templates
CREATE TABLE portfolio_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    preview_image_url TEXT,
    category VARCHAR(50), -- 'business', 'creative', 'minimal', etc.
    is_premium BOOLEAN DEFAULT false,
    config_schema JSONB, -- Template configuration options
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Portfolio indexes
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_slug ON portfolios(slug);
CREATE INDEX idx_portfolios_is_published ON portfolios(is_published);

-- QR Code indexes
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX idx_qr_codes_portfolio_id ON qr_codes(portfolio_id);

-- Short URL indexes
CREATE INDEX idx_short_urls_short_code ON short_urls(short_code);
CREATE INDEX idx_short_urls_user_id ON short_urls(user_id);

-- Analytics indexes
CREATE INDEX idx_portfolio_views_portfolio_id ON portfolio_views(portfolio_id);
CREATE INDEX idx_portfolio_views_created_at ON portfolio_views(created_at);
CREATE INDEX idx_qr_scans_qr_code_id ON qr_scans(qr_code_id);
CREATE INDEX idx_qr_scans_created_at ON qr_scans(created_at);
CREATE INDEX idx_link_clicks_portfolio_id ON link_clicks(portfolio_id);
CREATE INDEX idx_link_clicks_created_at ON link_clicks(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_socials ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_ctas ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_urls ENABLE ROW LEVEL SECURITY;

-- User profile policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Portfolio policies
CREATE POLICY "Users can manage own portfolios" ON portfolios
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published portfolios" ON portfolios
    FOR SELECT USING (is_published = true AND is_public = true);

-- Portfolio related table policies (inherit from portfolio)
CREATE POLICY "Users can manage own portfolio contacts" ON portfolio_contacts
    FOR ALL USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own portfolio socials" ON portfolio_socials
    FOR ALL USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own portfolio services" ON portfolio_services
    FOR ALL USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own portfolio media" ON portfolio_media
    FOR ALL USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own portfolio testimonials" ON portfolio_testimonials
    FOR ALL USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own portfolio CTAs" ON portfolio_ctas
    FOR ALL USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

-- QR Code policies
CREATE POLICY "Users can manage own QR codes" ON qr_codes
    FOR ALL USING (auth.uid() = user_id);

-- Short URL policies
CREATE POLICY "Users can manage own short URLs" ON short_urls
    FOR ALL USING (auth.uid() = user_id);

-- Analytics policies (read-only for users, insert-only for public)
CREATE POLICY "Users can view own analytics" ON portfolio_views
    FOR SELECT USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert portfolio views" ON portfolio_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own QR scan analytics" ON qr_scans
    FOR SELECT USING (
        qr_code_id IN (
            SELECT id FROM qr_codes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert QR scans" ON qr_scans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own link click analytics" ON link_clicks
    FOR SELECT USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert link clicks" ON link_clicks
    FOR INSERT WITH CHECK (true);

-- Template policies (read-only for all)
ALTER TABLE portfolio_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view templates" ON portfolio_templates
    FOR SELECT USING (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_services_updated_at BEFORE UPDATE ON portfolio_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at BEFORE UPDATE ON qr_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_short_urls_updated_at BEFORE UPDATE ON short_urls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique short codes
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
    random_index INTEGER;
BEGIN
    -- Generate 8 character random string
    FOR i IN 1..8 LOOP
        random_index := floor(random() * length(chars) + 1);
        result := result || substr(chars, random_index, 1);
    END LOOP;
    
    -- Check if code already exists, regenerate if it does
    WHILE EXISTS(SELECT 1 FROM short_urls WHERE short_code = result) LOOP
        result := '';
        FOR i IN 1..8 LOOP
            random_index := floor(random() * length(chars) + 1);
            result := result || substr(chars, random_index, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert default templates
INSERT INTO portfolio_templates (id, name, description, category) VALUES
('modern', 'Modern', 'Clean and professional design with bold typography', 'business'),
('minimalist', 'Minimalist', 'Simple and elegant layout focusing on content', 'minimal'),
('creative', 'Creative', 'Vibrant and artistic design for creative professionals', 'creative'); 