-- Habilita al SUPER_ADMIN a administrar las canchas y los árbitros
-- usados al programar partidos del fixture.

drop policy if exists super_admin_manage_fields on public.fields;
create policy super_admin_manage_fields on public.fields for all to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists super_admin_manage_referees on public.referees;
create policy super_admin_manage_referees on public.referees for all to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());

grant insert, update, delete on public.fields, public.referees to authenticated;
