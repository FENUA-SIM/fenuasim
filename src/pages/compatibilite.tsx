import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Device {
  brand: string
  models: string[]
}

const TERMINAUX_ESIM = [
  {
    brand: 'Apple',
    models: [
      'iPhone 15 / 15 Plus / 15 Pro / 15 Pro Max',
      'iPhone 14 / 14 Plus / 14 Pro / 14 Pro Max',
      'iPhone 13 / 13 mini / 13 Pro / 13 Pro Max',
      'iPhone 12 / 12 mini / 12 Pro / 12 Pro Max',
      'iPhone 11 / 11 Pro / 11 Pro Max',
      'iPhone XS / XS Max',
      'iPhone XR',
      'iPhone SE (2e et 3e génération)',
      'iPad Pro (3e gen et +)',
      'iPad Air (3e gen et +)',
      'iPad (7e gen et +)',
      'iPad mini (5e gen et +)'
    ]
  },
  {
    brand: 'Samsung',
    models: [
      'Galaxy S24 / S24+ / S24 Ultra',
      'Galaxy S23 / S23+ / S23 Ultra',
      'Galaxy S22 / S22+ / S22 Ultra',
      'Galaxy S21 / S21+ / S21 Ultra',
      'Galaxy Z Fold5 / Z Flip5',
      'Galaxy Z Fold4 / Z Flip4',
      'Galaxy Z Fold3 / Z Flip3',
      'Galaxy Note20 / Note20 Ultra',
      'Galaxy Watch4 / Watch5 / Watch6',
    ]
  },
  {
    brand: 'Google',
    models: [
      'Pixel 8 / 8 Pro',
      'Pixel 7 / 7 Pro / 7a',
      'Pixel 6 / 6 Pro / 6a',
      'Pixel 5',
      'Pixel 4 / 4a / 4 XL',
      'Pixel 3 / 3a / 3 XL',
    ]
  },
  {
    brand: 'Oppo',
    models: [
      'Find X3 Pro',
      'Reno6 Pro 5G',
      'Reno5 A',
      'OPPO Watch',
    ]
  },
  {
    brand: 'Huawei',
    models: [
      'P40 / P40 Pro',
      'Mate 40 Pro',
      'Watch 3',
      'Watch 3 Pro',
    ]
  },
  {
    brand: 'Autres',
    models: [
      'Motorola Razr 2019/5G/2022',
      'Surface Duo',
      'Honor Magic 4 Pro / Magic 5 Pro',
      'Xiaomi 12T Pro / 13 Lite',
      'Fairphone 4',
      'Sony Xperia 10 IV / 1 IV / 5 IV',
      'OnePlus 11 5G',
      'Vivo X90 Pro',
      'Et bien d\'autres...'
    ]
  }
];

export default function Compatibilite() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <h1 className="text-3xl font-bold mb-6">Compatibilité eSIM</h1>
      <p className="mb-6 text-lg text-gray-700">
        Voici une liste récente de terminaux compatibles eSIM (non exhaustive, à vérifier selon les opérateurs) :
      </p>
      <div className="bg-white rounded-xl shadow p-6 border border-purple-100 text-left">
        {TERMINAUX_ESIM.map(({ brand, models }) => (
          <div key={brand} className="mb-6">
            <h2 className="text-lg font-bold text-purple-700 mb-2">{brand}</h2>
            <ul className="flex flex-wrap gap-2">
              {models.map(model => (
                <li key={model} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm">
                  {model}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <a href="https://www.airalo.com/help/fr/a-propos-dairalo/NFHQSUXFCZOM/quels-sont-les-appareils-compatibles/D2N6OZSVVM9W?srsltid=AfmBOooqcXE3J-YBy6XInyPUDhOzbKGVQetRsP7CzdoklUSPRNTamkV0" target="_blank" rel="noopener noreferrer" className="inline-block bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition mb-4">Voir la liste complète</a>
      </div>
    </div>
  )
} 
