import { createContext, useState, useContext, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const verificarSesion = async () => {

      const tokenGuardado = localStorage.getItem("token");

      if (!tokenGuardado) {
        setLoading(false);
        return;
      }

      try {

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${tokenGuardado}`,
          },
        });

        if (!res.ok) {
          throw new Error("Token inválido");
        }

        const data = await res.json();

        setToken(tokenGuardado);
        setUsuario(data.user);

      } catch (error) {

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        setToken(null);
        setUsuario(null);

      } finally {

        setLoading(false);

      }
    };

    verificarSesion();

  }, []);

  const login = (tokenRecibido, datosUsuario) => {

    localStorage.setItem("token", tokenRecibido);
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

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        login,
        logout,
        loading,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };