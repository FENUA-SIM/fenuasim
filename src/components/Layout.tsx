import { ReactNode } from 'react'
import Navbar from './layout/Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Contenu principal */}
      <main className="flex-grow pt-16">
        {children}
      </main>

      {/* Pied de page */}
      <Footer />
    </div>
  )
} 