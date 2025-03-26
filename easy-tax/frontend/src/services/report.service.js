import axios from 'axios';
import { API_URL } from '../config';

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

class ReportService {
  // Get spending trends data
  async getSpendingTrends(params = {}) {
    try {
      return await API.get('/api/transactions/reports/spending-trends', { params });
    } catch (error) {
      console.error('Error fetching spending trends:', error);
      throw error;
    }
  }

  // Get income vs expense data
  async getIncomeVsExpense(params = {}) {
    try {
      return await API.get('/api/transactions/reports/income-vs-expense', { params });
    } catch (error) {
      console.error('Error fetching income vs expense data:', error);
      throw error;
    }
  }

  // Get category breakdown data
  async getCategoryBreakdown(params = {}) {
    try {
      return await API.get('/api/transactions/reports/category-breakdown', { params });
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      throw error;
    }
  }

  // Get financial summary data
  async getFinancialSummary(params = {}) {
    try {
      return await API.get('/api/transactions/reports/summary', { params });
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  }
}

export default new ReportService(); 