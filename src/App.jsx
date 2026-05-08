import { Routes, Route } from "react-router-dom"
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Servicios from './components/Servicios'
import About from './components/About'
import Footer from './components/Footer'
import Pasos from './components/Pasos'
import QuoteForm from './components/QuoteForm'
import Galeria from './pages/Galeria'
import Carousel from './components/Carousel'
import Login from "./pages/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import Admin from "./pages/Admin"


function App() {

  const servicios = [
    { titulo: "babyshower", imagen: "/assets/images/babyshower.png" },
    { titulo: "cumpleanos", imagen: "/assets/images/cumpleanos.png" },
    { titulo: "bodas", imagen: "/assets/images/bodas.png" },
    { titulo: "corporativo", imagen: "/assets/images/corporativo.png" },
  ]

  const adicionales = [
    { titulo: "flores", imagen: "/assets/images/flores.png" },
    { titulo: "catering", imagen: "/assets/images/catering.png" },
  ]

  return (
    <Routes>

      {/* HOME */}
      <Route path="/" element={
        <>
          <Navbar />
          <Hero />
          <Carousel />

          <Servicios 
            titulo="Servicios" 
            data={servicios} 
            id="servicios"
          />

          <Pasos />

          <Servicios 
            titulo="Servicios adicionales" 
            data={adicionales} 
            id="adicionales"
          />

          <About />
          <QuoteForm />
          <Footer />
        </>
      } />

      {/* 🔥 GALERIA DINÁMICA */}
      <Route path="/galeria/:categoria" element={
        <>
          <Navbar />
          <Galeria />
          <Footer />
        </>
      } />

      {/* LOGIN */}
      <Route path="/admin/login" element={<Login />} />

      {/* ADMIN PROTEGIDO */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } 
      />

    </Routes>
  )
}

export default App