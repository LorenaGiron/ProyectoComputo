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
import Dashboard from "./pages/Dashboard";
import Tienda from "./pages/Tienda";
import ProtectedRoute from "./components/ProtectedRoute";

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
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        {/* Productos */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute requiredPage="productos">
              <Layout>
                <Productos />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Recepciones */}
        <Route
          path="/recepciones"
          element={
            <ProtectedRoute requiredPage="recepciones">
              <Layout>
                <Recepciones />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Clientes */}
        <Route
          path="/clientes"
          element={
            <ProtectedRoute requiredPage="clientes">
              <Layout>
                <Clientes />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Proveedores */}
        <Route
          path="/proveedores"
          element={
            <ProtectedRoute requiredPage="proveedores">
              <Layout>
                <Proveedores />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Usuarios */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute requiredPage="usuarios">
              <Layout>
                <Usuarios />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Auditoría */}
        <Route
          path="/auditoria"
          element={
            <ProtectedRoute requiredPage="auditoria">
              <Layout>
                <Auditoria />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Tienda (para clientes) */}
        <Route
          path="/tienda"
          element={
            //<ProtectedRoute requiredPage="tienda">
              <Tienda />
            //</ProtectedRoute>
          }
        />

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;