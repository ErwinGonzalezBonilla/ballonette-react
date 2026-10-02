import { useEffect, useState } from "react"
import { MODO_CONSTRUCCION } from "../config/sitio"
import { HASH_CLAVE } from "../config/clave"
import EnConstruccion from "./EnConstruccion"

const LLAVE = "ballonette_acceso_equipo"

async function huella(texto) {
  const datos = new TextEncoder().encode(texto)
  const resultado = await crypto.subtle.digest("SHA-256", datos)
  return Array.from(new Uint8Array(resultado))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function leerAcceso() {
  try {
    return localStorage.getItem(LLAVE) === HASH_CLAVE
  } catch {
    return false
  }
}

// Muestra "En construcción" al público y la web completa al equipo (con clave).
function AccesoEquipo({ children }) {
  const [dentro, setDentro] = useState(leerAcceso)

  // Mientras está en construcción, pedimos a Google que no la indexe todavía
  useEffect(() => {
    if (!MODO_CONSTRUCCION) return
    const meta = document.createElement("meta")
    meta.name = "robots"
    meta.content = "noindex"
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  if (!MODO_CONSTRUCCION) return children

  const entrar = async (clave) => {
    const ok = HASH_CLAVE !== "sin-configurar" && (await huella(clave)) === HASH_CLAVE
    if (ok) {
      try {
        localStorage.setItem(LLAVE, HASH_CLAVE)
      } catch {
        /* sin almacenamiento: la sesión dura hasta recargar */
      }
      setDentro(true)
    }
    return ok
  }

  const salir = () => {
    try {
      localStorage.removeItem(LLAVE)
    } catch {
      /* nada */
    }
    setDentro(false)
  }

  if (!dentro) return <EnConstruccion onEntrar={entrar} />

  return (
    <>
      {children}
      <div className="vista-previa">
        <span>👀 Vista previa del equipo</span>
        <button type="button" onClick={salir}>Salir</button>
      </div>
    </>
  )
}

export default AccesoEquipo
