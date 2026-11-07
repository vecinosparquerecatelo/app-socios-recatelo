-- ============================================================
-- Desbloquear un código de socio (solo la directiva)
-- Sirve para el botón «Desbloquear» de Mi cuenta > Bloquear códigos.
-- Bloquear ya funciona sin esto.
-- Pegar TODO este texto en Supabase > SQL Editor > New query > Run
-- ============================================================

create or replace function public.activar_codigo(codigo text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not public.es_directiva() then return false; end if;
  update public.codigos k set activo = true where k.codigo = activar_codigo.codigo;
  return found;
end $$;

grant execute on function public.activar_codigo(text) to authenticated;
