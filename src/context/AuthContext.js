import React, { createContext, useContext, useState } from "react";
import { logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    // Clear local session immediately — don't wait for API
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Notify backend in background — don't block UI
    try {
      await Promise.race([
        logoutUser(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 3000)
        ),
      ]);
    } catch {
      // Silently ignore — local session already cleared
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);