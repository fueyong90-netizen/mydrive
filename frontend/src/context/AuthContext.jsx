import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier le token au chargement
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (err) {
        console.error("Erreur parsing user data:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      
      // ✅ Stocker le token
      localStorage.setItem("token", res.data.token);
      
      // ✅ Stocker les infos utilisateur
      const userData = {
        id: res.data.user.id,
        email: res.data.user.email,
        username: res.data.user.username,
      };
      
      localStorage.setItem("user", JSON.stringify(userData));
      setCurrentUser(userData);

      return { success: true };
    } catch (err) {
      console.error("Erreur de connexion:", err);
      // Nettoyer en cas d'erreur
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("welcomed"); // Reset le message de bienvenue
    setCurrentUser(null);
  };

  const register = async (username, email, password) => {
    try {
      const res = await api.post("/auth/register", { username, email, password });
      
      // ✅ IMPORTANT : Afficher le message de bienvenue
      console.log("✅ Inscription réussie:", res.data.message);
      
      return { 
        success: true,
        message: res.data.message || "Bienvenue dans le monde du hacker PFJ !"
      };
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
