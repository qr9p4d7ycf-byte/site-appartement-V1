import { useState, type FormEvent } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { supabase, isConfigured } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { session, isAdmin, signOut } = useAuth()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (session && isAdmin) return <Navigate to="/admin" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Identifiant ou mot de passe incorrect.')
    setBusy(false)
  }

  return (
    <main className="min-h-screen grid place-items-center bg-stone-50 p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-8 shadow-sm border border-stone-200">
        <h1 className="font-serif text-2xl text-brand">Espace administrateur</h1>
        {!isConfigured && <p className="mt-3 text-sm text-amber-800">Supabase n'est pas configuré (voir README).</p>}
        {params.get('refuse') && session && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            Ce compte n'est pas autorisé. Ajoutez-le à la table admin_profiles (README, étape 5).{' '}
            <button type="button" className="underline" onClick={signOut}>Se déconnecter</button>
          </p>
        )}
        <label className="block mt-6 text-sm font-medium" htmlFor="email">Adresse e-mail</label>
        <input id="email" type="email" required autoComplete="username" value={email}
          onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-stone-300 px-3 py-2" />
        <label className="block mt-4 text-sm font-medium" htmlFor="pw">Mot de passe</label>
        <input id="pw" type="password" required autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-stone-300 px-3 py-2" />
        {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
        <button disabled={busy || !isConfigured}
          className="mt-6 w-full bg-brand text-white py-2.5 disabled:opacity-50">
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </main>
  )
}
