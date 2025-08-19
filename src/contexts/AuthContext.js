import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get("auth_token");
      if (!token) {
        return;
      }

      try {
        const profile = await authAPI.getProfile();
        const currentUser = profile.user || profile;
        Cookies.set("user_data", JSON.stringify(currentUser), { expires: 1 });
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        logout();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      const { access_token } = response;

      Cookies.set("auth_token", access_token, { expires: 1 }); // 1 day

      const profile = await authAPI.getProfile();
      const userData = profile.user || profile;
      Cookies.set("user_data", JSON.stringify(userData), { expires: 1 });

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, name, password) => {
    try {
      setLoading(true);
      const response = await authAPI.register(email, name, password);
      const { access_token } = response;

      Cookies.set("auth_token", access_token, { expires: 1 });

      const profile = await authAPI.getProfile();
      const userData = profile.user || profile;
      Cookies.set("user_data", JSON.stringify(userData), { expires: 1 });

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(data);
      const { user: updatedUser } = response;
      Cookies.set("user_data", JSON.stringify(updatedUser), { expires: 1 });
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Update profile failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Update failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("user_data");
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
