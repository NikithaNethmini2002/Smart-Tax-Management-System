import axios from 'axios';
import { API_URL } from '../config';

// Transaction API service
const TransactionService = {
  // Get all transactions
  getAllTransactions: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching transactions' };
    }
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching transaction' };
    }
  },

  // Filter transactions
  filterTransactions: async (filters) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_URL}/api/transactions/filter?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error filtering transactions' };
    }
  },

  // Get transaction summary
  getTransactionSummary: async (period) => {
    try {
      const queryString = period ? `period=${period}` : '';
      const response = await axios.get(`${API_URL}/api/transactions/summary?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching transaction summary' };
    }
  },

  // Create a new transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await axios.post(`${API_URL}/api/transactions`, transactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error creating transaction' };
    }
  },

  // Update a transaction
  updateTransaction: async (id, transactionData) => {
    try {
      const response = await axios.put(`${API_URL}/api/transactions/${id}`, transactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating transaction' };
    }
  },

  // Delete a transaction
  deleteTransaction: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/api/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deleting transaction' };
    }
  }
};

export default TransactionService; 