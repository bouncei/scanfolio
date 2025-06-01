-- Insert sample portfolio templates
INSERT INTO portfolio_templates (
  id,
  name,
  description,
  preview_image,
  is_premium,
  config
) VALUES 
(
  gen_random_uuid(),
  'Modern Business',
  'Clean and professional template perfect for service-based businesses',
  '/templates/modern-business.jpg',
  false,
  '{
    "layout": "modern",
    "sections": ["hero", "about", "services", "testimonials", "contact"],
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#1E40AF",
      "accent": "#F59E0B"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter"
    }
  }'::jsonb
),
(
  gen_random_uuid(),
  'Creative Portfolio',
  'Showcase your creative work with this visually stunning template',
  '/templates/creative-portfolio.jpg',
  false,
  '{
    "layout": "creative",
    "sections": ["hero", "portfolio", "about", "services", "contact"],
    "colors": {
      "primary": "#8B5CF6",
      "secondary": "#7C3AED",
      "accent": "#F59E0B"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter"
    }
  }'::jsonb
),
(
  gen_random_uuid(),
  'Restaurant & Food',
  'Perfect for restaurants, cafes, and food businesses',
  '/templates/restaurant.jpg',
  false,
  '{
    "layout": "restaurant",
    "sections": ["hero", "menu", "about", "gallery", "contact"],
    "colors": {
      "primary": "#DC2626",
      "secondary": "#B91C1C",
      "accent": "#F59E0B"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter"
    }
  }'::jsonb
),
(
  gen_random_uuid(),
  'Tech Startup',
  'Modern and innovative design for tech companies and startups',
  '/templates/tech-startup.jpg',
  true,
  '{
    "layout": "tech",
    "sections": ["hero", "features", "about", "team", "contact"],
    "colors": {
      "primary": "#06B6D4",
      "secondary": "#0891B2",
      "accent": "#F59E0B"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter"
    }
  }'::jsonb
),
(
  gen_random_uuid(),
  'Personal Brand',
  'Elegant template for personal branding and consulting',
  '/templates/personal-brand.jpg',
  true,
  '{
    "layout": "personal",
    "sections": ["hero", "about", "expertise", "testimonials", "contact"],
    "colors": {
      "primary": "#059669",
      "secondary": "#047857",
      "accent": "#F59E0B"
    },
    "typography": {
      "heading": "Playfair Display",
      "body": "Inter"
    }
  }'::jsonb
),
(
  gen_random_uuid(),
  'E-commerce Store',
  'Perfect for online stores and product showcases',
  '/templates/ecommerce.jpg',
  true,
  '{
    "layout": "ecommerce",
    "sections": ["hero", "products", "about", "testimonials", "contact"],
    "colors": {
      "primary": "#7C2D12",
      "secondary": "#92400E",
      "accent": "#F59E0B"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter"
    }
  }'::jsonb
); 