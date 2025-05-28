import React from 'react';

/**
 * Page principale du tableau de bord
 * Affiche les statistiques et informations générales
 */
const Dashboard = () => {
  // Données fictives pour la démo
  const stats = [
    { name: 'Factures en attente', value: 12, change: '+2', changeType: 'increase' },
    { name: 'Factures validées', value: 147, change: '+12%', changeType: 'increase' },
    { name: 'Montant TVA (mois)', value: '125 400 DA', change: '+8%', changeType: 'increase' },
    { name: 'Économies réalisées', value: '45 200 DA', change: '+5%', changeType: 'increase' },
  ];

  const recentInvoices = [
    { id: 'F-2023-001', fournisseur: 'Algérie Télécom', montant: '12 500 DA', date: '25/05/2025', statut: 'En attente' },
    { id: 'F-2023-002', fournisseur: 'Sonelgaz', montant: '34 200 DA', date: '24/05/2025', statut: 'Validé' },
    { id: 'F-2023-003', fournisseur: 'Mobilis', montant: '8 600 DA', date: '23/05/2025', statut: 'Validé' },
    { id: 'F-2023-004', fournisseur: 'Amazon Web Services', montant: '45 700 DA', date: '22/05/2025', statut: 'En attente' },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary-900">Tableau de bord</h1>
          <p className="text-text-secondary mt-1">Bienvenue sur ComptaDZ, voici un aperçu de votre activité</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button className="btn btn-outline">Exporter</button>
          <button className="btn btn-primary">Ajouter une facture</button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <p className="text-text-secondary text-sm font-medium">{stat.name}</p>
            <p className="mt-2 text-3xl font-semibold text-text-primary">{stat.value}</p>
            <div className="mt-2">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-success' : 'text-error'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-text-secondary text-sm ml-1">vs mois précédent</span>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique (à remplacer par un vrai graphique plus tard) */}
      <div className="card">
        <h2 className="text-lg font-heading font-semibold text-primary-900 mb-4">Évolution des factures</h2>
        <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
          <p className="text-text-secondary">Graphique d'évolution des factures à venir</p>
        </div>
      </div>

      {/* Dernières factures */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-primary-900">Dernières factures</h2>
          <a href="/factures" className="text-primary-600 hover:text-primary-800 text-sm font-medium">Voir toutes</a>
        </div>
        
        <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-text-secondary sm:pl-0">
                    Référence
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-text-secondary">
                    Fournisseur
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-text-secondary">
                    Montant
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-text-secondary">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-text-secondary">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary-900 sm:pl-0">
                      {invoice.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-text-primary">
                      {invoice.fournisseur}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-text-primary">
                      {invoice.montant}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-text-primary">
                      {invoice.date}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.statut === 'Validé'
                            ? 'bg-green-100 text-success'
                            : 'bg-yellow-100 text-amber-800'
                        }`}
                      >
                        {invoice.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
