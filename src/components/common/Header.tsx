//src/components/common/Header.tsx
import './Header.css'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth/useAuth'
import { useCart } from '../../contexts/cart/useCart'
import { useFavorites } from '../../contexts/favorites/useFavorites'
import { CategoryBar } from './products/CategoryBar'

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()           // sesión + ¿es admin?
  const { itemCount } = useCart()                                        // joyas en el carrito
  const { favoritesCount } = useFavorites()                              // favoritas
  const navigate = useNavigate()
  const { pathname } = useLocation()                                     // URL actual

  const handleLogout = async () => {                                     // botón Salir
    await logout()
    navigate('/')
  }

  return (
    <>
      <header className="header">
        <div className="header-top">
          <Link to="/" className="logo"><h1>M Lady</h1></Link>
          <div className="header-iconos">
            <Link to="/favorites" className="icono">♥ {favoritesCount}</Link>
            <Link to="/cart" className="icono">🛒 {itemCount}</Link>
          </div>
        </div>

        <nav className="header-nav">
          <div className="nav-izquierda">
            <NavLink to="/" end>Inicio</NavLink>
            <NavLink to="/products">Productos</NavLink>
            <NavLink to="/cart">Carrito</NavLink>
            <NavLink to="/favorites">Favoritos</NavLink>
            <NavLink to="/checkout">Pago</NavLink>
            {isAuthenticated && !isAdmin && (                            // solo CLIENTES logueados
              <NavLink to="/orders">Mis pedidos</NavLink>
            )}
            <NavLink to="/admin">Admin</NavLink>                         {/* el guardia controla quién entra */}
          </div>

          <div className="nav-derecha">
            {isAuthenticated ? (
              <>
                <span className="saludo">Hola, {user?.name}</span>
                <button className="nav-boton" onClick={handleLogout}>Salir</button>
              </>
            ) : (
              <>
                <NavLink to="/signin">Ingresar</NavLink>
                <NavLink to="/signup">Registrarse</NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      {pathname === '/products' && <CategoryBar />}                      {/* categorías solo en Productos */}
    </>
  )
}