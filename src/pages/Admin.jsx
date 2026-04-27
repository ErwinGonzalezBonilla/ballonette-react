import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"
import UploadImage from "../components/UploadImage"

function Admin() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/admin/login")
  }

  return (
    <section style={{ padding: "120px 20px", textAlign: "center" }}>
      <h1>Panel Admin</h1>

      <button onClick={handleLogout}>
        Cerrar sesión
      </button>

      <UploadImage />
    </section>
  )
}

export default Admin