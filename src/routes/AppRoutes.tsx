//src/routes/AppRoutes.tsx
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/layouts/Layouts'
import { ProtectedRoute } from './ProtectedRoutes'
import { AdminRoute } from './AdminRoute'
import { HomePage } from '../pages/HomePage'
import { ProductsPage } from '../pages/ProductsPage'
import { SignInPage } from '../pages/SignInPage'
import { SignUpPage } from '../pages/SignUpPage'
import { CartPage } from '../pages/CartPage'
import { FavoritesPage } from '../pages/FavoritePage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { MyOrdersPage } from '../pages/orders/MyOrdersPage'                    // historial
import { OrderDetailPage } from '../pages/orders/OrderDetailPage'              // detalle
import { OrderConfirmationPage } from '../pages/orders/OrderConfirmationPage'  // confirmación
import { AdminPage } from '../pages/AdminPage'
import { ProductFormPage } from '../pages/admin/ProductFormPage'
import { AdminProductsPage } from '../pages/admin/AdminProductsPage'
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage'
import { AdminLayout } from '../components/layouts/AdminLayout'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'                // detalle de producto

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>                                        {/* Header y Footer */}
        {/* Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protegidas (hay que estar logueado) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/orders/:orderId/confirmation" element={<OrderConfirmationPage />} />
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />         {/* detalle */}
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />          {/* URL inexistente → inicio */}
      </Route>
    </Routes>
  )
}