import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Recepciones from "./pages/Recepciones";
import "./App.css";

const Placeholder = ({ titulo }) => (
  <div
    className="p-10 text-[#E7D6FF]"
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
