-- Portfolio Website Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create hero table
CREATE TABLE IF NOT EXISTS hero (
  id SERIAL PRIMARY KEY,
  name TEXT,
  designation TEXT,
  photo_url TEXT
);

-- Create about table
CREATE TABLE IF NOT EXISTS about (
  id SERIAL PRIMARY KEY,
  content TEXT
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_items table
CREATE TABLE IF NOT EXISTS card_items (
  id SERIAL PRIMARY KEY,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  github_link TEXT,
  demo_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_feedback table
CREATE TABLE IF NOT EXISTS project_feedback (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resume table
CREATE TABLE IF NOT EXISTS resume (
  id SERIAL PRIMARY KEY,
  file_url TEXT
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If you already have the projects table, run this to add demo_link column:
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_link TEXT;

-- Enable Row Level Security (RLS) - Optional but recommended
-- For public read access, you may want to create policies
-- For now, we'll keep it simple and allow all operations
-- You can configure RLS policies in Supabase Dashboard > Authentication > Policies

-- Note: Make sure to create the following Storage Buckets in Supabase:
-- 1. profile_images (public)
-- 2. card_images (public)
-- 3. project_images (public)
-- 4. resume_files (public)
--
-- For each bucket, set the policy to allow:
-- - SELECT (public read access)
-- - INSERT (authenticated users only, or configure as needed)
-- - UPDATE (authenticated users only, or configure as needed)
-- - DELETE (authenticated users only, or configure as needed)

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  role TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT FALSE,
  technologies TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_experiences_sort_order ON experiences(sort_order);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status);










