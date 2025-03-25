import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found in localStorage');
          setAuth(prev => ({ ...prev, loading: false }));
          return;
        }
        
        console.log('Token found in localStorage, setting auth header');
        // Set auth header for all future requests first
        setAuthToken(token);
        
        try {
          // Decode token and log its contents for debugging
          const decoded = jwtDecode(token);
          console.log('Decoded token:', decoded);
          
          const currentTime = Date.now() / 1000;
          console.log('Current time:', currentTime, 'Token expiry:', decoded.exp);
          
          if (decoded.exp < currentTime) {
            // Token is expired
            console.log('Token is expired, trying to refresh...');
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (refreshToken) {
              try {
                const res = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
                localStorage.setItem('token', res.data.token);
                
                const newDecoded = jwtDecode(res.data.token);
                
                // Set auth state
                setAuth({
                  isAuthenticated: true,
                  isAdmin: newDecoded.isAdmin,
                  user: { id: newDecoded.id },
                  loading: true, // Still loading until we fetch full profile
                });
                
                // Set auth header for all future requests
                setAuthToken(res.data.token);
                
                // Get user profile
                await fetchUserProfile(newDecoded.id, newDecoded.isAdmin);
              } catch (error) {
                console.error('Failed to refresh token:', error);
                // Refresh token is invalid, logout user
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                setAuth({ isAuthenticated: false, isAdmin: false, user: null, loading: false });
                setAuthToken(null);
              }
            } else {
              // No refresh token, logout user
              localStorage.removeItem('token');
              setAuth({ isAuthenticated: false, isAdmin: false, user: null, loading: false });
              setAuthToken(null);
            }
          } else {
            // Token is still valid
            console.log('Token is valid, attempting to extract user ID');
            
            // Extract user ID with fallbacks and detailed logging
            let userId;
            if (decoded.id) {
              userId = decoded.id;
              console.log('Found user ID in token.id:', userId);
            } else if (decoded.user && decoded.user.id) {
              userId = decoded.user.id;
              console.log('Found user ID in token.user.id:', userId);
            } else {
              console.error('Could not find user ID in token:', decoded);
              // If we can't find a user ID, we should log out
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              setAuth({ isAuthenticated: false, isAdmin: false, user: null, loading: false });
              setAuthToken(null);
              return;
            }
            
            // Update auth state with loading=true while we fetch profile
            setAuth({
              isAuthenticated: true,
              isAdmin: !!decoded.isAdmin,
              user: { id: userId },
              loading: true,
            });
            
            console.log('Fetching user profile for ID:', userId, 'isAdmin:', !!decoded.isAdmin);
            // Get user profile
            const profileData = await fetchUserProfile(userId, !!decoded.isAdmin);
            console.log('Profile fetch complete:', !!profileData ? 'success' : 'failed');
          }
        } catch (err) {
          console.error('Error decoding token:', err);
          // Log the actual token (for dev only - remove in production)
          console.error('Invalid token:', token);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setAuth({ isAuthenticated: false, isAdmin: false, user: null, loading: false });
          setAuthToken(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setAuth({ isAuthenticated: false, isAdmin: false, user: null, loading: false });
        setAuthToken(null);
      }
    };
    
    checkLoggedIn();
  }, []);
  
  // Set auth token in axios headers
  const setAuthToken = token => {
    if (token) {
      console.log('Setting auth token in axios headers');
      // Make sure we're using the exact format the backend expects
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Log it to verify
      console.log('Auth header is now:', axios.defaults.headers.common['Authorization']);
    } else {
      console.log('Removing auth token from axios headers');
      delete axios.defaults.headers.common['Authorization'];
    }
  };
  
  // Fetch user profile
  const fetchUserProfile = async (userId, isAdmin = false) => {
    try {
      console.log(`Fetching profile for user: ${userId}, isAdmin: ${isAdmin}`);
      
      // Log the current auth header to verify it's set correctly
      const currentHeader = axios.defaults.headers.common['Authorization'];
      console.log('Current Authorization header:', currentHeader);
      
      // If no auth header is set, get it from localStorage and set it
      if (!currentHeader) {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Setting missing auth header from localStorage');
          setAuthToken(token);
        } else {
          console.error('No token in localStorage, cannot fetch profile');
          setAuth(prev => ({ ...prev, loading: false }));
          return null;
        }
      }
      
      const endpoint = isAdmin ? `${API_URL}/api/admin/profile` : `${API_URL}/api/users/profile`;
      console.log(`Making request to: ${endpoint}`);
      
      const res = await axios.get(endpoint);
      console.log('Profile API response status:', res.status);
      console.log('Profile data received:', res.data);
      
      setAuth(prev => ({ 
        ...prev, 
        user: res.data,
        loading: false
      }));
      
      return res.data;
    } catch (err) {
      console.error('Error fetching user profile:');
      console.error(err);
      
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        
        // If unauthorized, try to set token again from localStorage
        if (err.response.status === 401) {
          console.log('Unauthorized. Trying to refresh auth token from localStorage');
          const token = localStorage.getItem('token');
          if (token) {
            setAuthToken(token);
            // You could retry the request here, but be careful of infinite loops
          }
        }
      }
      
      setAuth(prev => ({ ...prev, loading: false }));
      return null;
    }
  };
  
  // Login user
  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      console.log('Login response:', res.data);
      
      if (!res.data.token) {
        console.error('No token received in login response');
        return { success: false, message: 'No authentication token received' };
      }
      
      // Store token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Omit refreshToken if it's not in the response
      if (res.data.refreshToken) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
      }
      
      // Set the token in axios headers FIRST
      setAuthToken(res.data.token);
      
      // Then update auth state
      setAuth({
        isAuthenticated: true,
        isAdmin: false,
        user: res.data.user,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };
  
  // Login admin
  const loginAdmin = async (email, password) => {
    try {
      console.log('Attempting admin login with:', { email });
      
      // Change this URL to match your backend route
      const res = await axios.post(`${API_URL}/api/auth/login/admin`, { email, password });
      console.log('Admin login response:', res.data);
      
      if (!res.data.token) {
        console.error('No token received in admin login response');
        return { success: false, message: 'No authentication token received' };
      }
      
      localStorage.setItem('token', res.data.token);
      if (res.data.refreshToken) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
      }
      
      const decoded = jwtDecode(res.data.token);
      console.log('Decoded admin token:', decoded);
      
      // Set the token in axios headers FIRST
      setAuthToken(res.data.token);
      
      // Then update auth state
      setAuth({
        isAuthenticated: true,
        isAdmin: true,
        user: res.data.admin,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Admin login error:', error.response?.data || error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };
  
  // Register user
  const register = async (userData) => {
    try {
      // Format the birthday date for API submission
      const formattedData = {
        ...userData,
        birthday: userData.birthday 
      };
      
      // Remove confirmPassword if it exists
      if (formattedData.confirmPassword) {
        delete formattedData.confirmPassword;
      }
      
      console.log('Sending registration data:', formattedData);
      const res = await axios.post(`${API_URL}/api/auth/register`, formattedData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setAuth({
          isAuthenticated: true,
          isAdmin: false,
          user: res.data.user,
          loading: false
        });
      }
      
      return res.data;
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
        errors: err.response?.data?.errors || null
      };
    }
  };
  
  // Register admin
  const registerAdmin = async (formData) => {
    try {
      console.log('Attempting admin registration:', formData.email);
      const res = await axios.post(`${API_URL}/api/auth/register/admin`, formData);
      
      console.log('Admin registration response:', res.data);
      
      if (res.data.success) {
        return { success: true };
      } else {
        return { 
          success: false, 
          message: res.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Admin registration error:', error.response?.data || error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || null
      };
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setAuth({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      loading: false,
    });
    setAuthToken(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        loginAdmin,
        register,
        registerAdmin,
        logout,
        fetchUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 