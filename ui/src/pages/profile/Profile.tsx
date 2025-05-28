import React, { useState } from 'react';

/**
 * Page de profil utilisateur
 * Permet de consulter et modifier ses informations personnelles
 */
const Profile = () => {
  // État du formulaire
  const [formData, setFormData] = useState({
    nom: 'Utilisateur Test',
    email: 'utilisateur@example.com',
    role: 'Admin',
    entreprise: 'Entreprise Test SARL',
    telephone: '+213 555 123 456',
    adresse: '123 Rue des Exemples, Alger, Algérie',
  });
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumission du formulaire de profil
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      // TODO: Implémenter l'appel API pour mettre à jour le profil
      console.log('Mise à jour du profil:', formData);
      
      // Simulation de délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err) {
      setErrorMessage('Erreur lors de la mise à jour du profil');
      console.error('Erreur de mise à jour:', err);
    } finally {
      setLoading(false);
    }
  };

  // Soumission du formulaire de mot de passe
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      // TODO: Implémenter l'appel API pour changer le mot de passe
      console.log('Changement de mot de passe:', { currentPassword, newPassword });
      
      // Simulation de délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMessage('Erreur lors du changement de mot de passe');
      console.error('Erreur de mot de passe:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-primary-900">Profil</h1>
        <p className="text-text-secondary mt-1">Gérez vos informations personnelles et votre mot de passe</p>
      </div>

      {/* Messages de succès/erreur */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-success rounded-md">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-error rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Informations de profil */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-heading font-semibold text-primary-900">Informations personnelles</h2>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary-600 hover:text-primary-800"
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="nom" className="form-label">Nom complet</label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  value={formData.nom}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="telephone" className="form-label">Téléphone</label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="adresse" className="form-label">Adresse</label>
                <input
                  id="adresse"
                  name="adresse"
                  type="text"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Enregistrer'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-text-secondary">Nom complet</p>
              <p className="mt-1 text-text-primary">{formData.nom}</p>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary">Email</p>
              <p className="mt-1 text-text-primary">{formData.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary">Rôle</p>
              <p className="mt-1 text-text-primary">{formData.role}</p>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary">Entreprise</p>
              <p className="mt-1 text-text-primary">{formData.entreprise}</p>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary">Téléphone</p>
              <p className="mt-1 text-text-primary">{formData.telephone || '-'}</p>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary">Adresse</p>
              <p className="mt-1 text-text-primary">{formData.adresse || '-'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Changement de mot de passe */}
      <div className="card">
        <h2 className="text-lg font-heading font-semibold text-primary-900 mb-6">Changer le mot de passe</h2>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label htmlFor="currentPassword" className="form-label">Mot de passe actuel</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-input"
              disabled={loading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              disabled={loading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              disabled={loading}
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Modifier le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
