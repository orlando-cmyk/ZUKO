# Noir Tasks — Setup

## 1. Supabase — ejecuta este SQL en el SQL Editor

```sql
-- Tabla de perfiles del equipo
create table profiles (
  id uuid references auth.users primary key,
  name text not null,
  initials text not null,
  color text default '#c9a96e'
);

-- Tabla de tareas
create table tasks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text default 'dev',
  priority text default 'media',
  estimated_hrs int default 1,
  deadline date,
  status text default 'pendiente',
  assigned_to uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Seguridad Row Level Security
alter table tasks enable row level security;
alter table profiles enable row level security;

-- Políticas: cualquier usuario autenticado puede leer y escribir
create policy "authenticated read tasks"  on tasks    for select using (auth.role() = 'authenticated');
create policy "authenticated write tasks" on tasks    for all    using (auth.role() = 'authenticated');
create policy "authenticated read profiles"  on profiles for select using (auth.role() = 'authenticated');
create policy "authenticated write profiles" on profiles for all    using (auth.role() = 'authenticated');

-- Realtime: activar para tasks
alter publication supabase_realtime add table tasks;

-- Datos de ejemplo (ejecuta después de crear usuarios)
-- insert into profiles (id, name, initials) values
--   ('uuid-del-usuario', 'Tu Nombre', 'TN');

-- Tareas de ejemplo
insert into tasks (name, category, priority, estimated_hrs, deadline) values
  ('Rediseño landing page', 'diseño', 'alta', 8, now() + interval '5 days'),
  ('API de autenticación', 'dev', 'alta', 12, now() + interval '7 days'),
  ('Campaña newsletter', 'marketing', 'media', 4, now() + interval '9 days'),
  ('Dashboard analytics', 'dev', 'media', 10, now() + interval '12 days'),
  ('Manual de identidad', 'diseño', 'baja', 6, now() + interval '14 days'),
  ('Setup CI/CD', 'ops', 'alta', 7, now() + interval '6 days'),
  ('Tests unitarios', 'dev', 'media', 6, now() + interval '10 days'),
  ('Optimización SEO', 'marketing', 'media', 5, now() + interval '11 days');
```

## 2. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

Encuéntralas en: Supabase → Project Settings → API

## 3. Correr el proyecto

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## 4. Deploy en Vercel

```bash
npx vercel
```

Agrega las variables de entorno en el dashboard de Vercel.

## 5. Agregar miembros del equipo

Después de que cada persona se registre, agrega su perfil en Supabase:

```sql
insert into profiles (id, name, initials) values
  ('uuid-del-usuario', 'Alejandra M.', 'AM');
```

El UUID lo encuentras en Supabase → Authentication → Users.
