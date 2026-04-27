import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

function Galeria() {
  const [imagenes, setImagenes] = useState([])
  const [indexActivo, setIndexActivo] = useState(null)
  const [zoom, setZoom] = useState(1)
  const { categoria } = useParams()

  // 🔥 CARGAR IMÁGENES
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("imagenes")) || []

    const filtradas = data.filter(
      (img) => img.categoria === categoria
    )
// eslint-disable-next-line
    setImagenes(filtradas)
  }, [categoria])

  // 🔥 TECLADO (SIN ERRORES)
  useEffect(() => {
    const handleKey = (e) => {
      if (indexActivo === null) return

      if (e.key === "Escape") {
        setIndexActivo(null)
      }

      if (e.key === "ArrowRight") {
        setZoom(1)
        setIndexActivo((prev) =>
          prev === imagenes.length - 1 ? 0 : prev + 1
        )
      }

      if (e.key === "ArrowLeft") {
        setZoom(1)
        setIndexActivo((prev) =>
          prev === 0 ? imagenes.length - 1 : prev - 1
        )
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [indexActivo, imagenes])

  return (
    <div style={{ padding: "60px 20px" }}>
      <h1 style={{ marginBottom: "20px", textTransform: "capitalize" }}>
        Galería: {categoria}
      </h1>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "15px",
        }}
      >
        {imagenes.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt=""
            onClick={() => {
              setIndexActivo(i)
              setZoom(1)
            }}
            style={{
              width: "100%",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "0.3s",
            }}
          />
        ))}
      </div>

      {/* 🔥 MODAL */}
      {indexActivo !== null && (
        <div
          onClick={() => setIndexActivo(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            animation: "fadeIn 0.3s ease",
          }}
        >
          {/* CERRAR */}
          <span
            onClick={() => setIndexActivo(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              fontSize: "30px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ✕
          </span>

          {/* IZQUIERDA */}
          <span
            onClick={(e) => {
              e.stopPropagation()
              setZoom(1)
              setIndexActivo((prev) =>
                prev === 0 ? imagenes.length - 1 : prev - 1
              )
            }}
            style={{
              position: "absolute",
              left: "20px",
              fontSize: "40px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ‹
          </span>

          {/* IMAGEN */}
          <img
            src={imagenes[indexActivo].url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              e.deltaY < 0
                ? setZoom((z) => Math.min(z + 0.2, 3))
                : setZoom((z) => Math.max(z - 0.2, 1))
            }}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "12px",
              transform: `scale(${zoom})`,
              transition: "transform 0.2s ease",
            }}
          />

          {/* DERECHA */}
          <span
            onClick={(e) => {
              e.stopPropagation()
              setZoom(1)
              setIndexActivo((prev) =>
                prev === imagenes.length - 1 ? 0 : prev + 1
              )
            }}
            style={{
              position: "absolute",
              right: "20px",
              fontSize: "40px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ›
          </span>
        </div>
      )}

      {/* ANIMACIÓN */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
          }
        `}
      </style>
    </div>
  )
}

export default Galeria