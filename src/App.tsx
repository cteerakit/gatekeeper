import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
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
import { useAuth } from "./hooks/useAuth"
import { usePosts } from "./hooks/usePosts"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Loader2, LogOut, CheckCircle2, Clock, XCircle, Shield, User, FileText, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { MultiStepPostForm } from "@/components/MultiStepPostForm"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function App() {
  const { t, i18n } = useTranslation()

  const { user, loading: authLoading, signInWithFacebook, signOut } = useAuth()
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [isNewPostOpen, setIsNewPostOpen] = useState(false)
  const { posts, submitPost, updatePostStatus, refresh, loading: postsLoading } = usePosts()

  // Watch for changes in admin mode to refresh data
  useEffect(() => {
    if (user) refresh(isAdminMode)
  }, [isAdminMode, user, refresh])

  // Update page title dynamically
  useEffect(() => {
    document.title = t("common.app_name")
  }, [t])



  const handleStatusUpdate = async (postId: string, status: 'approved' | 'rejected') => {
    try {
      await updatePostStatus(postId, status)
      toast.success(status === 'approved' ? t("notifications.post_approved") : t("notifications.post_rejected"))
      refresh(true)
    } catch {
      toast.error(t("notifications.update_failed"))
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-foreground p-4 md:p-8 font-sans selection:bg-primary/20">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-8 gap-4 px-4 pt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t("common.app_name")}</h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium ml-12">{t("common.app_subtitle")}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!user ? (
              <>
                <LanguageSwitcher />
                <Button onClick={signInWithFacebook} className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white border-none shadow-xl px-6">
                  {t("common.login_facebook")}
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-10 w-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture} alt={user.user_metadata?.full_name || "User"} />
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 shadow-xl" align="end">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || user.email?.split('@')[0] || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 flex flex-col gap-2">
                    <p className="text-xs font-semibold text-muted-foreground">{t("common.language", "Language / ภาษา")}</p>
                    <LanguageSwitcher />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsAdminMode(!isAdminMode)} className="cursor-pointer">
                    {isAdminMode ? <User className="w-4 h-4 mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                    {isAdminMode ? t("common.member_mode", "Member Mode") : t("common.admin_mode", "Admin Mode")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("common.sign_out")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="relative">
              <div className="absolute inset-0 bg-primary blur-3xl opacity-10 rounded-full" />
              <div className="relative w-24 h-24 bg-card border rounded-2xl flex items-center justify-center mb-4 rotate-3 shadow-2xl">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight text-foreground">{t("landing.title")}</h2>
              <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">{t("landing.subtitle")}</p>
            </div>
            <Button size="lg" onClick={signInWithFacebook} className="bg-[#1877F2] hover:bg-[#1877F2]/90 w-full max-w-xs transition-all hover:scale-[1.03] text-lg font-bold h-14 shadow-2xl text-white">
              {t("landing.get_started")}
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in duration-500">

            {/* Dashboard List */}
            <div className="lg:col-span-12">
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
                        <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
                          <DialogTrigger render={<Button className="font-bold shadow-md bg-primary hover:bg-primary/90 text-white" />}>
                            <span className="flex items-center">
                              <Plus className="w-4 h-4 mr-2" />
                              {t("form.submit_new_post")}
                            </span>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none outline-none">
                            <MultiStepPostForm
                              submitPost={submitPost}
                              onSuccess={() => setIsNewPostOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>
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
                          <TableRow key={post.id} className="group transition-colors hover:bg-neutral-50/80">
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
                                    onClick={() => handleStatusUpdate(post.id, 'approved')}
                                    className="h-8 border-green-200 text-green-700 bg-green-50 hover:bg-green-600 hover:text-white"
                                  >
                                    {t("dashboard.approve")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(post.id, 'rejected')}
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
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default App
