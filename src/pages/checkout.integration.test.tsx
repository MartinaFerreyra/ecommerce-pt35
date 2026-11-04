// src/pages/checkout.integration.test.tsx
// INTEGRACIÓN: flujo completo de usuario → agrega una joya al carrito → checkout → orden creada.
// Firestore está MOCKEADO: createOrder no llega a Firebase.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { ProductCard } from '../components/common/products/ProductCard'  // tarjeta REAL
import { CheckoutPage } from './CheckoutPage'                           // checkout REAL
import { createOrder } from '../services/ordersService'                 // (mockeado abajo)
import { renderWithProviders } from '../test/renderWithProviders'       // wrapper de providers
import { clienta, collar } from '../test/fixtures'

vi.mock('../services/ordersService', () => ({ createOrder: vi.fn() }))  // Firestore falso

function PantallaDePrueba() {                                           // tienda + checkout en la misma pantalla
  return (
    <Routes>
      <Route path="/" element={<><ProductCard product={collar} /><CheckoutPage /></>} />
      <Route path="/orders/:orderId/confirmation" element={<p>Confirmación OK</p>} />
    </Routes>
  )
}

describe('Flujo: agregar al carrito → checkout', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('con el carrito vacío muestra el mensaje', () => {
    renderWithProviders(<CheckoutPage />, { user: clienta })
    expect(screen.getByText('Tu carrito está vacío')).toBeTruthy()
  })

  it('agrega 2 collares, completa la entrega y crea la orden', async () => {
    vi.mocked(createOrder).mockResolvedValue('orden-123')
    renderWithProviders(<PantallaDePrueba />, { user: clienta })

    const agregar = screen.getByRole('button', { name: 'Añadir al carrito' })
    fireEvent.click(agregar)                                            // 1 collar
    fireEvent.click(agregar)                                            // 2 collares

    fireEvent.change(screen.getByPlaceholderText('Ej: Las Heras, Mendoza'), {
      target: { value: 'Las Heras' },                                   // localidad
    })
    fireEvent.click(screen.getByRole('button', { name: /confirmar compra/i }))

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1))
    const orden = vi.mocked(createOrder).mock.calls[0][0]               // lo que se mandó a Firestore
    expect(orden.userId).toBe('uid-ana')
    expect(orden.items[0]).toMatchObject({ productId: 'p1', quantity: 2, price: 1000, subtotal: 2000 }) // snapshot
    expect(orden.subtotal).toBe(2000)
    expect(orden.shipping).toMatchObject({ method: 'delivery', locality: 'Las Heras', cost: 3500 })
    expect(orden.total).toBe(5500)                                      // 2000 + envío 3500

    expect(await screen.findByText('Confirmación OK')).toBeTruthy()     // navegó a la confirmación
  })

  it('no deja confirmar sin localidad (validación)', () => {
    renderWithProviders(<PantallaDePrueba />, { user: clienta })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carrito' }))
    fireEvent.click(screen.getByRole('button', { name: /confirmar compra/i }))
    expect(screen.getByText('Ingresá tu localidad.')).toBeTruthy()
    expect(createOrder).not.toHaveBeenCalled()
  })

  it('doble click en Confirmar crea UNA sola orden (edge)', async () => {
    vi.mocked(createOrder).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('orden-1'), 20)), // tarda un poco
    )
    renderWithProviders(<PantallaDePrueba />, { user: clienta })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carrito' }))
    fireEvent.change(screen.getByPlaceholderText('Ej: Las Heras, Mendoza'), { target: { value: 'Godoy Cruz' } })

    const confirmar = screen.getByRole('button', { name: /confirmar compra/i })
    fireEvent.click(confirmar)                                          // click 1
    fireEvent.click(confirmar)                                          // click 2 (enseguida)

    expect(await screen.findByText('Confirmación OK')).toBeTruthy()
    expect(createOrder).toHaveBeenCalledTimes(1)                        // el candado useRef funcionó
  })

  it('si Firestore falla, muestra un error y deja reintentar', async () => {
    vi.mocked(createOrder).mockRejectedValue(new Error('permission-denied'))
    const silenciar = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderWithProviders(<PantallaDePrueba />, { user: clienta })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carrito' }))
    fireEvent.change(screen.getByPlaceholderText('Ej: Las Heras, Mendoza'), { target: { value: 'Maipú' } })
    fireEvent.click(screen.getByRole('button', { name: /confirmar compra/i }))

    expect(await screen.findByText('No se pudo registrar el pedido. Intentá de nuevo.')).toBeTruthy()
    expect((screen.getByRole('button', { name: /confirmar compra/i }) as HTMLButtonElement).disabled).toBe(false)
    silenciar.mockRestore()
  })
})