-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_images table
CREATE TABLE IF NOT EXISTS menu_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table (extracted from images via AI)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category VARCHAR(100),
  allergens TEXT[],
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample restaurant
INSERT INTO restaurants (id, name, description, logo_url) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Bella Vista Restaurant',
  'Authentic Italian cuisine with a modern twist',
  '/placeholder.svg?height=100&width=100'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (restaurant_id, name, description, price, category, is_vegetarian, is_vegan) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Margherita Pizza', 'Fresh mozzarella, tomato sauce, basil', 18.99, 'Pizza', true, false),
('550e8400-e29b-41d4-a716-446655440000', 'Spaghetti Carbonara', 'Eggs, pancetta, parmesan, black pepper', 22.99, 'Pasta', false, false),
('550e8400-e29b-41d4-a716-446655440000', 'Caesar Salad', 'Romaine lettuce, croutons, parmesan, caesar dressing', 14.99, 'Salads', true, false),
('550e8400-e29b-41d4-a716-446655440000', 'Tiramisu', 'Coffee-soaked ladyfingers, mascarpone, cocoa', 8.99, 'Desserts', true, false);
