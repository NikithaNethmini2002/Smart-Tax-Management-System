import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:9000/api/budgets/';

// Budget API service
const BudgetService = {
  // Get all budgets
  getAllBudgets: async () => {
    try {
      const response = await axios.get(API_URL, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching budgets' };
    }
  },

  // Get all budgets with their current status
  getAllBudgetsStatus: async () => {
    try {
      const response = await axios.get(API_URL + 'status', { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching budgets status' };
    }
  },

  // Get budget by ID
  getBudgetById: async (id) => {
    try {
      console.log('Fetching budget with ID:', id);
      const response = await axios.get(API_URL + id, { headers: authHeader() });
      console.log('Response from getBudgetById:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getBudgetById:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Error fetching budget' };
    }
  },

  // Get budget status by ID
  getBudgetStatus: async (id) => {
    try {
      const response = await axios.get(`${API_URL}${id}/status`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching budget status' };
    }
  },

  // Get budget recommendations
  getBudgetRecommendations: async () => {
    try {
      const response = await axios.get(API_URL + 'recommendations', { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching budget recommendations' };
    }
  },

  // Create a new budget
  createBudget: async (budgetData) => {
    try {
      const response = await axios.post(API_URL, budgetData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error creating budget' };
    }
  },

  // Update a budget
  updateBudget: async (id, budgetData) => {
    try {
      const response = await axios.put(API_URL + id, budgetData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating budget' };
    }
  },

  // Delete a budget
  deleteBudget: async (id) => {
    try {
      console.log('Deleting budget with ID:', id);
      const response = await axios.delete(API_URL + id, { headers: authHeader() });
      console.log('Delete budget response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in deleteBudget:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Error deleting budget' };
    }
  }
};

export default BudgetService; 