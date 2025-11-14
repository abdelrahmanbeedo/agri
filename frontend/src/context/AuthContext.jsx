import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("agri_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("agri_token") || null;
  });

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);

    localStorage.setItem("agri_user", JSON.stringify(userData));
    localStorage.setItem("agri_token", jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("agri_user");
    localStorage.removeItem("agri_token");
  };

  const isLoggedIn = !!token;

  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
  axios.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
