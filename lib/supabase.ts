import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type TaskStatus = 'pendiente' | 'en progreso' | 'listo'
export type TaskPriority = 'alta' | 'media' | 'baja'
export type TaskCategory = 'diseño' | 'dev' | 'marketing' | 'ops'

export interface Profile {
  id: string
  name: string
  initials: string
  color: string
}

export interface Task {
  id: string
  name: string
  category: TaskCategory
  priority: TaskPriority
  estimated_hrs: number
  deadline: string | null
  status: TaskStatus
  assigned_to: string | null
  created_at: string
  completed_at: string | null
}
