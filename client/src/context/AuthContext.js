import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userType, setUserType] = useState(localStorage.getItem('userType'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const login = async (phoneNumber, password, type = 'admin') => {
    try {
      const endpoint = type === 'superAdmin' 
        ? '/super-admin/login' 
        : '/auth/login';
      
      const response = await axios.post(`${API_URL}${endpoint}`, 
        type === 'superAdmin' 
          ? { username: phoneNumber, password }
          : { phoneNumber, password }
      );
      
      const { token: newToken, admin, superAdmin } = response.data;
      
      setToken(newToken);
      setUser(admin || superAdmin);
      setUserType(type);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('userType', type);
      localStorage.setItem('user', JSON.stringify(admin || superAdmin));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUserType(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const isSuperAdmin = () => {
    return userType === 'superAdmin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        userType,
        login,
        logout,
        isAuthenticated,
        isSuperAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

