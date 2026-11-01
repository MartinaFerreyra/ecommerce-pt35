//src/components/layouts/AdminLayout.tsx
import './AdminLayout.css'                                  // estilos del panel
import { NavLink, Outlet } from 'react-router-dom'          // links y el "hueco" de la página

export function AdminLayout() {                             // marco común de todas las páginas /admin/*
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">                     {/* menú lateral */}
        <h3>⚙️ Panel admin</h3>
        <nav>
          <NavLink to="/admin" end>Resumen</NavLink>                    {/* end: activo solo en /admin exacto */}
          <NavLink to="/admin/products" end>Productos</NavLink>         {/* tabla de productos */}
          <NavLink to="/admin/products/new">+ Nuevo producto</NavLink>  {/* formulario (Parte 2) */}
          <NavLink to="/admin/orders">Pedidos</NavLink>                 {/* 🆕 tabla de pedidos */}
          <NavLink to="/admin/users">Usuarios</NavLink>
        </nav>
      </aside>

      <section className="admin-contenido">
        <Outlet />                                          {/* acá aparece la página de admin actual */}
      </section>
    </div>
  )
}