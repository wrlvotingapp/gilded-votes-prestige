-- Enforce single vote per subcategory and improve storage access for certificates (retry with conditional policy creation)

-- 1) Prevent duplicate votes for same candidate (double-click protection)
create unique index if not exists uniq_votes_user_candidate on public.votes(user_id, candidate_id);

-- 2) Trigger to prevent more than one vote per subcategory per user
create or replace function public.prevent_multiple_votes_per_subcategory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_subcategory uuid;
begin
  select subcategory_id into new_subcategory from public.candidates where id = NEW.candidate_id;
  if new_subcategory is null then
    raise exception 'Invalid candidate';
  end if;

  if exists (
    select 1
    from public.votes v
    join public.candidates c on c.id = v.candidate_id
    where v.user_id = NEW.user_id
      and c.subcategory_id = new_subcategory
  ) then
    raise exception 'You have already voted in this subcategory';
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_prevent_multiple_votes_per_subcategory on public.votes;
create trigger trg_prevent_multiple_votes_per_subcategory
before insert on public.votes
for each row
execute function public.prevent_multiple_votes_per_subcategory();

-- 3) Storage policies for certificates bucket (private bucket with controlled access)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Admins manage certificates bucket'
  ) THEN
    CREATE POLICY "Admins manage certificates bucket"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'certificates' AND public.has_role(auth.uid(), 'admin'))
    WITH CHECK (bucket_id = 'certificates' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Users can view own certificate files'
  ) THEN
    CREATE POLICY "Users can view own certificate files"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'certificates'
      AND split_part(name, '/', 1) = auth.uid()::text
    );
  END IF;
END$$;
