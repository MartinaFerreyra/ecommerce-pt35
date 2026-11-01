//src/pages/ProductsPage.tsx
import { ProductFilters } from '../components/common/products/ProductFilters'
import { ProductList } from '../components/common/products/ProductList'

export function ProductsPage() {
  return (
    <section>
      <h2>Colección Bisutería Premium</h2>
      <ProductFilters />
      <ProductList />
    </section>
  )
}