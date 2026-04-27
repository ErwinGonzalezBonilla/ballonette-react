import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, getDocs, orderBy, query } from "firebase/firestore"

function Gallery() {
  const [images, setImages] = useState([])
  const [filtro, setFiltro] = useState("todas")
  const [selectedImg, setSelectedImg] = useState(null) // 🔥 MODAL

  useEffect(() => {
    const fetchImages = async () => {
      const q = query(
        collection(db, "imagenes"),
        orderBy("createdAt", "desc")
      )

      const snapshot = await getDocs(q)

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setImages(data)
    }

    fetchImages()
  }, [])

  return (
    <section style={{ padding: "60px 20px" }}>
      
      <h2 style={{
        textAlign: "center",
        marginBottom: "20px",
        fontSize: "2rem"
      }}>
        Galería
      </h2>

      {/* FILTROS */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        {["todas", "bodas", "cumpleanos", "babyshower", "corporativo"].map(cat => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            style={{
              margin: "5px",
              padding: "10px 15px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              background: filtro === cat ? "#000" : "#eee",
              color: filtro === cat ? "#fff" : "#000"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div style={{
        columnCount: window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3,
        columnGap: "15px"
      }}>
        {images
          .filter(img => filtro === "todas" || img.categoria === filtro)
          .map(img => (
            <div
              key={img.id}
              onClick={() => setSelectedImg(img.url)} // 🔥 ABRE MODAL
              style={{
                marginBottom: "15px",
                breakInside: "avoid",
                overflow: "hidden",
                borderRadius: "15px",
                cursor: "pointer"
              }}
            >
              <img
                src={img.url}
                style={{
                  width: "100%",
                  borderRadius: "15px",
                  transition: "transform 0.3s ease"
                }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              />
            </div>
          ))}
      </div>

      {/* 🔥 MODAL */}
      {selectedImg && (
        <div
          onClick={() => setSelectedImg(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <img
            src={selectedImg}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "10px"
            }}
          />
        </div>
      )}

    </section>
  )
}

export default Gallery
