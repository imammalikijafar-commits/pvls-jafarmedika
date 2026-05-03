'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtime(refetch: () => void) {
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('surveys-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'surveys' }, () => {
        refetch()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [refetch])
}
