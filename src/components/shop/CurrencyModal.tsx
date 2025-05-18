import { useEffect } from 'react'
import { Globe } from 'lucide-react'

interface CurrencyModalProps {
  onSelect: (currency: 'EUR' | 'XPF' | 'USD') => void
}

export default function CurrencyModal({ onSelect }: CurrencyModalProps) {
  // Empêche le scroll en arrière-plan quand le modal est ouvert
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-100/80 via-white/90 to-orange-100/80">
      <div className="bg-white border-2 border-purple-200 shadow-2xl rounded-3xl p-8 max-w-xs w-full text-center relative animate-fade-in">
        <div className="flex flex-col items-center mb-4">
          <Globe className="w-10 h-10 text-purple-600 mb-2" />
          <h2 className="text-2xl font-extrabold text-purple-700 mb-1">Choisissez votre devise</h2>
          <p className="text-sm text-gray-600 mb-2">Vous pourrez la modifier à tout moment</p>
        </div>
        <div className="flex flex-col gap-4">
          <button
            className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold shadow-md hover:from-purple-700 hover:to-orange-600 transition text-lg"
            onClick={() => onSelect('EUR')}
          >
            € Euro (EUR)
          </button>
          <button
            className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold shadow-md hover:from-orange-600 hover:to-purple-700 transition text-lg"
            onClick={() => onSelect('XPF')}
          >
            ₣ Franc Pacifique (XPF)
          </button>
          <button
            className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-700 to-orange-400 text-white font-bold shadow-md hover:from-purple-800 hover:to-orange-500 transition text-lg"
            onClick={() => onSelect('USD')}
          >
            $ Dollar US (USD)
          </button>
        </div>
      </div>
    </div>
  )
} 