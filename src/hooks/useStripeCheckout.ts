"use client"

import { useState } from "react"
import { useCart } from "@/hooks/useCart"

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false)
  const { items, clearCart } = useCart()

  const handleCheckout = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/create-cart-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      })

      const { url } = await response.json()
      if (url) {
        clearCart()
        window.location.href = url
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return { handleCheckout, loading }
} 