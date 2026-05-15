import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Recepciones from "./pages/Recepciones";
import Usuarios from "./pages/Usuarios";
import Clientes from "./pages/Clientes";
import Productos from './pages/Productos'
import Auditoria from "./pages/Auditoria";
import Proveedores from "./pages/Proveedores";
// import Dashboard from "./pages/Dashboard";

import "./App.css";

const Placeholder = ({ titulo }) => (
  <div
    className="p-10 text-lila"
    style={{ fontFamily: "'Poppins', sans-serif" }}
  >
    <h1 className="text-3xl font-bold text-white">{titulo}</h1>
    <p className="opacity-60">Esta sección está en construcción...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección principal */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Home */}
        <Route path="/home" element={<Home />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route
          path="/Dashboard"
          element={
            <Layout>
              <Placeholder titulo="DASHBOARD" />
            </Layout>
          }
        />

        {/* Productos */}
        <Route
          path="/productos"
          element={
            <Layout>
              <Productos />
            </Layout>
          }
        />

        {/* Recepciones */}
        <Route
          path="/recepciones"
          element={
            <Layout>
              <Recepciones />
            </Layout>
          }
        />

        {/* Clientes */}
        <Route
          path="/clientes"
          element={
            <Layout>
              <Clientes />
            </Layout>
          }
        />

        {/* Proveedores */}
        <Route
          path="/proveedores"
          element={
            <Layout>
              <Proveedores />
            </Layout>
          }
        />

        {/* Usuarios */}
        <Route
          path="/usuarios"
          element={
            <Layout>
              <Usuarios />
            </Layout>
          }
        />

        {/* Auditoría */}
        <Route
          path="/auditoria"
          element={
              <Auditoria />
          }
        />

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;