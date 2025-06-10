'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import LanguageSelector from '@/components/LanguageSelector'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0)
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="w-full bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between px-4" style={{ height: '88px' }}>
        {/* Logo */}
        <Link href="/" className="flex items-center" style={{ height: '80px' }}>
          <div style={{ height: '80px', width: '80px', overflow: 'visible', display: 'flex', alignItems: 'center' }}>
            <Image 
              src="/logo.png" 
              alt="FENUA SIM" 
              width={120} 
              height={120} 
              style={{ transform: 'scale(1.5)', objectFit: 'contain' }} 
              priority={true}
            />
          </div>
        </Link>

        {/* Liens Desktop */}
        <ul className="hidden md:flex items-center gap-6 font-medium text-gray-700">
          <li><Link href="/" className="nav-link">Accueil</Link></li>
          <li><Link href="/shop" className="nav-link">Nos eSIM</Link></li>
          <li><Link href="/my-esims" className="nav-link">Mes eSIM</Link></li>
          <li><Link href="/compatibilite" className="nav-link">Compatibilité</Link></li>
          <li><Link href="/faq" className="nav-link">FAQ</Link></li>
          <li><Link href="/contact" className="nav-link">Contact</Link></li>
          <li>
            <Link href="/dashboard" className="nav-link">
              <span className="inline-flex items-center gap-1">
                <User className="inline-block" size={22} />
                <span>Mon espace</span>
              </span>
            </Link>
          </li>
        </ul>

        {/* Bouton Menu Mobile */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(true)} className="p-2">
            <Menu size={26} />
          </button>
        </div>
      </nav>

      {/* Menu Mobile plein écran */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6 pt-24 flex flex-col gap-6 text-gray-800 font-medium text-lg overflow-y-auto">
          <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6">
            <X size={28} />
          </button>
          <Link href="/" onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link href="/shop" onClick={() => setMenuOpen(false)}>Nos eSIM</Link>
          <Link href="/compatibilite" onClick={() => setMenuOpen(false)}>Compatibilité</Link>
          <Link href="/faq" onClick={() => setMenuOpen(false)}>FAQ</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)}>Panier</Link>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Mon espace</Link>
        </div>
      )}
    </header>
  )
}
