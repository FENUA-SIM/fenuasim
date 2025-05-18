export default function Contact() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Contactez-nous</h1>
      <form className="bg-white rounded-xl shadow p-6 space-y-6 border border-purple-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Votre nom" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Votre email" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" rows={5} placeholder="Votre message" />
        </div>
        <button type="submit" className="w-full bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition">Envoyer</button>
      </form>
      <div className="mt-10 text-center text-gray-600">
        <p>Ou contactez-nous directement :</p>
        <p className="mt-2">📧 <a href="mailto:contact@fenuasim.com" className="text-purple-600 hover:underline">contact@fenuasim.com</a></p>
        <p className="mt-1">📞 <a href="tel:+689123456" className="text-purple-600 hover:underline">+689 12 34 56</a></p>
      </div>
    </div>
  )
} 