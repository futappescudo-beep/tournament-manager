-- Acceso de invitado: solo fixture y tabla de posiciones, sin acceso a tablas operativas.
grant usage on schema public to anon;
grant select on public.vw_fixture, public.vw_standings to anon;
