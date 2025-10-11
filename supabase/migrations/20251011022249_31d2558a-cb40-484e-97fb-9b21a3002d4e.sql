-- Add status field to profiles for ban functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'banned'));

-- Update certificates table to support admin uploads
ALTER TABLE public.certificates
DROP CONSTRAINT IF EXISTS certificates_candidate_id_fkey,
ADD COLUMN IF NOT EXISTS certificate_file_url text,
ALTER COLUMN candidate_id DROP NOT NULL;

-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload certificates
CREATE POLICY "Admins can upload certificates"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificates' AND
  has_role(auth.uid(), 'admin')
);

-- Allow admins to manage certificate files
CREATE POLICY "Admins can manage certificates"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'certificates' AND
  has_role(auth.uid(), 'admin')
);

-- Allow users to view their own certificates
CREATE POLICY "Users can view their certificates"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificates' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Update RLS for admins to manage all certificates
CREATE POLICY "Admins can create certificates for any user"
ON public.certificates
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all certificates"
ON public.certificates
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));