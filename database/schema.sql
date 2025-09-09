-- HSA Religious Freedom Petition Landing Page Database Schema
-- Execute this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Petitions table
CREATE TABLE public.petitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  intro_md TEXT,
  goal_count INTEGER DEFAULT 10000,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signatures table
CREATE TABLE public.signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID REFERENCES public.petitions(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  consent_news BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirm_token TEXT,
  ip_hash TEXT NOT NULL,
  ua_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT phone_or_email_required CHECK (phone IS NOT NULL OR email IS NOT NULL),
  CONSTRAINT unique_phone_per_petition UNIQUE(phone, petition_id) WHERE phone IS NOT NULL,
  CONSTRAINT unique_email_per_petition UNIQUE(email, petition_id) WHERE email IS NOT NULL
);

-- Email log table
CREATE TABLE public.email_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  template TEXT NOT NULL,
  meta JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error TEXT
);

-- Petition stats view
CREATE VIEW public.petition_stats AS
SELECT 
  p.id,
  p.slug,
  p.title,
  COALESCE(COUNT(s.id) FILTER (WHERE s.status = 'confirmed'), 0) as confirmed_count
FROM public.petitions p
LEFT JOIN public.signatures s ON p.id = s.petition_id
WHERE p.is_public = true
GROUP BY p.id, p.slug, p.title;

-- Indexes for performance
CREATE INDEX idx_signatures_petition_status ON public.signatures(petition_id, status);
CREATE INDEX idx_signatures_email ON public.signatures(email);
CREATE INDEX idx_signatures_confirm_token ON public.signatures(confirm_token);
CREATE INDEX idx_petitions_slug ON public.petitions(slug);
CREATE INDEX idx_email_log_sent_at ON public.email_log(sent_at);

-- Row Level Security (RLS)
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

-- Petitions policies
CREATE POLICY "Public can read public petitions" ON public.petitions
  FOR SELECT USING (is_public = true);

CREATE POLICY "Owners can manage their petitions" ON public.petitions
  FOR ALL USING (auth.uid() = created_by);

-- Signatures policies
CREATE POLICY "Anyone can insert signatures" ON public.signatures
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can read signatures" ON public.signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.petitions 
      WHERE id = petition_id AND created_by = auth.uid()
    )
  );

-- Email log policies (service role only)
CREATE POLICY "Service role can manage email log" ON public.email_log
  FOR ALL USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.petitions TO anon, authenticated;
GRANT INSERT ON public.signatures TO anon, authenticated;
GRANT SELECT ON public.petition_stats TO anon, authenticated;
GRANT ALL ON public.email_log TO service_role;

-- Insert sample petition (replace with actual user ID)
INSERT INTO public.petitions (slug, title, intro_md, goal_count, is_public, created_by)
VALUES (
  'campaign',
  'Faith Under Siege: Stand for Religious Freedom in Korea',
  'On July 18, 2025, authorities raided homes and churches without charges. Add your name to demand due process and dignity for people of faith.',
  10000,
  true,
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT (slug) DO NOTHING;
