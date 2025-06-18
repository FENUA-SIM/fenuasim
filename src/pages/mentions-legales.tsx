export default function MentionsLegales() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Mentions Légales</h1>
      
      <div className="bg-white rounded-xl shadow p-8 space-y-8 border border-purple-100">
        <section>
          <h2 className="text-xl font-semibold text-purple-700 mb-4">1. Éditeur du site</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Nom du site : FENUA SIM</li>
            <li>Propriétaire / Responsable de publication : FENUA SIM SASU</li>
            <li>Adresse : 58 rue Monceau 75008</li>
            <li>Email : contact@fenuasim.com</li>
            <li>Statut juridique : [SASU]</li>
            <li>SIRET : [943 713 875]</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-700 mb-4">2. Hébergement</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Hébergeur : Vercel Inc.</li>
            <li>340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
            <li>Site : <a href="https://vercel.com" className="text-fenua-purple underline" target="_blank" rel="noopener noreferrer">https://vercel.com</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-700 mb-4">3. Base de données & traitement des données</h2>
          <p className="text-gray-700 mb-2">Les données sont hébergées et sécurisées via Supabase, une solution de base de données conforme aux standards de sécurité modernes.</p>
          <p className="text-gray-700 mb-2">En utilisant notre site, vous acceptez le traitement de vos données dans le cadre des finalités suivantes :</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Gestion des commandes et paiements</li>
            <li>Connexion aux services Airalo (pour l'achat de eSIM)</li>
            <li>Service client et support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-700 mb-4">4. Propriété intellectuelle</h2>
          <p className="text-gray-700">Tous les contenus présents sur le site FENUA SIM (textes, images, logos, marques, etc.) sont la propriété exclusive de leur détenteur. Toute reproduction, distribution, modification ou utilisation sans autorisation préalable est interdite.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-700 mb-4">5. Cookies</h2>
          <p className="text-gray-700">Le site peut utiliser des cookies à des fins de fonctionnement et d'analyse statistique. Vous pouvez à tout moment désactiver les cookies via les paramètres de votre navigateur.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-700 mb-4">6. Responsabilité</h2>
          <p className="text-gray-700">FENUA SIM s'efforce de fournir des informations exactes mais ne saurait garantir l'exactitude, la complétude ou l'actualité des contenus publiés. L'utilisation du site se fait sous votre seule responsabilité.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-700 mb-4">7. Contact</h2>
          <p className="text-gray-700">Pour toute question ou réclamation, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:contact@fenuasim.com" className="text-fenua-purple underline">contact@fenuasim.com</a></p>
        </section>
      </div>
    </div>
  )
} 
