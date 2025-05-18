// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Add debugging for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL defined:', !!supabaseUrl)
console.log('Supabase Anon Key defined:', !!supabaseAnonKey)

// Create the client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Add a test function to check connection
export const testSupabaseConnection = async () => {
  try {
    // First test if the connection works at all
    const { data: connectionTest, error: connectionError } = await supabase
      .from('orders')
      .select('count()', { count: 'exact' })
    
    console.log('Supabase connection test:', 
      connectionError ? `Error: ${connectionError.message}` : `Success! Count: ${connectionTest[0].count}`
    )
    
    return { success: !connectionError, data: connectionTest, error: connectionError }
  } catch (e) {
    console.error('Supabase connection test failed:', e)
    return { success: false, error: e }
  }
}

export { supabase }