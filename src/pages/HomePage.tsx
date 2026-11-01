//src/pages/HomePage.tsx
import './AuthPages.css'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="auth-card home-card">
      <h2>✨ Bienvenida a M Lady</h2>
      <p>Bisutería premium: collares, pulseras y anillos.</p>
      <Link to="/products" className="auth-btn">Ver la colección</Link>
    </section>
  )
}