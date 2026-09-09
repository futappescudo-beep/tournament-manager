-- El trigger de auditoría se ejecutaba con los permisos del usuario web y
-- impedía crear equipos/jugadores. La función conserva la auditoría, pero
-- escribe como su propietario (postgres) y no expone audit_log al cliente.
create or replace function public.fn_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log (user_id, table_name, schema_name, record_id, action, new_values)
    values (auth.uid(), tg_table_name, tg_table_schema, new.id, tg_op, to_jsonb(new));
    return new;
  end if;

  if tg_op = 'UPDATE' then
    insert into public.audit_log (user_id, table_name, schema_name, record_id, action, old_values, new_values)
    values (auth.uid(), tg_table_name, tg_table_schema, new.id, tg_op, to_jsonb(old), to_jsonb(new));
    return new;
  end if;

  insert into public.audit_log (user_id, table_name, schema_name, record_id, action, old_values)
  values (auth.uid(), tg_table_name, tg_table_schema, old.id, tg_op, to_jsonb(old));
  return old;
end;
$$;
