"use client"

import Image from "next/image"
import { useCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

interface ForfaitCardProps {
  id: string
  name: string
  description: string
  price: number
  data: string
  validity: string
  image: string
  currency: string
  language: string
}

export function ForfaitCard({
  id,
  name,
  description,
  price,
  data,
  validity,
  image,
  currency,
  language,
}: ForfaitCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      currency,
    })
  }

  return (
    <div
      className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative h-48 w-full">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-fenua-purple">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Données</p>
            <p className="font-semibold text-fenua-purple">{data}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Validité</p>
            <p className="font-semibold text-fenua-purple">{validity}</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-2xl font-bold text-fenua-purple">
            {price} {currency}
          </p>
          <Button
            onClick={handleAddToCart}
            className="bg-fenua-purple hover:bg-fenua-purple/90"
          >
            <ShoppingCart className="mr-2" size={20} />
            {language === "fr" ? "Ajouter" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  )
} 