import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ChatWidget() {
  const [messages, setMessages] = useState<any[]>([{
    role: 'assistant',
    content: 'Bonjour ! Je suis votre assistant eSIM. Pour quelle destination souhaitez-vous une eSIM ?'
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
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
        body: JSON.stringify({ messages: newMessages, email }),
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
    <div className="fixed bottom-6 right-6 z-50 w-80 max-w-full bg-white rounded-2xl shadow-xl border border-purple-100 flex flex-col">
      <div className="p-4 border-b font-bold text-purple-700">Assistant eSIM</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: 350 }}>
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={
              m.role === 'user'
                ? 'inline-block bg-purple-100 text-purple-900 rounded-xl px-3 py-2 mb-1'
                : 'inline-block bg-gray-100 text-gray-800 rounded-xl px-3 py-2 mb-1'
            }>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-400 text-sm">L'assistant réfléchit...</div>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="flex flex-col gap-2 p-4 border-t">
        {!email && (
          <input
            type="email"
            placeholder="Votre email pour recevoir l'eSIM"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2 mb-2"
            required
          />
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Votre message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
            disabled={loading}
            required
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700"
            disabled={loading}
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  )
} 