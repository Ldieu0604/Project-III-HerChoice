// admin-dashboard/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { adminLogin } from '../api/adminApi.js'; // Import login function from adminApi
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores payload info from token (userId, role)
  const [loading, setLoading] = useState(true); // Loading state (checking token)

  useEffect(() => {
    const loadUserFromToken = () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Check if token is still valid and if user has admin role
          // decoded.exp is expiration time (Unix timestamp), multiply by 1000 for milliseconds
          if (decoded.exp * 1000 > Date.now() && decoded.role === 'admin') {
            setUser(decoded); // Assign user info from token
          } else {
            localStorage.removeItem('adminToken'); // Token expired or not admin role
          }
        } catch (error) {
          console.error("Failed to decode token:", error);
          localStorage.removeItem('adminToken'); // Clear token if invalid
        }
      }
      setLoading(false); // Token check completed
    };

    loadUserFromToken();
  }, []); // Run only once when component mounts

  const login = async (email, password) => {
    try {
      const data = await adminLogin(email, password); // Call login API
      const decoded = jwtDecode(data.token);
      setUser(decoded); // Update user state
      return true; // Return true if login successful
    } catch (error) {
      console.error('Login failed in AuthContext:', error);
      throw error; // Throw error so LoginPage component can handle it
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken'); // Clear token from localStorage
    setUser(null); // Clear user info from state
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Ensure useAuth custom hook is exported
export const useAuth = () => {
  return useContext(AuthContext);
};
