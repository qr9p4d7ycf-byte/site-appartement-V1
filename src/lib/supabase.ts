import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isConfigured = Boolean(url && key)
// La clé "anon" est publique par conception : la sécurité repose sur les règles RLS (supabase/schema.sql).
export const supabase = createClient(url ?? 'http://localhost', key ?? 'missing')
