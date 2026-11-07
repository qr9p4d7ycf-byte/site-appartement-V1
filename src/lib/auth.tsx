import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isConfigured } from './supabase'

type AuthState = { session: Session | null; isAdmin: boolean; loading: boolean; signOut: () => Promise<void> }
const Ctx = createContext<AuthState>({ session: null, isAdmin: false, loading: true, signOut: async () => {} })
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(isConfigured)

  useEffect(() => {
    if (!isConfigured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isConfigured) return
    if (!session) { setIsAdmin(false); setLoading(false); return }
    // Vérification côté base : la fonction is_admin() est la seule source de vérité.
    supabase.rpc('is_admin').then(({ data }) => { setIsAdmin(data === true); setLoading(false) })
  }, [session])

  const signOut = async () => { await supabase.auth.signOut() }
  return <Ctx.Provider value={{ session, isAdmin, loading, signOut }}>{children}</Ctx.Provider>
}
