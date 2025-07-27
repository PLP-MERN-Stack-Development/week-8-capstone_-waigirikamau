import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  role: 'farmer' | 'buyer';
  isVerified: boolean;
  hasProfile: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'farmer' | 'buyer') => Promise<void>;
  logout: () => void;
  updateProfile: (hasProfile: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

axios.defaults.baseURL = 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Scoped interceptor - ensures it’s only active within the provider
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const register = async (email: string, password: string, role: 'farmer' | 'buyer') => {
    try {
      const res = await axios.post('/auth/register', { email, password, role });
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = (hasProfile: boolean) => {
    if (user) {
      setUser({ ...user, hasProfile });
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      loading,
      updateProfile,
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
