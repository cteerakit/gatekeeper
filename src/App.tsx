import { Routes, Route, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "./hooks/useAuth"
import { Toaster } from "@/components/ui/sonner"
import { Loader2, LogOut, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Home from "./pages/Home"
import SubmitPost from "./pages/SubmitPost"

function App() {
    const { t } = useTranslation()
    const { user, isAdmin, loading: authLoading, signInWithFacebook, signOut } = useAuth()
    const [isAdminMode, setIsAdminMode] = useState(false)
    
    // Automatically turn off admin mode if user is no longer admin
    useEffect(() => {
        if (!isAdmin) {
            setIsAdminMode(false)
        }
    }, [isAdmin])

    // Update page title dynamically
    useEffect(() => {
        document.title = t("common.app_name")
    }, [t])

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 text-foreground font-sans selection:bg-primary/20">
            <Toaster position="top-right" richColors />
            
            {/* Common Header */}
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-8 gap-4 px-4 pt-4">
                    <Link to="/" className="space-y-1 hover:opacity-90 transition-opacity">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <Shield className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t("common.app_name")}</h1>
                        </div>
                        <p className="text-muted-foreground text-sm font-medium ml-12">{t("common.app_subtitle")}</p>
                    </Link>

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
                                        <p className="text-xs font-semibold text-muted-foreground">{t("common.language")}</p>
                                        <LanguageSwitcher />
                                    </div>
                                    {isAdmin && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                onClick={() => setIsAdminMode(!isAdminMode)}
                                                className="cursor-pointer"
                                            >
                                                <Shield className="w-4 h-4 mr-2" />
                                                {isAdminMode ? t("common.member_mode") : t("common.admin_mode")}
                                            </DropdownMenuItem>
                                        </>
                                    )}
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


                {/* Page Content */}
                <main className="mt-8">
                    <Routes>
                        <Route path="/" element={<Home isAdminMode={isAdminMode} />} />
                        <Route path="/new" element={<SubmitPost />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}

export default App
