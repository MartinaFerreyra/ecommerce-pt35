//src/pages/SignUpPage.tsx
import './AuthPages.css'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth/useAuth'
import { getAuthErrorMessage } from '../services/authService'

export function SignUpPage() {
  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const registrar = async (accion: () => Promise<void>) => {
    setError(null)
    setEnviando(true)
    try {
      await accion()
      navigate('/products', { replace: true })                // al terminar, a la colección
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setEnviando(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    registrar(() => signup(name, email, password))
  }

  return (
    <section className="auth-card">
      <h2>📝 Registrarse</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>Contraseña (mínimo 6 caracteres)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-btn" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </form>
      <button className="auth-google" onClick={() => registrar(loginWithGoogle)} disabled={enviando}>
        Registrarse con Google
      </button>
      <p>¿Ya tenés cuenta? <Link to="/signin">Ingresar</Link></p>
    </section>
  )
}