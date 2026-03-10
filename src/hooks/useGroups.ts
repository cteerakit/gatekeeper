import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Group {
    id: string
    name: string
    slug: string
    cover_url: string | null
}

export function useGroups() {
    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchGroups() {
            try {
                const { data, error } = await supabase
                    .from('groups')
                    .select('*')

                if (error) throw error
                setGroups(data || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchGroups()
    }, [])

    return { groups, isLoading, error }
}
