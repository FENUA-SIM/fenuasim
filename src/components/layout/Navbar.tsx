'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import LanguageSelector from '@/components/LanguageSelector'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0)
  const pathname = usePathname();

  return (
    <header className="w-full bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between px-4" style={{height: '56px'}}>
        {/* Logo */}
        <Link href="/" className="flex items-center" style={{height: '48px'}}>
          <div style={{height: '48px', width: '48px', overflow: 'visible', display: 'flex', alignItems: 'center'}}>
            <Image 
              src="/logo.png" 
              alt="FENUA SIM" 
              width={80} 
              height={80} 
              style={{transform: 'scale(1.3)', objectFit: 'contain'}} 
              priority={true}
            />
          </div>
        </Link>
        {/* Liens */}
        <ul className="hidden md:flex items-center gap-6 font-medium text-gray-700">
          <li>
            <Link href="/" className="nav-link">Accueil</Link>
          </li>
          <li>
            <Link href="/shop" className="nav-link">Nos eSIM</Link>
          </li>
          <li>
            <Link href="/compatibilite" className="nav-link">Compatibilité</Link>
          </li>
          <li>
            <Link href="/faq" className="nav-link">FAQ</Link>
          </li>
          <li>
            <Link href="/contact" className="nav-link">Contact</Link>
          </li>
          <li>
            <LanguageSelector />
          </li>
          <li>
            <Link
              href="/cart"
              className={`relative group nav-link ${pathname === '/cart' ? 'pointer-events-none opacity-50' : ''}`}
            >
              <ShoppingCart className="inline-block" size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="nav-link">
              <span className="inline-flex items-center gap-1">
                <User className="inline-block" size={22} />
                <span>Mon espace</span>
              </span>
            </Link>
          </li>
        </ul>
        {/* Menu mobile (à améliorer plus tard) */}
        <div className="md:hidden">
          {/* À implémenter : menu burger */}
        </div>
      </nav>
    </header>
  )
} 