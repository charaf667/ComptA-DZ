import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiRefreshCw } from 'react-icons/fi';

interface PerformanceMetrics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  averageDecisionTime: number;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fonction pour récupérer les métriques
  const fetchMetrics = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      const response = await axios.get(`${API_URL}/performance-metrics`);
      if (response.data.success) {
        setMetrics(response.data.data);
        setLastRefresh(new Date());
      } else {
        setError('Erreur lors de la récupération des métriques');
      }
    } catch (err) {
      setError('Erreur lors de la récupération des métriques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    fetchMetrics();
  }, []);
  
  // Configuration du rechargement automatique toutes les 30 secondes
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMetrics(true); // true indique un auto-refresh
    }, 30000); // 30 secondes
    
    // Nettoyage à la démontage du composant
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div>Chargement des métriques...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!metrics) {
    return <div>Aucune donnée de métrique disponible</div>;
  }

  const data = [
    { name: 'Total', value: metrics.totalSuggestions },
    { name: 'Acceptées', value: metrics.acceptedSuggestions },
    { name: 'Rejetées', value: metrics.rejectedSuggestions },
    { name: 'Temps Moyen', value: metrics.averageDecisionTime },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tableau de Bord des Performances</h1>
        <div className="flex items-center text-sm text-gray-600">
          {refreshing && (
            <span className="flex items-center mr-4">
              <FiRefreshCw className="animate-spin mr-2" /> Actualisation...
            </span>
          )}
          {lastRefresh && (
            <span>
              Dernière mise à jour: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceDashboard;
