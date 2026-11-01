//src/components/common/products/CategoryBar.tsx
import './CategoryBar.css'                                              // estilos de los botones
import { useProducts } from '../../../contexts/products/useProducts'    // la categoría elegida y cómo cambiarla
import type { CategoryFilter } from '../../../types/Product'            // tipo de filtro

const categorias: { valor: CategoryFilter; texto: string }[] = [        // los botones que se muestran
  { valor: 'todas', texto: 'Todas' },
  { valor: 'collares', texto: 'Collares' },
  { valor: 'pulseras', texto: 'Pulseras' },
  { valor: 'anillos', texto: 'Anillos' },
]

export function CategoryBar() {                                         // la barra de categorías
  const { selectedCategory, setSelectedCategory } = useProducts()       // lee y cambia la categoría (sin props)

  return (
    <div className="category-bar">                                     {/* la barra */}
      {categorias.map((c) => (                                          // por cada categoría, un botón
        <button
          key={c.valor}
          className={selectedCategory === c.valor ? 'category-btn activo' : 'category-btn'} // el elegido se marca
          onClick={() => setSelectedCategory(c.valor)}                  // al tocar, cambia la categoría
        >
          {c.texto}
        </button>
      ))}
    </div>
  )
}