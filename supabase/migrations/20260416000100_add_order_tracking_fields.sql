alter table public.orders
add column if not exists tracking_number text,
add column if not exists carrier text,
add column if not exists tracking_url text;

update public.orders
set carrier = coalesce(nullif(carrier, ''), 'Australia Post')
where tracking_number is not null
  and trim(tracking_number) <> ''
  and (carrier is null or trim(carrier) = '');
