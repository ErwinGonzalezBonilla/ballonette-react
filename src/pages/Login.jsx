import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"
import { useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/admin")
    } catch (error) {
  console.log(error)
  setError("Credenciales incorrectas")
}
  }

  return (
    <section style={{ padding: "120px 20px", textAlign: "center" }}>
      
      <h1>Admin Login</h1>

      <form onSubmit={handleLogin} style={{ maxWidth: "400px", margin: "auto" }}>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />

        <button type="submit" className="btn-cta">
          Entrar
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

      </form>

    </section>
  )
}

export default Login