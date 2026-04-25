import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export async function GET(req: NextRequest) {
  // Verificar que la llamada viene de Vercel Cron
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [{ data: tasks }, { data: profiles }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .in('status', ['pendiente', 'en progreso'])
      .order('priority', { ascending: true }),
    supabase.from('profiles').select('*'),
  ])

  if (!tasks || !profiles) {
    return NextResponse.json({ error: 'Error consultando Supabase' }, { status: 500 })
  }

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p.name as string]))

  const pending   = tasks.filter(t => t.status === 'pendiente')
  const inProgress = tasks.filter(t => t.status === 'en progreso')
  const unassigned = tasks.filter(t => !t.assigned_to)

  const totalHrs = tasks.reduce((s: number, t: { estimated_hrs: number }) => s + t.estimated_hrs, 0)

  // Agrupar por persona
  const byPerson: Record<string, { name: string; tasks: typeof tasks }> = {}
  for (const task of tasks) {
    if (!task.assigned_to) continue
    if (!byPerson[task.assigned_to]) {
      byPerson[task.assigned_to] = { name: profileMap[task.assigned_to] ?? task.assigned_to, tasks: [] }
    }
    byPerson[task.assigned_to].tasks.push(task)
  }

  const priIcon: Record<string, string> = { alta: '🔴', media: '🟡', baja: '🟢' }

  const now = new Date().toLocaleString('es-MX', {
    timeZone: 'America/Merida',
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  const lines: string[] = [
    `🐊 *Zuko Tasks — ${now}*`,
    '',
    `📊 *Resumen:*`,
    `• Pendientes: ${pending.length} tarea${pending.length !== 1 ? 's' : ''} (${pending.reduce((s: number, t: { estimated_hrs: number }) => s + t.estimated_hrs, 0)}h)`,
    `• En progreso: ${inProgress.length} tarea${inProgress.length !== 1 ? 's' : ''} (${inProgress.reduce((s: number, t: { estimated_hrs: number }) => s + t.estimated_hrs, 0)}h)`,
    `• Total activas: ${tasks.length} · ${totalHrs}h`,
  ]

  if (unassigned.length > 0) {
    lines.push('', `⚠️ *Sin asignar (${unassigned.length}):*`)
    for (const t of unassigned.slice(0, 5)) {
      const dl = t.deadline ? ` · 📅${formatDate(t.deadline)}` : ''
      lines.push(`  ${priIcon[t.priority] ?? '⚪'} ${t.name} (${t.estimated_hrs}h${dl})`)
    }
    if (unassigned.length > 5) lines.push(`  …y ${unassigned.length - 5} más`)
  }

  const personEntries = Object.values(byPerson)
  if (personEntries.length > 0) {
    lines.push('', `👥 *Por persona:*`)
    for (const { name, tasks: pts } of personEntries) {
      const hrs = pts.reduce((s: number, t: { estimated_hrs: number }) => s + t.estimated_hrs, 0)
      const overload = hrs > 20 ? ' ⚠️' : ''
      lines.push(`  *${name}* — ${pts.length} tarea${pts.length !== 1 ? 's' : ''}, ${hrs}h${overload}`)
      for (const t of pts.slice(0, 3)) {
        lines.push(`    ${priIcon[t.priority] ?? '⚪'} ${t.name}`)
      }
      if (pts.length > 3) lines.push(`    …y ${pts.length - 3} más`)
    }
  }

  if (tasks.length === 0) {
    lines.push('', `✅ ¡Todo limpio! No hay tareas pendientes.`)
  }

  const message = lines.join('\n')

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to:   process.env.TWILIO_WHATSAPP_TO!,
    body: message,
  })

  return NextResponse.json({
    ok: true,
    sent: now,
    tasks: tasks.length,
    unassigned: unassigned.length,
  })
}
