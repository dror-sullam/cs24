import { createClient } from '@supabase/supabase-js'

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

// Use development values or environment variables
const supabaseUrl = isDevelopment 
  ? 'https://dmswkhumaemazjerzvbz.supabase.co'
  : process.env.REACT_APP_SUPABASE_URL

const supabaseAnonKey = isDevelopment
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc3draHVtYWVtYXpqZXJ6dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTUxNjMsImV4cCI6MjA1NzYzMTE2M30.4CUlXBDUQPjyn1piI9ou8j10lq8wcdEmuEcncR1u9dE'
  : process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment setup.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 