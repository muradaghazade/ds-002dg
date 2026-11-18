begin;

create table if not exists public.date_replies (
  id uuid primary key,
  activity text not null check (activity in ('cinema', 'food', 'coffee')),
  detail text not null check (char_length(btrim(detail)) between 1 and 160),
  date date not null,
  created_at timestamptz not null default now()
);

alter table public.date_replies enable row level security;

revoke all on table public.date_replies from public, anon, authenticated;
grant select on table public.date_replies to authenticated;
grant insert (id, activity, detail, date) on public.date_replies to anon, authenticated;

drop policy if exists guests_submit_date_replies on public.date_replies;
create policy guests_submit_date_replies on public.date_replies for insert to anon, authenticated
  with check (date >= (now() at time zone 'Asia/Baku')::date);

-- Replace this UUID with the User UID of your Supabase Auth account.
drop policy if exists owner_reads_date_replies on public.date_replies;
create policy owner_reads_date_replies
  on public.date_replies for select to authenticated
  using ((select auth.uid()) = '00000000-0000-0000-0000-000000000000'::uuid);

create or replace function public.submit_date_reply(
  reply_id uuid, reply_activity text, reply_detail text, reply_date date
)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.date_replies (id, activity, detail, date)
  values (reply_id, reply_activity, btrim(reply_detail), reply_date)
  on conflict do nothing;
$$;

revoke all on function public.submit_date_reply(uuid, text, text, date) from public, anon, authenticated;
grant execute on function public.submit_date_reply(uuid, text, text, date) to anon, authenticated;

commit;
