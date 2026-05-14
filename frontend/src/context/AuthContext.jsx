import { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") ?? null  // persiste al recargar
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

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
