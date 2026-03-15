import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { usePosts } from "@/hooks/usePosts"
import { MultiStepPostForm } from "@/components/MultiStepPostForm"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function SubmitPost() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { submitPost } = usePosts()

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate("/")}
                        className="hover:bg-white shadow-sm border border-transparent hover:border-neutral-200"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        {t("form.back_to_dashboard")}
                    </Button>
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                        {t("form.submit_new_post")}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {t("form.description")}
                    </p>
                </div>

                <div className="mt-8">
                    <MultiStepPostForm 
                        submitPost={submitPost} 
                        onSuccess={() => navigate("/")} 
                    />
                </div>
            </div>
        </div>
    )
}
