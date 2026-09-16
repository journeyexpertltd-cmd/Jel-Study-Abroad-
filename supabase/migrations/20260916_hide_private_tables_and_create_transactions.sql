-- Applied to production Supabase on 2026-09-16.
-- Hide private CRM tables from anonymous API discovery and create payment transaction persistence.

revoke all on table public.activity_logs from anon;
revoke all on table public.applications from anon;
revoke all on table public.documents from anon;
revoke all on table public.follow_ups from anon;
revoke all on table public.leads from anon;
revoke all on table public.staff_profiles from anon;
revoke all on table public.students from anon;

create table if not exists public.transactions (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  fee_type text,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'BDT',
  status text not null default 'Pending',
  bank_tran_id text,
  card_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;
revoke all on table public.transactions from anon;
grant select, insert, update, delete on table public.transactions to authenticated;

create policy transactions_staff_read on public.transactions for select to authenticated using (public.is_jel_staff());
create policy transactions_staff_insert on public.transactions for insert to authenticated with check (public.is_jel_staff());
create policy transactions_staff_update on public.transactions for update to authenticated using (public.is_jel_staff()) with check (public.is_jel_staff());
create policy transactions_admin_delete on public.transactions for delete to authenticated using (public.is_jel_admin());

create index if not exists transactions_created_at_idx on public.transactions(created_at desc);
create index if not exists transactions_status_idx on public.transactions(status);

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at before update on public.transactions for each row execute function public.handle_updated_at();
