export default function Concours() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
        🎉 Grand Concours FENUA SIM
      </h1>
      
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100 mb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">
            Gagnez une eSIM Monde pour rester connecté partout !
          </h2>
          <p className="text-gray-600 text-lg">
            Participez et tentez de remporter une <strong>eSIM Monde 20 Go – 200 SMS – 200 min – 365 jours</strong>, utilisable dans plus de 100 pays 🌍.
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
                Partagez votre plus belle photo de voyage et remportez notre eSIM Monde <strong>20 Go – 200 SMS – 200 min – 365 jours</strong>.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📅 <strong>Date limite :</strong> 31 décembre 2024</p>
                <p>🎁 <strong>Prix :</strong> eSIM Monde 20 Go – 200 SMS – 200 min – 365 jours</p>
                <p>🌍 <strong>Validité :</strong> Plus de 100 pays</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h5 className="font-semibold text-purple-700 mb-3">Comment participer :</h5>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Aimez la page Facebook <strong>@fenuasim</strong></li>
                <li>Partagez votre photo de voyage en commentaire du post concours</li>
                <li>Ajoutez le hashtag <strong>#FenuaSIMVoyage</strong></li>
                <li>Invitez vos amis à aimer et commenter votre participation</li>
              </ol>
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
                <li>• Avoir un compte Facebook public</li>
                <li>• Respecter les règles de participation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Prix et validité :</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• eSIM valable 12 mois</li>
                <li>• Activation possible dans plus de 100 pays</li>
                <li>• Support technique inclus</li>
                <li>• Non échangeable et non remboursable</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-purple-700 mb-4">
            Prêt à tenter votre chance ?
          </h3>
          <p className="text-gray-600 mb-6">
            Rejoignez notre communauté Facebook et participez maintenant pour gagner votre eSIM Monde 20 Go !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://www.facebook.com/fenuasim" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              📱 Suivre sur Facebook
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
          Ce concours est organisé par FENUA SIM SASU, 58 rue Monceau 75008 Paris. 
          Les règles complètes sont disponibles sur demande. 
        </p>
        <p className="text-sm text-gray-600">
          Pour toute question concernant notre concours, contactez-nous à 
          <a href="mailto:contact@fenuasim.com" className="text-purple-600 hover:underline ml-1">
            contact@fenuasim.com
          </a>
        </p>
      </div>
    </div>
  );
}
