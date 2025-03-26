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

class ChatbotService {
  // Send user message and get chatbot response
  async sendMessage(message, conversation = []) {
    try {
      return await API.post('/api/chatbot/message', { message, conversation });
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  }

  // Get frequently asked questions
  async getFrequentlyAskedQuestions() {
    try {
      return await API.get('/api/chatbot/faq');
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  }
}

export default new ChatbotService(); 