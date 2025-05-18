"use client"

import { useLanguage } from "@/hooks/useLanguage"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Globe className="text-fenua-purple" size={20} />
      <Button
        variant={language === "fr" ? "default" : "ghost"}
        onClick={() => setLanguage("fr")}
        className={language === "fr" ? "bg-fenua-purple hover:bg-fenua-purple/90" : ""}
      >
        FR
      </Button>
      <Button
        variant={language === "en" ? "default" : "ghost"}
        onClick={() => setLanguage("en")}
        className={language === "en" ? "bg-fenua-purple hover:bg-fenua-purple/90" : ""}
      >
        EN
      </Button>
    </div>
  )
} 