"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LanguageState {
  language: "fr" | "en"
  setLanguage: (language: "fr" | "en") => void
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: "fr",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "language-storage",
    }
  )
) 