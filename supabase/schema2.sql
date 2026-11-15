-- Run once, after schema.sql
create table settings(key text primary key,value jsonb not null default '{}');
alter table settings enable row level security;
create policy s_sel on settings for select using(is_staff());
create policy s_all on settings for all using(is_admin()) with check(is_admin());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('attachments','attachments',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf']) on conflict do nothing;
create policy att_sel on storage.objects for select using(bucket_id='attachments' and is_staff());
create policy att_ins on storage.objects for insert with check(bucket_id='attachments' and is_staff());
create policy att_del on storage.objects for delete using(bucket_id='attachments' and is_admin());
create function guard_pay() returns trigger language plpgsql security definer set search_path=public as $$
declare r text;
begin select role into r from profiles where id=auth.uid() and active;
if r in('admin','finance') then return new; end if;
if exists(select 1 from jsonb_array_elements(coalesce(new.data->'pay','[]')) with ordinality n(e,i) where coalesce((n.e->>'ok')::bool,false) and (old.data->'pay'->(n.i::int-1)) is distinct from n.e)
then raise exception 'Only Finance or Admin can verify payments'; end if;
return new; end $$;
create trigger guard_pay_t before update on orders for each row execute function guard_pay();
