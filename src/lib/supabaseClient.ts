// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// replace with your Supabase URL and anon key from your dashboard
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
