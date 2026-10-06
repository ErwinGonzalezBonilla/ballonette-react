import { Routes, Route } from "react-router-dom"

import Cabecera from "./components/inicio/Cabecera"
import Portada from "./components/inicio/Portada"
import GaleriaInicio from "./components/inicio/GaleriaInicio"
import ComoFunciona from "./components/inicio/ComoFunciona"
import ServiciosInicio from "./components/inicio/ServiciosInicio"
import AdicionalesInicio from "./components/inicio/AdicionalesInicio"
import Tamanos from "./components/inicio/Tamanos"
import Nosotros from "./components/inicio/Nosotros"
import Contacto from "./components/inicio/Contacto"
import PanelRedes from "./components/inicio/PanelRedes"
import Pie from "./components/inicio/Pie"

import Galeria from "./pages/Galeria"
import Login from "./pages/Login"
import Admin from "./pages/Admin"
import ProtectedRoute from "./components/ProtectedRoute"
import BalloonBot from "./components/chatbot/BalloonBot"

function Inicio() {
  return (
    <>
      <Cabecera />
      <main>
        <Portada />
        <GaleriaInicio />
        <ComoFunciona />
        <ServiciosInicio />
        <AdicionalesInicio />
        <Tamanos />
        <Nosotros />
        <Contacto />
        <PanelRedes />
      </main>
      <Pie />
    </>
  )
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Inicio />} />

        {/* Galerías por categoría (fotos subidas desde el panel admin) */}
        <Route
          path="/galeria/:categoria"
          element={
            <>
              <Cabecera />
              <main className="contenedor" style={{ padding: "3rem 0 5rem" }}>
                <Galeria />
              </main>
              <Pie />
            </>
          }
        />

        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Balloonbot disponible en toda la web */}
      <BalloonBot />
    </>
  )
}

export default App
