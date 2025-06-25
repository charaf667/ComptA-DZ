import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Box
} from '@mui/material';
import type { IAccount, IAccountCreate, IAccountUpdate } from '../../types/account.types';
import accountService from '../../services/account.service';

interface AccountFormDialogProps {
  open: boolean;
  account: IAccount | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AccountFormDialog: React.FC<AccountFormDialogProps> = ({ 
  open, 
  account, 
  onClose, 
  onSuccess 
}) => {
  // État du formulaire
  const [formData, setFormData] = useState<IAccountCreate & Partial<IAccountUpdate>>({
    code: '',
    label: '',
    classe: 1,
    type: 'debit',
    category: 'detail',
    parentCode: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);

  // Charger les comptes pour le sélecteur de compte parent
  useEffect(() => {
    if (open) {
      loadAccounts();
    }
  }, [open]);

  // Initialiser le formulaire avec les données du compte à éditer
  useEffect(() => {
    if (account) {
      setFormData({
        label: account.label,
        category: account.category?.toLowerCase() as 'detail' | 'collectif',
        type: account.type?.toLowerCase() as 'debit' | 'credit',
        isActive: account.isActive,
        // Ajout des champs pour éviter les erreurs de type
        code: '',
        classe: 1,
        parentCode: ''
      });
    } else {
      setFormData({
        code: '',
        label: '',
        classe: 1,
        type: 'debit',
        category: 'detail',
        parentCode: ''
      });
    }
    setErrors({});
  }, [account, open]);

  // Charger la liste des comptes pour le sélecteur de compte parent
  const loadAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const data = await accountService.getAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Effacer l'erreur pour ce champ
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!account) { // Validation pour la création uniquement
      if (!formData.code) {
        newErrors.code = 'Le code est requis';
      } else if (!/^[0-9]+$/.test(formData.code as string)) {
        newErrors.code = 'Le code doit contenir uniquement des chiffres';
      }
      
      if (!formData.classe || (formData.classe as number) < 1 || (formData.classe as number) > 7) {
        newErrors.classe = 'La classe doit être entre 1 et 7';
      }
      
      if (!formData.type) {
        newErrors.type = 'Le type est requis';
      }
    }
    
    if (!formData.label) {
      newErrors.label = 'Le libellé est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      if (account) {
      // Mise à jour d'un compte existant
      await accountService.updateAccount(account.id, formData as IAccountUpdate);
      } else {
        // Création d'un nouveau compte
        await accountService.createAccount(formData as IAccountCreate);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde du compte:', err);
      
      // Gérer les erreurs de validation du serveur
      if (err.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        err.response.data.errors.forEach((error: any) => {
          serverErrors[error.param] = error.msg;
        });
        setErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  // Titre du dialogue
  const dialogTitle = account ? 'Modifier un compte' : 'Créer un nouveau compte';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2, mt: 1 }}>
          {!account && (
            <>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <TextField
                  name="code"
                  label="Code"
                  fullWidth
                  value={formData.code || ''}
                  onChange={handleChange}
                  error={!!errors.code}
                  helperText={errors.code}
                  disabled={loading}
                  required
                />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <FormControl fullWidth error={!!errors.classe}>
                  <InputLabel>Classe</InputLabel>
                  <Select
                    name="classe"
                    value={formData.classe}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        classe: Number(e.target.value)
                      });
                    }}
                    label="Classe"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((classe) => (
                      <MenuItem key={classe} value={classe}>
                        Classe {classe}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.classe && <FormHelperText>{errors.classe}</FormHelperText>}
                </FormControl>
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        type: e.target.value as 'debit' | 'credit'
                      });
                    }}
                    label="Type"
                  >
                    <MenuItem value="debit">Débit</MenuItem>
                    <MenuItem value="credit">Crédit</MenuItem>
                  </Select>
                  {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                </FormControl>
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <FormControl fullWidth>
                  <InputLabel>Compte parent</InputLabel>
                  <Select
                    name="parentCode"
                    value={formData.parentCode || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        parentCode: e.target.value as string
                      });
                    }}
                    label="Compte parent"
                  >
                    <MenuItem value="">Aucun (compte racine)</MenuItem>
                    {loadingAccounts ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} /> Chargement...
                      </MenuItem>
                    ) : (
                      accounts.map((acc) => (
                        <MenuItem key={acc.id} value={acc.code}>
                          {acc.code} - {acc.label}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            </>
          )}
          
          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              name="label"
              label="Libellé"
              fullWidth
              value={formData.label || ''}
              onChange={handleChange}
              error={!!errors.label}
              helperText={errors.label}
              disabled={loading}
              required
            />
          </Box>
          
          <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                name="category"
                value={formData.category || 'detail'}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    category: e.target.value as 'detail' | 'collectif'
                  });
                }}
                label="Catégorie"
              >
                <MenuItem value="detail">Détail</MenuItem>
                <MenuItem value="collectif">Collectif</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {account && (
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="isActive"
                  value={formData.isActive === undefined ? "true" : formData.isActive ? "true" : "false"}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      isActive: e.target.value === "true"
                    });
                  }}
                  label="Statut"
                >
                  <MenuItem value="true">Actif</MenuItem>
                  <MenuItem value="false">Inactif</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {account ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountFormDialog;
