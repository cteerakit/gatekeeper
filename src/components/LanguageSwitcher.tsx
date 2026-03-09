import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
    const { i18n } = useTranslation()

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('th') ? 'en' : 'th'
        i18n.changeLanguage(newLang)
    }

    const currentLanguage = i18n.language.startsWith('th') ? 'TH' : 'EN'

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-muted-foreground hover:text-foreground h-9 px-3 gap-2 bg-white border"
        >
            <Languages className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{currentLanguage}</span>
        </Button>
    )
}
