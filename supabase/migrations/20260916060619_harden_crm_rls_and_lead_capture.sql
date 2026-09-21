-- Applied to production Supabase on 2026-09-16.
-- Harden JEL CRM authorization, lead capture, and database performance.

alter table public.leads alter column email drop not null;

drop policy if exists "Allow authenticated users to insert leads" on public.leads;
drop policy if exists "Allow authenticated users to read leads" on public.leads;
drop policy if exists "Allow authenticated users to update leads" on public.leads;
drop policy if exists jel_admin_manage_leads on public.leads;
drop policy if exists jel_staff_read_leads on public.leads;
drop policy if exists leads_staff_read on public.leads;
drop policy if exists leads_staff_update on public.leads;
drop policy if exists leads_admin_delete on public.leads;

create policy leads_staff_read on public.leads for select to authenticated using (public.is_jel_staff());
create policy leads_staff_insert on public.leads for insert to authenticated with check (public.is_jel_staff());
create policy leads_staff_update on public.leads for update to authenticated using (public.is_jel_staff()) with check (public.is_jel_staff());
create policy leads_admin_delete on public.leads for delete to authenticated using (public.is_jel_admin());

drop policy if exists admins_manage_staff_profiles on public.staff_profiles;
drop policy if exists admins_read_staff_profiles on public.staff_profiles;
drop policy if exists staff_profiles_admin_manage on public.staff_profiles;
drop policy if exists staff_profiles_self_read on public.staff_profiles;
drop policy if exists staff_read_own_profile on public.staff_profiles;

create policy staff_profiles_read on public.staff_profiles for select to authenticated using ((id = (select auth.uid())) or public.is_jel_admin());
create policy staff_profiles_admin_insert on public.staff_profiles for insert to authenticated with check (public.is_jel_admin());
create policy staff_profiles_admin_update on public.staff_profiles for update to authenticated using (public.is_jel_admin()) with check (public.is_jel_admin());
create policy staff_profiles_admin_delete on public.staff_profiles for delete to authenticated using (public.is_jel_admin());

drop policy if exists students_self_read on public.students;
drop policy if exists students_self_update on public.students;
drop policy if exists students_staff_manage on public.students;

create policy students_read on public.students for select to authenticated using ((auth_user_id = (select auth.uid())) or public.is_jel_staff());
create policy students_staff_insert on public.students for insert to authenticated with check (public.is_jel_staff());
create policy students_update on public.students for update to authenticated using ((auth_user_id = (select auth.uid())) or public.is_jel_staff()) with check ((auth_user_id = (select auth.uid())) or public.is_jel_staff());
create policy students_staff_delete on public.students for delete to authenticated using (public.is_jel_staff());

drop policy if exists applications_staff_manage on public.applications;
drop policy if exists applications_student_read on public.applications;
create policy applications_read on public.applications for select to authenticated using ((student_id = public.current_student_id()) or public.is_jel_staff());
create policy applications_staff_insert on public.applications for insert to authenticated with check (public.is_jel_staff());
create policy applications_staff_update on public.applications for update to authenticated using (public.is_jel_staff()) with check (public.is_jel_staff());
create policy applications_staff_delete on public.applications for delete to authenticated using (public.is_jel_staff());

drop policy if exists documents_staff_manage on public.documents;
drop policy if exists documents_student_read on public.documents;
create policy documents_read on public.documents for select to authenticated using ((student_id = public.current_student_id()) or public.is_jel_staff());
create policy documents_staff_insert on public.documents for insert to authenticated with check (public.is_jel_staff());
create policy documents_staff_update on public.documents for update to authenticated using (public.is_jel_staff()) with check (public.is_jel_staff());
create policy documents_staff_delete on public.documents for delete to authenticated using (public.is_jel_staff());

drop policy if exists follow_ups_staff_manage on public.follow_ups;
create policy follow_ups_staff_read on public.follow_ups for select to authenticated using (public.is_jel_staff());
create policy follow_ups_staff_insert on public.follow_ups for insert to authenticated with check (public.is_jel_staff());
create policy follow_ups_staff_update on public.follow_ups for update to authenticated using (public.is_jel_staff()) with check (public.is_jel_staff());
create policy follow_ups_staff_delete on public.follow_ups for delete to authenticated using (public.is_jel_staff());

create or replace function public.handle_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.current_student_id() from public, anon, authenticated;
grant execute on function public.current_student_id() to authenticated;
revoke all on function public.generate_student_id() from public, anon, authenticated;
grant execute on function public.generate_student_id() to authenticated;
revoke all on function public.is_jel_admin() from public, anon, authenticated;
grant execute on function public.is_jel_admin() to authenticated;
revoke all on function public.is_jel_staff() from public, anon, authenticated;
grant execute on function public.is_jel_staff() to authenticated;
revoke all on function public.sync_student_from_auth() from public, anon, authenticated;
revoke all on function public.submit_public_lead(text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_public_lead(text,text,text,text,text,text,text) to anon, authenticated;

drop table if exists public.table_name;

create index if not exists activity_logs_actor_user_id_idx on public.activity_logs(actor_user_id);
create index if not exists activity_logs_student_id_idx on public.activity_logs(student_id);
create index if not exists applications_assigned_to_idx on public.applications(assigned_to);
create index if not exists documents_application_id_idx on public.documents(application_id);
create index if not exists follow_ups_application_id_idx on public.follow_ups(application_id);
create index if not exists follow_ups_assigned_to_idx on public.follow_ups(assigned_to);
create index if not exists follow_ups_student_id_idx on public.follow_ups(student_id);
create index if not exists leads_assigned_to_idx on public.leads(assigned_to);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_status_idx on public.leads(status);
