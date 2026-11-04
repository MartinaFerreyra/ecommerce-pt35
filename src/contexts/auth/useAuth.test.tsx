// src/contexts/auth/useAuth.test.tsx
// Prueba useAuth con el AuthProvider REAL, pero con Firebase MOCKEADO (sin internet).
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import { AuthProvider } from './AuthProvider'
import * as authService from '../../services/authService'                 // (mockeado abajo)
import { admin, clienta } from '../../test/fixtures'

// ---------- MOCKS DE FIREBASE ----------
const mocks = vi.hoisted(() => ({                                         // estado compartido con los mocks
  firebaseUser: null as null | { uid: string },                           // "sesión guardada" en Firebase
}))

vi.mock('../../services/firebase', () => ({ auth: {}, db: {} }))          // no inicializa Firebase de verdad

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: unknown) => void) => { // simula "¿había sesión?"
    callback(mocks.firebaseUser)
    return () => {}                                                       // función para dejar de escuchar
  },
}))

vi.mock('../../services/authService', () => ({                            // todas las llamadas a Firebase, falsas
  getOrCreateUserProfile: vi.fn(),
  loginService: vi.fn(),
  signupService: vi.fn(),
  loginWithGoogleService: vi.fn(),
  logoutService: vi.fn(),
}))

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.firebaseUser = null                                             // por defecto, sin sesión
  })

  it('tira error si se usa fuera de <AuthProvider> (guard)', () => {
    const silenciar = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow('useAuth debe usarse dentro de <AuthProvider>')
    silenciar.mockRestore()
  })

  it('sin sesión guardada: user null y no autenticado', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))      // terminó de revisar
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('persistencia: si había sesión, carga el perfil con su rol', async () => {
    mocks.firebaseUser = { uid: 'uid-ana' }                               // Firebase recuerda la sesión
    vi.mocked(authService.getOrCreateUserProfile).mockResolvedValue(clienta)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).toEqual(clienta))
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAdmin).toBe(false)                            // es customer
  })

  it('login con un admin: isAdmin true', async () => {
    vi.mocked(authService.loginService).mockResolvedValue(admin)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => { await result.current.login('admin@test.com', '123456') })
    expect(authService.loginService).toHaveBeenCalledWith('admin@test.com', '123456')
    expect(result.current.isAdmin).toBe(true)
  })

  it('logout limpia el usuario', async () => {
    vi.mocked(authService.loginService).mockResolvedValue(clienta)
    vi.mocked(authService.logoutService).mockResolvedValue(undefined)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => { await result.current.login('ana@test.com', '123456') })
    await act(async () => { await result.current.logout() })
    expect(result.current.user).toBeNull()
  })

  it('si el login falla, el error llega a quien llamó (edge)', async () => {
    vi.mocked(authService.loginService).mockRejectedValue(new Error('auth/invalid-credential'))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await expect(result.current.login('mal@test.com', 'x')).rejects.toThrow('auth/invalid-credential')
    expect(result.current.user).toBeNull()                                // sigue sin sesión
  })
})