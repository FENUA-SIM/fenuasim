import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function createPayment(plan_id: string, email: string) {
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: { plan_id, email },
  })
  if (error) throw error
  return data // { checkout_url: string }
} 