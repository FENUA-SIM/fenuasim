import Image from 'next/image'
import Link from 'next/link'
import { Globe2, Star } from 'lucide-react'

interface DestinationCardProps {
  name: string
  slug: string
  flag: string
  description: string
  packageCount: number
  isPopular?: boolean
}

export default function DestinationCard({
  name,
  slug,
  flag,
  description,
  packageCount,
  isPopular = false
}: DestinationCardProps) {
  return (
    <div className="group bg-white border-2 border-fenua-purple rounded-2xl shadow-xl p-0 flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden">
      {isPopular && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-fenua-coral text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Star className="w-4 h-4" />
            Populaire
          </div>
        </div>
      )}
      
      <div className="relative h-48 w-full">
        <Image
          src={flag}
          alt={`Drapeau ${name}`}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/images/fallback-flag.png'
          }}
        />
      </div>

      <div className="p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-bold text-fenua-purple mb-2">{name}</h3>
          <p className="text-gray-600 line-clamp-2">{description}</p>
        </div>

        <div className="flex items-center gap-2 text-fenua-purple">
          <Globe2 className="w-5 h-5" />
          <span className="text-sm font-medium">{packageCount} forfaits disponibles</span>
        </div>

        <Link
          href={`/shop/${slug}`}
          className="w-full py-3 bg-gradient-to-r from-fenua-purple to-fenua-coral text-white font-bold rounded-xl shadow hover:scale-105 transition text-center"
        >
          Découvrir
        </Link>
      </div>
    </div>
  )
} 