import axios from 'axios';
import { API_URL } from '../config';

// Budget API service
const BudgetService = {
  // Get all budgets
  getAllBudgets: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/budgets`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching budgets' };
    }
  },

  // Get all budgets with their current status
  getAllBudgetsStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/budgets/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching budgets status' };
    }
  },

  // Get budget by ID
  getBudgetById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/budgets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching budget' };
    }
  },

  // Get budget status by ID
  getBudgetStatus: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/budgets/${id}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching budget status' };
    }
  },

  // Get budget recommendations
  getBudgetRecommendations: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/budgets/recommendations`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching budget recommendations' };
    }
  },

  // Create a new budget
  createBudget: async (budgetData) => {
    try {
      const response = await axios.post(`${API_URL}/api/budgets`, budgetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error creating budget' };
    }
  },

  // Update a budget
  updateBudget: async (id, budgetData) => {
    try {
      const response = await axios.put(`${API_URL}/api/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating budget' };
    }
  },

  // Delete a budget
  deleteBudget: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/api/budgets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deleting budget' };
    }
  }
};

export default BudgetService; 