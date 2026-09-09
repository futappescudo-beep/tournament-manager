insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-photos', 'player-photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists player_photos_upload on storage.objects;
create policy player_photos_upload on storage.objects for insert to authenticated
with check (bucket_id = 'player-photos' and public.can_manage_tournament());
drop policy if exists player_photos_read on storage.objects;
create policy player_photos_read on storage.objects for select to authenticated
using (bucket_id = 'player-photos' and public.is_backoffice_user());
drop policy if exists player_photos_delete on storage.objects;
create policy player_photos_delete on storage.objects for delete to authenticated
using (bucket_id = 'player-photos' and public.can_manage_tournament());
grant usage on schema storage to authenticated;
grant select, insert, delete on storage.objects to authenticated;
