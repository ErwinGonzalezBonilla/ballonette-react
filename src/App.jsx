import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Servicios from "./components/Servicios"
import Adicionales from "./components/Adicionales"
import About from "./components/About"
import Footer from "./components/Footer"
import Pasos from "./components/Pasos"
import BalloonCTA from "./components/BalloonCTA"
import Galeria from "./pages/Galeria"
import Destacadas from "./components/Destacadas"
import Login from "./pages/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import Admin from "./pages/Admin"
import BalloonBot from "./components/chatbot/BalloonBot"

// "slug" es el nombre de la categoría en la galería (/galeria/slug)
const servicios = [
  {
    slug: "cumpleanos",
    titulo: "Cumpleaños",
    descripcion: "Arcos, columnas y fondos de globos para celebrar a lo grande.",
    imagen: "/assets/images/servicios/cumpleanos.webp",
    alt: "Arco de globos plateados y negros con cartel luminoso de Happy Birthday",
  },
  {
    slug: "babyshower",
    titulo: "Baby shower",
    descripcion: "Decoraciones tiernas y personalizadas para dar la bienvenida.",
    imagen: "/assets/images/servicios/babyshower.webp",
    alt: "Decoración de baby shower con globos azules y blancos y un osito",
  },
  {
    slug: "bodas",
    titulo: "Bodas",
    descripcion: "Composiciones elegantes de globos y flores para vuestro gran día.",
    imagen: "/assets/images/servicios/bodas.webp",
    alt: "Arco de globos en tonos tierra con flores para una boda",
  },
  {
    slug: "corporativo",
    titulo: "Eventos de empresa",
    descripcion: "Decoración con la imagen de tu marca para inauguraciones y fiestas.",
    imagen: "/assets/images/servicios/corporativo.webp",
    alt: "Columna de globos rojos y beige en una terraza con piscina",
    posicion: "center 40%",
  },
]

const adicionales = [
  {
    slug: "flores",
    titulo: "Flores y detalles",
    descripcion:
      "Ramos, cajas de rosas y composiciones florales boutique, también para regalar.",
    imagen: "/assets/images/servicios/flores.webp",
    alt: "Caja de rosas rosadas con bombones",
  },
  {
    slug: "catering",
    titulo: "Catering decorativo",
    descripcion:
      "Mesas de picoteo y dulces montadas con el mismo estilo que tu decoración.",
    imagen: "/assets/images/servicios/catering.webp",
    alt: "Mesa de catering con embutidos, canapés y decoración roja",
  },
]

function App() {
  return (
    <>
      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Hero />
              <Destacadas />
              <Servicios
                titulo="Servicios"
                subtitulo="Diseñamos cada decoración a medida. Elige tu tipo de evento y mira trabajos reales."
                data={servicios}
                id="servicios"
              />
              <Pasos />
              <Adicionales data={adicionales} />
              <About />
              <BalloonCTA />
              <Footer />
            </>
          }
        />

        {/* GALERIA */}
        <Route
          path="/galeria/:categoria"
          element={
            <>
              <Navbar />
              <Galeria />
              <Footer />
            </>
          }
        />

        {/* LOGIN */}
        <Route path="/admin/login" element={<Login />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* CHATBOT GLOBAL */}
      <BalloonBot />
    </>
  )
}

export default App
