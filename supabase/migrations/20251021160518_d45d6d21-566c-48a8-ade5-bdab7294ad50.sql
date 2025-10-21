-- Create table for social media links
CREATE TABLE public.social_media_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;

-- Anyone can view social media links
CREATE POLICY "Anyone can view social media links"
ON public.social_media_links
FOR SELECT
USING (true);

-- Admins can manage social media links
CREATE POLICY "Admins can manage social media links"
ON public.social_media_links
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_social_media_links_updated_at
BEFORE UPDATE ON public.social_media_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default social media links
INSERT INTO public.social_media_links (platform, url, icon, display_order) VALUES
  ('Instagram', 'https://instagram.com/owrvotes', 'Instagram', 1),
  ('Facebook', 'https://facebook.com/owrvotes', 'Facebook', 2),
  ('Twitter', 'https://twitter.com/owrvotes', 'Twitter', 3),
  ('YouTube', 'https://youtube.com/@owrvotes', 'Youtube', 4);