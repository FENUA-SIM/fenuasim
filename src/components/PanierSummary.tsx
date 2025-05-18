import { useCart } from '@/context/CartContext'

export default function PanierSummary({ language }: { language: string }) {
  const { items, total } = useCart()
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      <h4 className="text-fenua-purple font-bold mb-4">
        {language === 'fr' ? 'Votre panier' : 'Your cart'}
      </h4>
      <ul className="mb-4">
        {items.map(item => (
          <li key={item.id} className="flex justify-between text-sm mb-1">
            <span>{item.name}</span>
            <span>{item.price} {item.currency}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-bold text-fenua-purple text-lg mb-4">
        <span>{language === 'fr' ? 'Total' : 'Total'}</span>
        <span>{total} XPF</span>
      </div>
      <button className="btn-gradient w-full py-3 rounded-full text-lg font-semibold shadow-md">
        {language === 'fr' ? 'Commander' : 'Checkout'}
      </button>
    </div>
  )
} 