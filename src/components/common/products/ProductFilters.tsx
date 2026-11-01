//src/components/common/products/ProductFilters.tsx
import './ProductFilters.css'                                             // estilos del panel
import { useEffect, useState } from 'react'                               // estado local y efecto
import { useProducts } from '../../../contexts/products/useProducts'      // filtros del contexto
import type { CategoryFilter } from '../../../types/Product'              // tipo de categoría

export function ProductFilters() {                                        // el panel de filtros
  const {
    selectedCategory, setSelectedCategory,                                // categoría
    searchTerm, setSearchTerm,                                            // búsqueda
    pageSize, setPageSize,                                                // joyas por página
    clearFilters,                                                         // limpiar
  } = useProducts()

  const [texto, setTexto] = useState(searchTerm)                          // lo que se va escribiendo

  useEffect(() => {                                                       // espera a que dejes de escribir...
    const timer = setTimeout(() => setSearchTerm(texto.trim()), 400)      // ...400 ms, y recién ahí busca
    return () => clearTimeout(timer)                                      // si seguís escribiendo, reinicia la espera
  }, [texto, setSearchTerm])

  const handleClear = () => {                                             // botón "Limpiar filtros"
    setTexto('')                                                          // borra el cuadro de texto
    clearFilters()                                                        // vuelve todo a como estaba
  }

  return (
    <div className="filtros-panel">                                       {/* el recuadro */}
      <div className="filtros-fila">                                      {/* los 4 controles en fila */}
        <label className="filtro-campo">
          <span>Buscar joyas</span>
          <input
            type="text"
            placeholder="Nombre de la joya..."
            value={texto}                                                 // lo que escribiste
            onChange={(e) => setTexto(e.target.value)}                    // se actualiza al escribir
          />
        </label>

        <label className="filtro-campo">
          <span>Categoría</span>
          <select
            value={selectedCategory}                                      // la categoría elegida
            onChange={(e) => setSelectedCategory(e.target.value as CategoryFilter)} // la cambia en el contexto
          >
            <option value="todas">Todas las categorías</option>
            <option value="collares">Collares</option>
            <option value="pulseras">Pulseras</option>
            <option value="anillos">Anillos</option>
          </select>
        </label>

        <label className="filtro-campo">
          <span>Joyas por página</span>
          <select
            value={pageSize}                                              // tamaño elegido
            onChange={(e) => setPageSize(Number(e.target.value))}         // convierte el texto a número
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={10}>10</option>
          </select>
        </label>

        <button className="filtros-limpiar" onClick={handleClear}>Limpiar filtros</button>
      </div>

     
    </div>
  )
}