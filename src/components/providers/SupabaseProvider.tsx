'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { Database } from '@/lib/supabase/config'

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  useEffect(() => {
    const subscription = supabase
      .channel('*')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Change received!', payload)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return children
} 