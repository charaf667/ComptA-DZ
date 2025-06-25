import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, Chip, LinearProgress, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import type { ExplanationDetail, ExplanationFactor } from './types/explanation';

interface ExplanationPanelProps {
  explanationSummary?: string;
  explanationDetails?: ExplanationDetail[];
  explanationFactors?: ExplanationFactor[];
  onFeedback?: (feedback: {
    explanationHelpful: boolean;
    explanationType: string;
    suggestionAccepted: boolean;
    comments?: string;
  }) => void;
  expanded?: boolean;
}

/**
 * Composant pour afficher les explications détaillées fournies par l'IA
 */
const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  explanationSummary,
  explanationDetails,
  explanationFactors,
  onFeedback,
  expanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);
  const [activeSection, setActiveSection] = useState<string>('summary');
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [feedbackType, setFeedbackType] = useState<'helpful' | 'not-helpful' | null>(null);
  const [comments] = useState<string>(''); // Utilisé uniquement pour être envoyé dans le feedback

  // Si aucune explication n'est disponible, ne pas afficher le composant
  if (!explanationSummary && (!explanationDetails || explanationDetails.length === 0) && (!explanationFactors || explanationFactors.length === 0)) {
    return null;
  }

  const handleFeedback = (isHelpful: boolean) => {
    if (onFeedback) {
      onFeedback({
        explanationHelpful: isHelpful,
        explanationType: activeSection,
        suggestionAccepted: true, // Cette valeur sera mise à jour par le composant parent
        comments
      });
    }
    setFeedbackGiven(true);
    setFeedbackType(isHelpful ? 'helpful' : 'not-helpful');
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        mt: 2, 
        mb: 2, 
        p: 0,
        borderLeft: '4px solid #3f51b5',
        overflow: 'hidden'
      }}
    >
      <Accordion 
        expanded={isExpanded} 
        onChange={() => setIsExpanded(!isExpanded)}
        disableGutters
        sx={{ boxShadow: 'none' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            backgroundColor: 'rgba(63, 81, 181, 0.08)',
            '&:hover': { backgroundColor: 'rgba(63, 81, 181, 0.12)' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LightbulbIcon sx={{ mr: 1, color: '#3f51b5' }} />
            <Typography variant="subtitle1" fontWeight="medium">
              Explication IA
            </Typography>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ p: 0 }}>
          {/* Navigation entre les différentes sections d'explication */}
          <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
            <Button 
              sx={{ 
                py: 1.5, 
                px: 2, 
                borderBottom: activeSection === 'summary' ? '2px solid #3f51b5' : 'none',
                borderRadius: 0,
                color: activeSection === 'summary' ? '#3f51b5' : 'text.secondary'
              }}
              onClick={() => setActiveSection('summary')}
            >
              Résumé
            </Button>
            {explanationDetails && explanationDetails.length > 0 && (
              <Button 
                sx={{ 
                  py: 1.5, 
                  px: 2, 
                  borderBottom: activeSection === 'details' ? '2px solid #3f51b5' : 'none',
                  borderRadius: 0,
                  color: activeSection === 'details' ? '#3f51b5' : 'text.secondary'
                }}
                onClick={() => setActiveSection('details')}
              >
                Détails
              </Button>
            )}
            {explanationFactors && explanationFactors.length > 0 && (
              <Button 
                sx={{ 
                  py: 1.5, 
                  px: 2, 
                  borderBottom: activeSection === 'factors' ? '2px solid #3f51b5' : 'none',
                  borderRadius: 0,
                  color: activeSection === 'factors' ? '#3f51b5' : 'text.secondary'
                }}
                onClick={() => setActiveSection('factors')}
              >
                Facteurs
              </Button>
            )}
          </Box>
          
          {/* Contenu de l'explication selon la section active */}
          <Box sx={{ p: 2 }}>
            {activeSection === 'summary' && explanationSummary && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {explanationSummary}
              </Typography>
            )}
            
            {activeSection === 'details' && explanationDetails && explanationDetails.length > 0 && (
              <Box>
                {explanationDetails.map((detail, index) => (
                  <Box key={index} sx={{ mb: index < explanationDetails.length - 1 ? 2 : 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {detail.title}
                      </Typography>
                      <Chip 
                        label={`${detail.confidence}%`} 
                        size="small" 
                        color={detail.confidence > 80 ? "success" : detail.confidence > 50 ? "primary" : "warning"} 
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {detail.description}
                    </Typography>
                    {index < explanationDetails.length - 1 && <Divider sx={{ mt: 1.5, mb: 1.5 }} />}
                  </Box>
                ))}
              </Box>
            )}
            
            {activeSection === 'factors' && explanationFactors && explanationFactors.length > 0 && (
              <Box>
                {explanationFactors.map((factor, index) => (
                  <Box key={index} sx={{ mb: index < explanationFactors.length - 1 ? 2 : 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {factor.factor}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Impact: {Math.round(factor.impact * 100)}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Chip 
                        label={factor.value} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mr: 1 }}
                      />
                      <LinearProgress 
                        variant="determinate" 
                        value={factor.impact * 100} 
                        sx={{ 
                          flexGrow: 1, 
                          height: 8, 
                          borderRadius: 4 
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {factor.description}
                    </Typography>
                    {index < explanationFactors.length - 1 && <Divider sx={{ mt: 1.5, mb: 1.5 }} />}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          
          {/* Section de feedback */}
          {onFeedback && (
            <Box sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FactCheckIcon sx={{ mr: 1, color: '#3f51b5', fontSize: '1rem' }} />
                <Typography variant="subtitle2">
                  Cette explication vous a-t-elle été utile ?
                </Typography>
              </Box>
              
              {!feedbackGiven ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small" 
                    onClick={() => handleFeedback(true)}
                  >
                    Oui, utile
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small" 
                    onClick={() => handleFeedback(false)}
                  >
                    Non, pas utile
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color={feedbackType === 'helpful' ? 'success.main' : 'error.main'}>
                  {feedbackType === 'helpful' 
                    ? 'Merci pour votre retour positif !' 
                    : 'Merci pour votre retour. Nous allons améliorer nos explications.'}
                </Typography>
              )}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default ExplanationPanel;
