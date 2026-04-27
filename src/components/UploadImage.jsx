import { useState, useEffect } from "react"

function UploadImage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [imagenes, setImagenes] = useState([])
  const [categoria, setCategoria] = useState("bodas")

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("imagenes")) || []
    // eslint-disable-next-line
    setImagenes(data)
  }, [])

  const handleUpload = async () => {
    if (!file) return alert("Selecciona una imagen")

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "upload_ballonette")

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/drbtpcsdq/image/upload",
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await res.json()

      const nuevaImagen = {
        url: data.secure_url,
        categoria: categoria,
      }

      setImagenes((prev) => {
        const nuevas = [...prev, nuevaImagen]
        localStorage.setItem("imagenes", JSON.stringify(nuevas))
        return nuevas
      })

      setFile(null)
      alert("Imagen subida ✅")

    } catch (error) {
      console.error(error)
      alert("Error al subir")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: "40px" }}>
      <h2>Subir imagen</h2>

      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      >
        <option value="bodas">Bodas</option>
        <option value="cumpleanos">Cumpleaños</option>
        <option value="babyshower">Baby Shower</option>
        <option value="corporativo">Corporativo</option>
      </select>

      <br /><br />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Subiendo..." : "Subir imagen"}
      </button>

      <div style={{ marginTop: "20px" }}>
        {imagenes.map((img, i) => (
          <div key={i}>
            <img src={img.url} width="120" alt="" />
            <p>{img.categoria}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UploadImage