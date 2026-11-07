import { useEffect, useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

export default function Home() {
  const [title, setTitle] = useState('Votre appartement')
  useEffect(() => {
    if (!isConfigured) return
    // Lecture publique : seule la version publiée est accessible (RLS).
    supabase.from('site_settings').select('published').eq('id', 1).maybeSingle()
      .then(({ data }) => { const t = data?.published?.siteName; if (t) setTitle(t) })
  }, [])
  return (
    <main className="min-h-screen grid place-items-center bg-stone-50 p-8 text-center">
      <div>
        <h1 className="font-serif text-5xl text-brand">{title}</h1>
        <p className="mt-4 text-stone-600 max-w-md mx-auto">
          Les fondations sont en place. Les sections du site public arrivent à la phase 2.
        </p>
        {!isConfigured && (
          <p className="mt-6 text-sm text-amber-800">Supabase n'est pas configuré : voir le README, étape 3.</p>
        )}
        <a href="/admin" className="mt-8 inline-block text-sm underline text-brand">Espace administrateur</a>
      </div>
    </main>
  )
}
