import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"
import UploadImage from "../components/UploadImage"
import { useEffect, useState } from "react"

function Admin() {

  const navigate = useNavigate()

  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/admin/login")
  }

  // 🔥 FETCH DATA
  useEffect(() => {

    const fetchQuotes = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/quote-requests")
        const data = await res.json()
        setQuotes(data)
      } catch (error) {
        console.error(error)
      }

      setLoading(false)
    }

    fetchQuotes()

  }, [])

  return (
    <section style={{ padding: "120px 20px" }}>

      <h1 style={{ textAlign: "center" }}>Admin Dashboard</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {/* UPLOAD */}
      <UploadImage />

      {/* LEADS */}
      <h2 style={{ marginTop: "50px" }}>Solicitudes</h2>

      {loading && <p>Cargando...</p>}

      <div className="admin-grid">

        {quotes.map((q) => (

          <div key={q.id} className="admin-card">

            <div className="card-header">
              <h3>{q.name}</h3>
              <span className={`status ${q.status}`}>
                {q.status}
              </span>
            </div>

            <p><strong>📞</strong> {q.phone}</p>
            <p><strong>📧</strong> {q.email}</p>
            <p><strong>🎉</strong> {q.event_type}</p>
            <p><strong>🛠️</strong> {q.service_type}</p>
            <p><strong>👥</strong> {q.guest_count}</p>
            <p><strong>💰</strong> {q.budget}</p>

            <p className="date">
              {q.created_at
                ? new Date(q.created_at).toLocaleDateString()
                : ""}
            </p>

          </div>

        ))}

      </div>

    </section>
  )
}

export default Admin