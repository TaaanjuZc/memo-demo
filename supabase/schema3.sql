-- Run once, after schema2.sql (Woosh email integration)
create table woosh_events(
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
create policy w_sel on woosh_events for select using(is_staff());
create policy w_upd on woosh_events for update using(is_staff());
