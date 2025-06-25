import React from 'react';
import { Container, Typography, Breadcrumbs, Link, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExplanationMetricsPanel from '../../components/admin/ExplanationMetricsPanel';

/**
 * Page d'administration pour visualiser les métriques des explications IA
 */
const ExplanationMetricsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/admin" color="inherit">
            Administration
          </Link>
          <Typography color="text.primary">Métriques d'explications IA</Typography>
        </Breadcrumbs>
      </Box>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Métriques d'explications IA
      </Typography>
      
      <Typography variant="body1" paragraph>
        Ce tableau de bord présente les métriques de performance des explications fournies par l'IA. 
        Il permet d'évaluer l'efficacité des différents types d'explications et d'identifier les axes d'amélioration.
      </Typography>
      
      <ExplanationMetricsPanel />
    </Container>
  );
};

export default ExplanationMetricsPage;
