import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getPlans(country: string) {
  const { data, error } = await supabase
    .from('airalo_packages')
    .select('*')
    .eq('region_fr', country)
    .order('final_price_eur', { ascending: true })
  if (error) throw error
  return data
}

export async function getPlanById(id: string) {
  const { data, error } = await supabase
    .from('airalo_packages')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
} 