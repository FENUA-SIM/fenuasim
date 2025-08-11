export default function Concours() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
        🎉 Concours FENUA SIM
      </h1>
      
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100 mb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">
            Gagnez des forfaits eSIM pour vos voyages !
          </h2>
          <p className="text-gray-600 text-lg">
            Participez à nos concours et remportez des forfaits eSIM pour rester connecté partout dans le monde.
          </p>
        </div>

        {/* Concours en cours */}
        <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl p-6 mb-8 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-purple-700">🏆 Concours en cours</h3>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              ACTIF
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">"Voyagez Connecté"</h4>
              <p className="text-gray-600 mb-3">
                Partagez votre plus belle photo de voyage et gagnez un forfait eSIM de 5GB valable 30 jours !
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📅 <strong>Date limite :</strong> 31 décembre 2024</p>
                <p>🎁 <strong>Prix :</strong> Forfait eSIM 5GB/30 jours</p>
                <p>🌍 <strong>Validité :</strong> Plus de 100 pays</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h5 className="font-semibold text-purple-700 mb-3">Comment participer :</h5>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Suivez @fenuasim sur Instagram</li>
                <li>Partagez votre photo avec #FenuaSIMVoyage</li>
                <li>Mentionnez @fenuasim dans votre post</li>
                <li>Likez et commentez nos posts</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Concours à venir */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">📅 Concours à venir</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">"Backpacker Digital"</h4>
              <p className="text-gray-600 mb-3">
                Racontez votre meilleure anecdote de voyage et gagnez un forfait eSIM de 10GB !
              </p>
              <p className="text-sm text-gray-500">🚀 Bientôt disponible</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">"Famille Connectée"</h4>
              <p className="text-gray-600 mb-3">
                Partagez vos photos de famille en voyage et remportez des forfaits pour toute la famille !
              </p>
              <p className="text-sm text-gray-500">🚀 Bientôt disponible</p>
            </div>
          </div>
        </div>

        {/* Règles générales */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">📋 Règles générales</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Conditions de participation :</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Être majeur (18 ans et plus)</li>
                <li>• Résider en France métropolitaine</li>
                <li>• Avoir un compte Instagram public</li>
                <li>• Respecter les règles de chaque concours</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Prix et validité :</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Les forfaits eSIM sont valables 12 mois</li>
                <li>• Activation possible dans plus de 100 pays</li>
                <li>• Support technique inclus</li>
                <li>• Non échangeables ni remboursables</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Gagnants précédents */}
        <div className="bg-orange-50 rounded-xl p-6 mb-8 border border-orange-200">
          <h3 className="text-xl font-semibold text-orange-700 mb-4">🏅 Gagnants précédents</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl">
                👤
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Marie L.</h4>
              <p className="text-sm text-gray-600">Photo en Thaïlande</p>
              <p className="text-xs text-orange-600 font-semibold">Octobre 2024</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl">
                👤
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Thomas B.</h4>
              <p className="text-sm text-gray-600">Voyage au Japon</p>
              <p className="text-xs text-orange-600 font-semibold">Septembre 2024</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl">
                👤
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Sophie M.</h4>
              <p className="text-sm text-gray-600">Aventure au Canada</p>
              <p className="text-xs text-orange-600 font-semibold">Août 2024</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-purple-700 mb-4">
            Prêt à participer ?
          </h3>
          <p className="text-gray-600 mb-6">
            Rejoignez notre communauté de voyageurs et tentez votre chance !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://www.instagram.com/fenuasim" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              📱 Suivre sur Instagram
            </a>
            <a 
              href="/contact" 
              className="inline-block border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300"
            >
              💬 Nous contacter
            </a>
          </div>
        </div>
      </div>

      {/* Informations légales */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">ℹ️ Informations légales</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ces concours sont organisés par FENUA SIM SASU, 58 rue Monceau 75008 Paris. 
          Les règles complètes sont disponibles sur demande. 
          Les décisions du jury sont sans appel.
        </p>
        <p className="text-sm text-gray-600">
          Pour toute question concernant nos concours, contactez-nous à 
          <a href="mailto:contact@fenuasim.com" className="text-purple-600 hover:underline ml-1">
            concours@fenuasim.com
          </a>
        </p>
      </div>
    </div>
  );
}
