import { createClient } from '@supabase/supabase-js'

// Get environment variables for Create React App
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Throw an error if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your environment setup.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 