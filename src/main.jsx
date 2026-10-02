import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/styles.css'
import { BrowserRouter } from 'react-router-dom'
import ScrollToTop from "./components/ScrollToTop"
import AccesoEquipo from "./components/AccesoEquipo"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AccesoEquipo>
        <ScrollToTop />
        <App />
      </AccesoEquipo>
    </BrowserRouter>
  </React.StrictMode>
)