# Supabase Database Setup

To use this application, you must run the following SQL in your Supabase project's **SQL Editor**. 

This will create the necessary tables and enable Row Level Security (RLS) so that users can only see their own data (optional, currently tables are public for ease of setup).

## 1. Create Tables

```sql
-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category_id UUID,
  unit TEXT DEFAULT 'Nos',
  purchase_price NUMERIC(10, 2) DEFAULT 0,
  selling_price NUMERIC(10, 2) DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  current_stock INTEGER DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'Active',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'Purchase' or 'Sale'
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  entity_id UUID, -- Supplier or Customer
  total_amount NUMERIC(15, 2) DEFAULT 0,
  status TEXT DEFAULT 'Completed',
  notes TEXT
);

-- Stock Movements Table
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  type TEXT NOT NULL,
  qty_in INTEGER DEFAULT 0,
  qty_out INTEGER DEFAULT 0,
  balance_qty INTEGER DEFAULT 0,
  reference_id UUID
);
```

## 2. Insert Initial Data (Optional)
```sql
INSERT INTO categories (name) VALUES ('General'), ('Electronics'), ('Industrial'), ('Office');
```
