-- Phase 2 foundation: role permissions and document retention.
-- Additive only: does not alter existing student, Firebase, or ERP tables.

create table if not exists public.staff_role_permissions (
  role text not null check (role in ('super_admin', 'admin', 'counselor', 'finance', 'viewer', 'student')),
  permission text not null,
  allowed boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (role, permission)
);

create table if not exists public.document_retention_policies (
  document_category text primary key,
  retention_days integer not null check (retention_days >= 0),
  legal_hold_required boolean not null default true,
  auto_delete_enabled boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_profiles
    where user_id = auth.uid() and active = true
  );
$$;

create or replace function public.is_staff_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_profiles
    where user_id = auth.uid()
      and active = true
      and role in ('super_admin', 'admin')
  );
$$;

alter table public.staff_role_permissions enable row level security;
alter table public.document_retention_policies enable row level security;

drop policy if exists staff_role_permissions_staff_read on public.staff_role_permissions;
create policy staff_role_permissions_staff_read
on public.staff_role_permissions for select to authenticated
using (public.is_active_staff());

drop policy if exists staff_role_permissions_admin_manage on public.staff_role_permissions;
create policy staff_role_permissions_admin_manage
on public.staff_role_permissions for all to authenticated
using (public.is_staff_admin())
with check (public.is_staff_admin());

drop policy if exists document_retention_policies_staff_read on public.document_retention_policies;
create policy document_retention_policies_staff_read
on public.document_retention_policies for select to authenticated
using (public.is_active_staff());

drop policy if exists document_retention_policies_admin_manage on public.document_retention_policies;
create policy document_retention_policies_admin_manage
on public.document_retention_policies for all to authenticated
using (public.is_staff_admin())
with check (public.is_staff_admin());

insert into public.staff_role_permissions (role, permission, allowed)
values
  ('super_admin', 'manage_staff_roles', true),
  ('super_admin', 'manage_students', true),
  ('super_admin', 'manage_documents', true),
  ('super_admin', 'manage_finance', true),
  ('admin', 'manage_students', true),
  ('admin', 'manage_documents', true),
  ('admin', 'manage_finance', true),
  ('counselor', 'read_assigned_students', true),
  ('counselor', 'manage_assigned_applications', true),
  ('counselor', 'manage_follow_ups', true),
  ('finance', 'read_finance_fields', true),
  ('finance', 'manage_finance', true),
  ('viewer', 'read_approved_summaries', true),
  ('student', 'read_own_profile', true),
  ('student', 'read_own_application_status', true)
on conflict (role, permission) do nothing;

insert into public.document_retention_policies (document_category, retention_days, legal_hold_required, auto_delete_enabled, notes)
values
  ('identity_document', 365, true, false, 'Active case plus 12 months; review legal or immigration holds before deletion.'),
  ('academic_record', 730, true, false, 'Active case plus 24 months; anonymize or delete after review.'),
  ('english_test_certificate', 730, true, false, 'Active case plus 24 months.'),
  ('offer_and_visa_record', 730, true, false, 'Active case plus 24 months after final outcome.'),
  ('financial_proof', 365, true, false, 'Minimum operational period plus 12 months; finance access by default.'),
  ('consent_and_communication', 730, true, false, 'Preserve consent timestamp, source, and policy version.'),
  ('abandoned_application', 90, false, false, 'Review before deletion; do not retain unnecessary uploaded files.')
on conflict (document_category) do nothing;

create index if not exists documents_status_created_at_idx
on public.documents (status, created_at);

comment on table public.staff_role_permissions is 'Phase 2 approved permission catalog; enforcement remains coupled to RLS and authenticated staff roles.';
comment on table public.document_retention_policies is 'Phase 2 retention schedule; automatic deletion is disabled until policy approval and legal validation.';
