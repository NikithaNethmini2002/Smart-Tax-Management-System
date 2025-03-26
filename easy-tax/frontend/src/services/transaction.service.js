import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with baseURL
const API = axios.create({
  baseURL: API_URL
});

// Add authorization header to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle common API errors
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Transaction API service
const TransactionService = {
  // Get all transactions
  getAllTransactions: async () => {
    try {
      return await API.get('/api/transactions');
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    try {
      return await API.get(`/api/transactions/${id}`);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  },

  // Filter transactions
  filterTransactions: async (filters) => {
    try {
      return await API.get('/api/transactions/filter', { params: filters });
    } catch (error) {
      console.error('Error filtering transactions:', error);
      throw error;
    }
  },

  // Get transaction summary
  getTransactionSummary: async (period) => {
    try {
      return await API.get('/api/transactions/summary', { 
        params: period ? { period } : {} 
      });
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      throw error;
    }
  },

  // Create a new transaction
  createTransaction: async (transactionData) => {
    try {
      return await API.post('/api/transactions', transactionData);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  // Update a transaction
  updateTransaction: async (id, transactionData) => {
    try {
      return await API.put(`/api/transactions/${id}`, transactionData);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  // Delete a transaction
  deleteTransaction: async (id) => {
    try {
      return await API.delete(`/api/transactions/${id}`);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
};

export default TransactionService; 