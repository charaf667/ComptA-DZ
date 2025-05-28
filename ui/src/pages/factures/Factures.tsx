import React, { useState } from 'react';

/**
 * Page de gestion des factures
 * Permet de visualiser, filtrer et gérer les factures
 */
const Factures = () => {
  const [activeTab, setActiveTab] = useState('toutes');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Données fictives pour la démo
  const invoices = [
    { id: 'F-2023-001', fournisseur: 'Algérie Télécom', montant: '12 500 DA', date: '25/05/2025', statut: 'En attente', type: 'Télécom' },
    { id: 'F-2023-002', fournisseur: 'Sonelgaz', montant: '34 200 DA', date: '24/05/2025', statut: 'Validé', type: 'Électricité' },
    { id: 'F-2023-003', fournisseur: 'Mobilis', montant: '8 600 DA', date: '23/05/2025', statut: 'Validé', type: 'Télécom' },
    { id: 'F-2023-004', fournisseur: 'Amazon Web Services', montant: '45 700 DA', date: '22/05/2025', statut: 'En attente', type: 'Cloud' },
    { id: 'F-2023-005', fournisseur: 'Djezzy', montant: '7 500 DA', date: '21/05/2025', statut: 'Rejeté', type: 'Télécom' },
    { id: 'F-2023-006', fournisseur: 'SEAAL', montant: '3 200 DA', date: '20/05/2025', statut: 'Validé', type: 'Eau' },
    { id: 'F-2023-007', fournisseur: 'Air Algérie', montant: '85 000 DA', date: '19/05/2025', statut: 'En attente', type: 'Transport' },
    { id: 'F-2023-008', fournisseur: 'Microsoft', montant: '12 400 DA', date: '18/05/2025', statut: 'Validé', type: 'Logiciel' },
  ];

  // Filtrage des factures par statut et terme de recherche
  const filteredInvoices = invoices.filter(invoice => {
    const matchesTab = activeTab === 'toutes' || 
                      (activeTab === 'en-attente' && invoice.statut === 'En attente') ||
                      (activeTab === 'validees' && invoice.statut === 'Validé') ||
                      (activeTab === 'rejetees' && invoice.statut === 'Rejeté');
    
    const matchesSearch = searchTerm === '' || 
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary-900">Factures</h1>
          <p className="text-text-secondary mt-1">Gérez et consultez toutes vos factures</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Ajouter une facture
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Tabs */}
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('toutes')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'toutes'
                  ? 'bg-primary-50 text-primary-900'
                  : 'text-gray-600 hover:text-primary-900 hover:bg-gray-50'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setActiveTab('en-attente')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'en-attente'
                  ? 'bg-primary-50 text-primary-900'
                  : 'text-gray-600 hover:text-primary-900 hover:bg-gray-50'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setActiveTab('validees')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'validees'
                  ? 'bg-primary-50 text-primary-900'
                  : 'text-gray-600 hover:text-primary-900 hover:bg-gray-50'
              }`}
            >
              Validées
            </button>
            <button
              onClick={() => setActiveTab('rejetees')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'rejetees'
                  ? 'bg-primary-50 text-primary-900'
                  : 'text-gray-600 hover:text-primary-900 hover:bg-gray-50'
              }`}
            >
              Rejetées
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Rechercher une facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Référence
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Fournisseur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Montant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary-900">{invoice.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">{invoice.fournisseur}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">{invoice.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">{invoice.montant}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">{invoice.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.statut === 'Validé'
                            ? 'bg-green-100 text-success'
                            : invoice.statut === 'En attente'
                            ? 'bg-yellow-100 text-amber-800'
                            : 'bg-red-100 text-error'
                        }`}
                      >
                        {invoice.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-4">
                        Voir
                      </button>
                      <button className="text-primary-600 hover:text-primary-900">
                        Éditer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-text-secondary">
                    Aucune facture trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-text-secondary">
                Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredInvoices.length}</span> sur <span className="font-medium">{filteredInvoices.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Précédent
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Factures;
