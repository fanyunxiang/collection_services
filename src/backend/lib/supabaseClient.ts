import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Ensure environment variables from .env.local are available when running locally
if (!process.env.SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  dotenv.config({ path: '.env.local' })
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Supabase URL is not configured. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.')
}

if (!supabaseAnonKey) {
  throw new Error('Supabase anon key is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY.')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Supabase service role key is not configured. Set SUPABASE_SERVICE_ROLE_KEY.')
}

export const supabaseServerClient = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey)

export const DEFAULT_EMAIL_DOMAIN = process.env.DEFAULT_EMAIL_DOMAIN || 'example.com'
