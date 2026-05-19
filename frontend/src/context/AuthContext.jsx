import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user token/data on load
    try {
      const storedUser = localStorage.getItem('hostelx_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Only restore user if they have a valid token
        if (parsed && parsed.token) {
          setUser(parsed);
        } else {
          // Corrupted/tokenless data — clear it
          localStorage.removeItem('hostelx_user');
        }
      }
    } catch {
      localStorage.removeItem('hostelx_user');
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('hostelx_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hostelx_user');
  };

  const updateProfile = (updatedData) => {
    const newData = { ...user, ...updatedData };
    setUser(newData);
    localStorage.setItem('hostelx_user', JSON.stringify(newData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
