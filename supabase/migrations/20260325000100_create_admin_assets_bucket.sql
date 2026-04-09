insert into storage.buckets (id, name, public)
values ('admin-assets', 'admin-assets', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view admin assets'
  ) then
    create policy "Public can view admin assets"
    on storage.objects
    for select
    using (bucket_id = 'admin-assets');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins can upload admin assets'
  ) then
    create policy "Admins can upload admin assets"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'admin-assets'
      and public.has_role(auth.uid(), 'admin')
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins can update admin assets'
  ) then
    create policy "Admins can update admin assets"
    on storage.objects
    for update
    to authenticated
    using (
      bucket_id = 'admin-assets'
      and public.has_role(auth.uid(), 'admin')
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins can delete admin assets'
  ) then
    create policy "Admins can delete admin assets"
    on storage.objects
    for delete
    to authenticated
    using (
      bucket_id = 'admin-assets'
      and public.has_role(auth.uid(), 'admin')
    );
  end if;
end $$;
