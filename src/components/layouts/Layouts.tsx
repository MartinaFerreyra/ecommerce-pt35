//src/components/layouts/Layout.tsx
import { Outlet } from 'react-router-dom'                 // el "hueco" donde va cada página
import { Header } from '../common/Header'                 // arriba
import { Footer } from '../common/Footer'                 // abajo

export function Layout() {                                // esqueleto común de todas las páginas
  return (
    <>
      <Header />
      <main className="contenido-principal">
        <Outlet />                                        {/* acá aparece la página de la URL actual */}
      </main>
      <Footer />
    </>
  )
}