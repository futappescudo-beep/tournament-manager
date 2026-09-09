-- Solo el SUPER_ADMIN puede definir la estructura del torneo.
drop policy if exists super_admin_manage_tournaments on public.tournaments;
create policy super_admin_manage_tournaments on public.tournaments for all to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists super_admin_manage_categories on public.categories;
create policy super_admin_manage_categories on public.categories for all to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists super_admin_manage_zones on public.zones;
create policy super_admin_manage_zones on public.zones for all to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());

grant insert, update, delete on public.tournaments, public.categories, public.zones to authenticated;
