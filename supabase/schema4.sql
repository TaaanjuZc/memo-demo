-- Run once, after schema.sql. Safe to run more than once; also creates anything from schema2/schema3 that is missing.

-- From schema2: settings, private file storage
create table if not exists settings(key text primary key,value jsonb not null default '{}');
alter table settings enable row level security;
drop policy if exists s_sel on settings;create policy s_sel on settings for select using(is_staff());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('attachments','attachments',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf']) on conflict do nothing;
drop policy if exists att_sel on storage.objects;create policy att_sel on storage.objects for select using(bucket_id='attachments' and is_staff());
drop policy if exists att_ins on storage.objects;create policy att_ins on storage.objects for insert with check(bucket_id='attachments' and is_staff());

-- From schema3: Woosh email events
create table if not exists woosh_events(
 id bigserial primary key,
 message_id text unique not null,
 received_at timestamptz,
 sender text, subject text,
 kind text,
 order_ref text, tracking text, event_date date,
 status text not null default 'review',
 reason text,
 order_ids text[] not null default '{}',
 applied_order text,
 resolved_by text, resolved_at timestamptz,
 created_at timestamptz not null default now());
alter table woosh_events enable row level security;
drop policy if exists w_sel on woosh_events;create policy w_sel on woosh_events for select using(is_staff());
drop policy if exists w_upd on woosh_events;create policy w_upd on woosh_events for update using(is_staff());

-- Per-person access set in Admin. Defaults must match DEFAULTS in lib/perms.js.
alter table profiles add column if not exists perms jsonb;
create or replace function has_perm(k text) returns bool language sql security definer stable set search_path=public as $$
select coalesce((select p.role='admin' or coalesce((p.perms->>k)::bool,case k when 'verify_payments' then p.role='finance' else false end)
from profiles p where p.id=auth.uid() and p.active),false)$$;
create or replace function guard_pay() returns trigger language plpgsql security definer set search_path=public as $$
begin if auth.uid() is null or has_perm('verify_payments') then return new; end if;
if exists(select 1 from jsonb_array_elements(coalesce(new.data->'pay','[]')) with ordinality n(e,i) where coalesce((n.e->>'ok')::bool,false) and (old.data->'pay'->(n.i::int-1)) is distinct from n.e)
then raise exception 'You do not have permission to verify payments'; end if;
return new; end $$;
drop trigger if exists guard_pay_t on orders;create trigger guard_pay_t before update on orders for each row execute function guard_pay();
drop policy if exists o_del on orders;create policy o_del on orders for delete using(has_perm('delete_orders'));
drop policy if exists att_del on storage.objects;create policy att_del on storage.objects for delete using(bucket_id='attachments' and has_perm('delete_orders'));
drop policy if exists s_all on settings;create policy s_all on settings for all using(has_perm('settings')) with check(has_perm('settings'));
notify pgrst,'reload schema';
