import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ChatWidget() {
  const [messages, setMessages] = useState<any[]>([{
    role: 'assistant',
    content: 'Bonjour ! Je suis votre assistant eSIM. Pour quelle destination souhaitez-vous une eSIM ?'
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)

  async function sendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (data.role === 'function' && data.name === 'createPayment') {
        // Rediriger vers Stripe Checkout
        window.location.href = data.data.checkout_url
        return
      }
      if (data.role === 'function' && data.name === 'getPlans') {
        setMessages([...newMessages, { role: 'assistant', content: `Voici les forfaits disponibles :\n${data.data.map((p: any) => `• ${p.name} (${p.final_price_eur} €) [id: ${p.id}]`).join('\n')}` }])
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.content }])
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Désolé, une erreur est survenue." }])
    } finally {
      setLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-md mx-auto bg-white rounded-t-xl shadow-2xl border border-gray-200 flex flex-col h-[60vh] sm:bottom-4 sm:right-4 sm:left-auto sm:w-full sm:max-w-sm sm:rounded-xl">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'}`}>{msg.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t flex gap-2 bg-white">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fenua-coral"
          placeholder="Votre message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-fenua-coral text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          Envoyer
        </button>
      </form>
    </div>
  )
} 