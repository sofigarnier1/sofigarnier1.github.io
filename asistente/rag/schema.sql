-- Esquema del RAG del asistente (Supabase / PostgreSQL + pgvector). Se corre una sola vez en el SQL Editor.
create extension if not exists vector;

create table if not exists fragmentos (
  id         bigint generated always as identity primary key,
  archivo    text not null,
  titulo     text not null,
  seccion    text not null default '',
  texto      text not null,
  embedding  vector(1536) not null          -- text-embedding-3-small de OpenAI
);

-- Nadie lee ni escribe la tabla directo; solo se consulta por la función de abajo.
alter table fragmentos enable row level security;

create or replace function buscar_fragmentos(consulta vector(1536), cantidad int default 4)
returns table (archivo text, titulo text, seccion text, texto text, similitud float)
language sql stable security definer set search_path = public, extensions as $$
  select f.archivo, f.titulo, f.seccion, f.texto, 1 - (f.embedding <=> consulta) as similitud
  from fragmentos f
  order by f.embedding <=> consulta
  limit least(cantidad, 8);
$$;

revoke all on function buscar_fragmentos(vector, int) from public;
grant execute on function buscar_fragmentos(vector, int) to anon;   -- la clave "anon" solo puede buscar

-- Si el proyecto se creó sin "Grant API access to new tables automatically", la clave secret necesita este permiso para cargar los documentos:
grant select, insert, update, delete on table fragmentos to service_role;
grant usage, select on all sequences in schema public to service_role;
