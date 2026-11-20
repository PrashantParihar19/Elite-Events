import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // To this (This is the "Elite" way):
const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('eliteUser');
    return savedUser ? JSON.parse(savedUser) : null;
});

  // When the app starts, check if a user is already "Remembered"
  useEffect(() => {
    const savedUser = localStorage.getItem('eliteUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('eliteUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eliteUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};