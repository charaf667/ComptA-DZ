import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Type pour les métriques de performance reçues de l'API
interface PerformanceMetrics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  averageDecisionTimeMs: number;
  lastUpdated: string;
  explanations: {
    total: number;
    helpful: number;
    notHelpful: number;
    byType: Record<string, {
      total: number;
      helpful: number;
      notHelpful: number;
      acceptanceRate: number;
    }>;
  };
}

const COLORS = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0'];

/**
 * Composant pour afficher les métriques d'explication IA dans un tableau de bord
 */
const ExplanationMetricsPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Charger les métriques depuis l'API
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/performance-metrics');
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(`Erreur lors du chargement des métriques: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Rafraîchir les données toutes les 5 minutes
    const intervalId = setInterval(fetchMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Préparation des données pour les graphiques
  const prepareChartData = () => {
    if (!metrics) return { pieData: [], barData: [] };
    
    const pieData = [
      { name: 'Utiles', value: metrics.explanations.helpful },
      { name: 'Non utiles', value: metrics.explanations.notHelpful }
    ];
    
    const barData = Object.entries(metrics.explanations.byType).map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1), // Première lettre en majuscule
      utiles: data.helpful,
      nonUtiles: data.notHelpful,
      tauxAcceptation: Math.round(data.acceptanceRate * 100)
    }));
    
    return { pieData, barData };
  };
  
  const { pieData, barData } = prepareChartData();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!metrics) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Aucune donnée de métriques disponible.
      </Alert>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Tableau de bord des explications IA
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Dernière mise à jour: {new Date(metrics.lastUpdated).toLocaleString()}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Cartes de résumé */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid component="div" sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total des explications
              </Typography>
              <Typography variant="h4">
                {metrics.explanations.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid component="div" sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Explications utiles
              </Typography>
              <Typography variant="h4" color="success.main">
                {metrics.explanations.helpful}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid component="div" sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Explications non utiles
              </Typography>
              <Typography variant="h4" color="error.main">
                {metrics.explanations.notHelpful}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid component="div" sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Taux d'utilité
              </Typography>
              <Typography variant="h4" color="primary.main">
                {metrics.explanations.total > 0 
                  ? `${Math.round((metrics.explanations.helpful / metrics.explanations.total) * 100)}%` 
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Graphiques */}
      <Grid container spacing={3}>
        <Grid component="div" sx={{ width: { xs: '100%', md: '50%' } }}>
          <Typography variant="h6" gutterBottom>
            Répartition des explications
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} explications`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid component="div" sx={{ width: { xs: '100%', md: '50%' } }}>
          <Typography variant="h6" gutterBottom>
            Efficacité par type d'explication
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utiles" name="Explications utiles" fill="#4caf50" />
                <Bar dataKey="nonUtiles" name="Explications non utiles" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
      
      {/* Tableau détaillé */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Détails par type d'explication
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type d'explication</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Utiles</TableCell>
                <TableCell align="right">Non utiles</TableCell>
                <TableCell align="right">Taux d'acceptation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(metrics.explanations.byType).map(([type, data]) => (
                <TableRow key={type}>
                  <TableCell component="th" scope="row">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </TableCell>
                  <TableCell align="right">{data.total}</TableCell>
                  <TableCell align="right">{data.helpful}</TableCell>
                  <TableCell align="right">{data.notHelpful}</TableCell>
                  <TableCell align="right">{`${Math.round(data.acceptanceRate * 100)}%`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default ExplanationMetricsPanel;
