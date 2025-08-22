import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { login as apiLogin, register as apiRegister, getProfile } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    Cookies.set('jwt', data.access_token);
    setUser(data.user);
  };

  const register = async (info) => {
    const data = await apiRegister(info);
    Cookies.set('jwt', data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    Cookies.remove('jwt');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
