import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    
    if (!isLoggedIn) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/users/current-user');
      setUser(response.data?.data?.user || null);
    } catch (error) {
      setUser(null);
      localStorage.removeItem("isLoggedIn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem("isLoggedIn");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (data) => {
    try {
      const response = await api.post('/users/login', data);
      setUser(response.data?.data?.user);
      localStorage.setItem("isLoggedIn", "true");
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
      setUser(null);
      localStorage.removeItem("isLoggedIn");
      toast.success('Logged out successfully');
    } catch (error) {
      setUser(null);
      localStorage.removeItem("isLoggedIn");
      toast.error('Logged out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
