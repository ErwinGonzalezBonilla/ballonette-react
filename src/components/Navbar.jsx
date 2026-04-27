import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import logo from '../assets/logo.png'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const goToSection = (id) => {
    navigate("/")

    const interval = setInterval(() => {
      const section = document.getElementById(id)

      if (section) {
        section.scrollIntoView({ behavior: "smooth" })
        clearInterval(interval)
      }
    }, 100)

    setMenuOpen(false)
  }

  const goHomeTop = () => {
    navigate("/")

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 200)

    setMenuOpen(false)
  }

  return (
    <header className="navbar">

      <div className="logo" onClick={goHomeTop} style={{ cursor: "pointer" }}>
        <img src={logo} alt="Ballonette Logo" />
      </div>

      <div className="burger" onClick={() => setMenuOpen(!menuOpen)}>
        <i className="bi bi-list"></i>
      </div>

      <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
        
        <ul className="nav-links">

          <li>
            <span onClick={() => goToSection("servicios")}>
              Servicios
            </span>
          </li>

          <li>
            <span onClick={() => goToSection("adicionales")}>
              Adicionales
            </span>
          </li>

          <li>
            <span onClick={() => goToSection("about")}>
              About us
            </span>
          </li>

        </ul>

        <div className="social-icons">
          <a href="https://www.instagram.com/ballonette_eventos" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-instagram"></i>
          </a>

          <a href="#">
            <i className="bi bi-tiktok"></i>
          </a>
        </div>

      </nav>

    </header>
  )
}

export default Navbar