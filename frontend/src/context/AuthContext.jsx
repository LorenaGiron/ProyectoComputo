import { createContext, useState, useContext } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") ?? null
  );
  const [usuario, setUsuario] = useState(
    () => JSON.parse(localStorage.getItem("usuario") ?? "null")
  );

  const login = (tokenRecibido, datosUsuario) => {
    localStorage.setItem("token",   tokenRecibido);
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
    setToken(tokenRecibido);
    setUsuario(datosUsuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
  };

  const register = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message ?? "Error al registrarse");
      err.field = data.field ?? null;   
      throw err;
    }

    login(data.token, data.user);
    return data.user;
  };

  const getAuthHeader = () =>
    token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,                   
        login,
        logout,
        register,                   
        getAuthHeader,              
        isAuthenticated: !!token,   
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

export { AuthContext };
