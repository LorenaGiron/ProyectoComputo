import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Recepciones from "./pages/Recepciones";
import "./App.css";

// Páginas placeholder para las demás secciones
const Placeholder = ({ titulo }) => (
  <div
    style={{
      padding: "40px 48px",
      color: "#E7D6FF",
      fontFamily: "'Poppins', sans-serif",
    }}
  >
    <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>
      {titulo}
    </h1>
    <p style={{ opacity: 0.6 }}>Esta sección está en construcción...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Placeholder titulo="DASHBOARD" />
            </Layout>
          }
        />
        <Route
          path="/productos"
          element={
            <Layout>
              <Placeholder titulo="PRODUCTOS" />
            </Layout>
          }
        />
        <Route
          path="/recepciones"
          element={
            <Layout>
              <Recepciones />
            </Layout>
          }
        />
        <Route
          path="/clientes"
          element={
            <Layout>
              <Placeholder titulo="CLIENTES" />
            </Layout>
          }
        />
        <Route
          path="/proveedores"
          element={
            <Layout>
              <Placeholder titulo="PROVEEDORES" />
            </Layout>
          }
        />
        <Route
          path="/usuarios"
          element={
            <Layout>
              <Placeholder titulo="USUARIOS" />
            </Layout>
          }
        />
        <Route
          path="/auditoria"
          element={
            <Layout>
              <Placeholder titulo="AUDITORÍA" />
            </Layout>
          }
        />

        <Route path="*" element={<Navigate to="/recepciones" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
