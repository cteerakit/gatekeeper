import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Post {
    id: string
    content: string
    image_urls: string[]
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
}

export function usePosts() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = async (all = false) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        let query = supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })

        // If not 'all', filter by user_id
        if (!all) {
            query = query.eq('user_id', user.id)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching posts:', error)
        } else {
            setPosts(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchPosts()

        // Subscribe to realtime changes
        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
                // We'll let the component decide to refresh all or just personal
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const submitPost = async (content: string, files: File[]) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const image_urls: string[] = []

        for (const file of files) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('post-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('post-images')
                .getPublicUrl(filePath)

            image_urls.push(publicUrl)
        }

        const { error } = await supabase.from('posts').insert({
            user_id: user.id,
            content,
            image_urls,
            group_id: 'fixed-group-context',
            status: 'pending'
        })

        if (error) throw error
    }

    const updatePostStatus = async (postId: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('posts')
            .update({ status })
            .eq('id', postId)

        if (error) throw error
    }

    return { posts, loading, submitPost, updatePostStatus, refresh: fetchPosts }
}
