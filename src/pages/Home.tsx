import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { usePosts, Post } from "@/hooks/usePosts"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Clock, XCircle, FileText, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface HomeProps {
    isAdminMode: boolean
}

export default function Home({ isAdminMode }: HomeProps) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { user, signInWithFacebook } = useAuth()
    const { posts, updatePostStatus, refresh, loading: postsLoading } = usePosts()
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)

    useEffect(() => {
        if (user) refresh(isAdminMode)
    }, [isAdminMode, user, refresh])

    const handleStatusUpdate = async (postId: string, status: 'approved' | 'rejected') => {
        try {
            await updatePostStatus(postId, status)
            toast.success(status === 'approved' ? t("notifications.post_approved") : t("notifications.post_rejected"))
            refresh(true)
        } catch {
            toast.error(t("notifications.update_failed"))
        }
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary blur-3xl opacity-10 rounded-full" />
                    <div className="relative w-24 h-24 bg-card border rounded-2xl flex items-center justify-center mb-4 rotate-3 shadow-2xl">
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                    </div>
                </div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">{t("landing.title")}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed whitespace-pre-line">{t("landing.subtitle")}</p>
                </div>
                <Button size="lg" onClick={signInWithFacebook} className="bg-[#1877F2] hover:bg-[#1877F2]/90 w-full max-w-xs transition-all hover:scale-[1.03] text-lg font-bold h-14 shadow-2xl text-white">
                    {t("landing.get_started")}
                </Button>
            </div>
        )
    }

    return (
        <div className="animate-in fade-in duration-500">
            <Card className="shadow-lg overflow-hidden min-h-[600px] flex flex-col border-neutral-200 bg-white">
                <CardHeader className="bg-white border-b border-neutral-100 pb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-bold text-foreground">
                                {isAdminMode ? t("dashboard.approval_queue") : t("dashboard.submission_history")}
                            </CardTitle>
                            <CardDescription>
                                {isAdminMode ? t("dashboard.admin_description") : t("dashboard.member_description")}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            {postsLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                            {!isAdminMode && (
                                <Button onClick={() => navigate("/new")} className="font-bold shadow-md bg-primary hover:bg-primary/90 text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t("form.submit_new_post")}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <div className="flex-1 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-neutral-50/80">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="uppercase text-[10px] font-bold tracking-widest pl-6 text-muted-foreground">{t("dashboard.content_overview")}</TableHead>
                                <TableHead className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">{t("dashboard.submitted")}</TableHead>
                                <TableHead className="uppercase text-[10px] font-bold tracking-widest text-right pr-6 text-muted-foreground">{t("dashboard.management")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-32 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <FileText className="w-10 h-10 mb-2" />
                                            <p className="font-medium">{t("dashboard.no_results")}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posts.map((post) => (
                                    <TableRow 
                                        key={post.id} 
                                        className="group transition-colors hover:bg-neutral-50/80 cursor-pointer"
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        <TableCell className="max-w-md pl-6 py-5">
                                            <p className="line-clamp-2 leading-relaxed font-medium text-neutral-800 transition-colors">
                                                {post.content}
                                            </p>
                                            {post.image_urls && post.image_urls.length > 0 && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    {post.image_urls.map((url, i) => (
                                                        <div key={i} className="w-6 h-6 rounded bg-neutral-100 border border-neutral-200 overflow-hidden">
                                                            <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                        </div>
                                                    ))}
                                                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">
                                                        {t("dashboard.attachments", { count: post.image_urls.length })}
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-muted-foreground text-xs font-semibold">
                                            {new Date(post.created_at).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            {isAdminMode && post.status === 'pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleStatusUpdate(post.id, 'approved')
                                                        }}
                                                        className="h-8 border-green-200 text-green-700 bg-green-50 hover:bg-green-600 hover:text-white"
                                                    >
                                                        {t("dashboard.approve")}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleStatusUpdate(post.id, 'rejected')
                                                        }}
                                                        className="h-8 border-red-200 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white"
                                                    >
                                                        {t("dashboard.reject")}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                                    post.status === 'approved' && "bg-green-100 text-green-800 border-green-200",
                                                    post.status === 'pending' && "bg-yellow-100 text-yellow-800 border-yellow-200",
                                                    post.status === 'rejected' && "bg-red-100 text-red-800 border-red-200"
                                                )}>
                                                    {post.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                    {post.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                                    {post.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                                    {t(`dashboard.status_${post.status}`)}
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("dashboard.post_detail")}</DialogTitle>
                        <DialogDescription>
                            {selectedPost && new Date(selectedPost.created_at).toLocaleString(i18n.language, { 
                                dateStyle: 'full', 
                                timeStyle: 'short' 
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedPost && (
                        <div className="space-y-6 py-4">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <p className="whitespace-pre-wrap text-base text-neutral-800 leading-relaxed">
                                    {selectedPost.content}
                                </p>
                            </div>

                            {selectedPost.image_urls && selectedPost.image_urls.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    {selectedPost.image_urls.map((url, i) => (
                                        <div key={i} className="relative group rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-video">
                                            <img 
                                                src={url} 
                                                alt={`Attachment ${i + 1}`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-4 border-t">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">
                                    {t("dashboard.status")}:
                                </span>
                                <span className={cn(
                                    "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                    selectedPost.status === 'approved' && "bg-green-100 text-green-800 border-green-200",
                                    selectedPost.status === 'pending' && "bg-yellow-100 text-yellow-800 border-yellow-200",
                                    selectedPost.status === 'rejected' && "bg-red-100 text-red-800 border-red-200"
                                )}>
                                    {selectedPost.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                    {selectedPost.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                    {selectedPost.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                    {t(`dashboard.status_${selectedPost.status}`)}
                                </span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between items-center gap-4">
                        <div className="flex gap-2">
                            {isAdminMode && selectedPost?.status === 'pending' && (
                                <>
                                    <Button
                                        onClick={() => {
                                            handleStatusUpdate(selectedPost.id, 'approved')
                                            setSelectedPost(null)
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {t("dashboard.approve")}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            handleStatusUpdate(selectedPost.id, 'rejected')
                                            setSelectedPost(null)
                                        }}
                                    >
                                        {t("dashboard.reject")}
                                    </Button>
                                </>
                            )}
                        </div>
                        <Button variant="outline" onClick={() => setSelectedPost(null)}>
                            {t("common.close")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    )
}
