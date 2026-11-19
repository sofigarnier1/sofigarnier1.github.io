-- Contacto inteligente: tabla de mensajes. Correr UNA vez en el SQL Editor del proyecto Supabase `portfolio-asistente`.
-- Seguridad: con la clave pública (anon) solo se puede INSERTAR, a través de la función; nadie puede leer los mensajes salvo vos desde el panel.
create table if not exists public.mensajes (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  nombre text not null check (char_length(nombre) between 1 and 60),
  mail text check (mail is null or char_length(mail) <= 120),
  mensaje text not null check (char_length(mensaje) between 5 and 600),
  categoria text not null check (categoria in ('oferta_laboral','consulta_tecnica','colaboracion','otro')),
  resumen text
);
alter table public.mensajes enable row level security;
revoke all on public.mensajes from anon, authenticated;

create or replace function public.guardar_mensaje(p_nombre text, p_mail text, p_mensaje text, p_categoria text, p_resumen text)
returns void language sql security definer set search_path = public as $$
  insert into public.mensajes (nombre, mail, mensaje, categoria, resumen)
  values (left(p_nombre, 60), nullif(left(p_mail, 120), ''), left(p_mensaje, 600), p_categoria, left(p_resumen, 160));
$$;
revoke all on function public.guardar_mensaje(text, text, text, text, text) from public;
grant execute on function public.guardar_mensaje(text, text, text, text, text) to anon;
