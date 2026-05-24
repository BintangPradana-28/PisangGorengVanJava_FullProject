import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vamxyslzeimlsofhgmry.supabase.co'
// Gunakan Service Role Key agar backend bisa mengunggah file tanpa terhalang RLS (Row Level Security)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'dummy_key'

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey)
