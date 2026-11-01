//src/pages/SignInPage.tsx
import './AuthPages.css'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth/useAuth'
import { getAuthErrorMessage } from '../services/authService'

export function SignInPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { from?: string } | null)?.from ?? '/products' // a dónde iba antes

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const ingresar = async (accion: () => Promise<void>) => {  // misma lógica para email y Google
    setError(null)
    setEnviando(true)
    try {
      await accion()
      navigate(destino, { replace: true })                    // lo lleva a donde quería ir
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setEnviando(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()                                        // evita que recargue la página
    ingresar(() => login(email, password))
  }

  return (
    <section className="auth-card">
      <h2>🔑 Ingresar</h2>
      <form onSubmit={handleSubmit}>
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-btn" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <button className="auth-google" onClick={() => ingresar(loginWithGoogle)} disabled={enviando}>
        Ingresar con Google
      </button>
      <p>¿No tenés cuenta? <Link to="/signup">Registrarse</Link></p>
    </section>
  )
}