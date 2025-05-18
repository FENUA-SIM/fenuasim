export default function FAQ() {
  const faqs = [
    {
      question: "Comment fonctionne l'eSIM ?",
      answer: "L'eSIM est une carte SIM virtuelle intégrée à votre appareil. Après achat, vous recevez un QR code à scanner pour activer votre forfait."
    },
    {
      question: "Mon appareil est-il compatible ?",
      answer: "La plupart des smartphones récents sont compatibles. Consultez notre page Compatibilité pour vérifier."
    },
    {
      question: "Quand activer mon eSIM ?",
      answer: "Vous pouvez installer votre eSIM avant le départ, mais elle ne s'activera qu'à votre arrivée à destination."
    },
    {
      question: "Puis-je recharger mon forfait ?",
      answer: "Oui, il est possible de recharger votre forfait eSIM depuis votre espace client."
    }
  ];
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Foire aux questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-6 border border-purple-100">
            <h2 className="text-lg font-semibold text-purple-700 mb-2">{faq.question}</h2>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-10">
        <a href="/contact" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition">Contactez-nous</a>
      </div>
    </div>
  )
} 