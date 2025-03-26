import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import UserLayout from '../../../components/UserLayout';
import BudgetService from '../../../services/budget.service';

const BudgetRecommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await BudgetService.getBudgetRecommendations();
        console.log('Budget recommendations:', response);
        
        if (response && response.recommendations) {
          setRecommendations(response.recommendations);
        }
      } catch (err) {
        console.error('Error fetching budget recommendations:', err);
        setError('Failed to load budget recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  const getActionButton = (recommendation) => {
    if (recommendation.action === 'create') {
      return (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/budgets/new"
          state={{ 
            initialData: {
              name: `Budget for ${recommendation.category}`,
              amount: recommendation.recommendedAmount,
              category: recommendation.category,
              period: 'monthly'
            }
          }}
          size="small"
        >
          Create Budget
        </Button>
      );
    } else if (recommendation.action === 'increase' || recommendation.action === 'decrease') {
      return (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<EditIcon />}
          component={RouterLink}
          to={`/budgets/edit/${recommendation.budgetId}`}
          size="small"
        >
          Adjust Budget
        </Button>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <UserLayout title="Budget Recommendations">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Budget Recommendations">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/budgets"
          sx={{ mb: 2 }}
        >
          Back to Budgets
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Smart Budget Recommendations
          </Typography>
          
          <Typography variant="body2" color="textSecondary" paragraph>
            Based on your spending habits, we've generated these personalized recommendations to help you manage your finances better.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {recommendations.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No recommendations available at this time. Continue using the app to receive personalized recommendations.
            </Alert>
          ) : (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {recommendations.map((recommendation, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {recommendation.category || 'All Categories'}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" paragraph>
                        {recommendation.recommendation}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        {recommendation.action === 'increase' && (
                          <Typography variant="body2" color="error">
                            Current budget: ${recommendation.currentAmount.toFixed(2)}<br />
                            Recommended: ${recommendation.recommendedAmount.toFixed(2)}
                          </Typography>
                        )}
                        
                        {recommendation.action === 'decrease' && (
                          <Typography variant="body2" color="success.main">
                            Current budget: ${recommendation.currentAmount.toFixed(2)}<br />
                            Recommended: ${recommendation.recommendedAmount.toFixed(2)}
                          </Typography>
                        )}
                        
                        {recommendation.action === 'create' && (
                          <Typography variant="body2" color="primary">
                            Recommended budget: ${recommendation.recommendedAmount.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      {getActionButton(recommendation)}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </UserLayout>
  );
};

export default BudgetRecommendations; 