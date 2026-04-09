alter table public.profiles
add column if not exists membership_tier text not null default 'free';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_membership_tier_check'
  ) then
    alter table public.profiles
    add constraint profiles_membership_tier_check
    check (membership_tier in ('free', 'premium'));
  end if;
end $$;

alter table public.events
add column if not exists member_price numeric(10,2),
add column if not exists is_members_only boolean not null default false;

update public.events
set member_price = coalesce(member_price, price)
where member_price is null;

alter table public.books
add column if not exists member_price numeric(10,2),
add column if not exists is_members_only boolean not null default false;

update public.books
set member_price = coalesce(member_price, price)
where member_price is null;

alter table public.blog_posts
add column if not exists is_members_only boolean not null default false;
