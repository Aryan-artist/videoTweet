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
    const token = localStorage.getItem("accessToken");
    
    if (!isLoggedIn && !token) {
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
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (data) => {
    try {
      const response = await api.post('/users/login', data);
      const userData = response.data?.data?.user;
      const accessToken = response.data?.data?.accessToken;
      const refreshToken = response.data?.data?.refreshToken;

      setUser(userData);
      localStorage.setItem("isLoggedIn", "true");
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

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
    } catch (error) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
