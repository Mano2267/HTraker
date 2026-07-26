import { createContext, useContext, useState } from "react";
import client from "../api/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("hia_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const { data } = await client.post("/auth/login", { email, password });
    localStorage.setItem("hia_token", data.token);
    localStorage.setItem("hia_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const signup = async (email, password, name) => {
    const { data } = await client.post("/auth/signup", { email, password, name });
    localStorage.setItem("hia_token", data.token);
    localStorage.setItem("hia_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("hia_token");
    localStorage.removeItem("hia_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
