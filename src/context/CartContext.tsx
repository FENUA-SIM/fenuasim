'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  currency: string;
  data_amount: number;
  data_unit: string;
  duration: number;
  duration_unit: string;
  operator_logo_url?: string | null;
  quantity: number;
};

export type Promo = {
  code: string;
  discount_type: 'percent' | 'amount';
  discount_value: number;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  promo: Promo | null;
  setPromo: (promo: Promo | null) => void;
  total: number;
  discount: number;
  totalWithDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promo, setPromo] = useState<Promo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setItems(JSON.parse(stored));
    const storedPromo = localStorage.getItem('promo');
    if (storedPromo) setPromo(JSON.parse(storedPromo));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (promo) localStorage.setItem('promo', JSON.stringify(promo));
    else localStorage.removeItem('promo');
  }, [promo]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setItems([]);
  const updateQuantity = (id: string, quantity: number) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let discount = 0;
  if (promo) {
    if (promo.discount_type === 'percent') discount = total * (promo.discount_value / 100);
    else discount = promo.discount_value;
  }
  const totalWithDiscount = Math.max(0, total - discount);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, updateQuantity, promo, setPromo, total, discount, totalWithDiscount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
} 