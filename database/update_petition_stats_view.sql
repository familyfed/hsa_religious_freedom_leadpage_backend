-- Update petition_stats view to include pending_count and total_count
-- Execute this in your Supabase SQL editor

-- Drop and recreate the view with additional counts
DROP VIEW IF EXISTS public.petition_stats;

CREATE VIEW public.petition_stats AS
SELECT 
  p.id,
  p.slug,
  p.title,
  COALESCE(COUNT(s.id) FILTER (WHERE s.status = 'confirmed'), 0) as confirmed_count,
  COALESCE(COUNT(s.id) FILTER (WHERE s.status = 'pending'), 0) as pending_count,
  COALESCE(COUNT(s.id), 0) as total_count
FROM public.petitions p
LEFT JOIN public.signatures s ON p.id = s.petition_id
WHERE p.is_public = true
GROUP BY p.id, p.slug, p.title;

-- Grant permissions
GRANT SELECT ON public.petition_stats TO anon, authenticated;
