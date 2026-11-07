import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

const TABLES = [
  ['bookings', 'Demandes de réservation'],
  ['photos', 'Photos'],
  ['reviews', 'Avis'],
  ['pages', 'Pages'],
] as const

export default function Dashboard() {
  const { session, signOut } = useAuth()
  const [counts, setCounts] = useState<Record<string, number | null>>({})

  useEffect(() => {
    TABLES.forEach(async ([t]) => {
      const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true })
      setCounts((c) => ({ ...c, [t]: error ? null : count ?? 0 }))
    })
  }, [])

  return (
    <main className="min-h-screen bg-stone-50 p-8">
      <header className="flex items-center justify-between max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl text-brand">Tableau de bord</h1>
        <div className="text-sm text-stone-600">
          {session?.user.email} · <button className="underline" onClick={signOut}>Se déconnecter</button>
        </div>
      </header>
      <section className="max-w-4xl mx-auto mt-8 grid gap-4 sm:grid-cols-2">
        {TABLES.map(([t, label]) => (
          <div key={t} className="bg-white border border-stone-200 p-5">
            <p className="text-sm text-stone-600">{label}</p>
            <p className="text-3xl font-serif mt-1">{counts[t] ?? '–'}</p>
          </div>
        ))}
      </section>
      <p className="max-w-4xl mx-auto mt-8 text-sm text-stone-600">
        Connexion et droits administrateur vérifiés. Les outils de gestion arrivent dans les phases suivantes.
      </p>
    </main>
  )
}
