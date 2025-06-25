import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CloudDownload as ImportIcon
} from '@mui/icons-material';
import accountService from '../../services/account.service';
import type { IAccount, IAccountFilters } from '../../types/account.types';
import { AccountFormDialog } from '../../components/accounting';

const ChartOfAccountsPage: React.FC = () => {
  // États
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editAccount, setEditAccount] = useState<IAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, account: IAccount | null }>({
    open: false,
    account: null
  });
  const [notification, setNotification] = useState<{
    open: boolean,
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [filters, setFilters] = useState<IAccountFilters>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [importConfirm, setImportConfirm] = useState<boolean>(false);
  // Pour l'import CSV
  const [csvDialogOpen, setCsvDialogOpen] = useState<boolean>(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState<boolean>(false);

  // Chargement initial des comptes
  useEffect(() => {
    loadAccounts();
  }, []);

  // Fonction pour charger les comptes
  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountService.getAllAccounts();
      setAccounts(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des comptes');
      showNotification('Erreur lors du chargement des comptes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des comptes
  const filteredAccounts = accounts.filter(account => {
    let match = true;
    
    if (filters.classe && account.classe !== filters.classe) {
      match = false;
    }
    
    if (filters.isActive !== undefined && account.isActive !== filters.isActive) {
      match = false;
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const codeMatch = account.code.toLowerCase().includes(searchTerm);
      const labelMatch = account.label.toLowerCase().includes(searchTerm);
      if (!codeMatch && !labelMatch) {
        match = false;
      }
    }
    
    if (filters.parentCode) {
      if (account.parentCode !== filters.parentCode) {
        match = false;
      }
    }
    
    return match;
  });

  // Gestion du formulaire
  const handleOpenForm = (account: IAccount | null = null) => {
    setEditAccount(account);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditAccount(null);
  };

  // Gestion de la suppression
  const handleDeleteClick = (account: IAccount) => {
    setDeleteConfirm({ open: true, account });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.account) return;
    
    try {
      await accountService.deleteAccount(deleteConfirm.account.id);
      showNotification(`Compte ${deleteConfirm.account.code} supprimé avec succès`, 'success');
      loadAccounts();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Erreur lors de la suppression du compte', 'error');
    } finally {
      setDeleteConfirm({ open: false, account: null });
    }
  };

  // Gestion de l'import du plan comptable par défaut
  const handleImportClick = () => {
    setImportConfirm(true);
  };

  const handleConfirmImport = async () => {
    try {
      await accountService.importDefaultChartOfAccounts();
      showNotification('Plan comptable importé avec succès', 'success');
      loadAccounts();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Erreur lors de l\'import du plan comptable', 'error');
    } finally {
      setImportConfirm(false);
    }
  };

  // Gestion des notifications
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Gestion des filtres
  const handleFilterChange = (field: keyof IAccountFilters, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Rendu du composant
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Plan Comptable
      </Typography>

      {/* Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            sx={{ mr: 1 }}
          >
            Nouveau Compte
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ImportIcon />}
            onClick={handleImportClick}
            sx={{ mr: 2 }}
          >
            Importer le plan par défaut
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ImportIcon />}
            onClick={() => setCsvDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Import CSV
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={loadAccounts}
          >
            Actualiser
          </Button>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtres
          </Button>
        </Box>
      </Box>

      {/* Filtres */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtres
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Classe</InputLabel>
              <Select
                value={filters.classe || ''}
                label="Classe"
                onChange={(e) => handleFilterChange('classe', e.target.value ? Number(e.target.value) : undefined)}
              >
                <MenuItem value="">Toutes</MenuItem>
                {[1, 2, 3, 4, 5, 6, 7].map((classe) => (
                  <MenuItem key={classe} value={classe}>
                    Classe {classe}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
                label="Statut"
                onChange={(e) => {
                  const value = e.target.value as string;
                  handleFilterChange('isActive', value === '' ? undefined : value === 'active');
                }}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="active">Actifs</MenuItem>
                <MenuItem value="inactive">Inactifs</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Recherche"
              variant="outlined"
              value={filters.search || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
            
            <Button variant="outlined" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </Box>
        </Paper>
      )}

      {/* Tableau des comptes */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Libellé</TableCell>
                <TableCell>Classe</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="error">{error}</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>Aucun compte trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.code}</TableCell>
                    <TableCell>{account.label}</TableCell>
                    <TableCell>{account.classe}</TableCell>
                    <TableCell>
                      <Chip 
                        label={account.type === 'debit' ? 'Débit' : 'Crédit'} 
                        color={account.type === 'debit' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{account.category === 'detail' ? 'Détail' : 'Collectif'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={account.isActive ? 'Actif' : 'Inactif'} 
                        color={account.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenForm(account)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(account)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Formulaire de création/édition */}
      <AccountFormDialog
        open={openForm}
        account={editAccount}
        onClose={handleCloseForm}
        onSuccess={() => {
          loadAccounts();
          showNotification(
            `Compte ${editAccount ? 'modifié' : 'créé'} avec succès`, 
            'success'
          );
        }}
      />

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, account: null })}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le compte {deleteConfirm.account?.code} - {deleteConfirm.account?.label} ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, account: null })}>
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue d'import CSV */}
      <Dialog
        open={csvDialogOpen}
        onClose={() => {
          setCsvDialogOpen(false);
          setCsvFile(null);
        }}
      >
        <DialogTitle>Importer un plan comptable depuis un fichier CSV</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Format attendu :</strong> Le fichier doit être au format CSV avec les colonnes suivantes : <br />
            <code>code, label, classe, type, category</code><br />
            <ul>
              <li><b>code</b> : code du compte (ex : 512)</li>
              <li><b>label</b> : libellé du compte (ex : Banque)</li>
              <li><b>classe</b> : numéro de classe (1 à 9)</li>
              <li><b>type</b> : <i>debit</i> ou <i>credit</i></li>
              <li><b>category</b> : <i>detail</i> ou <i>collectif</i></li>
            </ul>
            <Box sx={{ mt: 1, mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                href="/template-plan-comptable.csv"
                download
                size="small"
                sx={{ mr: 1 }}
              >
                Télécharger un exemple de CSV
              </Button>
              <span style={{ fontSize: '0.95em', color: '#666' }}>
                <b>Besoin d'aide ?</b> Consultez la documentation ou contactez le support.
              </span>
            </Box>
            <span style={{ fontSize: '0.95em', color: '#888' }}>
              ⚠️ L'import n'est possible que si aucun plan n'existe déjà pour l'entreprise.
            </span>
          </DialogContentText>
          <input
            type="file"
            accept=".csv,text/csv"
            style={{ marginTop: 16 }}
            onChange={e => setCsvFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
            disabled={csvUploading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCsvDialogOpen(false);
            setCsvFile(null);
          }} disabled={csvUploading}>
            Annuler
          </Button>
          <Button
            onClick={async () => {
              if (!csvFile) {
                showNotification('Veuillez sélectionner un fichier CSV.', 'warning');
                return;
              }
              setCsvUploading(true);
              try {
                await accountService.importChartOfAccountsFromCsv(csvFile);
                showNotification('Import CSV réussi !', 'success');
                setCsvDialogOpen(false);
                setCsvFile(null);
                loadAccounts();
              } catch (err: any) {
                showNotification(err.message || 'Erreur lors de l\'import CSV', 'error');
              } finally {
                setCsvUploading(false);
              }
            }}
            color="primary"
            autoFocus
            disabled={csvUploading || !csvFile}
          >
            {csvUploading ? <CircularProgress size={20} /> : 'Importer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation d'import */}
      <Dialog
        open={importConfirm}
        onClose={() => setImportConfirm(false)}
      >
        <DialogTitle>Importer le plan comptable par défaut</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Cette action va importer le plan comptable par défaut pour votre entreprise.
            Cette opération n'est possible que si vous n'avez pas encore de comptes.
            Voulez-vous continuer ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportConfirm(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirmImport} color="primary" autoFocus>
            Importer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChartOfAccountsPage;
